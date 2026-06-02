<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Muestra extends Model {
    protected $fillable = ['orden_produccion_id','estilo_id','nombre','descripcion','observaciones','status'];
    public function orden() { return $this->belongsTo(OrdenProduccion::class, 'orden_produccion_id'); }
    public function estilo() { return $this->belongsTo(Estilo::class); }
}
