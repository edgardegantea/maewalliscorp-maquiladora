<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::create('operaciones_prenda', function (Blueprint $table) {
            $table->id();
            $table->foreignId('estilo_id')->nullable()->constrained('estilos')->onDelete('set null');
            $table->foreignId('cliente_id')->nullable()->constrained('clientes')->onDelete('set null');
            $table->foreignId('linea_produccion_id')->nullable()->constrained('lineas_produccion')->onDelete('set null');
            $table->foreignId('area_encargado_id')->nullable()->constrained('area_encargados')->onDelete('set null');
            $table->string('nombre', 150);
            $table->text('descripcion')->nullable();
            $table->text('detalle')->nullable();
            $table->text('observaciones')->nullable();
            $table->decimal('precio', 10, 2)->default(0);
            $table->unsignedInteger('numero_piezas')->default(0);
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('operaciones_prenda'); }
};
