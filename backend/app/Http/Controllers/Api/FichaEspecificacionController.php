<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\FichaEspecificacion;
use App\Models\OrdenProduccion;
use Illuminate\Http\Request;

class FichaEspecificacionController extends Controller {
    public function index(OrdenProduccion $ordenProduccion) {
        return response()->json($ordenProduccion->fichas()->with('estilo')->get());
    }
    public function store(Request $request, OrdenProduccion $ordenProduccion) {
        $data = $request->validate(['estilo_id'=>'nullable|exists:estilos,id','detalles'=>'nullable|string','materiales'=>'nullable|string','instrucciones'=>'nullable|string','observaciones'=>'nullable|string']);
        $data['orden_produccion_id'] = $ordenProduccion->id;
        return response()->json(FichaEspecificacion::create($data)->load('estilo'), 201);
    }
    public function show(FichaEspecificacion $fichaEspecificacion) { return response()->json($fichaEspecificacion->load('estilo','orden')); }
    public function update(Request $request, FichaEspecificacion $fichaEspecificacion) {
        $fichaEspecificacion->update($request->validate(['estilo_id'=>'nullable|exists:estilos,id','detalles'=>'nullable|string','materiales'=>'nullable|string','instrucciones'=>'nullable|string','observaciones'=>'nullable|string']));
        return response()->json($fichaEspecificacion);
    }
    public function destroy(FichaEspecificacion $fichaEspecificacion) { $fichaEspecificacion->delete(); return response()->json(null,204); }
}
