<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\Talla;
use Illuminate\Http\Request;

class TallaController extends Controller {
    public function index() { return response()->json(Talla::orderBy('orden')->get()); }
    public function store(Request $request) {
        $data = $request->validate(['nombre'=>'required|string|max:20','descripcion'=>'nullable|string|max:100','orden'=>'integer|min:0']);
        return response()->json(Talla::create($data), 201);
    }
    public function show(Talla $talla) { return response()->json($talla); }
    public function update(Request $request, Talla $talla) {
        $talla->update($request->validate(['nombre'=>'sometimes|string|max:20','descripcion'=>'nullable|string|max:100','orden'=>'integer|min:0']));
        return response()->json($talla);
    }
    public function destroy(Talla $talla) { $talla->delete(); return response()->json(null,204); }
}
