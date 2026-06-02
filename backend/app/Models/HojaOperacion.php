<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class HojaOperacion extends Model {
    protected $table = 'hoja_operaciones';
    protected $fillable = ['hoja_produccion_id','operacion_prenda_id','numero_piezas','total_por_operacion','fecha'];
    protected $casts = ['fecha' => 'date', 'total_por_operacion' => 'decimal:2'];
    public function hoja() { return $this->belongsTo(HojaProduccion::class, 'hoja_produccion_id'); }
    public function operacion() { return $this->belongsTo(OperacionPrenda::class, 'operacion_prenda_id'); }
}
