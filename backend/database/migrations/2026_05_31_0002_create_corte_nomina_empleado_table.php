<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('corte_nomina_empleado', function (Blueprint $table) {
            $table->id();
            $table->foreignId('corte_nomina_id')->constrained('cortes_nomina')->cascadeOnDelete();
            $table->foreignId('empleado_id')->constrained('empleados');
            $table->integer('num_hojas')->default(0);
            $table->decimal('total_hojas', 12, 2)->default(0);   // suma de total_a_pagar
            $table->decimal('deducciones', 12, 2)->default(0);   // deducciones manuales
            $table->decimal('total_neto', 12, 2)->default(0);    // total_hojas - deducciones
            $table->enum('status', ['pendiente', 'pagado'])->default('pendiente');
            $table->date('fecha_pago')->nullable();
            $table->enum('metodo_pago', ['efectivo', 'transferencia', 'cheque', 'otro'])->nullable();
            $table->string('referencia_pago', 150)->nullable();
            $table->text('observaciones')->nullable();
            $table->timestamps();

            $table->unique(['corte_nomina_id', 'empleado_id']);
        });
    }

    public function down(): void { Schema::dropIfExists('corte_nomina_empleado'); }
};
