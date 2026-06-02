<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        // Curva de tallas: distribución de piezas por talla dentro de una orden
        Schema::create('curva_tallas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('orden_produccion_id')->constrained('ordenes_produccion')->onDelete('cascade');
            $table->foreignId('talla_id')->constrained('tallas')->onDelete('cascade');
            $table->unsignedInteger('cantidad')->default(0);
            $table->timestamps();
            $table->unique(['orden_produccion_id','talla_id']);
        });
    }
    public function down(): void { Schema::dropIfExists('curva_tallas'); }
};
