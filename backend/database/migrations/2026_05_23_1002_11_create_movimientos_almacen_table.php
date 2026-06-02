<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::create('movimientos_almacen', function (Blueprint $table) {
            $table->id();
            $table->foreignId('empresa_id')->constrained('empresas')->onDelete('cascade');
            $table->enum('tipo_item', ['tela','avio']);
            $table->unsignedBigInteger('item_id');
            $table->string('nombre_item', 150)->nullable();   // cacheado para evitar JOINs en historial
            $table->enum('tipo_movimiento', ['entrada','salida','ajuste','devolucion']);
            $table->decimal('cantidad', 10, 4);
            $table->string('unidad', 20)->default('pieza');
            $table->decimal('costo_unitario', 10, 2)->nullable();
            $table->foreignId('orden_produccion_id')->nullable()->constrained('ordenes_produccion')->onDelete('set null');
            $table->foreignId('proveedor_id')->nullable()->constrained('proveedores')->onDelete('set null');
            $table->string('referencia', 100)->nullable();    // número de remisión, folio, etc.
            $table->text('observaciones')->nullable();
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('movimientos_almacen'); }
};
