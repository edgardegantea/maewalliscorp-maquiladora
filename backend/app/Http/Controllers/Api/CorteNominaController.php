<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CorteNomina;
use App\Models\CorteNominaEmpleado;
use App\Models\Empleado;
use App\Models\HojaProduccion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CorteNominaController extends Controller
{
    // ── Listar cortes ────────────────────────────────────────────────────────
    public function index(Request $request)
    {
        $cortes = CorteNomina::where('empresa_id', $request->auth_empresa_id)
            ->withCount('empleados')
            ->orderByDesc('fecha_inicio')
            ->paginate(20);

        return response()->json($cortes);
    }

    // ── Crear corte y calcular automáticamente ───────────────────────────────
    public function store(Request $request)
    {
        $data = $request->validate([
            'nombre'       => 'required|string|max:150',
            'fecha_inicio' => 'required|date',
            'fecha_fin'    => 'required|date|after_or_equal:fecha_inicio',
            'observaciones'=> 'nullable|string',
        ]);

        $data['empresa_id'] = $request->auth_empresa_id;
        $data['creado_por'] = $request->attributes->get('auth_user')->id;

        DB::beginTransaction();
        try {
            $corte = CorteNomina::create($data);
            $this->calcularEmpleados($corte, $request->auth_empresa_id);
            DB::commit();
        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json(['message' => 'Error al crear el corte: ' . $e->getMessage()], 500);
        }

        return response()->json($this->detalleCorte($corte), 201);
    }

    // ── Ver detalle ──────────────────────────────────────────────────────────
    public function show(Request $request, CorteNomina $corteNomina)
    {
        $this->chk($request, $corteNomina->empresa_id);
        return response()->json($this->detalleCorte($corteNomina));
    }

    // ── Actualizar (nombre, observaciones) ───────────────────────────────────
    public function update(Request $request, CorteNomina $corteNomina)
    {
        $this->chk($request, $corteNomina->empresa_id);
        $data = $request->validate([
            'nombre'        => 'sometimes|string|max:150',
            'observaciones' => 'nullable|string',
            'status'        => 'sometimes|in:borrador,cerrado,pagado',
        ]);
        $corteNomina->update($data);
        return response()->json($this->detalleCorte($corteNomina->fresh()));
    }

    // ── Recalcular (si se agregaron hojas después) ───────────────────────────
    public function calcular(Request $request, CorteNomina $corteNomina)
    {
        $this->chk($request, $corteNomina->empresa_id);
        if ($corteNomina->status !== 'borrador') {
            return response()->json(['message' => 'Solo se puede recalcular un corte en borrador.'], 422);
        }
        // Eliminar solo los registros pendientes y recalcular
        $corteNomina->empleados()->where('status', 'pendiente')->delete();
        $this->calcularEmpleados($corteNomina, $request->auth_empresa_id);
        return response()->json($this->detalleCorte($corteNomina->fresh()));
    }

    // ── Registrar pago de un empleado ────────────────────────────────────────
    public function registrarPago(Request $request, CorteNomina $corteNomina, Empleado $empleado)
    {
        $this->chk($request, $corteNomina->empresa_id);
        $data = $request->validate([
            'metodo_pago'      => 'required|in:efectivo,transferencia,cheque,otro',
            'referencia_pago'  => 'nullable|string|max:150',
            'fecha_pago'       => 'required|date',
            'deducciones'      => 'nullable|numeric|min:0',
            'observaciones'    => 'nullable|string',
        ]);

        $linea = CorteNominaEmpleado::where('corte_nomina_id', $corteNomina->id)
            ->where('empleado_id', $empleado->id)
            ->firstOrFail();

        if (isset($data['deducciones'])) {
            $linea->deducciones = $data['deducciones'];
            $linea->total_neto  = max(0, $linea->total_hojas - $linea->deducciones);
        }

        $linea->update([
            'status'           => 'pagado',
            'fecha_pago'       => $data['fecha_pago'],
            'metodo_pago'      => $data['metodo_pago'],
            'referencia_pago'  => $data['referencia_pago'] ?? null,
            'deducciones'      => $linea->deducciones,
            'total_neto'       => $linea->total_neto,
            'observaciones'    => $data['observaciones'] ?? null,
        ]);

        $this->recalcularTotalesCorte($corteNomina);

        return response()->json($linea->fresh()->load('empleado'));
    }

    // ── Pagar todos los pendientes de una vez ────────────────────────────────
    public function pagarTodos(Request $request, CorteNomina $corteNomina)
    {
        $this->chk($request, $corteNomina->empresa_id);
        $data = $request->validate([
            'metodo_pago'  => 'required|in:efectivo,transferencia,cheque,otro',
            'fecha_pago'   => 'required|date',
            'referencia_pago' => 'nullable|string|max:150',
        ]);

        $corteNomina->empleados()
            ->where('status', 'pendiente')
            ->update([
                'status'          => 'pagado',
                'fecha_pago'      => $data['fecha_pago'],
                'metodo_pago'     => $data['metodo_pago'],
                'referencia_pago' => $data['referencia_pago'] ?? null,
            ]);

        // Actualizar total_neto para los que no tenían deducción
        foreach ($corteNomina->empleados()->where('total_neto', 0)->get() as $l) {
            $l->update(['total_neto' => $l->total_hojas]);
        }

        $this->recalcularTotalesCorte($corteNomina);
        $corteNomina->update(['status' => 'pagado']);

        return response()->json($this->detalleCorte($corteNomina->fresh()));
    }

    // ── Actualizar deducción de una línea ─────────────────────────────────────
    public function actualizarLinea(Request $request, CorteNomina $corteNomina, Empleado $empleado)
    {
        $this->chk($request, $corteNomina->empresa_id);
        $data = $request->validate([
            'deducciones'  => 'required|numeric|min:0',
            'observaciones'=> 'nullable|string',
        ]);

        $linea = CorteNominaEmpleado::where('corte_nomina_id', $corteNomina->id)
            ->where('empleado_id', $empleado->id)
            ->firstOrFail();

        $linea->update([
            'deducciones'  => $data['deducciones'],
            'total_neto'   => max(0, $linea->total_hojas - $data['deducciones']),
            'observaciones'=> $data['observaciones'] ?? $linea->observaciones,
        ]);

        $this->recalcularTotalesCorte($corteNomina);
        return response()->json($linea->fresh()->load('empleado'));
    }

    // ── Detalle de hojas de un empleado en el corte ───────────────────────────
    public function hojasEmpleado(Request $request, CorteNomina $corteNomina, Empleado $empleado)
    {
        $this->chk($request, $corteNomina->empresa_id);

        $hojas = HojaProduccion::with('orden:id,codigo,modelo,cliente_id', 'orden.cliente:id,nombre', 'operaciones.operacion:id,nombre,precio')
            ->where('empresa_id', $request->auth_empresa_id)
            ->where('empleado_id', $empleado->id)
            ->where('fecha_fin', '>=', $corteNomina->fecha_inicio)
            ->where('fecha_inicio', '<=', $corteNomina->fecha_fin)
            ->orderBy('fecha_inicio')
            ->get();

        return response()->json([
            'empleado' => $empleado->only('id', 'nombre', 'apellidos', 'numero_huella'),
            'corte'    => $corteNomina->only('id', 'nombre', 'fecha_inicio', 'fecha_fin'),
            'hojas'    => $hojas,
            'total'    => $hojas->sum('total_a_pagar'),
        ]);
    }

    // ── Eliminar (solo borrador) ──────────────────────────────────────────────
    public function destroy(Request $request, CorteNomina $corteNomina)
    {
        $this->chk($request, $corteNomina->empresa_id);
        if ($corteNomina->status !== 'borrador') {
            return response()->json(['message' => 'Solo se puede eliminar un corte en borrador.'], 422);
        }
        $corteNomina->delete();
        return response()->json(null, 204);
    }

    // ════════════════════════════════════════════════════════════════════════
    // PRIVADOS
    // ════════════════════════════════════════════════════════════════════════

    /** Calcula los totales por empleado leyendo las hojas del período */
    private function calcularEmpleados(CorteNomina $corte, int $empresaId): void
    {
        // Obtener empleados activos de la empresa
        $empleados = Empleado::where('empresa_id', $empresaId)
            ->where('status', 'activo')
            ->get();

        $totalCorte = 0;

        foreach ($empleados as $emp) {
            $hojas = HojaProduccion::where('empresa_id', $empresaId)
                ->where('empleado_id', $emp->id)
                ->where('fecha_fin', '>=', $corte->fecha_inicio)
                ->where('fecha_inicio', '<=', $corte->fecha_fin)
                ->get();

            if ($hojas->isEmpty()) continue; // Solo incluir empleados con trabajo

            $totalHojas = $hojas->sum('total_a_pagar');
            $totalCorte += $totalHojas;

            // Si ya existe (recalculo), actualizar; si no, crear
            CorteNominaEmpleado::updateOrCreate(
                ['corte_nomina_id' => $corte->id, 'empleado_id' => $emp->id],
                [
                    'num_hojas'   => $hojas->count(),
                    'total_hojas' => $totalHojas,
                    'deducciones' => 0,
                    'total_neto'  => $totalHojas,
                    'status'      => 'pendiente',
                ]
            );
        }

        $corte->update(['total_calculado' => $totalCorte]);
    }

    /** Recalcula total_calculado y total_pagado del corte */
    private function recalcularTotalesCorte(CorteNomina $corte): void
    {
        $totales = CorteNominaEmpleado::where('corte_nomina_id', $corte->id)
            ->selectRaw('SUM(total_neto) as total_neto, SUM(CASE WHEN status="pagado" THEN total_neto ELSE 0 END) as total_pagado')
            ->first();

        $corte->update([
            'total_calculado' => $totales->total_neto ?? 0,
            'total_pagado'    => $totales->total_pagado ?? 0,
        ]);

        // Si todos están pagados, marcar el corte como pagado
        $pendientes = CorteNominaEmpleado::where('corte_nomina_id', $corte->id)
            ->where('status', 'pendiente')->count();
        if ($pendientes === 0 && $corte->empleados()->count() > 0) {
            $corte->update(['status' => 'pagado']);
        }
    }

    /** Carga el detalle completo de un corte */
    private function detalleCorte(CorteNomina $corte): array
    {
        $corte->load([
            'empleados.empleado:id,nombre,apellidos,numero_huella,telefono,email',
            'creadoPor:id,name',
        ]);

        $lineas = $corte->empleados->map(fn($l) => [
            'id'              => $l->id,
            'empleado_id'     => $l->empleado_id,
            'empleado'        => $l->empleado ? [
                'id'            => $l->empleado->id,
                'nombre'        => $l->empleado->nombre,
                'apellidos'     => $l->empleado->apellidos,
                'numero_huella' => $l->empleado->numero_huella,
                'telefono'      => $l->empleado->telefono,
                'email'         => $l->empleado->email,
            ] : null,
            'num_hojas'       => $l->num_hojas,
            'total_hojas'     => (float) $l->total_hojas,
            'deducciones'     => (float) $l->deducciones,
            'total_neto'      => (float) $l->total_neto,
            'status'          => $l->status,
            'fecha_pago'      => $l->fecha_pago?->toDateString(),
            'metodo_pago'     => $l->metodo_pago,
            'referencia_pago' => $l->referencia_pago,
            'observaciones'   => $l->observaciones,
        ]);

        $pendientes = $lineas->where('status', 'pendiente');
        $pagados    = $lineas->where('status', 'pagado');

        return [
            'id'               => $corte->id,
            'nombre'           => $corte->nombre,
            'fecha_inicio'     => $corte->fecha_inicio?->toDateString(),
            'fecha_fin'        => $corte->fecha_fin?->toDateString(),
            'status'           => $corte->status,
            'total_calculado'  => (float) $corte->total_calculado,
            'total_pagado'     => (float) $corte->total_pagado,
            'total_pendiente'  => (float) ($corte->total_calculado - $corte->total_pagado),
            'observaciones'    => $corte->observaciones,
            'creado_por'       => $corte->creadoPor?->name,
            'created_at'       => $corte->created_at?->toDateTimeString(),
            'num_empleados'    => $lineas->count(),
            'num_pendientes'   => $pendientes->count(),
            'num_pagados'      => $pagados->count(),
            'empleados'        => $lineas->values(),
        ];
    }

    private function chk(Request $r, ?int $id): void
    {
        if ($id === null || $id !== $r->auth_empresa_id) abort(403);
    }
}
