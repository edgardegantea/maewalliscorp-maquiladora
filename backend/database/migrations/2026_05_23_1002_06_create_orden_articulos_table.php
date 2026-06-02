<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        // Órdenes de producción multi-producto: varios artículos (SKU) por orden
        Schema::create('orden_articulos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('orden_produccion_id')->constrained('ordenes_produccion')->onDelete('cascade');
            $table->foreignId('articulo_id')->nullable()->constrained('articulos')->onDelete('set null');
            $table->string('descripcion', 200)->nullable(); // si no está en catálogo
            $table->string('color', 80)->nullable();
            $table->foreignId('talla_id')->nullable()->constrained('tallas')->onDelete('set null');
            $table->unsignedInteger('cantidad')->default(0);
            $table->decimal('precio_unitario', 10, 2)->nullable();
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('orden_articulos'); }
};
