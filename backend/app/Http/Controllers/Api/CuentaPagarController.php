<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\CuentaPagar;
use Illuminate\Http\Request;
class CuentaPagarController extends Controller {
    public function index(Request $request) {
        $q = CuentaPagar::where('empresa_id',$request->auth_empresa_id)->with('proveedor');
        if ($request->filled('proveedor_id')) $q->where('proveedor_id',$request->proveedor_id);
        if ($request->filled('status')) $q->where('status',$request->status);
        if ($request->boolean('vencidas')) $q->where('fecha_vencimiento','<',now())->whereIn('status',['pendiente','parcial']);
        return response()->json($q->orderBy('fecha_vencimiento')->paginate(20));
    }
    public function store(Request $request) {
        $data = $request->validate(['proveedor_id'=>'required|exists:proveedores,id','folio'=>'nullable|string|max:80','concepto'=>'required|string|max:200','monto_total'=>'required|numeric|min:0','fecha_emision'=>'required|date','fecha_vencimiento'=>'nullable|date','metodo_pago'=>'nullable|in:efectivo,transferencia,cheque,otro','observaciones'=>'nullable|string']);
        $data['empresa_id'] = $request->auth_empresa_id;
        $data['monto_pagado'] = 0;
        return response()->json(CuentaPagar::create($data)->load('proveedor'), 201);
    }
    public function show(Request $request, CuentaPagar $cuentaPagar) {
        if ($cuentaPagar->empresa_id!==$request->auth_empresa_id) abort(403);
        return response()->json($cuentaPagar->load('proveedor'));
    }
    public function registrarPago(Request $request, CuentaPagar $cuentaPagar) {
        if ($cuentaPagar->empresa_id!==$request->auth_empresa_id) abort(403);
        $data = $request->validate(['monto'=>'required|numeric|min:0.01','metodo_pago'=>'nullable|in:efectivo,transferencia,cheque,otro','observaciones'=>'nullable|string']);
        $nuevo = $cuentaPagar->monto_pagado + $data['monto'];
        if ($nuevo > $cuentaPagar->monto_total) return response()->json(['message'=>'El pago supera el saldo pendiente.'],422);
        $status = $nuevo >= $cuentaPagar->monto_total ? 'pagado' : 'parcial';
        $cuentaPagar->update(['monto_pagado'=>$nuevo,'status'=>$status,'metodo_pago'=>$data['metodo_pago'] ?? $cuentaPagar->metodo_pago]);
        return response()->json($cuentaPagar->load('proveedor'));
    }
    public function update(Request $request, CuentaPagar $cuentaPagar) {
        if ($cuentaPagar->empresa_id!==$request->auth_empresa_id) abort(403);
        $cuentaPagar->update($request->validate(['folio'=>'nullable|string|max:80','concepto'=>'sometimes|string|max:200','monto_total'=>'sometimes|numeric|min:0','fecha_emision'=>'sometimes|date','fecha_vencimiento'=>'nullable|date','metodo_pago'=>'nullable|in:efectivo,transferencia,cheque,otro','status'=>'in:pendiente,parcial,pagado,cancelado','observaciones'=>'nullable|string']));
        return response()->json($cuentaPagar->load('proveedor'));
    }
    public function destroy(Request $request, CuentaPagar $cuentaPagar) {
        if ($cuentaPagar->empresa_id!==$request->auth_empresa_id) abort(403);
        $cuentaPagar->delete(); return response()->json(null,204);
    }
}
