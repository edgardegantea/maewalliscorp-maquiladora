<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\Articulo;
use App\Models\Estilo;
use App\Models\Talla;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
class ArticuloController extends Controller {
    public function index(Request $request) {
        $q = Articulo::where('empresa_id',$request->auth_empresa_id)->with('estilo','talla');
        if ($request->filled('estilo_id')) $q->where('estilo_id',$request->estilo_id);
        if ($request->filled('color')) $q->where('color',$request->color);
        if ($request->filled('status')) $q->where('status',$request->status);
        if ($request->filled('q')) $q->where(fn($s)=>$s->where('nombre','like','%'.$request->q.'%')->orWhere('codigo_sku','like','%'.$request->q.'%'));
        return response()->json($q->orderBy('nombre')->paginate(30));
    }
    public function store(Request $request) {
        $data = $request->validate(['estilo_id'=>'nullable|exists:estilos,id','talla_id'=>'nullable|exists:tallas,id','codigo_sku'=>'nullable|string|max:80','nombre'=>'required|string|max:150','color'=>'nullable|string|max:80','descripcion'=>'nullable|string','precio_costo'=>'nullable|numeric|min:0','precio_venta'=>'nullable|numeric|min:0','status'=>'in:activo,inactivo']);
        $data['empresa_id'] = $request->auth_empresa_id;
        if (empty($data['codigo_sku'])) $data['codigo_sku'] = strtoupper(Str::random(8));
        return response()->json(Articulo::create($data)->load('estilo','talla'), 201);
    }
    // Generación masiva: crea un artículo por cada combinación color × talla de un estilo
    public function generarVariantes(Request $request) {
        $data = $request->validate(['estilo_id'=>'required|exists:estilos,id','nombre_base'=>'required|string|max:100','colores'=>'required|array|min:1','colores.*'=>'string|max:80','talla_ids'=>'required|array|min:1','talla_ids.*'=>'exists:tallas,id','precio_costo'=>'nullable|numeric|min:0','precio_venta'=>'nullable|numeric|min:0']);
        $eid = $request->auth_empresa_id;
        $creados = [];
        foreach ($data['colores'] as $color) {
            foreach ($data['talla_ids'] as $tallaId) {
                $talla = Talla::find($tallaId);
                $sku = strtoupper(Str::slug($data['nombre_base'].'-'.$color.'-'.$talla->nombre,'-'));
                $art = Articulo::firstOrCreate(
                    ['empresa_id'=>$eid,'codigo_sku'=>$sku],
                    ['estilo_id'=>$data['estilo_id'],'talla_id'=>$tallaId,'nombre'=>$data['nombre_base'],'color'=>$color,'precio_costo'=>$data['precio_costo']??null,'precio_venta'=>$data['precio_venta']??null,'status'=>'activo']
                );
                $creados[] = $art->load('estilo','talla');
            }
        }
        return response()->json(['total'=>count($creados),'articulos'=>$creados], 201);
    }
    public function show(Request $request, Articulo $articulo) {
        $this->chk($request,$articulo->empresa_id);
        return response()->json($articulo->load('estilo','talla'));
    }
    public function update(Request $request, Articulo $articulo) {
        $this->chk($request,$articulo->empresa_id);
        $data = $request->validate(['estilo_id'=>'nullable|exists:estilos,id','talla_id'=>'nullable|exists:tallas,id','codigo_sku'=>'nullable|string|max:80','nombre'=>'sometimes|string|max:150','color'=>'nullable|string|max:80','descripcion'=>'nullable|string','precio_costo'=>'nullable|numeric|min:0','precio_venta'=>'nullable|numeric|min:0','status'=>'in:activo,inactivo']);
        $articulo->update($data);
        return response()->json($articulo->load('estilo','talla'));
    }
    public function destroy(Request $request, Articulo $articulo) {
        $this->chk($request,$articulo->empresa_id); $articulo->delete(); return response()->json(null,204);
    }
    private function chk(Request $r, ?int $id): void { if ($id===null||$id!==$r->auth_empresa_id) abort(403); }
}
