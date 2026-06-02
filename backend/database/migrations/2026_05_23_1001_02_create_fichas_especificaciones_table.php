<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::create('fichas_especificaciones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('orden_produccion_id')->constrained('ordenes_produccion')->onDelete('cascade');
            $table->foreignId('estilo_id')->nullable()->constrained('estilos')->onDelete('set null');
            $table->text('detalles')->nullable();
            $table->text('materiales')->nullable();
            $table->text('instrucciones')->nullable();
            $table->text('observaciones')->nullable();
            $table->string('archivo')->nullable();
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('fichas_especificaciones'); }
};
