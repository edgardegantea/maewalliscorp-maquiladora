<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::create('cuentas_pagar', function (Blueprint $table) {
            $table->id();
            $table->foreignId('empresa_id')->constrained('empresas')->onDelete('cascade');
            $table->foreignId('proveedor_id')->constrained('proveedores')->onDelete('cascade');
            $table->string('folio', 80)->nullable();           // número de factura/remisión
            $table->string('concepto', 200);
            $table->decimal('monto_total', 12, 2);
            $table->decimal('monto_pagado', 12, 2)->default(0);
            $table->date('fecha_emision');
            $table->date('fecha_vencimiento')->nullable();
            $table->enum('metodo_pago', ['efectivo','transferencia','cheque','otro'])->nullable();
            $table->enum('status', ['pendiente','parcial','pagado','cancelado'])->default('pendiente');
            $table->text('observaciones')->nullable();
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('cuentas_pagar'); }
};
