<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class OrdenProduccion extends Model {
    protected $table = 'ordenes_produccion';
    protected $fillable = ['empresa_id','cliente_id','estilo_id','codigo','modelo','corte','cantidad_piezas','fecha_entrega','seguimiento','prioridad','corte_comenzado','status','observaciones'];
    protected $casts = ['corte_comenzado' => 'boolean', 'fecha_entrega' => 'date'];
    public function empresa() { return $this->belongsTo(Empresa::class); }
    public function cliente() { return $this->belongsTo(Cliente::class); }
    public function estilo()  { return $this->belongsTo(Estilo::class); }
    public function muestras() { return $this->hasMany(Muestra::class); }
    public function fichas() { return $this->hasMany(FichaEspecificacion::class); }
    public function procesos() { return $this->hasMany(ProcesoProduccion::class); }
    public function hojasProduccion() { return $this->hasMany(HojaProduccion::class); }
    public function curvaTallas() { return $this->hasMany(CurvaTalla::class); }
    public function articulos() { return $this->hasMany(OrdenArticulo::class); }
    public function enviosTaller() { return $this->hasMany(EnvioTaller::class,'orden_produccion_id'); }
}
