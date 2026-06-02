<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Cliente extends Model {
    protected $fillable = ['empresa_id','nombre','razon_social','domicilio','telefono','email','status'];
    public function empresa() { return $this->belongsTo(Empresa::class); }
    public function ordenes() { return $this->hasMany(OrdenProduccion::class); }
    public function operaciones() { return $this->hasMany(OperacionPrenda::class); }
}
