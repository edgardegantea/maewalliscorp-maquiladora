<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::create('registro_asistencia', function (Blueprint $table) {
            $table->id();
            $table->foreignId('empleado_id')->constrained('empleados')->onDelete('cascade');
            $table->date('fecha');
            $table->time('entrada')->nullable();
            $table->time('entrada_comida')->nullable();
            $table->time('salida_comida')->nullable();
            $table->time('salida')->nullable();
            $table->text('observaciones')->nullable();
            $table->timestamps();
            $table->unique(['empleado_id', 'fecha']);
        });
    }
    public function down(): void { Schema::dropIfExists('registro_asistencia'); }
};
