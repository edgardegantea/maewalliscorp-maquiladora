<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('empresa_id')->nullable()->after('id')->constrained('empresas')->onDelete('set null');
            $table->foreignId('empleado_id')->nullable()->after('empresa_id')->constrained('empleados')->onDelete('set null');
            $table->enum('role', ['admin', 'encargado', 'empleado'])->default('empleado')->after('email');
            $table->string('refresh_token', 500)->nullable();
        });
    }
    public function down(): void {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['empresa_id']);
            $table->dropForeign(['empleado_id']);
            $table->dropColumn(['empresa_id', 'empleado_id', 'role', 'refresh_token']);
        });
    }
};
