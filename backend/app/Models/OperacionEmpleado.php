<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class OperacionEmpleado extends Model {
    protected $table = 'operacion_empleados';
    protected $fillable = ['operacion_prenda_id','empleado_id','es_foraneo','num_piezas_asignadas','precio_variable'];
    protected $casts = ['es_foraneo' => 'boolean'];
    public function operacion() { return $this->belongsTo(OperacionPrenda::class, 'operacion_prenda_id'); }
    public function empleado() { return $this->belongsTo(Empleado::class); }
}
