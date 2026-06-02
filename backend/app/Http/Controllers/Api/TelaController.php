<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\Tela;
use App\Models\RolloTela;
use App\Models\MovimientoAlmacen;
use Illuminate\Http\Request;
class TelaController extends Controller {
    public function index(Request $request) {
        $q = Tela::where('empresa_id',$request->auth_empresa_id)->with('proveedor');
        if ($request->filled('status')) $q->where('status',$request->status);
        if ($request->filled('q')) $q->where('nombre','like','%'.$request->q.'%');
        return response()->json($q->orderBy('nombre')->paginate(20));
    }
    public function store(Request $request) {
        $data = $request->validate(['proveedor_id'=>'nullable|exists:proveedores,id','codigo'=>'nullable|string|max:50','nombre'=>'required|string|max:150','descripcion'=>'nullable|string','composicion'=>'nullable|string|max:100','ancho_cm'=>'nullable|numeric|min:0','unidad'=>'nullable|string|max:20','precio_unitario'=>'nullable|numeric|min:0','stock_minimo'=>'nullable|numeric|min:0','status'=>'in:activo,inactivo']);
        $data['empresa_id'] = $request->auth_empresa_id;
        return response()->json(Tela::create($data)->load('proveedor'), 201);
    }
    public function show(Request $request, Tela $tela) {
        $this->chk($request,$tela->empresa_id);
        return response()->json($tela->load('proveedor','rollos'));
    }
    public function update(Request $request, Tela $tela) {
        $this->chk($request,$tela->empresa_id);
        $data = $request->validate(['proveedor_id'=>'nullable|exists:proveedores,id','codigo'=>'nullable|string|max:50','nombre'=>'sometimes|string|max:150','descripcion'=>'nullable|string','composicion'=>'nullable|string|max:100','ancho_cm'=>'nullable|numeric|min:0','unidad'=>'nullable|string|max:20','precio_unitario'=>'nullable|numeric|min:0','stock_minimo'=>'nullable|numeric|min:0','status'=>'in:activo,inactivo']);
        $tela->update($data);
        return response()->json($tela->load('proveedor'));
    }
    public function destroy(Request $request, Tela $tela) {
        $this->chk($request,$tela->empresa_id); $tela->delete(); return response()->json(null,204);
    }
    // ── Rollos ────────────────────────────────────────────────────────────────
    public function rollos(Request $request, Tela $tela) {
        $this->chk($request,$tela->empresa_id);
        return response()->json($tela->rollos()->orderByDesc('id')->paginate(30));
    }
    public function storeRollo(Request $request, Tela $tela) {
        $this->chk($request,$tela->empresa_id);
        $data = $request->validate(['numero_rollo'=>'nullable|string|max:50','color'=>'nullable|string|max:80','lote'=>'nullable|string|max:80','metros_iniciales'=>'required|numeric|min:0','precio_unitario'=>'nullable|numeric|min:0','fecha_entrada'=>'nullable|date','status'=>'in:disponible,agotado,reservado','observaciones'=>'nullable|string']);
        $data['tela_id'] = $tela->id;
        $data['metros_disponibles'] = $data['metros_iniciales'];
        $rollo = RolloTela::create($data);
        // Actualizar stock de la tela
        $tela->increment('stock_actual', $data['metros_iniciales']);
        // Registrar movimiento
        MovimientoAlmacen::create(['empresa_id'=>$request->auth_empresa_id,'tipo_item'=>'tela','item_id'=>$tela->id,'nombre_item'=>$tela->nombre,'tipo_movimiento'=>'entrada','cantidad'=>$data['metros_iniciales'],'unidad'=>$tela->unidad,'costo_unitario'=>$data['precio_unitario'] ?? $tela->precio_unitario,'referencia'=>$data['numero_rollo'] ?? null]);
        return response()->json($rollo->load('tela'), 201);
    }
    public function fraccionarRollo(Request $request, RolloTela $rollo) {
        $tela = $rollo->tela; $this->chk($request,$tela->empresa_id);
        $data = $request->validate(['metros'=>'required|numeric|min:0.01','orden_produccion_id'=>'nullable|exists:ordenes_produccion,id','referencia'=>'nullable|string|max:100','observaciones'=>'nullable|string']);
        if ($data['metros'] > $rollo->metros_disponibles) return response()->json(['message'=>'Metros insuficientes en el rollo.'],422);
        $rollo->decrement('metros_disponibles', $data['metros']);
        if ($rollo->metros_disponibles <= 0) $rollo->update(['status'=>'agotado']);
        $tela->decrement('stock_actual', $data['metros']);
        MovimientoAlmacen::create(['empresa_id'=>$request->auth_empresa_id,'tipo_item'=>'tela','item_id'=>$tela->id,'nombre_item'=>$tela->nombre,'tipo_movimiento'=>'salida','cantidad'=>$data['metros'],'unidad'=>$tela->unidad,'costo_unitario'=>$rollo->precio_unitario ?? $tela->precio_unitario,'orden_produccion_id'=>$data['orden_produccion_id'] ?? null,'referencia'=>$data['referencia'] ?? 'Rollo #'.$rollo->numero_rollo,'observaciones'=>$data['observaciones'] ?? null]);
        return response()->json($rollo->fresh()->load('tela'));
    }
    private function chk(Request $r, ?int $id): void { if ($id===null||$id!==$r->auth_empresa_id) abort(403); }
}
