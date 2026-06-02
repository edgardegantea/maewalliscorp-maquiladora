<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CorteNominaEmpleado extends Model
{
    protected $table    = 'corte_nomina_empleado';
    protected $fillable = [
        'corte_nomina_id', 'empleado_id', 'num_hojas',
        'total_hojas', 'deducciones', 'total_neto',
        'status', 'fecha_pago', 'metodo_pago', 'referencia_pago', 'observaciones',
    ];
    protected $casts = [
        'fecha_pago'    => 'date',
        'total_hojas'   => 'float',
        'deducciones'   => 'float',
        'total_neto'    => 'float',
    ];

    public function corte()    { return $this->belongsTo(CorteNomina::class, 'corte_nomina_id'); }
    public function empleado() { return $this->belongsTo(Empleado::class); }
}
