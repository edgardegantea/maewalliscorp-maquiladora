<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\OperacionPrenda;
use App\Models\OperacionEmpleado;
use Illuminate\Http\Request;

class OperacionPrendaController extends Controller {
    public function index(Request $request) {
        $q = OperacionPrenda::with('estilo','cliente','lineaProduccion','areaEncargado.empleado');
        if ($request->filled('estilo_id')) $q->where('estilo_id',$request->estilo_id);
        if ($request->filled('cliente_id')) $q->where('cliente_id',$request->cliente_id);
        if ($request->filled('linea_produccion_id')) $q->where('linea_produccion_id',$request->linea_produccion_id);
        return response()->json($q->orderBy('nombre')->paginate(20));
    }
    public function store(Request $request) {
        $data = $request->validate([
            'estilo_id'=>'nullable|exists:estilos,id','cliente_id'=>'nullable|exists:clientes,id',
            'linea_produccion_id'=>'nullable|exists:lineas_produccion,id','area_encargado_id'=>'nullable|exists:area_encargados,id',
            'nombre'=>'required|string|max:150','descripcion'=>'nullable|string','detalle'=>'nullable|string',
            'observaciones'=>'nullable|string','precio'=>'nullable|numeric|min:0','numero_piezas'=>'nullable|integer|min:0',
            'empleados'=>'nullable|array','empleados.*.empleado_id'=>'required|exists:empleados,id',
            'empleados.*.es_foraneo'=>'boolean','empleados.*.num_piezas_asignadas'=>'nullable|integer|min:0',
            'empleados.*.precio_variable'=>'nullable|numeric|min:0',
        ]);
        $op = OperacionPrenda::create($data);
        foreach ($data['empleados'] ?? [] as $e) {
            OperacionEmpleado::create(['operacion_prenda_id'=>$op->id,...$e]);
        }
        return response()->json($op->load('estilo','cliente','empleados.empleado'), 201);
    }
    public function show(OperacionPrenda $operacionPrenda) {
        return response()->json($operacionPrenda->load('estilo','cliente','lineaProduccion','areaEncargado.empleado','empleados.empleado'));
    }
    public function update(Request $request, OperacionPrenda $operacionPrenda) {
        $data = $request->validate([
            'estilo_id'=>'nullable|exists:estilos,id','cliente_id'=>'nullable|exists:clientes,id',
            'linea_produccion_id'=>'nullable|exists:lineas_produccion,id','area_encargado_id'=>'nullable|exists:area_encargados,id',
            'nombre'=>'sometimes|string|max:150','descripcion'=>'nullable|string','detalle'=>'nullable|string',
            'observaciones'=>'nullable|string','precio'=>'nullable|numeric|min:0','numero_piezas'=>'nullable|integer|min:0',
        ]);
        $operacionPrenda->update($data);
        return response()->json($operacionPrenda->load('estilo','cliente'));
    }
    public function destroy(OperacionPrenda $operacionPrenda) { $operacionPrenda->delete(); return response()->json(null,204); }
}
