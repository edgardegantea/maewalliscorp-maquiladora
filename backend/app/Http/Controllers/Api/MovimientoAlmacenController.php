<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\MovimientoAlmacen;
use Illuminate\Http\Request;
class MovimientoAlmacenController extends Controller {
    public function index(Request $request) {
        $q = MovimientoAlmacen::where('empresa_id',$request->auth_empresa_id)->with('orden','proveedor');
        if ($request->filled('tipo_item')) $q->where('tipo_item',$request->tipo_item);
        if ($request->filled('tipo_movimiento')) $q->where('tipo_movimiento',$request->tipo_movimiento);
        if ($request->filled('search')) $q->where('nombre_item','like','%'.$request->search.'%');
        if ($request->filled('desde')) $q->whereDate('created_at','>=',$request->desde);
        if ($request->filled('hasta')) $q->whereDate('created_at','<=',$request->hasta);
        $perPage = min((int)($request->per_page ?? 30), 100);
        return response()->json($q->orderByDesc('created_at')->paginate($perPage));
    }
}
