<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\ProcesoProduccion;
use App\Models\OrdenProduccion;
use Illuminate\Http\Request;

class ProcesoProduccionController extends Controller {
    public function index(OrdenProduccion $ordenProduccion) {
        return response()->json($ordenProduccion->procesos()->with('empleado','eventualidades')->get());
    }
    public function store(Request $request, OrdenProduccion $ordenProduccion) {
        $data = $request->validate(['empleado_id'=>'nullable|exists:empleados,id','nombre_proceso'=>'required|string|max:150','fase'=>'in:habilitacion,ensamble,otro','observaciones'=>'nullable|string']);
        $data['orden_produccion_id'] = $ordenProduccion->id;
        $proceso = ProcesoProduccion::create($data);
        if ($request->filled('eventualidades')) {
            $proceso->eventualidades()->sync($request->eventualidades);
        }
        return response()->json($proceso->load('empleado','eventualidades'), 201);
    }
    public function show(ProcesoProduccion $procesoProduccion) { return response()->json($procesoProduccion->load('empleado','eventualidades')); }
    public function update(Request $request, ProcesoProduccion $procesoProduccion) {
        $procesoProduccion->update($request->validate(['empleado_id'=>'nullable|exists:empleados,id','nombre_proceso'=>'sometimes|string|max:150','fase'=>'in:habilitacion,ensamble,otro','observaciones'=>'nullable|string','status'=>'in:pendiente,en_proceso,completado']));
        if ($request->has('eventualidades')) $procesoProduccion->eventualidades()->sync($request->eventualidades);
        return response()->json($procesoProduccion->load('empleado','eventualidades'));
    }
    public function destroy(ProcesoProduccion $procesoProduccion) { $procesoProduccion->delete(); return response()->json(null,204); }
}
