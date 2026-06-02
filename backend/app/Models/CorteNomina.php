<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CorteNomina extends Model
{
    protected $table    = 'cortes_nomina';
    protected $fillable = [
        'empresa_id', 'nombre', 'fecha_inicio', 'fecha_fin',
        'status', 'total_calculado', 'total_pagado', 'observaciones', 'creado_por',
    ];
    protected $casts = [
        'fecha_inicio'     => 'date',
        'fecha_fin'        => 'date',
        'total_calculado'  => 'float',
        'total_pagado'     => 'float',
    ];

    public function empleados()  { return $this->hasMany(CorteNominaEmpleado::class, 'corte_nomina_id'); }
    public function creadoPor()  { return $this->belongsTo(User::class, 'creado_por'); }
}
