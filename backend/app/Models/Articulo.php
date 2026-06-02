<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class Articulo extends Model {
    protected $table = 'articulos';
    protected $fillable = ['empresa_id','estilo_id','talla_id','codigo_sku','nombre','color','descripcion','precio_costo','precio_venta','stock_actual','status'];
    protected $casts = ['precio_costo'=>'decimal:2','precio_venta'=>'decimal:2','stock_actual'=>'decimal:2'];
    public function empresa() { return $this->belongsTo(Empresa::class); }
    public function estilo() { return $this->belongsTo(Estilo::class); }
    public function talla() { return $this->belongsTo(Talla::class); }
}
