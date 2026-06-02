<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::create('ordenes_produccion', function (Blueprint $table) {
            $table->id();
            $table->foreignId('empresa_id')->constrained('empresas')->onDelete('cascade');
            $table->foreignId('cliente_id')->constrained('clientes')->onDelete('cascade');
            $table->string('codigo', 50)->unique();
            $table->string('modelo', 150)->nullable();
            $table->string('corte', 100)->nullable();
            $table->date('fecha_entrega')->nullable();
            $table->text('seguimiento')->nullable();
            $table->enum('prioridad', ['alta', 'media', 'baja'])->default('media');
            $table->boolean('corte_comenzado')->default(false);
            $table->enum('status', ['pendiente', 'en_proceso', 'completada', 'cancelada'])->default('pendiente');
            $table->text('observaciones')->nullable();
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('ordenes_produccion'); }
};
