<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AclaracionProduccion extends Model
{
    protected $table = 'aclaraciones_produccion';

    protected $fillable = [
        'empresa_id', 'empleado_id', 'hoja_produccion_id',
        'descripcion', 'status', 'respuesta',
    ];

    public function empleado() { return $this->belongsTo(Empleado::class); }
    public function hoja()     { return $this->belongsTo(HojaProduccion::class, 'hoja_produccion_id'); }
    public function empresa()  { return $this->belongsTo(Empresa::class); }
}
