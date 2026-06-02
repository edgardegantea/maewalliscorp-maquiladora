<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\ListaPrecio;
use App\Models\ListaPrecioArticulo;
use Illuminate\Http\Request;
class ListaPrecioController extends Controller {
    public function index(Request $request) {
        return response()->json(ListaPrecio::where('empresa_id',$request->auth_empresa_id)->orderBy('nombre')->paginate(20));
    }
    public function store(Request $request) {
        $data = $request->validate(['nombre'=>'required|string|max:150','descripcion'=>'nullable|string','tipo'=>'nullable|in:general,cliente,mayoreo,menudeo','fecha_vigencia_inicio'=>'nullable|date','fecha_vigencia_fin'=>'nullable|date|after_or_equal:fecha_vigencia_inicio','activa'=>'boolean',
            'articulos'=>'nullable|array','articulos.*.articulo_id'=>'required|exists:articulos,id','articulos.*.precio'=>'required|numeric|min:0']);
        $data['empresa_id'] = $request->auth_empresa_id;
        $articulos = $data['articulos'] ?? []; unset($data['articulos']);
        $lista = ListaPrecio::create($data);
        foreach ($articulos as $a) ListaPrecioArticulo::create(['lista_precio_id'=>$lista->id,'articulo_id'=>$a['articulo_id'],'precio'=>$a['precio']]);
        return response()->json($lista->load('articulos.articulo'), 201);
    }
    public function show(Request $request, ListaPrecio $listaPrecio) {
        if ($listaPrecio->empresa_id!==$request->auth_empresa_id) abort(403);
        return response()->json($listaPrecio->load('articulos.articulo.estilo','articulos.articulo.talla'));
    }
    public function update(Request $request, ListaPrecio $listaPrecio) {
        if ($listaPrecio->empresa_id!==$request->auth_empresa_id) abort(403);
        $listaPrecio->update($request->validate(['nombre'=>'sometimes|string|max:150','descripcion'=>'nullable|string','tipo'=>'nullable|in:general,cliente,mayoreo,menudeo','fecha_vigencia_inicio'=>'nullable|date','fecha_vigencia_fin'=>'nullable|date','activa'=>'boolean']));
        return response()->json($listaPrecio);
    }
    public function syncArticulos(Request $request, ListaPrecio $listaPrecio) {
        if ($listaPrecio->empresa_id!==$request->auth_empresa_id) abort(403);
        $data = $request->validate(['articulos'=>'required|array','articulos.*.articulo_id'=>'required|exists:articulos,id','articulos.*.precio'=>'required|numeric|min:0']);
        $listaPrecio->articulos()->delete();
        foreach ($data['articulos'] as $a) ListaPrecioArticulo::create(['lista_precio_id'=>$listaPrecio->id,'articulo_id'=>$a['articulo_id'],'precio'=>$a['precio']]);
        return response()->json($listaPrecio->load('articulos.articulo'));
    }
    public function destroy(Request $request, ListaPrecio $listaPrecio) {
        if ($listaPrecio->empresa_id!==$request->auth_empresa_id) abort(403);
        $listaPrecio->delete(); return response()->json(null,204);
    }
}
