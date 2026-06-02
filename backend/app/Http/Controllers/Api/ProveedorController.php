<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\Proveedor;
use Illuminate\Http\Request;
class ProveedorController extends Controller {
    public function index(Request $request) {
        $q = Proveedor::where('empresa_id',$request->auth_empresa_id);
        if ($request->filled('status')) $q->where('status',$request->status);
        if ($request->filled('q')) $q->where('nombre','like','%'.$request->q.'%');
        return response()->json($q->orderBy('nombre')->paginate(20));
    }
    public function store(Request $request) {
        $data = $request->validate(['nombre'=>'required|string|max:150','razon_social'=>'nullable|string|max:200','rfc'=>'nullable|string|max:20','domicilio'=>'nullable|string','telefono'=>'nullable|string|max:20','email'=>'nullable|email','contacto'=>'nullable|string|max:100','observaciones'=>'nullable|string','status'=>'in:activo,inactivo']);
        $data['empresa_id'] = $request->auth_empresa_id;
        return response()->json(Proveedor::create($data), 201);
    }
    public function show(Request $request, Proveedor $proveedor) {
        $this->chk($request,$proveedor->empresa_id);
        return response()->json($proveedor->load('telas','avios'));
    }
    public function update(Request $request, Proveedor $proveedor) {
        $this->chk($request,$proveedor->empresa_id);
        $data = $request->validate(['nombre'=>'sometimes|string|max:150','razon_social'=>'nullable|string','rfc'=>'nullable|string|max:20','domicilio'=>'nullable|string','telefono'=>'nullable|string|max:20','email'=>'nullable|email','contacto'=>'nullable|string|max:100','observaciones'=>'nullable|string','status'=>'in:activo,inactivo']);
        $proveedor->update($data);
        return response()->json($proveedor);
    }
    public function destroy(Request $request, Proveedor $proveedor) {
        $this->chk($request,$proveedor->empresa_id); $proveedor->delete(); return response()->json(null,204);
    }
    private function chk(Request $r, ?int $id): void { if ($id===null||$id!==$r->auth_empresa_id) abort(403); }
}
