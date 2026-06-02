<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::create('dias_laborables', function (Blueprint $table) {
            $table->id();
            $table->foreignId('empresa_id')->constrained('empresas')->onDelete('cascade');
            $table->enum('dia_semana', ['lunes','martes','miercoles','jueves','viernes','sabado','domingo']);
            $table->boolean('activo')->default(true);
            $table->time('hora_entrada')->nullable();
            $table->time('hora_salida')->nullable();
            $table->timestamps();
            $table->unique(['empresa_id', 'dia_semana']);
        });
    }
    public function down(): void { Schema::dropIfExists('dias_laborables'); }
};
