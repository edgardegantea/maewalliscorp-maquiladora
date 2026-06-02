<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::create('hoja_operaciones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('hoja_produccion_id')->constrained('hojas_produccion')->onDelete('cascade');
            $table->foreignId('operacion_prenda_id')->constrained('operaciones_prenda')->onDelete('cascade');
            $table->unsignedInteger('numero_piezas')->default(0);
            $table->decimal('total_por_operacion', 10, 2)->default(0);
            $table->date('fecha');
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('hoja_operaciones'); }
};
