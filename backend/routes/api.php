<?php
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\EmpresaController;
use App\Http\Controllers\Api\EmpleadoController;
use App\Http\Controllers\Api\AreaController;
use App\Http\Controllers\Api\ClienteController;
use App\Http\Controllers\Api\EstiloController;
use App\Http\Controllers\Api\TallaController;
use App\Http\Controllers\Api\LineaProduccionController;
use App\Http\Controllers\Api\OrdenProduccionController;
use App\Http\Controllers\Api\MuestraController;
use App\Http\Controllers\Api\FichaEspecificacionController;
use App\Http\Controllers\Api\EventualidadTrabajoController;
use App\Http\Controllers\Api\ProcesoProduccionController;
use App\Http\Controllers\Api\OperacionPrendaController;
use App\Http\Controllers\Api\HojaProduccionController;
use App\Http\Controllers\Api\DiaLaborableController;
use App\Http\Controllers\Api\RegistroAsistenciaController;
use App\Http\Controllers\Api\ProveedorController;
use App\Http\Controllers\Api\TelaController;
use App\Http\Controllers\Api\AvioController;
use App\Http\Controllers\Api\ArticuloController;
use App\Http\Controllers\Api\TallerExternoController;
use App\Http\Controllers\Api\CuentaPagarController;
use App\Http\Controllers\Api\ListaPrecioController;
use App\Http\Controllers\Api\BomController;
use App\Http\Controllers\Api\MovimientoAlmacenController;
use App\Http\Controllers\Api\EmpleadoPortalController;
use App\Http\Controllers\Api\ReporteController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\CorteNominaController;
use Illuminate\Support\Facades\Route;

