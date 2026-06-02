<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class EnvioTaller extends Model {
    protected $table = 'envios_taller';
    protected $fillable = ['empresa_id','taller_id','orden_produccion_id','concepto','piezas_enviadas','piezas_recibidas','precio_por_pieza','importe_total','fecha_envio','fecha_compromiso','fecha_recepcion','status','observaciones'];
    protected $casts = ['precio_por_pieza'=>'decimal:2','importe_total'=>'decimal:2','fecha_envio'=>'date','fecha_compromiso'=>'date','fecha_recepcion'=>'date'];
    public function empresa() { return $this->belongsTo(Empresa::class); }
    public function taller() { return $this->belongsTo(TallerExterno::class,'taller_id'); }
    public function orden() { return $this->belongsTo(OrdenProduccion::class,'orden_produccion_id'); }
}
