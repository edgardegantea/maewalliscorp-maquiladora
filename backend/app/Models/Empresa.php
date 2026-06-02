<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Empresa extends Model {
    protected $fillable = ['nombre','razon_social','domicilio','telefono','email','rfc','logo'];
    public function empleados() { return $this->hasMany(Empleado::class); }
    public function areas() { return $this->hasMany(Area::class); }
    public function clientes() { return $this->hasMany(Cliente::class); }
    public function estilos() { return $this->hasMany(Estilo::class); }
    public function lineasProduccion() { return $this->hasMany(LineaProduccion::class); }
    public function ordenes() { return $this->hasMany(OrdenProduccion::class); }
    public function eventualidades() { return $this->hasMany(EventualidadTrabajo::class); }
    public function diasLaborables() { return $this->hasMany(DiaLaborable::class); }
    public function hojasProduccion() { return $this->hasMany(HojaProduccion::class); }
    public function users() { return $this->hasMany(User::class); }
}
