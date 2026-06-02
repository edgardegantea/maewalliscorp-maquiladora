<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::create('telas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('empresa_id')->constrained('empresas')->onDelete('cascade');
            $table->foreignId('proveedor_id')->nullable()->constrained('proveedores')->onDelete('set null');
            $table->string('codigo', 50)->nullable();
            $table->string('nombre', 150);
            $table->text('descripcion')->nullable();
            $table->string('composicion', 100)->nullable();  // 100% algodón, 60/40, etc.
            $table->decimal('ancho_cm', 6, 2)->nullable();
            $table->string('unidad', 20)->default('metro');  // metro, yarda, kg
            $table->decimal('precio_unitario', 10, 2)->default(0);
            $table->decimal('stock_actual', 10, 2)->default(0);
            $table->decimal('stock_minimo', 10, 2)->default(0);
            $table->enum('status', ['activo','inactivo'])->default('activo');
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('telas'); }
};
