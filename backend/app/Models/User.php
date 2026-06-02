<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;

class User extends Authenticatable {
    use HasFactory;
    protected $fillable = ['name','email','password','empresa_id','empleado_id','role','refresh_token'];
    protected $hidden = ['password','refresh_token'];
    protected $casts = ['password' => 'hashed'];
    public function empresa() { return $this->belongsTo(Empresa::class); }
    public function empleado() { return $this->belongsTo(Empleado::class); }
}
