<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class CuentaPagar extends Model {
    protected $table = 'cuentas_pagar';
    protected $fillable = ['empresa_id','proveedor_id','folio','concepto','monto_total','monto_pagado','fecha_emision','fecha_vencimiento','metodo_pago','status','observaciones'];
    protected $casts = ['monto_total'=>'decimal:2','monto_pagado'=>'decimal:2','fecha_emision'=>'date','fecha_vencimiento'=>'date'];
    public function empresa() { return $this->belongsTo(Empresa::class); }
    public function proveedor() { return $this->belongsTo(Proveedor::class); }
}
