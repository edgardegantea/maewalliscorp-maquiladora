<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class HojaProduccion extends Model {
    protected $table = 'hojas_produccion';
    protected $fillable = ['empresa_id','empleado_id','orden_produccion_id','fecha_inicio','fecha_fin','dias_inhabiles','importe_total','total_a_pagar','fecha_registro','observaciones'];
    protected $casts = ['fecha_inicio' => 'date', 'fecha_fin' => 'date', 'fecha_registro' => 'date', 'importe_total' => 'decimal:2', 'total_a_pagar' => 'decimal:2'];
    public function empresa() { return $this->belongsTo(Empresa::class); }
    public function empleado() { return $this->belongsTo(Empleado::class); }
    public function orden() { return $this->belongsTo(OrdenProduccion::class, 'orden_produccion_id'); }
    public function operaciones() { return $this->hasMany(HojaOperacion::class); }
    public function eventualidades() { return $this->belongsToMany(EventualidadTrabajo::class, 'hoja_eventualidades', 'hoja_produccion_id', 'eventualidad_trabajo_id'); }
}
