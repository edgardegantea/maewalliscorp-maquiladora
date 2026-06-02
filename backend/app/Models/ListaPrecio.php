<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class ListaPrecio extends Model {
    protected $table = 'listas_precios';
    protected $fillable = ['empresa_id','nombre','descripcion','tipo','fecha_vigencia_inicio','fecha_vigencia_fin','activa'];
    protected $casts = ['fecha_vigencia_inicio'=>'date','fecha_vigencia_fin'=>'date','activa'=>'boolean'];
    public function empresa() { return $this->belongsTo(Empresa::class); }
    public function articulos() { return $this->hasMany(ListaPrecioArticulo::class,'lista_precio_id'); }
}
