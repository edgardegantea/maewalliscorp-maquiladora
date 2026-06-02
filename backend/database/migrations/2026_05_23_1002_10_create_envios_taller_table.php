<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::create('envios_taller', function (Blueprint $table) {
            $table->id();
            $table->foreignId('empresa_id')->constrained('empresas')->onDelete('cascade');
            $table->foreignId('taller_id')->constrained('talleres_externos')->onDelete('cascade');
            $table->foreignId('orden_produccion_id')->nullable()->constrained('ordenes_produccion')->onDelete('set null');
            $table->string('concepto', 200);           // descripción del trabajo enviado
            $table->unsignedInteger('piezas_enviadas')->default(0);
            $table->unsignedInteger('piezas_recibidas')->default(0);
            $table->decimal('precio_por_pieza', 10, 2)->nullable();
            $table->decimal('importe_total', 12, 2)->nullable();
            $table->date('fecha_envio');
            $table->date('fecha_compromiso')->nullable();  // fecha prometida de entrega
            $table->date('fecha_recepcion')->nullable();
            $table->enum('status', ['enviado','en_proceso','recibido_parcial','recibido','cancelado'])->default('enviado');
            $table->text('observaciones')->nullable();
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('envios_taller'); }
};
