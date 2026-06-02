<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::create('listas_precios', function (Blueprint $table) {
            $table->id();
            $table->foreignId('empresa_id')->constrained('empresas')->onDelete('cascade');
            $table->string('nombre', 150);
            $table->text('descripcion')->nullable();
            $table->enum('tipo', ['general','cliente','mayoreo','menudeo'])->default('general');
            $table->date('fecha_vigencia_inicio')->nullable();
            $table->date('fecha_vigencia_fin')->nullable();
            $table->boolean('activa')->default(true);
            $table->timestamps();
        });
        Schema::create('lista_precio_articulos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lista_precio_id')->constrained('listas_precios')->onDelete('cascade');
            $table->foreignId('articulo_id')->constrained('articulos')->onDelete('cascade');
            $table->decimal('precio', 10, 2);
            $table->timestamps();
            $table->unique(['lista_precio_id','articulo_id']);
        });
    }
    public function down(): void {
        Schema::dropIfExists('lista_precio_articulos');
        Schema::dropIfExists('listas_precios');
    }
};
