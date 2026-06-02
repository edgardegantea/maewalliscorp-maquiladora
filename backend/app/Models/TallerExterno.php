<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class TallerExterno extends Model {
    protected $table = 'talleres_externos';
    protected $fillable = ['empresa_id','nombre','responsable','telefono','email','domicilio','especialidad','observaciones','status'];
    public function empresa() { return $this->belongsTo(Empresa::class); }
    public function envios() { return $this->hasMany(EnvioTaller::class,'taller_id'); }
}
