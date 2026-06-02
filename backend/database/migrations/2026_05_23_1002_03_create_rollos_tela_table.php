<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::create('rollos_tela', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tela_id')->constrained('telas')->onDelete('cascade');
            $table->string('numero_rollo', 50)->nullable();
            $table->string('color', 80)->nullable();
            $table->string('lote', 80)->nullable();
            $table->decimal('metros_iniciales', 10, 2)->default(0);
            $table->decimal('metros_disponibles', 10, 2)->default(0);
            $table->decimal('precio_unitario', 10, 2)->nullable(); // puede diferir del catálogo
            $table->date('fecha_entrada')->nullable();
            $table->enum('status', ['disponible','agotado','reservado'])->default('disponible');
            $table->text('observaciones')->nullable();
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('rollos_tela'); }
};
