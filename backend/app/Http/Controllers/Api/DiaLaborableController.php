<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\DiaLaborable;
use Illuminate\Http\Request;

class DiaLaborableController extends Controller {
    public function index(Request $request) {
        return response()->json(DiaLaborable::where('empresa_id',$request->auth_empresa_id)->get());
    }
    public function store(Request $request) {
        $data = $request->validate(['dia_semana'=>'required|in:lunes,martes,miercoles,jueves,viernes,sabado,domingo','activo'=>'boolean','hora_entrada'=>'nullable|date_format:H:i','hora_salida'=>'nullable|date_format:H:i']);
        $data['empresa_id'] = $request->auth_empresa_id;
        $dia = DiaLaborable::updateOrCreate(['empresa_id'=>$data['empresa_id'],'dia_semana'=>$data['dia_semana']],$data);
        return response()->json($dia, 201);
    }
    public function update(Request $request, DiaLaborable $diaLaborable) {
        $diaLaborable->update($request->validate(['activo'=>'boolean','hora_entrada'=>'nullable|date_format:H:i','hora_salida'=>'nullable|date_format:H:i']));
        return response()->json($diaLaborable);
    }
}
