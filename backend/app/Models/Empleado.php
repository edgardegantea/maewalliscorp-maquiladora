<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Empleado extends Model {
    protected $fillable = ['empresa_id','numero_huella','nombre','apellidos','domicilio','telefono','email','foto','status'];
    public function empresa() { return $this->belongsTo(Empresa::class); }
    public function registroAsistencia() { return $this->hasMany(RegistroAsistencia::class); }
    public function areasEncargado() { return $this->hasMany(AreaEncargado::class); }
    public function procesosProduccion() { return $this->hasMany(ProcesoProduccion::class); }
    public function operacionesAsignadas() { return $this->hasMany(\App\Models\OperacionEmpleado::class); }
    public function hojasProduccion() { return $this->hasMany(HojaProduccion::class); }
    public function user() { return $this->hasOne(User::class); }
}
