<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PermisoEmpleado extends Model
{
    protected $table = 'permisos_empleado';

    protected $fillable = [
        'empresa_id', 'empleado_id', 'tipo',
        'fecha_inicio', 'fecha_fin', 'motivo',
        'status', 'observaciones_encargado',
    ];

    protected $casts = [
        'fecha_inicio' => 'date',
        'fecha_fin'    => 'date',
    ];

    public function empleado() { return $this->belongsTo(Empleado::class); }
    public function empresa()  { return $this->belongsTo(Empresa::class); }
}
