<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\Muestra;
use App\Models\OrdenProduccion;
use Illuminate\Http\Request;

class MuestraController extends Controller {
    public function index(Request $request, OrdenProduccion $ordenProduccion) {
        return response()->json($ordenProduccion->muestras()->with('estilo')->get());
    }
    public function store(Request $request, OrdenProduccion $ordenProduccion) {
        $data = $request->validate(['estilo_id'=>'nullable|exists:estilos,id','nombre'=>'nullable|string|max:100','descripcion'=>'nullable|string','observaciones'=>'nullable|string','status'=>'in:pendiente,aprobada,rechazada']);
        $data['orden_produccion_id'] = $ordenProduccion->id;
        return response()->json(Muestra::create($data)->load('estilo'), 201);
    }
    public function show(Muestra $muestra) { return response()->json($muestra->load('estilo','orden')); }
    public function update(Request $request, Muestra $muestra) {
        $muestra->update($request->validate(['estilo_id'=>'nullable|exists:estilos,id','nombre'=>'nullable|string|max:100','descripcion'=>'nullable|string','observaciones'=>'nullable|string','status'=>'in:pendiente,aprobada,rechazada']));
        return response()->json($muestra);
    }
    public function destroy(Muestra $muestra) { $muestra->delete(); return response()->json(null,204); }
}
