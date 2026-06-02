<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\Avio;
use App\Models\MovimientoAlmacen;
use Illuminate\Http\Request;
class AvioController extends Controller {
    public function index(Request $request) {
        $q = Avio::where('empresa_id',$request->auth_empresa_id)->with('proveedor');
        if ($request->filled('categoria')) $q->where('categoria',$request->categoria);
        if ($request->filled('status')) $q->where('status',$request->status);
        if ($request->filled('q')) $q->where('nombre','like','%'.$request->q.'%');
        // Alerta de stock bajo
        if ($request->boolean('stock_bajo')) $q->whereColumn('stock_actual','<=','stock_minimo');
        return response()->json($q->orderBy('nombre')->paginate(20));
    }
    public function store(Request $request) {
        $data = $request->validate(['proveedor_id'=>'nullable|exists:proveedores,id','codigo'=>'nullable|string|max:50','nombre'=>'required|string|max:150','descripcion'=>'nullable|string','categoria'=>'nullable|in:hilo,cierre,boton,etiqueta,bolsa,cinta,elastico,entretela,remache,broche,accesorio,empaque,otro','unidad'=>'nullable|string|max:20','precio_unitario'=>'nullable|numeric|min:0','stock_actual'=>'nullable|numeric|min:0','stock_minimo'=>'nullable|numeric|min:0','status'=>'in:activo,inactivo']);
        $data['empresa_id'] = $request->auth_empresa_id;
        return response()->json(Avio::create($data)->load('proveedor'), 201);
    }
    public function show(Request $request, Avio $avio) {
        $this->chk($request,$avio->empresa_id);
        return response()->json($avio->load('proveedor'));
    }
    public function update(Request $request, Avio $avio) {
        $this->chk($request,$avio->empresa_id);
        $data = $request->validate(['proveedor_id'=>'nullable|exists:proveedores,id','codigo'=>'nullable|string|max:50','nombre'=>'sometimes|string|max:150','descripcion'=>'nullable|string','categoria'=>'nullable|in:hilo,cierre,boton,etiqueta,bolsa,cinta,elastico,entretela,remache,broche,accesorio,empaque,otro','unidad'=>'nullable|string|max:20','precio_unitario'=>'nullable|numeric|min:0','stock_minimo'=>'nullable|numeric|min:0','status'=>'in:activo,inactivo']);
        $avio->update($data);
        return response()->json($avio->load('proveedor'));
    }
    public function destroy(Request $request, Avio $avio) {
        $this->chk($request,$avio->empresa_id); $avio->delete(); return response()->json(null,204);
    }
    public function ajustarStock(Request $request, Avio $avio) {
        $this->chk($request,$avio->empresa_id);
        $data = $request->validate(['tipo_movimiento'=>'required|in:entrada,salida,ajuste,devolucion','cantidad'=>'required|numeric|min:0.0001','orden_produccion_id'=>'nullable|exists:ordenes_produccion,id','referencia'=>'nullable|string|max:100','observaciones'=>'nullable|string']);
        $delta = in_array($data['tipo_movimiento'],['salida']) ? -$data['cantidad'] : $data['cantidad'];
        if ($data['tipo_movimiento']==='ajuste') { $avio->update(['stock_actual'=>$data['cantidad']]); $delta = 0; }
        else $avio->increment('stock_actual', $delta);
        MovimientoAlmacen::create(['empresa_id'=>$request->auth_empresa_id,'tipo_item'=>'avio','item_id'=>$avio->id,'nombre_item'=>$avio->nombre,'tipo_movimiento'=>$data['tipo_movimiento'],'cantidad'=>$data['cantidad'],'unidad'=>$avio->unidad,'costo_unitario'=>$avio->precio_unitario,'orden_produccion_id'=>$data['orden_produccion_id'] ?? null,'referencia'=>$data['referencia'] ?? null,'observaciones'=>$data['observaciones'] ?? null]);
        return response()->json($avio->fresh()->load('proveedor'));
    }
    private function chk(Request $r, ?int $id): void { if ($id===null||$id!==$r->auth_empresa_id) abort(403); }
}
