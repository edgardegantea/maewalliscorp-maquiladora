<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\Area;
use Illuminate\Http\Request;

class AreaController extends Controller {
    public function index(Request $request) {
        return response()->json(Area::where('empresa_id', $request->auth_empresa_id)->with('encargadoActivo.empleado')->get());
    }
    public function store(Request $request) {
        $data = $request->validate(['nombre' => 'required|string|max:100', 'descripcion' => 'nullable|string']);
        $data['empresa_id'] = $request->auth_empresa_id;
        return response()->json(Area::create($data), 201);
    }
    public function show(Request $request, Area $area) {
        $this->chk($request, $area->empresa_id);
        return response()->json($area->load('encargados.empleado'));
    }
    public function update(Request $request, Area $area) {
        $this->chk($request, $area->empresa_id);
        $area->update($request->validate(['nombre' => 'sometimes|string|max:100', 'descripcion' => 'nullable|string']));
        return response()->json($area);
    }
    public function destroy(Request $request, Area $area) {
        $this->chk($request, $area->empresa_id);
        $area->delete();
        return response()->json(null, 204);
    }
    private function chk(Request $request, int $id): void { if ($id !== $request->auth_empresa_id) abort(403); }
}
