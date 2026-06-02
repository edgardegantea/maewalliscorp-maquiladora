<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class RolloTela extends Model {
    protected $table = 'rollos_tela';
    protected $fillable = ['tela_id','numero_rollo','color','lote','metros_iniciales','metros_disponibles','precio_unitario','fecha_entrada','status','observaciones'];
    protected $casts = ['metros_iniciales'=>'decimal:2','metros_disponibles'=>'decimal:2','precio_unitario'=>'decimal:2','fecha_entrada'=>'date'];
    public function tela() { return $this->belongsTo(Tela::class); }
}
