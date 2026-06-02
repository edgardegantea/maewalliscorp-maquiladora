<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\EventualidadTrabajo;
use Illuminate\Http\Request;

class EventualidadTrabajoController extends Controller {
    public function index(Request $request) {
        $q = EventualidadTrabajo::where('empresa_id',$request->auth_empresa_id);
        if ($request->filled('desde')) $q->where('fecha_hora_inicio','>=',$request->desde);
        return response()->json($q->orderByDesc('fecha_hora_inicio')->paginate(20));
    }
    public function store(Request $request) {
        $data = $request->validate(['nombre'=>'required|string|max:150','descripcion'=>'nullable|string','fecha_hora_inicio'=>'nullable|date_format:Y-m-d H:i:s','fecha_hora_fin'=>'nullable|date_format:Y-m-d H:i:s','observaciones'=>'nullable|string']);
        $data['empresa_id'] = $request->auth_empresa_id;
        return response()->json(EventualidadTrabajo::create($data), 201);
    }
    public function show(EventualidadTrabajo $eventualidadTrabajo) { return response()->json($eventualidadTrabajo); }
    public function update(Request $request, EventualidadTrabajo $eventualidadTrabajo) {
        $eventualidadTrabajo->update($request->validate(['nombre'=>'sometimes|string|max:150','descripcion'=>'nullable|string','fecha_hora_inicio'=>'nullable|date_format:Y-m-d H:i:s','fecha_hora_fin'=>'nullable|date_format:Y-m-d H:i:s','observaciones'=>'nullable|string']));
        return response()->json($eventualidadTrabajo);
    }
    public function destroy(EventualidadTrabajo $eventualidadTrabajo) { $eventualidadTrabajo->delete(); return response()->json(null,204); }
}
