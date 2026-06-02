<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class ProcesoProduccion extends Model {
    protected $table = 'procesos_produccion';
    protected $fillable = ['orden_produccion_id','empleado_id','nombre_proceso','fase','observaciones','status'];
    public function orden() { return $this->belongsTo(OrdenProduccion::class, 'orden_produccion_id'); }
    public function empleado() { return $this->belongsTo(Empleado::class); }
    public function eventualidades() { return $this->belongsToMany(EventualidadTrabajo::class, 'proceso_eventualidades', 'proceso_produccion_id', 'eventualidad_trabajo_id'); }
}
