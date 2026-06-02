<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class MovimientoAlmacen extends Model {
    protected $table = 'movimientos_almacen';
    protected $fillable = ['empresa_id','tipo_item','item_id','nombre_item','tipo_movimiento','cantidad','unidad','costo_unitario','orden_produccion_id','proveedor_id','referencia','observaciones'];
    protected $casts = ['cantidad'=>'decimal:4','costo_unitario'=>'decimal:2'];
    public function empresa() { return $this->belongsTo(Empresa::class); }
    public function orden() { return $this->belongsTo(OrdenProduccion::class,'orden_produccion_id'); }
    public function proveedor() { return $this->belongsTo(Proveedor::class); }
}
