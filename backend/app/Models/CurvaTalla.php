<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class CurvaTalla extends Model {
    protected $table = 'curva_tallas';
    protected $fillable = ['orden_produccion_id','talla_id','cantidad'];
    public function orden() { return $this->belongsTo(OrdenProduccion::class,'orden_produccion_id'); }
    public function talla() { return $this->belongsTo(Talla::class); }
}
