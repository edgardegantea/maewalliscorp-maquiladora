<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::create('talleres_externos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('empresa_id')->constrained('empresas')->onDelete('cascade');
            $table->string('nombre', 150);
            $table->string('responsable', 150)->nullable();
            $table->string('telefono', 20)->nullable();
            $table->string('email')->nullable();
            $table->text('domicilio')->nullable();
            $table->text('especialidad')->nullable();   // tipo de trabajo que realiza
            $table->text('observaciones')->nullable();
            $table->enum('status', ['activo','inactivo'])->default('activo');
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('talleres_externos'); }
};
