<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\LineaProduccion;
use Illuminate\Http\Request;

class LineaProduccionController extends Controller {
    public function index(Request $request) {
        return response()->json(LineaProduccion::where('empresa_id',$request->auth_empresa_id)->orderBy('codigo')->get());
    }
    public function store(Request $request) {
        $data = $request->validate(['codigo'=>'required|string|max:50|unique:lineas_produccion,codigo','ubicacion'=>'nullable|string|max:200','descripcion'=>'nullable|string','status'=>'in:activo,inactivo']);
        $data['empresa_id'] = $request->auth_empresa_id;
        return response()->json(LineaProduccion::create($data), 201);
    }
    public function show(Request $request, LineaProduccion $lineaProduccion) { $this->chk($request,$lineaProduccion->empresa_id); return response()->json($lineaProduccion); }
    public function update(Request $request, LineaProduccion $lineaProduccion) {
        $this->chk($request,$lineaProduccion->empresa_id);
        $lineaProduccion->update($request->validate(['codigo'=>"sometimes|string|max:50|unique:lineas_produccion,codigo,{$lineaProduccion->id}",'ubicacion'=>'nullable|string|max:200','descripcion'=>'nullable|string','status'=>'in:activo,inactivo']));
        return response()->json($lineaProduccion);
    }
    public function destroy(Request $request, LineaProduccion $lineaProduccion) { $this->chk($request,$lineaProduccion->empresa_id); $lineaProduccion->delete(); return response()->json(null,204); }
    private function chk(Request $request, int $id): void { if ($id !== $request->auth_empresa_id) abort(403); }
}
