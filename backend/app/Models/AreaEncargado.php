<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class AreaEncargado extends Model {
    protected $table = 'area_encargados';
    protected $fillable = ['area_id','empleado_id','fecha_inicio','fecha_fin','status'];
    public function area() { return $this->belongsTo(Area::class); }
    public function empleado() { return $this->belongsTo(Empleado::class); }
    public function operaciones() { return $this->hasMany(OperacionPrenda::class); }
}
