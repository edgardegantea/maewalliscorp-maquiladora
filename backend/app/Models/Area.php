<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Area extends Model {
    protected $fillable = ['empresa_id','nombre','descripcion'];
    public function empresa() { return $this->belongsTo(Empresa::class); }
    public function encargados() { return $this->hasMany(AreaEncargado::class); }
    public function encargadoActivo() { return $this->hasOne(AreaEncargado::class)->where('status','activo')->latest(); }
}
