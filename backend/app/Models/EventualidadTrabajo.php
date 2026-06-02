<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class EventualidadTrabajo extends Model {
    protected $table = 'eventualidades_trabajo';
    protected $fillable = ['empresa_id','nombre','descripcion','fecha_hora_inicio','fecha_hora_fin','observaciones'];
    protected $casts = ['fecha_hora_inicio' => 'datetime', 'fecha_hora_fin' => 'datetime'];
    public function empresa() { return $this->belongsTo(Empresa::class); }
    public function procesos() { return $this->belongsToMany(ProcesoProduccion::class, 'proceso_eventualidades', 'eventualidad_trabajo_id', 'proceso_produccion_id'); }
    public function hojas() { return $this->belongsToMany(HojaProduccion::class, 'hoja_eventualidades', 'eventualidad_trabajo_id', 'hoja_produccion_id'); }
}
