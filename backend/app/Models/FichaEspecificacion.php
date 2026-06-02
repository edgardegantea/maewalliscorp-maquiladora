<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class FichaEspecificacion extends Model {
    protected $table = 'fichas_especificaciones';
    protected $fillable = ['orden_produccion_id','estilo_id','detalles','materiales','instrucciones','observaciones','archivo'];
    public function orden() { return $this->belongsTo(OrdenProduccion::class, 'orden_produccion_id'); }
    public function estilo() { return $this->belongsTo(Estilo::class); }
}
