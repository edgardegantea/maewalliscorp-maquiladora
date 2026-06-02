<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Estilo extends Model {
    protected $fillable = ['empresa_id','nombre','descripcion','categoria','status'];
    public function empresa() { return $this->belongsTo(Empresa::class); }
    public function muestras() { return $this->hasMany(Muestra::class); }
    public function fichas() { return $this->hasMany(FichaEspecificacion::class); }
    public function operaciones() { return $this->hasMany(OperacionPrenda::class); }
    public function bom() { return $this->hasMany(BomItem::class); }
    public function articulos() { return $this->hasMany(Articulo::class); }
}
