<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\Empresa;
use Illuminate\Http\Request;

class EmpresaController extends Controller {
    public function show(Request $request) {
        return response()->json($request->attributes->get('auth_user')->load('empresa')->empresa);
    }
    public function update(Request $request) {
        $empresa = Empresa::findOrFail($request->auth_empresa_id);
        $data = $request->validate([
            'nombre' => 'sometimes|string|max:255',
            'razon_social' => 'nullable|string|max:255',
            'domicilio' => 'nullable|string',
            'telefono' => 'nullable|string|max:20',
            'email' => 'nullable|email',
            'rfc' => 'nullable|string|max:20',
        ]);
        $empresa->update($data);
        return response()->json($empresa);
    }
}
