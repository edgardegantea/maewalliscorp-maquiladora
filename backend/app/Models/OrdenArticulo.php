<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class OrdenArticulo extends Model {
    protected $table = 'orden_articulos';
    protected $fillable = ['orden_produccion_id','articulo_id','descripcion','color','talla_id','cantidad','precio_unitario'];
    protected $casts = ['precio_unitario'=>'decimal:2'];
    public function orden() { return $this->belongsTo(OrdenProduccion::class,'orden_produccion_id'); }
    public function articulo() { return $this->belongsTo(Articulo::class); }
    public function talla() { return $this->belongsTo(Talla::class); }
}
