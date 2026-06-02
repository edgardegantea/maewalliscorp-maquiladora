<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class BomItem extends Model {
    protected $table = 'bom_items';
    protected $fillable = ['estilo_id','tipo','item_id','nombre_referencia','cantidad_por_prenda','unidad','observaciones'];
    protected $casts = ['cantidad_por_prenda'=>'decimal:4'];
    public function estilo() { return $this->belongsTo(Estilo::class); }
}
