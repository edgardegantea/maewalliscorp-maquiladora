<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::create('articulos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('empresa_id')->constrained('empresas')->onDelete('cascade');
            $table->foreignId('estilo_id')->nullable()->constrained('estilos')->onDelete('set null');
            $table->foreignId('talla_id')->nullable()->constrained('tallas')->onDelete('set null');
            $table->string('codigo_sku', 80)->nullable();
            $table->string('nombre', 150);
            $table->string('color', 80)->nullable();
            $table->string('descripcion')->nullable();
            $table->decimal('precio_costo', 10, 2)->nullable();
            $table->decimal('precio_venta', 10, 2)->nullable();
            $table->decimal('stock_actual', 10, 2)->default(0);
            $table->enum('status', ['activo','inactivo'])->default('activo');
            $table->timestamps();
            $table->unique(['empresa_id','codigo_sku']);
        });
    }
    public function down(): void { Schema::dropIfExists('articulos'); }
};
