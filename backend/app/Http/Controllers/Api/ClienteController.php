<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\Cliente;
use Illuminate\Http\Request;

class ClienteController extends Controller {
    public function index(Request $request) {
        $q = Cliente::where('empresa_id', $request->auth_empresa_id);
        if ($request->filled('status')) $q->where('status', $request->status);
        if ($request->filled('search')) $q->where(function($x) use ($request) {
            $x->where('nombre','like',"%{$request->search}%")->orWhere('razon_social','like',"%{$request->search}%");
        });
        return response()->json($q->orderBy('nombre')->paginate(20));
    }
    public function store(Request $request) {
        $data = $request->validate(['nombre'=>'required|string|max:150','razon_social'=>'nullable|string|max:200','domicilio'=>'nullable|string','telefono'=>'nullable|string|max:20','email'=>'nullable|email','status'=>'in:activo,inactivo']);
        $data['empresa_id'] = $request->auth_empresa_id;
        return response()->json(Cliente::create($data), 201);
    }
    public function show(Request $request, Cliente $cliente) { $this->chk($request,$cliente->empresa_id); return response()->json($cliente); }
    public function update(Request $request, Cliente $cliente) {
        $this->chk($request,$cliente->empresa_id);
        $cliente->update($request->validate(['nombre'=>'sometimes|string|max:150','razon_social'=>'nullable|string|max:200','domicilio'=>'nullable|string','telefono'=>'nullable|string|max:20','email'=>'nullable|email','status'=>'in:activo,inactivo']));
        return response()->json($cliente);
    }
    public function destroy(Request $request, Cliente $cliente) { $this->chk($request,$cliente->empresa_id); $cliente->delete(); return response()->json(null,204); }
    private function chk(Request $request, int $id): void { if ($id !== $request->auth_empresa_id) abort(403); }
}
