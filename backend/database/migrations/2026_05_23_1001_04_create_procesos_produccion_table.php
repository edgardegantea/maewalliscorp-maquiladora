<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::create('procesos_produccion', function (Blueprint $table) {
            $table->id();
            $table->foreignId('orden_produccion_id')->constrained('ordenes_produccion')->onDelete('cascade');
            $table->foreignId('empleado_id')->nullable()->constrained('empleados')->onDelete('set null');
            $table->string('nombre_proceso', 150);
            $table->enum('fase', ['habilitacion', 'ensamble', 'otro'])->default('habilitacion');
            $table->text('observaciones')->nullable();
            $table->enum('status', ['pendiente', 'en_proceso', 'completado'])->default('pendiente');
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('procesos_produccion'); }
};
