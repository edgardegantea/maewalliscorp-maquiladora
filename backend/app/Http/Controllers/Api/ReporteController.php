<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Empleado;
use App\Models\HojaProduccion;
use App\Models\OrdenProduccion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReporteController extends Controller
{
    /**
     * Reporte de producción agrupado por empleado en un período.
     * GET /reportes/produccion?desde=&hasta=
     */
    public function produccion(Request $request)
    {
        $desde = $request->input('desde', now()->startOfMonth()->toDateString());
        $hasta = $request->input('hasta', now()->toDateString());
        $eid   = $request->auth_empresa_id;

        // Totales por empleado desde hojas_produccion
        $totalesHojas = HojaProduccion::with('empleado:id,nombre,apellidos,status')
            ->where('empresa_id', $eid)
            ->whereBetween('fecha_inicio', [$desde, $hasta])
            ->get()
            ->groupBy('empleado_id')
            ->map(function ($hojas) {
                $emp = $hojas->first()->empleado;
                return [
                    'empleado_id'   => $emp?->id,
                    'nombre'        => $emp?->nombre,
                    'apellidos'     => $emp?->apellidos,
                    'status'        => $emp?->status,
                    'total_hojas'   => $hojas->count(),
                    'total_pagado'  => (float) $hojas->sum('total_a_pagar'),
                    'hojas'         => $hojas->map(fn($h) => [
                        'id'           => $h->id,
                        'fecha_inicio' => $h->fecha_inicio?->toDateString(),
                        'fecha_fin'    => $h->fecha_fin?->toDateString(),
                        'total_a_pagar'=> (float) $h->total_a_pagar,
                        'orden_id'     => $h->orden_produccion_id,
                    ])->values(),
                ];
            })
            ->values();

        return response()->json([
            'desde'         => $desde,
            'hasta'         => $hasta,
            'total_pagado'  => $totalesHojas->sum('total_pagado'),
            'total_hojas'   => $totalesHojas->sum('total_hojas'),
            'empleados'     => $totalesHojas,
        ]);
    }

    /**
     * Reporte de órdenes: resumen por status + vencimientos próximos.
     * GET /reportes/ordenes
     */
    public function ordenes(Request $request)
    {
        $eid = $request->auth_empresa_id;

        $por_status = OrdenProduccion::where('empresa_id', $eid)
            ->select('status', DB::raw('count(*) as total'))
            ->groupBy('status')
            ->pluck('total', 'status');

        $proximas = OrdenProduccion::with('cliente:id,nombre')
            ->where('empresa_id', $eid)
            ->whereIn('status', ['pendiente', 'en_proceso'])
            ->whereNotNull('fecha_entrega')
            ->orderBy('fecha_entrega')
            ->limit(10)
            ->get()
            ->map(fn($o) => [
                'id'            => $o->id,
                'codigo'        => $o->codigo,
                'modelo'        => $o->modelo,
                'cliente'       => $o->cliente?->nombre,
                'fecha_entrega' => $o->fecha_entrega,
                'status'        => $o->status,
                'prioridad'     => $o->prioridad,
                'dias_restantes'=> now()->diffInDays($o->fecha_entrega, false),
            ]);

        return response()->json([
            'por_status' => $por_status,
            'proximas_entregas' => $proximas,
        ]);
    }

    /**
     * Reporte de inventario: stock bajo mínimo.
     * GET /reportes/inventario
     */
    public function inventario(Request $request)
    {
        $eid = $request->auth_empresa_id;

        $telas_bajas = DB::table('telas')
            ->where('empresa_id', $eid)
            ->whereColumn('stock_actual', '<=', 'stock_minimo')
            ->where('status', 'activo')
            ->select('id', 'codigo', 'nombre', 'stock_actual', 'stock_minimo', 'unidad')
            ->get();

        $avios_bajos = DB::table('avios')
            ->where('empresa_id', $eid)
            ->whereColumn('stock_actual', '<=', 'stock_minimo')
            ->where('status', 'activo')
            ->select('id', 'codigo', 'nombre', 'stock_actual', 'stock_minimo', 'unidad', 'categoria')
            ->get();

        return response()->json([
            'telas_bajo_minimo' => $telas_bajas,
            'avios_bajo_minimo' => $avios_bajos,
            'total_alertas'     => $telas_bajas->count() + $avios_bajos->count(),
        ]);
    }
}
