<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class ListaPrecioArticulo extends Model {
    protected $table = 'lista_precio_articulos';
    protected $fillable = ['lista_precio_id','articulo_id','precio'];
    protected $casts = ['precio'=>'decimal:2'];
    public function lista() { return $this->belongsTo(ListaPrecio::class,'lista_precio_id'); }
    public function articulo() { return $this->belongsTo(Articulo::class); }
}
