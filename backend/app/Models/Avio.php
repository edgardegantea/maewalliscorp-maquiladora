<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class Avio extends Model {
    protected $table = 'avios';
    protected $fillable = ['empresa_id','proveedor_id','codigo','nombre','descripcion','categoria','unidad','precio_unitario','stock_actual','stock_minimo','status'];
    protected $casts = ['precio_unitario'=>'decimal:2','stock_actual'=>'decimal:2','stock_minimo'=>'decimal:2'];
    public function empresa() { return $this->belongsTo(Empresa::class); }
    public function proveedor() { return $this->belongsTo(Proveedor::class); }
}
