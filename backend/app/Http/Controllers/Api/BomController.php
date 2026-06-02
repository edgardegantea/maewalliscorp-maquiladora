<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\BomItem;
use App\Models\Estilo;
use Illuminate\Http\Request;
class BomController extends Controller {
    public function porEstilo(Request $request, Estilo $estilo) {
        if ($estilo->empresa_id!==$request->auth_empresa_id) abort(403);
        return response()->json($estilo->load('bom'));
    }
    public function store(Request $request) {
        $data = $request->validate(['estilo_id'=>'required|exists:estilos,id','tipo'=>'required|in:tela,avio','item_id'=>'required|integer|min:1','nombre_referencia'=>'nullable|string|max:150','cantidad_por_prenda'=>'required|numeric|min:0.0001','unidad'=>'nullable|string|max:20','observaciones'=>'nullable|string']);
        return response()->json(BomItem::create($data)->load('estilo'), 201);
    }
    public function update(Request $request, BomItem $bomItem) {
        $bomItem->update($request->validate(['nombre_referencia'=>'nullable|string|max:150','cantidad_por_prenda'=>'sometimes|numeric|min:0.0001','unidad'=>'nullable|string|max:20','observaciones'=>'nullable|string']));
        return response()->json($bomItem);
    }
    public function destroy(BomItem $bomItem) { $bomItem->delete(); return response()->json(null,204); }
}
