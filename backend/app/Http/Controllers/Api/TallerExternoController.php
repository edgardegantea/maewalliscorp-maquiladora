<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\TallerExterno;
use App\Models\EnvioTaller;
use Illuminate\Http\Request;
class TallerExternoController extends Controller {
    public function index(Request $request) {
        $q = TallerExterno::where('empresa_id',$request->auth_empresa_id);
        if ($request->filled('status')) $q->where('status',$request->status);
        return response()->json($q->orderBy('nombre')->paginate(20));
    }
    public function store(Request $request) {
        $data = $request->validate(['nombre'=>'required|string|max:150','responsable'=>'nullable|string|max:150','telefono'=>'nullable|string|max:20','email'=>'nullable|email','domicilio'=>'nullable|string','especialidad'=>'nullable|string','observaciones'=>'nullable|string','status'=>'in:activo,inactivo']);
        $data['empresa_id'] = $request->auth_empresa_id;
        return response()->json(TallerExterno::create($data), 201);
    }
    public function show(Request $request, TallerExterno $tallerExterno) {
        $this->chk($request,$tallerExterno->empresa_id);
        return response()->json($tallerExterno->load('envios.orden'));
    }
    public function update(Request $request, TallerExterno $tallerExterno) {
        $this->chk($request,$tallerExterno->empresa_id);
        $tallerExterno->update($request->validate(['nombre'=>'sometimes|string|max:150','responsable'=>'nullable|string|max:150','telefono'=>'nullable|string|max:20','email'=>'nullable|email','domicilio'=>'nullable|string','especialidad'=>'nullable|string','observaciones'=>'nullable|string','status'=>'in:activo,inactivo']));
        return response()->json($tallerExterno);
    }
    public function destroy(Request $request, TallerExterno $tallerExterno) {
        $this->chk($request,$tallerExterno->empresa_id); $tallerExterno->delete(); return response()->json(null,204);
    }
    // ── Envíos ────────────────────────────────────────────────────────────────
    public function envios(Request $request) {
        $q = EnvioTaller::where('empresa_id',$request->auth_empresa_id)->with('taller','orden.cliente');
        if ($request->filled('taller_id')) $q->where('taller_id',$request->taller_id);
        if ($request->filled('status')) $q->where('status',$request->status);
        if ($request->filled('orden_produccion_id')) $q->where('orden_produccion_id',$request->orden_produccion_id);
        return response()->json($q->orderByDesc('fecha_envio')->paginate(20));
    }
    public function storeEnvio(Request $request) {
        $data = $request->validate(['taller_id'=>'required|exists:talleres_externos,id','orden_produccion_id'=>'nullable|exists:ordenes_produccion,id','concepto'=>'required|string|max:200','piezas_enviadas'=>'required|integer|min:1','precio_por_pieza'=>'nullable|numeric|min:0','fecha_envio'=>'required|date','fecha_compromiso'=>'nullable|date|after_or_equal:fecha_envio','observaciones'=>'nullable|string']);
        $data['empresa_id'] = $request->auth_empresa_id;
        $data['piezas_recibidas'] = 0;
        if (!empty($data['precio_por_pieza'])) $data['importe_total'] = $data['piezas_enviadas'] * $data['precio_por_pieza'];
        return response()->json(EnvioTaller::create($data)->load('taller','orden.cliente'), 201);
    }
    public function updateEnvio(Request $request, EnvioTaller $envioTaller) {
        if ($envioTaller->empresa_id !== $request->auth_empresa_id) abort(403);
        $data = $request->validate(['piezas_recibidas'=>'nullable|integer|min:0','fecha_recepcion'=>'nullable|date','status'=>'in:enviado,en_proceso,recibido_parcial,recibido,cancelado','observaciones'=>'nullable|string','precio_por_pieza'=>'nullable|numeric|min:0']);
        if (!empty($data['precio_por_pieza'])) $data['importe_total'] = $envioTaller->piezas_enviadas * $data['precio_por_pieza'];
        $envioTaller->update($data);
        return response()->json($envioTaller->load('taller','orden.cliente'));
    }
    private function chk(Request $r, ?int $id): void { if ($id===null||$id!==$r->auth_empresa_id) abort(403); }
}
