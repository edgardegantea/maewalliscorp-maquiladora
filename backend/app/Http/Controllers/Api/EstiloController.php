<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\Estilo;
use Illuminate\Http\Request;

class EstiloController extends Controller {
    public function index(Request $request) {
        $q = Estilo::where('empresa_id', $request->auth_empresa_id);
        if ($request->filled('status')) $q->where('status',$request->status);
        if ($request->filled('categoria')) $q->where('categoria',$request->categoria);
        return response()->json($q->orderBy('nombre')->get());
    }
    public function store(Request $request) {
        $data = $request->validate(['nombre'=>'required|string|max:100','descripcion'=>'nullable|string','categoria'=>'nullable|string|max:100','status'=>'in:activo,inactivo']);
        $data['empresa_id'] = $request->auth_empresa_id;
        return response()->json(Estilo::create($data), 201);
    }
    public function show(Request $request, Estilo $estilo) { $this->chk($request,$estilo->empresa_id); return response()->json($estilo); }
    public function update(Request $request, Estilo $estilo) {
        $this->chk($request,$estilo->empresa_id);
        $estilo->update($request->validate(['nombre'=>'sometimes|string|max:100','descripcion'=>'nullable|string','categoria'=>'nullable|string|max:100','status'=>'in:activo,inactivo']));
        return response()->json($estilo);
    }
    public function destroy(Request $request, Estilo $estilo) { $this->chk($request,$estilo->empresa_id); $estilo->delete(); return response()->json(null,204); }
    private function chk(Request $request, int $id): void { if ($id !== $request->auth_empresa_id) abort(403); }
}
