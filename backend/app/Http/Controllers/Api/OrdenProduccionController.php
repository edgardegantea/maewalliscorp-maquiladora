<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\OrdenProduccion;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class OrdenProduccionController extends Controller {
    public function index(Request $request) {
        $q = OrdenProduccion::where('empresa_id', $request->auth_empresa_id)->with('cliente');
        if ($request->filled('status')) $q->where('status',$request->status);
        if ($request->filled('prioridad')) $q->where('prioridad',$request->prioridad);
        if ($request->filled('cliente_id')) $q->where('cliente_id',$request->cliente_id);
        if ($request->filled('search')) $q->where(function($x) use ($request){ $x->where('codigo','like',"%{$request->search}%")->orWhere('modelo','like',"%{$request->search}%"); });
        return response()->json($q->orderByRaw("FIELD(prioridad,'alta','media','baja')")->orderBy('fecha_entrega')->paginate(20));
    }
    public function store(Request $request) {
        $data = $request->validate([
            'cliente_id'      => 'required|exists:clientes,id',
            'estilo_id'       => 'nullable|exists:estilos,id',
            'codigo'          => 'nullable|string|max:50|unique:ordenes_produccion,codigo',
            'modelo'          => 'nullable|string|max:150',
            'corte'           => 'nullable|string|max:100',
            'cantidad_piezas' => 'nullable|integer|min:1',
            'fecha_entrega'   => 'nullable|date',
            'seguimiento'     => 'nullable|string',
            'prioridad'       => 'in:alta,media,baja',
            'corte_comenzado' => 'boolean',
            'observaciones'   => 'nullable|string',
        ]);
        $data['empresa_id'] = $request->auth_empresa_id;
        $data['codigo'] = $data['codigo'] ?? 'OP-'.strtoupper(Str::random(6));
        return response()->json(OrdenProduccion::create($data)->load('cliente','estilo'), 201);
    }
    public function show(Request $request, OrdenProduccion $ordenProduccion) {
        $this->chk($request,$ordenProduccion->empresa_id);
        return response()->json($ordenProduccion->load('cliente','estilo','muestras','fichas','procesos.empleado','hojasProduccion.empleado'));
    }
    public function update(Request $request, OrdenProduccion $ordenProduccion) {
        $this->chk($request,$ordenProduccion->empresa_id);
        $data = $request->validate([
            'cliente_id'      => 'sometimes|exists:clientes,id',
            'estilo_id'       => 'nullable|exists:estilos,id',
            'modelo'          => 'nullable|string|max:150',
            'corte'           => 'nullable|string|max:100',
            'cantidad_piezas' => 'nullable|integer|min:1',
            'fecha_entrega'   => 'nullable|date',
            'seguimiento'     => 'nullable|string',
            'prioridad'       => 'in:alta,media,baja',
            'corte_comenzado' => 'boolean',
            'status'          => 'in:pendiente,en_proceso,completada,cancelada',
            'observaciones'   => 'nullable|string',
        ]);
        $ordenProduccion->update($data);
        return response()->json($ordenProduccion->load('cliente','estilo'));
    }
    public function destroy(Request $request, OrdenProduccion $ordenProduccion) {
        $this->chk($request,$ordenProduccion->empresa_id);
        $ordenProduccion->delete();
        return response()->json(null,204);
    }
    private function chk(Request $request, int $id): void { if ($id !== $request->auth_empresa_id) abort(403); }
}
