<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::create('hoja_eventualidades', function (Blueprint $table) {
            $table->id();
            $table->foreignId('hoja_produccion_id')->constrained('hojas_produccion')->onDelete('cascade');
            $table->foreignId('eventualidad_trabajo_id')->constrained('eventualidades_trabajo')->onDelete('cascade');
        });
    }
    public function down(): void { Schema::dropIfExists('hoja_eventualidades'); }
};
