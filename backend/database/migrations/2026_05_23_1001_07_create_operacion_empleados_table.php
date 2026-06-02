<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::create('operacion_empleados', function (Blueprint $table) {
            $table->id();
            $table->foreignId('operacion_prenda_id')->constrained('operaciones_prenda')->onDelete('cascade');
            $table->foreignId('empleado_id')->constrained('empleados')->onDelete('cascade');
            $table->boolean('es_foraneo')->default(false);
            $table->unsignedInteger('num_piezas_asignadas')->default(0);
            $table->decimal('precio_variable', 10, 2)->nullable();
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('operacion_empleados'); }
};
