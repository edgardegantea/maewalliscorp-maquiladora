<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('ordenes_produccion', function (Blueprint $table) {
            $table->foreignId('estilo_id')->nullable()->after('cliente_id')->constrained('estilos')->nullOnDelete();
            $table->unsignedInteger('cantidad_piezas')->nullable()->after('corte');
        });
    }

    public function down(): void
    {
        Schema::table('ordenes_produccion', function (Blueprint $table) {
            $table->dropForeign(['estilo_id']);
            $table->dropColumn(['estilo_id', 'cantidad_piezas']);
        });
    }
};
