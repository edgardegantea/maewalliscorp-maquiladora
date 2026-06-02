<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class LineaProduccion extends Model {
    protected $table = 'lineas_produccion';
    protected $fillable = ['empresa_id','codigo','ubicacion','descripcion','status'];
    public function empresa() { return $this->belongsTo(Empresa::class); }
    public function operaciones() { return $this->hasMany(OperacionPrenda::class); }
}
