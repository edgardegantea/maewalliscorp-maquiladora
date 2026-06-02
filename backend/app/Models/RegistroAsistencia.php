<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class RegistroAsistencia extends Model {
    protected $table = 'registro_asistencia';
    protected $fillable = ['empleado_id','fecha','entrada','entrada_comida','salida_comida','salida','observaciones'];
    public function empleado() { return $this->belongsTo(Empleado::class); }
}
