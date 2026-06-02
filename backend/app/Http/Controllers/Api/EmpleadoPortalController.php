<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AclaracionProduccion;
use App\Models\CorteNominaEmpleado;
use App\Models\Empleado;
use App\Models\HojaOperacion;
use App\Models\HojaProduccion;
use App\Models\OrdenProduccion;
use App\Models\PermisoEmpleado;
use App\Models\RegistroAsistencia;
use Illuminate\Http\Request;

class EmpleadoPortalController extends Controller
{
    // ── Helper: obtener el empleado del usuario autenticado ─────────────────
    private function empleadoAuth(Request $request): Empleado
    {
        $user = $request->attributes->get('auth_user');
        if (!$user->empleado_id) {
            abort(403, 'Tu cuenta no está vinculada a un empleado.');
        }
        return Empleado::findOrFail($user->empleado_id);
    }

    // ── Mi Producción ────────────────────────────────────────────────────────
    public function produccion(Request $request)
    {
        $empleado = $this->empleadoAuth($request);

        $desde = $request->input('desde', now()->subDays(27)->toDateString());
        $hasta = $request->input('hasta', now()->toDateString());

        $operaciones = HojaOperacion::whereHas('hoja', fn($q) =>
                $q->where('empleado_id', $empleado->id)
            )
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
                'id'              => $op->id,
                'fecha'           => $op->fecha?->toDateString(),
                'numero_piezas'   => $op->numero_piezas,
                'total'           => (float) $op->total_por_operacion,
                'operacion'       => $op->operacion?->nombre,
                'precio_unitario' => (float) ($op->operacion?->precio ?? 0),
                'orden_id'        => $op->hoja?->orden?->id,
                'orden_codigo'    => $op->hoja?->orden?->codigo,
                'orden_modelo'    => $op->hoja?->orden?->modelo,
                'cliente'         => $op->hoja?->orden?->cliente?->nombre,
                'hoja_id'         => $op->hoja_produccion_id,
            ]);

        return response()->json([
            'empleado'      => $empleado->only('id', 'nombre', 'apellidos', 'status'),
            'desde'         => $desde,
            'hasta'         => $hasta,
            'total_piezas'  => $operaciones->sum('numero_piezas'),
            'total_importe' => $operaciones->sum('total'),
            'operaciones'   => $operaciones,
        ]);
    }

    // ── Mis Pagos — cortes de nómina pagados + trabajo pendiente ────────────
    public function pagos(Request $request)
    {
        $empleado = $this->empleadoAuth($request);

        // 1. Pagos ya realizados (cortes cerrados/pagados)
        $cortes = CorteNominaEmpleado::with('corte:id,nombre,fecha_inicio,fecha_fin,status')
            ->where('empleado_id', $empleado->id)
            ->where('status', 'pagado')
            ->orderByDesc('fecha_pago')
            ->get()
            ->map(fn($l) => [
                'id'              => $l->id,
                'corte_id'        => $l->corte_nomina_id,
                'nombre_corte'    => $l->corte?->nombre,
                'fecha_inicio'    => $l->corte?->fecha_inicio?->toDateString(),
                'fecha_fin'       => $l->corte?->fecha_fin?->toDateString(),
                'num_hojas'       => $l->num_hojas,
                'total_hojas'     => (float) $l->total_hojas,
                'deducciones'     => (float) $l->deducciones,
                'total_neto'      => (float) $l->total_neto,
                'fecha_pago'      => $l->fecha_pago?->toDateString(),
                'metodo_pago'     => $l->metodo_pago,
                'referencia_pago' => $l->referencia_pago,
                'observaciones'   => $l->observaciones,
            ]);

        // 2. Hojas pendientes (no incluidas en ningún corte pagado)
        $hojasIds = HojaProduccion::where('empleado_id', $empleado->id)
            ->where('empresa_id', $request->auth_empresa_id)
            ->pluck('id');

        // IDs de hojas ya pagadas (en cortes pagados dentro del período de cada hoja)
        $cortesIds = CorteNominaEmpleado::where('empleado_id', $empleado->id)
            ->where('status', 'pagado')
            ->with('corte:id,fecha_inicio,fecha_fin')
            ->get();

        $hojasPendientes = HojaProduccion::with('orden:id,codigo,modelo')
            ->where('empleado_id', $empleado->id)
            ->where('empresa_id', $request->auth_empresa_id)
            ->orderByDesc('fecha_inicio')
            ->get()
            ->filter(function($h) use ($cortesIds) {
                // Excluir hojas cuyo período está cubierto por algún corte pagado
                foreach ($cortesIds as $c) {
                    if ($c->corte && $h->fecha_inicio <= $c->corte->fecha_fin && $h->fecha_fin >= $c->corte->fecha_inicio) {
                        return false;
                    }
                }
                return true;
            })
            ->map(fn($h) => [
                'id'           => $h->id,
                'fecha_inicio' => $h->fecha_inicio?->toDateString(),
                'fecha_fin'    => $h->fecha_fin?->toDateString(),
                'total_a_pagar'=> (float) $h->total_a_pagar,
                'orden_codigo' => $h->orden?->codigo,
            ]);

        return response()->json([
            'empleado'         => $empleado->only('id', 'nombre', 'apellidos'),
            'total_recibido'   => $cortes->sum('total_neto'),
            'total_pendiente'  => $hojasPendientes->sum('total_a_pagar'),
            'num_cortes'       => $cortes->count(),
            'pagos'            => $cortes->values(),
            'hojas_pendientes' => $hojasPendientes->values(),
        ]);
    }

    // ── Mi Asistencia ────────────────────────────────────────────────────────
    public function asistencia(Request $request)
    {
        $empleado = $this->empleadoAuth($request);

        $desde = $request->input('desde', now()->startOfMonth()->toDateString());
        $hasta = $request->input('hasta', now()->toDateString());

        $registros = RegistroAsistencia::where('empleado_id', $empleado->id)
            ->whereBetween('fecha', [$desde, $hasta])
            ->orderBy('fecha')
            ->get()
            ->map(fn($r) => [
                'id'            => $r->id,
                'fecha'         => $r->fecha,
                'entrada'       => $r->entrada,
                'entrada_comida'=> $r->entrada_comida,
                'salida_comida' => $r->salida_comida,
                'salida'        => $r->salida,
                'observaciones' => $r->observaciones,
            ]);

        return response()->json([
            'empleado'     => $empleado->only('id', 'nombre', 'apellidos'),
            'desde'        => $desde,
            'hasta'        => $hasta,
            'total_dias'   => $registros->count(),
            'registros'    => $registros,
        ]);
    }

    // ── Mis Órdenes ──────────────────────────────────────────────────────────
    public function ordenes(Request $request)
    {
        $empleado = $this->empleadoAuth($request);

        // Órdenes en las que el empleado tiene al menos una hoja de producción
        $ordenIds = HojaProduccion::where('empleado_id', $empleado->id)
            ->pluck('orden_produccion_id')
            ->unique();

        $ordenes = OrdenProduccion::with('cliente:id,nombre')
            ->whereIn('id', $ordenIds)
            ->where('empresa_id', $request->auth_empresa_id)
            ->orderByDesc('created_at')
            ->get()
            ->map(fn($o) => [
                'id'             => $o->id,
                'codigo'         => $o->codigo,
                'modelo'         => $o->modelo,
                'cliente'        => $o->cliente?->nombre,
                'prioridad'      => $o->prioridad,
                'status'         => $o->status,
                'fecha_entrega'  => $o->fecha_entrega,
                'observaciones'  => $o->observaciones,
            ]);

        return response()->json($ordenes);
    }

    // ── Mis Permisos — index ─────────────────────────────────────────────────
    public function permisosIndex(Request $request)
    {
        $empleado = $this->empleadoAuth($request);

        $permisos = PermisoEmpleado::where('empleado_id', $empleado->id)
            ->orderByDesc('created_at')
            ->get();

        return response()->json($permisos);
    }

    // ── Mis Permisos — store ─────────────────────────────────────────────────
    public function permisosStore(Request $request)
    {
        $empleado = $this->empleadoAuth($request);

        $data = $request->validate([
            'tipo'         => 'required|in:vacaciones,permiso_personal,incapacidad,otro',
            'fecha_inicio' => 'required|date|after_or_equal:today',
            'fecha_fin'    => 'required|date|after_or_equal:fecha_inicio',
            'motivo'       => 'required|string|max:1000',
        ]);

        $permiso = PermisoEmpleado::create([
            ...$data,
            'empresa_id'  => $request->auth_empresa_id,
            'empleado_id' => $empleado->id,
            'status'      => 'pendiente',
        ]);

        return response()->json($permiso, 201);
    }

    // ── Mis Permisos — destroy (solo si está pendiente) ──────────────────────
    public function permisosDestroy(Request $request, int $id)
    {
        $empleado = $this->empleadoAuth($request);

        $permiso = PermisoEmpleado::where('id', $id)
            ->where('empleado_id', $empleado->id)
            ->firstOrFail();

        if ($permiso->status !== 'pendiente') {
            abort(422, 'Solo puedes cancelar permisos en estado pendiente.');
        }

        $permiso->delete();
        return response()->json(null, 204);
    }

    // ── Mis Aclaraciones — index ──────────────────────────────────────────────
    public function aclaracionesIndex(Request $request)
    {
        $empleado = $this->empleadoAuth($request);

        $aclaraciones = AclaracionProduccion::with('hoja:id,fecha_inicio,fecha_fin,orden_produccion_id', 'hoja.orden:id,codigo')
            ->where('empleado_id', $empleado->id)
            ->orderByDesc('created_at')
            ->get();

        return response()->json($aclaraciones);
    }

    // ── Mis Aclaraciones — store ──────────────────────────────────────────────
    public function aclaracionesStore(Request $request)
    {
        $empleado = $this->empleadoAuth($request);

        $data = $request->validate([
            'hoja_produccion_id' => 'nullable|exists:hojas_produccion,id',
            'descripcion'        => 'required|string|max:2000',
        ]);

        // Verificar que la hoja pertenece al empleado si se especifica
        if (!empty($data['hoja_produccion_id'])) {
            $hoja = HojaProduccion::find($data['hoja_produccion_id']);
            if (!$hoja || $hoja->empleado_id !== $empleado->id) {
                abort(403, 'La hoja de producción no pertenece a tu registro.');
            }
        }

        $aclaracion = AclaracionProduccion::create([
            ...$data,
            'empresa_id'  => $request->auth_empresa_id,
            'empleado_id' => $empleado->id,
            'status'      => 'pendiente',
        ]);

        return response()->json($aclaracion->load('hoja.orden'), 201);
    }

    // ════════════════════════════════════════════════════════════════════════
    // GESTIÓN (admin / encargado)
    // ════════════════════════════════════════════════════════════════════════

    // ── Gestión Permisos — index ─────────────────────────────────────────────
    public function gestionPermisosIndex(Request $request)
    {
        $q = PermisoEmpleado::with('empleado:id,nombre,apellidos')
            ->where('empresa_id', $request->auth_empresa_id)
            ->orderByDesc('created_at');

        if ($request->filled('status')) $q->where('status', $request->status);
        if ($request->filled('empleado_id')) $q->where('empleado_id', $request->empleado_id);

        return response()->json($q->paginate(20));
    }

    // ── Gestión Permisos — update (aprobar / rechazar) ───────────────────────
    public function gestionPermisosUpdate(Request $request, PermisoEmpleado $permiso)
    {
        if ($permiso->empresa_id !== $request->auth_empresa_id) abort(403);

        $data = $request->validate([
            'status'                  => 'required|in:aprobado,rechazado',
            'observaciones_encargado' => 'nullable|string|max:1000',
        ]);

        $permiso->update($data);
        return response()->json($permiso->load('empleado'));
    }

    // ── Gestión Aclaraciones — index ─────────────────────────────────────────
    public function gestionAclaracionesIndex(Request $request)
    {
        $q = AclaracionProduccion::with(
                'empleado:id,nombre,apellidos',
                'hoja:id,fecha_inicio,fecha_fin,orden_produccion_id',
                'hoja.orden:id,codigo'
            )
            ->where('empresa_id', $request->auth_empresa_id)
            ->orderByDesc('created_at');

        if ($request->filled('status')) $q->where('status', $request->status);
        if ($request->filled('empleado_id')) $q->where('empleado_id', $request->empleado_id);

        return response()->json($q->paginate(20));
    }

    // ── Gestión Aclaraciones — update (responder) ────────────────────────────
    public function gestionAclaracionesUpdate(Request $request, AclaracionProduccion $aclaracion)
    {
        if ($aclaracion->empresa_id !== $request->auth_empresa_id) abort(403);

        $data = $request->validate([
            'status'    => 'required|in:en_revision,resuelta,rechazada',
            'respuesta' => 'nullable|string|max:2000',
        ]);

        $aclaracion->update($data);
        return response()->json($aclaracion->load('empleado', 'hoja.orden'));
    }
}
