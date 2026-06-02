<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\Empleado;
use App\Models\HojaOperacion;
use Illuminate\Http\Request;

class EmpleadoController extends Controller {
    public function index(Request $request) {
        $q = Empleado::where('empresa_id', $request->auth_empresa_id);
        if ($request->filled('status')) $q->where('status', $request->status);
        if ($request->filled('search')) $q->where(function($query) use ($request) {
            $query->where('nombre', 'like', "%{$request->search}%")->orWhere('apellidos', 'like', "%{$request->search}%");
        });
        return response()->json($q->orderBy('apellidos')->paginate(20));
    }
    public function store(Request $request) {
        $data = $request->validate([
            'numero_huella' => 'nullable|string|max:50|unique:empleados,numero_huella',
            'nombre' => 'required|string|max:100',
            'apellidos' => 'required|string|max:100',
            'domicilio' => 'nullable|string',
            'telefono' => 'nullable|string|max:20',
            'email' => 'nullable|email',
            'status' => 'in:activo,inactivo',
        ]);
        $data['empresa_id'] = $request->auth_empresa_id;
        return response()->json(Empleado::create($data), 201);
    }
    public function show(Request $request, Empleado $empleado) {
        $this->authorize_empresa($request, $empleado->empresa_id);
        return response()->json($empleado->load('areasEncargado.area'));
    }
    public function update(Request $request, Empleado $empleado) {
        $this->authorize_empresa($request, $empleado->empresa_id);
        $data = $request->validate([
            'numero_huella' => "nullable|string|max:50|unique:empleados,numero_huella,{$empleado->id}",
            'nombre' => 'sometimes|string|max:100',
            'apellidos' => 'sometimes|string|max:100',
            'domicilio' => 'nullable|string',
            'telefono' => 'nullable|string|max:20',
            'email' => 'nullable|email',
            'status' => 'in:activo,inactivo',
        ]);
        $empleado->update($data);
        return response()->json($empleado);
    }
    public function destroy(Request $request, Empleado $empleado) {
        $this->authorize_empresa($request, $empleado->empresa_id);
        $empleado->delete();
        return response()->json(null, 204);
    }
    /**
     * Devuelve todas las operaciones de un empleado en un rango de fechas.
     * Cada registro incluye: fecha, operacion, hoja → orden → cliente.
     */
    public function produccion(Request $request, Empleado $empleado)
    {
        $this->authorize_empresa($request, $empleado->empresa_id);

        $desde = $request->input('desde', now()->subDays(27)->toDateString()); // 4 semanas atrás
        $hasta = $request->input('hasta', now()->toDateString());

        $operaciones = HojaOperacion::whereHas('hoja', function ($q) use ($empleado, $desde, $hasta) {
                $q->where('empleado_id', $empleado->id)
                  ->where(function ($q2) use ($desde, $hasta) {
                      $q2->whereBetween('fecha_inicio', [$desde, $hasta])
                         ->orWhereBetween('fecha_fin', [$desde, $hasta]);
                  });
            })
            ->with([
                'hoja:id,empleado_id,orden_produccion_id,fecha_inicio,fecha_fin',
                'hoja.orden:id,codigo,modelo,cliente_id',
                'hoja.orden.cliente:id,nombre',
                'operacion:id,nombre,precio',
            ])
            ->whereBetween('fecha', [$desde, $hasta])
            ->orderBy('fecha')
            ->orderBy('hoja_produccion_id')
            ->get()
            ->map(fn($op) => [
                'id'               => $op->id,
                'fecha'            => $op->fecha?->toDateString(),
                'numero_piezas'    => $op->numero_piezas,
                'total'            => (float) $op->total_por_operacion,
                'operacion'        => $op->operacion?->nombre,
                'precio_unitario'  => (float) ($op->operacion?->precio ?? 0),
                'orden_id'         => $op->hoja?->orden?->id,
                'orden_codigo'     => $op->hoja?->orden?->codigo,
                'orden_modelo'     => $op->hoja?->orden?->modelo,
                'cliente'          => $op->hoja?->orden?->cliente?->nombre,
                'hoja_id'          => $op->hoja_produccion_id,
            ]);

        return response()->json([
            'empleado' => $empleado->only('id','nombre','apellidos','status'),
            'desde'    => $desde,
            'hasta'    => $hasta,
            'total_piezas' => $operaciones->sum('numero_piezas'),
            'total_importe'=> $operaciones->sum('total'),
            'operaciones'  => $operaciones,
        ]);
    }

    private function authorize_empresa(Request $request, int $empresa_id): void {
        if ($empresa_id !== $request->auth_empresa_id) abort(403);
    }
}
