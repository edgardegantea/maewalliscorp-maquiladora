<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        // BOM (Lista de Materiales): telas y avíos necesarios por estilo
        Schema::create('bom_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('estilo_id')->constrained('estilos')->onDelete('cascade');
            $table->enum('tipo', ['tela','avio']); // tipo de insumo
            $table->unsignedBigInteger('item_id');  // id en telas o avios según tipo
            $table->string('nombre_referencia', 150)->nullable(); // nombre cacheado
            $table->decimal('cantidad_por_prenda', 10, 4); // metros de tela, piezas de botón, etc.
            $table->string('unidad', 20)->default('pieza');
            $table->text('observaciones')->nullable();
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('bom_items'); }
};
