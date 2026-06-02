<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class Proveedor extends Model {
    protected $table = 'proveedores';
    protected $fillable = ['empresa_id','nombre','razon_social','rfc','domicilio','telefono','email','contacto','observaciones','status'];
    public function empresa() { return $this->belongsTo(Empresa::class); }
    public function telas() { return $this->hasMany(Tela::class); }
    public function avios() { return $this->hasMany(Avio::class); }
    public function cuentasPagar() { return $this->hasMany(CuentaPagar::class); }
}
