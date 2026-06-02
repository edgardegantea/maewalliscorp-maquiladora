<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class OperacionPrenda extends Model {
    protected $table = 'operaciones_prenda';
    protected $fillable = ['estilo_id','cliente_id','linea_produccion_id','area_encargado_id','nombre','descripcion','detalle','observaciones','precio','numero_piezas'];
    protected $casts = ['precio' => 'decimal:2'];
    public function estilo() { return $this->belongsTo(Estilo::class); }
    public function cliente() { return $this->belongsTo(Cliente::class); }
    public function lineaProduccion() { return $this->belongsTo(LineaProduccion::class); }
    public function areaEncargado() { return $this->belongsTo(AreaEncargado::class); }
    public function empleados() { return $this->hasMany(\App\Models\OperacionEmpleado::class); }
    public function hojasOperacion() { return $this->hasMany(HojaOperacion::class); }
}