// Auth public
Route::prefix('auth')->group(function () {
    Route::post('register',        [AuthController::class, 'register']);
    Route::post('login',           [AuthController::class, 'login']);
    Route::post('refresh',         [AuthController::class, 'refresh']);
    Route::post('forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('reset-password',  [AuthController::class, 'resetPassword']);
});

// Protected
Route::middleware('jwt')->group(function () {
    Route::post('auth/logout',          [AuthController::class, 'logout']);
    Route::get('auth/me',               [AuthController::class, 'me']);
    Route::post('auth/change-password', [AuthController::class, 'changePassword']);

    // Gestión de usuarios (admin)
    Route::get('users',                       [UserController::class, 'index']);
    Route::post('users',                      [UserController::class, 'store']);
    Route::put('users/{user}',                [UserController::class, 'update']);
    Route::delete('users/{user}',             [UserController::class, 'destroy']);
    Route::post('users/{user}/reset-password',[UserController::class, 'resetPassword']);

    // Empresa
    Route::get('empresa', [EmpresaController::class, 'show']);
    Route::put('empresa', [EmpresaController::class, 'update']);

    // CRUD resources
    Route::get('empleados/{empleado}/produccion', [EmpleadoController::class, 'produccion']);
    Route::apiResource('empleados', EmpleadoController::class);
    Route::apiResource('areas', AreaController::class);
    Route::apiResource('clientes', ClienteController::class);
    Route::apiResource('estilos', EstiloController::class);
    Route::apiResource('tallas', TallaController::class);
    Route::apiResource('lineas-produccion', LineaProduccionController::class)
        ->parameters(['lineas-produccion' => 'lineaProduccion']);
    Route::apiResource('eventualidades', EventualidadTrabajoController::class)
        ->parameters(['eventualidades' => 'eventualidadTrabajo']);
    Route::apiResource('operaciones-prenda', OperacionPrendaController::class)
        ->parameters(['operaciones-prenda' => 'operacionPrenda']);
    Route::apiResource('hojas-produccion', HojaProduccionController::class)
        ->parameters(['hojas-produccion' => 'hojaProduccion']);
    Route::post('hojas-produccion/{hojaProduccion}/operaciones',  [HojaProduccionController::class, 'addOperacion']);
    Route::put('hoja-operaciones/{hojaOperacion}',                [HojaProduccionController::class, 'updateOperacion']);
    Route::delete('hoja-operaciones/{hojaOperacion}',             [HojaProduccionController::class, 'destroyOperacion']);
    Route::get('hojas-produccion/{hojaProduccion}/pdf',           [HojaProduccionController::class, 'pdf']);
    Route::apiResource('dias-laborables', DiaLaborableController::class)
        ->only(['index','store','update'])
        ->parameters(['dias-laborables' => 'diaLaborable']);
    Route::apiResource('asistencia', RegistroAsistenciaController::class)
        ->parameters(['asistencia' => 'registroAsistencium']);

    // ── NUEVOS MÓDULOS ────────────────────────────────────────────────────────
    // Proveedores
    Route::apiResource('proveedores', ProveedorController::class)
        ->parameters(['proveedores'=>'proveedor']);

    // Telas + Rollos + Fraccionamiento
    Route::apiResource('telas', TelaController::class)
        ->parameters(['telas'=>'tela']);
    Route::get('telas/{tela}/rollos',         [TelaController::class,'rollos']);
    Route::post('telas/{tela}/rollos',         [TelaController::class,'storeRollo']);
    Route::post('rollos/{rollo}/fraccionar',   [TelaController::class,'fraccionarRollo']);

    // Avíos + Ajuste de stock
    Route::apiResource('avios', AvioController::class)->parameters(['avios'=>'avio']);
    Route::post('avios/{avio}/stock',          [AvioController::class,'ajustarStock']);

    // Artículos / SKU + Generación de variantes
    Route::post('articulos/generar-variantes', [ArticuloController::class,'generarVariantes']);
    Route::apiResource('articulos', ArticuloController::class)
        ->parameters(['articulos'=>'articulo']);

    // Talleres externos + Envíos
    Route::apiResource('talleres', TallerExternoController::class)
        ->parameters(['talleres'=>'tallerExterno']);
    Route::get('envios-taller',                [TallerExternoController::class,'envios']);
    Route::post('envios-taller',               [TallerExternoController::class,'storeEnvio']);
    Route::put('envios-taller/{envioTaller}',  [TallerExternoController::class,'updateEnvio']);

    // BOM (Lista de Materiales por Estilo)
    Route::get('estilos/{estilo}/bom',         [BomController::class,'porEstilo']);
    Route::post('bom',                         [BomController::class,'store']);
    Route::put('bom/{bomItem}',                [BomController::class,'update']);
    Route::delete('bom/{bomItem}',             [BomController::class,'destroy']);

    // Listas de precios
    Route::apiResource('listas-precios', ListaPrecioController::class)
        ->parameters(['listas-precios'=>'listaPrecio']);
    Route::post('listas-precios/{listaPrecio}/articulos', [ListaPrecioController::class,'syncArticulos']);

    // Cuentas por pagar
    Route::apiResource('cuentas-pagar', CuentaPagarController::class)
        ->parameters(['cuentas-pagar'=>'cuentaPagar']);
    Route::post('cuentas-pagar/{cuentaPagar}/pago', [CuentaPagarController::class,'registrarPago']);

    // Movimientos de almacén (lectura)
    Route::get('movimientos-almacen',          [MovimientoAlmacenController::class,'index']);

    // Reportes
    Route::get('reportes/produccion',          [ReporteController::class, 'produccion']);
    Route::get('reportes/ordenes',             [ReporteController::class, 'ordenes']);
    Route::get('reportes/inventario',          [ReporteController::class, 'inventario']);

    // Nómina — Cortes de pago
    Route::apiResource('cortes-nomina', CorteNominaController::class)
        ->parameters(['cortes-nomina' => 'corteNomina']);
    Route::post('cortes-nomina/{corteNomina}/calcular',     [CorteNominaController::class, 'calcular']);
    Route::post('cortes-nomina/{corteNomina}/pagar-todos',  [CorteNominaController::class, 'pagarTodos']);
    Route::post('cortes-nomina/{corteNomina}/pago/{empleado}',     [CorteNominaController::class, 'registrarPago']);
    Route::patch('cortes-nomina/{corteNomina}/linea/{empleado}',   [CorteNominaController::class, 'actualizarLinea']);
    Route::get('cortes-nomina/{corteNomina}/hojas/{empleado}',     [CorteNominaController::class, 'hojasEmpleado']);

    // Curva de tallas por orden (inline)
    Route::get('ordenes/{ordenProduccion}/curva-tallas', function(\App\Models\OrdenProduccion $ordenProduccion, \Illuminate\Http\Request $request) {
        if ($ordenProduccion->empresa_id!==$request->auth_empresa_id) abort(403);
        return response()->json($ordenProduccion->curvaTallas()->with('talla')->get());
    });
    Route::post('ordenes/{ordenProduccion}/curva-tallas', function(\App\Models\OrdenProduccion $ordenProduccion, \Illuminate\Http\Request $request) {
        if ($ordenProduccion->empresa_id!==$request->auth_empresa_id) abort(403);
        $data = $request->validate(['curva'=>'required|array','curva.*.talla_id'=>'required|exists:tallas,id','curva.*.cantidad'=>'required|integer|min:0']);
        $ordenProduccion->curvaTallas()->delete();
        foreach ($data['curva'] as $item) \App\Models\CurvaTalla::create(['orden_produccion_id'=>$ordenProduccion->id,'talla_id'=>$item['talla_id'],'cantidad'=>$item['cantidad']]);
        return response()->json($ordenProduccion->curvaTallas()->with('talla')->get());
    });

    // Nested resources
    Route::apiResource('ordenes', OrdenProduccionController::class)
        ->parameters(['ordenes' => 'ordenProduccion']);
    Route::apiResource('ordenes.muestras', MuestraController::class)
        ->shallow()
        ->parameters(['ordenes' => 'ordenProduccion']);
    Route::apiResource('ordenes.fichas', FichaEspecificacionController::class)
        ->shallow()
        ->parameters(['ordenes' => 'ordenProduccion']);
    Route::apiResource('ordenes.procesos', ProcesoProduccionController::class)
        ->shallow()
        ->parameters(['ordenes' => 'ordenProduccion']);
});

// ── PORTAL EMPLEADO ───────────────────────────────────────────────────────────
Route::prefix('portal')->middleware('jwt')->group(function () {
    Route::get('produccion',          [EmpleadoPortalController::class, 'produccion']);
    Route::get('pagos',               [EmpleadoPortalController::class, 'pagos']);
    Route::get('asistencia',          [EmpleadoPortalController::class, 'asistencia']);
    Route::get('ordenes',             [EmpleadoPortalController::class, 'ordenes']);
    Route::get('permisos',            [EmpleadoPortalController::class, 'permisosIndex']);
    Route::post('permisos',           [EmpleadoPortalController::class, 'permisosStore']);
    Route::delete('permisos/{id}',    [EmpleadoPortalController::class, 'permisosDestroy']);
    Route::get('aclaraciones',        [EmpleadoPortalController::class, 'aclaracionesIndex']);
    Route::post('aclaraciones',       [EmpleadoPortalController::class, 'aclaracionesStore']);
});

// ── GESTIÓN DE PORTAL (admin / encargado) ─────────────────────────────────────
Route::prefix('gestion')->middleware('jwt')->group(function () {
    Route::get('permisos',                               [EmpleadoPortalController::class, 'gestionPermisosIndex']);
    Route::put('permisos/{permiso}',                     [EmpleadoPortalController::class, 'gestionPermisosUpdate']);
    Route::get('aclaraciones',                           [EmpleadoPortalController::class, 'gestionAclaracionesIndex']);
    Route::put('aclaraciones/{aclaracion}',              [EmpleadoPortalController::class, 'gestionAclaracionesUpdate']);
});

// Area encargados (adicional)
Route::middleware('jwt')->group(function () {
    Route::post('area_encargados', function (\Illuminate\Http\Request $request) {
        $data = $request->validate(['area_id'=>'required|exists:areas,id','empleado_id'=>'required|exists:empleados,id','fecha_inicio'=>'required|date','status'=>'in:activo,inactivo']);
        // Inhabilitar encargado actual
        \App\Models\AreaEncargado::where('area_id',$data['area_id'])->where('status','activo')->update(['status'=>'inactivo','fecha_fin'=>now()->toDateString()]);
        return response()->json(\App\Models\AreaEncargado::create($data)->load('empleado','area'), 201);
    });
});

