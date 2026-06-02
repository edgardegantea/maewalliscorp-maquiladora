<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('aclaraciones_produccion', function (Blueprint $table) {
            $table->id();
            $table->foreignId('empresa_id')->constrained('empresas')->cascadeOnDelete();
            $table->foreignId('empleado_id')->constrained('empleados')->cascadeOnDelete();
            $table->foreignId('hoja_produccion_id')->nullable()->constrained('hojas_produccion')->nullOnDelete();
            $table->text('descripcion');
            $table->enum('status', ['pendiente', 'en_revision', 'resuelta', 'rechazada'])->default('pendiente');
            $table->text('respuesta')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('aclaraciones_produccion');
    }
};
