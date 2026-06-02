<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\HojaProduccion;
use App\Models\HojaOperacion;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;

class HojaProduccionController extends Controller {

    public function index(Request $request) {
        $q = HojaProduccion::where('empresa_id',$request->auth_empresa_id)->with('empleado','orden.cliente');
        if ($request->filled('empleado_id')) $q->where('empleado_id',$request->empleado_id);
        if ($request->filled('orden_produccion_id')) $q->where('orden_produccion_id',$request->orden_produccion_id);
        if ($request->filled('desde')) $q->where('fecha_fin','>=',$request->desde);
        if ($request->filled('hasta')) $q->where('fecha_inicio','<=',$request->hasta);
        $perPage = max(1, min((int)($request->per_page ?? 20), 500));
        return response()->json($q->orderByDesc('fecha_registro')->paginate($perPage));
    }

    public function store(Request $request) {
        $data = $request->validate([
            'empleado_id'=>'required|exists:empleados,id','orden_produccion_id'=>'required|exists:ordenes_produccion,id',
            'fecha_inicio'=>'required|date','fecha_fin'=>'required|date|after_or_equal:fecha_inicio',
            'dias_inhabiles'=>'nullable|integer|min:0','fecha_registro'=>'required|date',
            'observaciones'=>'nullable|string',
            'operaciones'=>'nullable|array','operaciones.*.operacion_prenda_id'=>'required|exists:operaciones_prenda,id',
            'operaciones.*.numero_piezas'=>'required|integer|min:0','operaciones.*.total_por_operacion'=>'required|numeric|min:0','operaciones.*.fecha'=>'required|date',
            'eventualidades'=>'nullable|array','eventualidades.*'=>'exists:eventualidades_trabajo,id',
        ]);
        $data['empresa_id'] = $request->auth_empresa_id;
        $operaciones   = $data['operaciones'] ?? [];
        $eventualidades= $data['eventualidades'] ?? [];
        unset($data['operaciones'], $data['eventualidades']);
        $data['importe_total'] = collect($operaciones)->sum('total_por_operacion');
        $data['total_a_pagar'] = $data['importe_total'];
        $hoja = HojaProduccion::create($data);
        foreach ($operaciones as $op) HojaOperacion::create(['hoja_produccion_id'=>$hoja->id,...$op]);
        if ($eventualidades) $hoja->eventualidades()->sync($eventualidades);
        return response()->json($hoja->load('empleado','orden.cliente','operaciones.operacion','eventualidades'), 201);
    }

    public function show(Request $request, HojaProduccion $hojaProduccion) {
        $this->chk($request,$hojaProduccion->empresa_id);
        return response()->json($hojaProduccion->load('empleado','orden.cliente','operaciones.operacion','eventualidades'));
    }

    public function update(Request $request, HojaProduccion $hojaProduccion) {
        $this->chk($request,$hojaProduccion->empresa_id);
        $data = $request->validate([
            'empleado_id'         => 'sometimes|exists:empleados,id',
            'orden_produccion_id' => 'sometimes|exists:ordenes_produccion,id',
            'fecha_inicio'        => 'sometimes|date',
            'fecha_fin'           => 'sometimes|date',
            'dias_inhabiles'      => 'nullable|integer|min:0',
            'fecha_registro'      => 'sometimes|date',
            'observaciones'       => 'nullable|string',
        ]);
        $hojaProduccion->update($data);
        return response()->json($hojaProduccion->fresh()->load('empleado','orden.cliente'));
    }

    public function destroy(Request $request, HojaProduccion $hojaProduccion) {
        $this->chk($request,$hojaProduccion->empresa_id);
        $hojaProduccion->delete();
        return response()->json(null,204);
    }

    // ── Operaciones individuales de la hoja ───────────────────────────────────

    /** POST /hojas-produccion/{hoja}/operaciones — agregar una operación */
    public function addOperacion(Request $request, HojaProduccion $hojaProduccion) {
        $this->chk($request,$hojaProduccion->empresa_id);
        $data = $request->validate([
            'operacion_prenda_id'  => 'required|exists:operaciones_prenda,id',
            'numero_piezas'        => 'required|integer|min:0',
            'total_por_operacion'  => 'required|numeric|min:0',
            'fecha'                => 'required|date',
        ]);
        $op = HojaOperacion::create(['hoja_produccion_id' => $hojaProduccion->id, ...$data]);
        $this->recalcularTotal($hojaProduccion);
        return response()->json($op->load('operacion'), 201);
    }

    /** PUT /hoja-operaciones/{operacion} — actualizar una operación */
    public function updateOperacion(Request $request, HojaOperacion $hojaOperacion) {
        // Verificar que pertenece a la empresa
        $hoja = $hojaOperacion->hoja;
        $this->chk($request, $hoja->empresa_id);
        $data = $request->validate([
            'operacion_prenda_id' => 'sometimes|exists:operaciones_prenda,id',
            'numero_piezas'       => 'sometimes|integer|min:0',
            'total_por_operacion' => 'sometimes|numeric|min:0',
            'fecha'               => 'sometimes|date',
        ]);
        $hojaOperacion->update($data);
        $this->recalcularTotal($hoja);
        return response()->json($hojaOperacion->fresh()->load('operacion'));
    }

    /** DELETE /hoja-operaciones/{operacion} — eliminar una operación */
    public function destroyOperacion(Request $request, HojaOperacion $hojaOperacion) {
        $hoja = $hojaOperacion->hoja;
        $this->chk($request, $hoja->empresa_id);
        $hojaOperacion->delete();
        $this->recalcularTotal($hoja);
        return response()->json(null, 204);
    }

    /** Recalcula importe_total y total_a_pagar de la hoja */
    /** Genera y descarga el PDF de la hoja de producción */
    public function pdf(Request $request, HojaProduccion $hojaProduccion)
    {
        $this->chk($request, $hojaProduccion->empresa_id);

        $hoja = $hojaProduccion->load([
            'empleado',
            'orden.cliente',
            'operaciones.operacion',
            'eventualidades',
            'empresa',
        ]);

        $pdf = Pdf::loadView('pdf.hoja_produccion', [
            'hoja'    => $hoja,
            'empresa' => $hoja->empresa,
        ])->setPaper('letter', 'portrait');

        $filename = 'hoja-' . str_pad($hoja->id, 5, '0', STR_PAD_LEFT) . '.pdf';

        return $pdf->download($filename);
    }

    private function recalcularTotal(HojaProduccion $hoja): void {
        $total = $hoja->operaciones()->sum('total_por_operacion');
        $hoja->update(['importe_total' => $total, 'total_a_pagar' => $total]);
    }

    private function chk(Request $request, ?int $id): void {
        if ($id === null || $id !== $request->auth_empresa_id) abort(403);
    }
}
