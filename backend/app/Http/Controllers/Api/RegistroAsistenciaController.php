<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\Empleado;
use App\Models\RegistroAsistencia;
use Illuminate\Http\Request;

class RegistroAsistenciaController extends Controller {
    public function index(Request $request) {
        $q = RegistroAsistencia::with('empleado')->whereHas('empleado', fn($e) => $e->where('empresa_id',$request->auth_empresa_id));
        if ($request->filled('empleado_id')) $q->where('empleado_id',$request->empleado_id);
        if ($request->filled('desde')) $q->where('fecha','>=',$request->desde);
        if ($request->filled('hasta')) $q->where('fecha','<=',$request->hasta);
        return response()->json($q->orderByDesc('fecha')->paginate(30));
    }
    public function store(Request $request) {
        $data = $request->validate(['empleado_id'=>'required|exists:empleados,id','fecha'=>'required|date','entrada'=>'nullable|date_format:H:i:s,H:i','entrada_comida'=>'nullable|date_format:H:i:s,H:i','salida_comida'=>'nullable|date_format:H:i:s,H:i','salida'=>'nullable|date_format:H:i:s,H:i','observaciones'=>'nullable|string']);
        // Normalize HH:MM → HH:MM:SS for MySQL TIME columns
        foreach (['entrada','entrada_comida','salida_comida','salida'] as $field) {
            if (!empty($data[$field]) && strlen($data[$field]) === 5) $data[$field] .= ':00';
        }
        $reg = RegistroAsistencia::updateOrCreate(['empleado_id'=>$data['empleado_id'],'fecha'=>$data['fecha']],$data);
        return response()->json($reg->load('empleado'), 201);
    }
    public function show(RegistroAsistencia $registroAsistencium) { return response()->json($registroAsistencium->load('empleado')); }
    public function update(Request $request, RegistroAsistencia $registroAsistencium) {
        $data = $request->validate(['entrada'=>'nullable|date_format:H:i:s,H:i','entrada_comida'=>'nullable|date_format:H:i:s,H:i','salida_comida'=>'nullable|date_format:H:i:s,H:i','salida'=>'nullable|date_format:H:i:s,H:i','observaciones'=>'nullable|string']);
        foreach (['entrada','entrada_comida','salida_comida','salida'] as $field) {
            if (!empty($data[$field]) && strlen($data[$field]) === 5) $data[$field] .= ':00';
        }
        $registroAsistencium->update($data);
        return response()->json($registroAsistencium);
    }
    public function destroy(RegistroAsistencia $registroAsistencium) { $registroAsistencium->delete(); return response()->json(null,204); }
}
