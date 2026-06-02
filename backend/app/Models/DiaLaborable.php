<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class DiaLaborable extends Model {
    protected $table = 'dias_laborables';
    protected $fillable = ['empresa_id','dia_semana','activo','hora_entrada','hora_salida'];
    protected $casts = ['activo' => 'boolean'];
    public function empresa() { return $this->belongsTo(Empresa::class); }
}
