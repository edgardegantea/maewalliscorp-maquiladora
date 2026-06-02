<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0');
        foreach ([
            'permisos_empleado','aclaraciones_produccion',
            'lista_precio_articulos','listas_precios',
            'cuentas_pagar',
            'envios_taller','talleres_externos',
            'movimientos_almacen',
            'bom_items',
            'curva_tallas','orden_articulos',
            'articulos',
            'avios',
            'rollos_tela','telas',
            'proveedores',
            'hoja_eventualidades','hoja_operaciones','hojas_produccion',
            'operacion_empleados','operaciones_prenda',
            'proceso_eventualidades','procesos_produccion',
            'fichas_especificaciones','muestras',
            'ordenes_produccion',
            'eventualidades_trabajo',
            'dias_laborables',
            'registro_asistencia',
            'area_encargados','areas',
            'lineas_produccion',
            'tallas',
            'estilos',
            'clientes',
            'empleados',
            'users',
            'empresas',
        ] as $t) { DB::table($t)->truncate(); }
        DB::statement('SET FOREIGN_KEY_CHECKS=1');

        // ══════════════════════════════════════════════════════════════════════
        // 1. EMPRESA
        // ══════════════════════════════════════════════════════════════════════
        $eid = DB::table('empresas')->insertGetId([
            'nombre'       => 'Confecciones MaeWallis',
            'razon_social' => 'Confecciones MaeWallis S.A. de C.V.',
            'domicilio'    => 'Blvd. Industrial 145, Parque El Carmen, Teziutlán, Puebla',
            'telefono'     => '2317890123',
            'email'        => 'contacto@maewallis.com',
            'rfc'          => 'CMW200315AB3',
            'created_at'   => now(), 'updated_at' => now(),
        ]);

        // ══════════════════════════════════════════════════════════════════════
        // 2. USUARIOS
        // ══════════════════════════════════════════════════════════════════════
        DB::table('users')->insert([
            ['name'=>'Administrador General',  'email'=>'admin@maewallis.com',         'password'=>Hash::make('Admin2026!'),      'empresa_id'=>$eid,'role'=>'admin',     'email_verified_at'=>now(),'created_at'=>now(),'updated_at'=>now()],
            ['name'=>'Encargado Producción',   'email'=>'encargado@maewallis.com',      'password'=>Hash::make('Encargado2026!'), 'empresa_id'=>$eid,'role'=>'encargado', 'email_verified_at'=>now(),'created_at'=>now(),'updated_at'=>now()],
            ['name'=>'Operadora Costura',      'email'=>'empleado@maewallis.com',       'password'=>Hash::make('Empleado2026!'),  'empresa_id'=>$eid,'role'=>'empleado',  'email_verified_at'=>now(),'created_at'=>now(),'updated_at'=>now()],
            ['name'=>'Supervisor Planta',       'email'=>'supervisor@maewallis.com',      'password'=>Hash::make('Supervisor2026!'), 'empresa_id'=>$eid,'role'=>'admin',     'email_verified_at'=>now(),'created_at'=>now(),'updated_at'=>now()],
        ]);
        $userAdmin     = DB::table('users')->where('email','admin@maewallis.com')->value('id');
        $userEncargado = DB::table('users')->where('email','encargado@maewallis.com')->value('id');
        $userEmpleado  = DB::table('users')->where('email','empleado@maewallis.com')->value('id');

        // ══════════════════════════════════════════════════════════════════════
        // 3. CLIENTES (6)
        // ══════════════════════════════════════════════════════════════════════
        $cli = [];
        foreach ([
            ['Moda Elegante',            'Moda Elegante S.A. de C.V.',              'Av. Independencia 320, Puebla',         '2222345678','ventas@modaelegante.com',        'activo'],
            ['Textiles del Sur',         'Textiles del Sur S.R.L.',                 'Calle Morelos 88, Tehuacán',            '2383456789','pedidos@textilesdelsur.com',     'activo'],
            ['Boutique Primavera',       'Boutique Primavera S.A.',                 'Masaryk 89, Polanco, CDMX',            '5555678901','compras@boutiqueprimavera.com',  'activo'],
            ['Uniformes Industriales',   'Uniformes Industriales del Golfo S.A.',   'Blvd. Ávila Camacho 200, Veracruz',   '2294567890','uniformes.golfo@gmail.com',      'activo'],
            ['Exportadora Moda Sur',     'Exportadora Moda Sur S.A. de C.V.',      'Blvd. Comercio 540, Monterrey',        '8181234567','pedidos@modasur.com.mx',         'activo'],
            ['Confecciones Regionales',  'Confecciones Regionales de Puebla S.A.', 'Calle 6 Oriente 18, Atlixco, Puebla', '2444321098','ventas@confregionales.com',      'activo'],
        ] as [$n,$r,$d,$t,$e,$s]) {
            $cli[] = DB::table('clientes')->insertGetId(['empresa_id'=>$eid,'nombre'=>$n,'razon_social'=>$r,'domicilio'=>$d,'telefono'=>$t,'email'=>$e,'status'=>$s,'created_at'=>now(),'updated_at'=>now()]);
        }

        // ══════════════════════════════════════════════════════════════════════
        // 4. EMPLEADOS (15 — 13 activos, 2 inactivos)
        // ══════════════════════════════════════════════════════════════════════
        $emp = [];
        foreach ([
            ['001','María Elena',       'Ramos Vázquez',       'Calle Hidalgo 12, Teziutlán',          '2317654321','mariaelenasew@gmail.com',    'activo'],
            ['002','Rosa Isela',        'Hernández Cruz',      'Av. Benito Juárez 45, Teziutlán',      '2317543210','rosa.hernandez@gmail.com',   'activo'],
            ['003','Ana Patricia',      'López Jiménez',       'Col. El Mirador 78, Teziutlán',        '2317432109','alopez.maq@gmail.com',       'activo'],
            ['004','Beatriz',           'Sánchez Torres',      'Calle 5 de Mayo 100, Teziutlán',       '2317321098', null,                         'activo'],
            ['005','Gloria Martínez',   'Pérez Reyes',         'Av. Revolución 55, Teziutlán',         '2317210987','gloria.prez@hotmail.com',    'activo'],
            ['006','Karla Yazmín',      'Flores González',     'Col. Centro 23, Teziutlán',            '2317109876', null,                         'activo'],
            ['007','Sandra Monserrat',  'Reyes Luna',          'Blvd. Norte 67, Teziutlán',            '2316098765','sandrarey.costura@gmail.com','activo'],
            ['008','Juana Emilia',      'García Castillo',     'Calle Reforma 89, Teziutlán',          '2315987654','juana.garcia.c@gmail.com',   'activo'],
            ['009','Lucía del Carmen',  'Pérez Mendoza',       'Col. San Francisco 14, Teziutlán',     '2314876543', null,                         'activo'],
            ['010','Patricia',          'Morales Ríos',        'Av. 20 de Noviembre 33, Teziutlán',    '2313765432','p.moralesrios@gmail.com',    'activo'],
            ['011','Esperanza',         'Domínguez Salinas',   'Calle Guadalupe 56, Teziutlán',         null,          null,                         'inactivo'],
            ['012','Verónica',          'Castro Mejía',        'Col. Las Flores 12, Teziutlán',        '2316112233','vero.castro.m@gmail.com',    'activo'],
            ['013','Claudia Ivette',    'Méndez Ortiz',        'Calle Álvaro Obregón 34, Teziutlán',  '2317334455', null,                         'activo'],
            ['014','Silvia',            'Gutiérrez Paredes',   'Av. Ferrocarril 90, Teziutlán',        '2315556677','silviagtz.cos@gmail.com',    'activo'],
            ['015','Norma Leticia',     'Aguilar Bravo',       'Calle Pino Suárez 7, Teziutlán',       null,          null,                         'inactivo'],
        ] as [$hue,$nom,$ape,$dom,$tel,$eml,$sts]) {
            $emp[] = DB::table('empleados')->insertGetId(['empresa_id'=>$eid,'numero_huella'=>$hue,'nombre'=>$nom,'apellidos'=>$ape,'domicilio'=>$dom,'telefono'=>$tel,'email'=>$eml,'status'=>$sts,'created_at'=>now(),'updated_at'=>now()]);
        }

        DB::table('users')->where('id',$userEncargado)->update(['empleado_id'=>$emp[0]]);
        DB::table('users')->where('id',$userEmpleado)->update(['empleado_id'=>$emp[3]]);

        // ══════════════════════════════════════════════════════════════════════
        // 5. ÁREAS (4)
        // ══════════════════════════════════════════════════════════════════════
        $areas = [];
        foreach ([
            ['Corte',             'Área de corte de tela y materiales'],
            ['Ensamble',          'Área de costura y ensamble de prendas'],
            ['Acabado y Calidad', 'Revisión, planchado, etiquetado y empaque final'],
            ['Almacén',           'Recepción, resguardo y despacho de materiales e inventarios'],
        ] as [$n,$d]) {
            $areas[] = DB::table('areas')->insertGetId(['empresa_id'=>$eid,'nombre'=>$n,'descripcion'=>$d,'created_at'=>now(),'updated_at'=>now()]);
        }
        foreach ([[$areas[0],$emp[0]],[$areas[1],$emp[1]],[$areas[2],$emp[2]],[$areas[3],$emp[11]]] as [$aid,$empId]) {
            DB::table('area_encargados')->insert(['area_id'=>$aid,'empleado_id'=>$empId,'fecha_inicio'=>'2026-01-06','status'=>'activo','created_at'=>now(),'updated_at'=>now()]);
        }

        // ══════════════════════════════════════════════════════════════════════
        // 6. ESTILOS (7)
        // ══════════════════════════════════════════════════════════════════════
        $est = [];
        foreach ([
            ['Blusa Manga Larga Dama',    'Blusa clásica manga larga para dama',            'Blusas'],
            ['Pantalón de Vestir Dama',   'Pantalón de corte recto para dama',              'Pantalones'],
            ['Vestido Casual',            'Vestido de uso diario, largo a la rodilla',      'Vestidos'],
            ['Conjunto Deportivo',        'Top y short deportivo unisex',                   'Deportivo'],
            ['Camisa Formal Caballero',   'Camisa de vestir manga larga caballero',         'Camisas'],
            ['Falda Midi',                'Falda hasta media pierna, corte A',              'Faldas'],
            ['Sudadera con Capucha',      'Sudadera unisex con capucha y bolsillo canguro', 'Deportivo'],
        ] as [$n,$d,$c]) {
            $est[] = DB::table('estilos')->insertGetId(['empresa_id'=>$eid,'nombre'=>$n,'descripcion'=>$d,'categoria'=>$c,'status'=>'activo','created_at'=>now(),'updated_at'=>now()]);
        }

        // ══════════════════════════════════════════════════════════════════════
        // 7. TALLAS (8)
        // ══════════════════════════════════════════════════════════════════════
        $tallasIds = [];
        foreach ([['XS',0],['S',1],['M',2],['L',3],['XL',4],['XXL',5],['XXXL',6],['Talla Única',99]] as [$n,$o]) {
            $tallasIds[] = DB::table('tallas')->insertGetId(['nombre'=>$n,'descripcion'=>"Talla $n",'orden'=>$o,'created_at'=>now(),'updated_at'=>now()]);
        }

        // ══════════════════════════════════════════════════════════════════════
        // 8. LÍNEAS DE PRODUCCIÓN (3)
        // ══════════════════════════════════════════════════════════════════════
        $lin = [];
        foreach ([
            ['LP-A01','Nave A – Zona Norte', 'Línea principal de blusas y vestidos'],
            ['LP-B01','Nave B – Zona Centro','Línea de pantalones y conjuntos'],
            ['LP-C01','Nave A – Zona Sur',   'Línea de acabados y calidad'],
        ] as [$c,$u,$d]) {
            $lin[] = DB::table('lineas_produccion')->insertGetId(['empresa_id'=>$eid,'codigo'=>$c,'ubicacion'=>$u,'descripcion'=>$d,'status'=>'activo','created_at'=>now(),'updated_at'=>now()]);
        }

        // ══════════════════════════════════════════════════════════════════════
        // 9. DÍAS LABORABLES
        // ══════════════════════════════════════════════════════════════════════
        foreach ([
            ['lunes',    true,  '08:00','17:00'],
            ['martes',   true,  '08:00','17:00'],
            ['miercoles',true,  '08:00','17:00'],
            ['jueves',   true,  '08:00','17:00'],
            ['viernes',  true,  '08:00','17:00'],
            ['sabado',   true,  '08:00','14:00'],
            ['domingo',  false, null,   null],
        ] as [$dia,$act,$ent,$sal]) {
            DB::table('dias_laborables')->insert(['empresa_id'=>$eid,'dia_semana'=>$dia,'activo'=>$act,'hora_entrada'=>$ent,'hora_salida'=>$sal,'created_at'=>now(),'updated_at'=>now()]);
        }

        // ══════════════════════════════════════════════════════════════════════
        // 10. EVENTUALIDADES (6)
        // ══════════════════════════════════════════════════════════════════════
        $evs = [];
        foreach ([
            ['Falla de Maquinaria',     'Paro de línea por descompostura de máquina de coser u overlok', null,                 null,                 null],
            ['Falta de Material',       'Desabasto de tela, hilo u otro insumo necesario',               null,                 null,                 null],
            ['Corte de Energía',        'Interrupción del suministro eléctrico',                         '2026-05-10 09:30:00','2026-05-10 11:00:00','Duró aprox. 1.5 hrs, afectó la línea B'],
            ['Ausentismo',              'Falta de personal por enfermedad o permiso',                    null,                 null,                 null],
            ['Revisión de Calidad',     'Paro temporal para inspección de lote por parte del cliente',  '2026-05-16 14:00:00','2026-05-16 15:30:00','Lote OP-2026-001 sin rechazos.'],
            ['Reparación de Overlock',  'Mantenimiento correctivo overlock 5 hilos línea A',            '2026-05-27 08:00:00','2026-05-27 10:30:00','Paro de 2.5 hrs, afectó 3 operarias'],
        ] as [$n,$d,$fi,$ff,$obs]) {
            $evs[] = DB::table('eventualidades_trabajo')->insertGetId(['empresa_id'=>$eid,'nombre'=>$n,'descripcion'=>$d,'fecha_hora_inicio'=>$fi,'fecha_hora_fin'=>$ff,'observaciones'=>$obs,'created_at'=>now(),'updated_at'=>now()]);
        }

        // ══════════════════════════════════════════════════════════════════════
        // 11. OPERACIONES DE PRENDA (14)
        // ══════════════════════════════════════════════════════════════════════
        $ops = [];
        foreach ([
            ['Unir hombros',           'Unión de piezas delantera y trasera por los hombros',             0.80, 0, 0],
            ['Pegar mangas',           'Colocación y costura de mangas al cuerpo de la prenda',           1.20, 0, 0],
            ['Cerrar costados',        'Cierre de costados con overlock 5 hilos',                         0.90, 0, null],
            ['Pegar cuello',           'Ensamble y costura de cuello o escote terminado',                 1.50, 0, 0],
            ['Dobladillo inferior',    'Dobladillo de 1 cm en la parte inferior de la prenda',            0.70, 1, null],
            ['Pegar cremallera',       'Colocación de cierre/cremallera invisible o visible',             2.00, 1, 2],
            ['Coser bolsillos',        'Ensamble de bolsillos laterales o traseros',                      1.30, 1, 1],
            ['Basta de pantalón',      'Dobladillo inferior del pantalón según especificación',           0.80, 1, 1],
            ['Pegar pretina',          'Colocación de pretina con entretela',                             1.10, 1, 1],
            ['Revisar costuras',       'Inspección visual y corrección de puntadas irregulares',          0.50, 2, null],
            ['Planchar y doblar',      'Planchado, doblado y presentación final',                         0.60, 2, null],
            ['Empacar prenda',         'Etiqueta, bolsa plástica y empaque individual',                   0.40, 2, null],
            ['Pegar elástico en cintura','Colocación de elástico en cintura de falda/short',             0.95, 1, 5],
            ['Sobrepespunte decorativo','Costura decorativa visible en orillas y bolsillos',              1.10, 0, 4],
        ] as [$nom,$desc,$precio,$lidx,$eidx]) {
            $ops[] = DB::table('operaciones_prenda')->insertGetId([
                'estilo_id'           => $eidx !== null ? $est[$eidx] : null,
                'cliente_id'          => null,
                'linea_produccion_id' => $lin[$lidx],
                'area_encargado_id'   => null,
                'nombre'              => $nom,
                'descripcion'         => $desc,
                'precio'              => $precio,
                'numero_piezas'       => 0,
                'created_at'          => now(), 'updated_at' => now(),
            ]);
        }
        DB::table('operacion_empleados')->insert([
            ['operacion_prenda_id'=>$ops[0],'empleado_id'=>$emp[7],'es_foraneo'=>true,'num_piezas_asignadas'=>500,'precio_variable'=>0.85,'created_at'=>now(),'updated_at'=>now()],
            ['operacion_prenda_id'=>$ops[1],'empleado_id'=>$emp[8],'es_foraneo'=>true,'num_piezas_asignadas'=>300,'precio_variable'=>1.30,'created_at'=>now(),'updated_at'=>now()],
            ['operacion_prenda_id'=>$ops[5],'empleado_id'=>$emp[9],'es_foraneo'=>true,'num_piezas_asignadas'=>200,'precio_variable'=>2.10,'created_at'=>now(),'updated_at'=>now()],
        ]);

        // ══════════════════════════════════════════════════════════════════════
        // 12. ÓRDENES DE PRODUCCIÓN (8)
        // ══════════════════════════════════════════════════════════════════════
        $ord = [];
        foreach ([
            ['OP-2026-001',$cli[0],'alta',  'BL-MANGA-045','CORTE-0501','2026-06-05','en_proceso', false,'Cliente solicita entrega urgente. Tela 100% algodón pima.'],
            ['OP-2026-002',$cli[1],'media', 'PT-VESTIR-12','CORTE-0489','2026-06-15','en_proceso', true, 'Modelo slim fit. Verificar medidas con ficha técnica adjunta.'],
            ['OP-2026-003',$cli[2],'alta',  'VE-CASUAL-08','CORTE-0502','2026-06-02','pendiente',  false,'Nueva colección verano. Requiere muestra aprobada antes de producción.'],
            ['OP-2026-004',$cli[3],'baja',  'UN-POLO-031', 'CORTE-0478','2026-05-30','completada', true, 'Uniformes empresa logística. Entrega completada sin observaciones.'],
            ['OP-2026-005',$cli[0],'media', 'BL-FORMAL-22','CORTE-0510','2026-06-20','pendiente',  false,null],
            ['OP-2026-006',$cli[4],'alta',  'FA-MIDI-004', 'CORTE-0518','2026-06-10','en_proceso', true, 'Falda midi para exportación. Entrega en tres lotes parciales.'],
            ['OP-2026-007',$cli[5],'media', 'SD-CAPUCHA-7','CORTE-0522','2026-06-28','pendiente',  false,'Sudadera unisex. Primera orden de este cliente.'],
            ['OP-2026-008',$cli[2],'baja',  'CM-FORM-010', 'CORTE-0495','2026-05-20','cancelada',  false,'Cancelada por cliente. Tela ya cortada — reutilizar en OP-2026-005.'],
        ] as [$cod,$cliId,$prio,$mod,$cor,$ent,$sts,$cortC,$obs]) {
            $ord[] = DB::table('ordenes_produccion')->insertGetId(['empresa_id'=>$eid,'cliente_id'=>$cliId,'codigo'=>$cod,'modelo'=>$mod,'corte'=>$cor,'fecha_entrega'=>$ent,'prioridad'=>$prio,'corte_comenzado'=>$cortC,'status'=>$sts,'observaciones'=>$obs,'created_at'=>now(),'updated_at'=>now()]);
        }

        // ══════════════════════════════════════════════════════════════════════
        // 13. MUESTRAS (8)
        // ══════════════════════════════════════════════════════════════════════
        DB::table('muestras')->insert([
            ['orden_produccion_id'=>$ord[0],'estilo_id'=>$est[0],'nombre'=>'Muestra piloto – Blusa ML',         'descripcion'=>'Primera muestra tela provisional talla M',   'observaciones'=>'Aprobada con modificación en profundidad de escote', 'status'=>'aprobada', 'created_at'=>now(),'updated_at'=>now()],
            ['orden_produccion_id'=>$ord[1],'estilo_id'=>$est[1],'nombre'=>'Muestra pantalón slim fit',         'descripcion'=>'Pantalón slim fit talla M sin basta',         'observaciones'=>'Pendiente aprobación Textiles del Sur',              'status'=>'pendiente','created_at'=>now(),'updated_at'=>now()],
            ['orden_produccion_id'=>$ord[2],'estilo_id'=>$est[2],'nombre'=>'Muestra vestido casual verano',     'descripcion'=>'Vestido tela de muestra talla S',             'observaciones'=>null,                                                 'status'=>'pendiente','created_at'=>now(),'updated_at'=>now()],
            ['orden_produccion_id'=>$ord[3],'estilo_id'=>null,    'nombre'=>'Muestra uniforme polo blanco',     'descripcion'=>'Polo blanco con bordado empresa logística',   'observaciones'=>'Aprobada desde el inicio',                          'status'=>'aprobada', 'created_at'=>now(),'updated_at'=>now()],
            ['orden_produccion_id'=>$ord[3],'estilo_id'=>null,    'nombre'=>'Muestra polo color corporativo',   'descripcion'=>'Polo azul marino con bordado',                'observaciones'=>'Rechazada por tono incorrecto, se reelaboró',       'status'=>'rechazada','created_at'=>now(),'updated_at'=>now()],
            ['orden_produccion_id'=>$ord[5],'estilo_id'=>$est[5],'nombre'=>'Muestra falda midi exportación',    'descripcion'=>'Falda talla M, largo 65 cm, forrada',         'observaciones'=>'Aprobada con ajuste en largo (+2 cm)',               'status'=>'aprobada', 'created_at'=>now(),'updated_at'=>now()],
            ['orden_produccion_id'=>$ord[6],'estilo_id'=>$est[6],'nombre'=>'Muestra sudadera capucha',          'descripcion'=>'Sudadera talla L, color gris mezcla',         'observaciones'=>'En espera de respuesta del cliente',                 'status'=>'pendiente','created_at'=>now(),'updated_at'=>now()],
            ['orden_produccion_id'=>$ord[6],'estilo_id'=>$est[6],'nombre'=>'Muestra sudadera capucha – Negro',  'descripcion'=>'Sudadera talla M, color negro',               'observaciones'=>'Enviada para revisión',                              'status'=>'pendiente','created_at'=>now(),'updated_at'=>now()],
        ]);

        // ══════════════════════════════════════════════════════════════════════
        // 14. FICHAS DE ESPECIFICACIONES
        // ══════════════════════════════════════════════════════════════════════
        DB::table('fichas_especificaciones')->insert([
            ['orden_produccion_id'=>$ord[0],'estilo_id'=>$est[0],'detalles'=>"Blusa manga larga, cuello redondo, 4 tallas: S/M/L/XL. Total 1,200 pzas.\nCorte y confección en algodón pima.", 'materiales'=>"Tela: 100% algodón pima 140 g/m²  1.8 m/prenda\nHilo: poliéster Nm 50/2\nEtiquetas tejidas", 'instrucciones'=>"Costuras overlock 5 hilos. Dobladillo 1 cm. Cuello con entretela.", 'observaciones'=>'Revisar largo de manga','archivo'=>null,'created_at'=>now(),'updated_at'=>now()],
            ['orden_produccion_id'=>$ord[1],'estilo_id'=>$est[1],'detalles'=>"Pantalón slim fit dama, 5 bolsillos, pretina 4 cm. Tallas S/M/L. Total 800 pzas.", 'materiales'=>"Gabardina stretch 260 g/m²  1.4 m/prenda\nCierre YKK 18 cm\nRemaches dorados", 'instrucciones'=>"Basta 3 cm. Pretina con entretela rígida.", 'observaciones'=>null,'archivo'=>null,'created_at'=>now(),'updated_at'=>now()],
            ['orden_produccion_id'=>$ord[5],'estilo_id'=>$est[5],'detalles'=>"Falda midi forrada, cierre invisible lateral, largo 65 cm. Tallas XS/S/M/L/XL. Total 600 pzas.", 'materiales'=>"Tela exterior: seda sintética 55 g/m²  1.6 m/prenda\nForro: poliéster liviano\nCierre invisible 22 cm", 'instrucciones'=>"Forro interno cosido a mano. Dobladillo con entredós.", 'observaciones'=>'Empacar en bolsa individual con cartón','archivo'=>null,'created_at'=>now(),'updated_at'=>now()],
        ]);

        // ══════════════════════════════════════════════════════════════════════
        // 15. PROCESOS DE PRODUCCIÓN
        // ══════════════════════════════════════════════════════════════════════
        foreach ([
            [$ord[0],$emp[0], 'Habilitación de piezas – Blusa',    'habilitacion','completado'],
            [$ord[0],$emp[1], 'Ensamble de cuerpo y mangas',        'ensamble',    'en_proceso'],
            [$ord[0],$emp[2], 'Acabado y empaque',                  'otro',        'pendiente'],
            [$ord[1],$emp[0], 'Corte de tela pantalón',             'habilitacion','completado'],
            [$ord[1],$emp[3], 'Ensamble pantalón slim',             'ensamble',    'en_proceso'],
            [$ord[2],$emp[1], 'Habilitación vestido verano',        'habilitacion','pendiente'],
            [$ord[3],$emp[1], 'Habilitación uniformes polo',        'habilitacion','completado'],
            [$ord[3],$emp[2], 'Ensamble y bordado uniformes',       'ensamble',    'completado'],
            [$ord[3],$emp[2], 'Acabado y empaque uniformes',        'otro',        'completado'],
            [$ord[5],$emp[0], 'Corte falda midi exportación',       'habilitacion','completado'],
            [$ord[5],$emp[3], 'Ensamble y forro falda midi',        'ensamble',    'en_proceso'],
            [$ord[5],$emp[2], 'Control de calidad exportación',     'otro',        'pendiente'],
        ] as [$oId,$eId,$nom,$fase,$sts]) {
            DB::table('procesos_produccion')->insert(['orden_produccion_id'=>$oId,'empleado_id'=>$eId,'nombre_proceso'=>$nom,'fase'=>$fase,'status'=>$sts,'created_at'=>now(),'updated_at'=>now()]);
        }

        // ══════════════════════════════════════════════════════════════════════
        // 16. HOJAS DE PRODUCCIÓN (17 hojas, 5 semanas)
        // ══════════════════════════════════════════════════════════════════════
        // [eidx, oidx, inicio, fin, dias_inh, [[op_idx, piezas, precio, diasOffset], ...]]
        $hojasDef = [
            // ── Semana 1: 28 abr – 2 may (uniforme completado) ────────────────
            [5, 3, '2026-04-28','2026-05-02', 0, [[0,400,0.80,0],[2,400,0.90,1],[9,400,0.50,2],[0,350,0.80,3],[2,350,0.90,4]]],
            [6, 3, '2026-04-28','2026-05-02', 0, [[10,380,0.60,0],[11,380,0.40,1],[10,320,0.60,3],[11,320,0.40,4]]],
            // ── Semana 2: 5 – 9 may (blusa + pantalón) ───────────────────────
            [0, 0, '2026-05-05','2026-05-09', 0, [[0,250,0.80,0],[1,180,1.20,1],[2,250,0.90,2],[0,200,0.80,3],[1,160,1.20,4]]],
            [1, 0, '2026-05-05','2026-05-09', 0, [[3,200,1.50,0],[3,180,1.50,2],[0,200,0.80,4]]],
            [3, 1, '2026-05-05','2026-05-09', 0, [[6,150,1.30,0],[7,150,0.80,1],[4,150,0.70,2],[6,120,1.30,3],[8,130,1.10,4]]],
            // ── Semana 3: 12 – 16 may ────────────────────────────────────────
            [2, 0, '2026-05-12','2026-05-16', 0, [[9,300,0.50,0],[10,280,0.60,1],[9,250,0.50,3],[10,250,0.60,4]]],
            [4, 1, '2026-05-12','2026-05-16', 1, [[4,200,0.70,0],[5,100,2.00,2],[4,180,0.70,4]]],
            [6, 0, '2026-05-12','2026-05-16', 0, [[11,350,0.40,0],[11,300,0.40,2],[11,280,0.40,4]]],
            // ── Semana 4: 19 – 23 may ────────────────────────────────────────
            [0, 0, '2026-05-19','2026-05-23', 1, [[1,220,1.20,0],[3,220,1.50,2],[1,180,1.20,4]]],
            [1, 1, '2026-05-19','2026-05-23', 0, [[6,180,1.30,0],[8,180,1.10,1],[6,150,1.30,3],[8,150,1.10,4]]],
            [3, 0, '2026-05-19','2026-05-23', 0, [[2,300,0.90,0],[4,300,0.70,1],[2,260,0.90,3],[4,260,0.70,4]]],
            [5, 5, '2026-05-19','2026-05-23', 0, [[12,280,0.95,0],[12,250,0.95,2],[9,280,0.50,4]]],
            // ── Semana 5: 26 – 30 may ────────────────────────────────────────
            [0, 0, '2026-05-26','2026-05-30', 0, [[0,200,0.80,0],[3,200,1.50,1],[1,180,1.20,3],[2,180,0.90,4]]],
            [1, 5, '2026-05-26','2026-05-30', 0, [[0,240,0.80,0],[12,240,0.95,1],[0,200,0.80,3],[12,200,0.95,4]]],
            [4, 1, '2026-05-26','2026-05-30', 0, [[7,200,0.80,0],[8,200,1.10,2],[5,120,2.00,4]]],
            [7, 5, '2026-05-26','2026-05-30', 0, [[9,300,0.50,0],[10,300,0.60,1],[11,300,0.40,3],[9,250,0.50,4]]],
            // ── Semana 6: 2 – 6 jun ─────────────────────────────────────────
            [0, 0, '2026-06-02','2026-06-06', 0, [[1,180,1.20,0],[3,180,1.50,1],[0,180,0.80,3],[4,180,0.70,4]]],
            [3, 5, '2026-06-02','2026-06-06', 0, [[0,220,0.80,0],[12,220,0.95,2],[9,220,0.50,4]]],
        ];

        $hojaIds = [];
        foreach ($hojasDef as [$eidx,$oidx,$fi,$ff,$di,$opsList]) {
            $total = array_sum(array_map(fn($o) => $o[1] * $o[2], $opsList));
            $hid   = DB::table('hojas_produccion')->insertGetId([
                'empresa_id'          => $eid,
                'empleado_id'         => $emp[$eidx],
                'orden_produccion_id' => $ord[$oidx],
                'fecha_inicio'        => $fi,
                'fecha_fin'           => $ff,
                'dias_inhabiles'      => $di,
                'importe_total'       => $total,
                'total_a_pagar'       => $total,
                'fecha_registro'      => $ff,
                'created_at'          => now(), 'updated_at' => now(),
            ]);
            $hojaIds[] = $hid;
            $fechaInicio = new \DateTime($fi);
            foreach ($opsList as [$opidx,$piezas,$precio,$diasOffset]) {
                $fechaOp = clone $fechaInicio;
                $fechaOp->modify("+{$diasOffset} days");
                DB::table('hoja_operaciones')->insert([
                    'hoja_produccion_id'  => $hid,
                    'operacion_prenda_id' => $ops[$opidx],
                    'numero_piezas'       => $piezas,
                    'total_por_operacion' => round($piezas * $precio, 2),
                    'fecha'               => $fechaOp->format('Y-m-d'),
                    'created_at'          => now(), 'updated_at' => now(),
                ]);
            }
        }

        DB::table('hoja_eventualidades')->insert([
            ['hoja_produccion_id'=>$hojaIds[5], 'eventualidad_trabajo_id'=>$evs[0]],
            ['hoja_produccion_id'=>$hojaIds[6], 'eventualidad_trabajo_id'=>$evs[1]],
            ['hoja_produccion_id'=>$hojaIds[7], 'eventualidad_trabajo_id'=>$evs[4]],
            ['hoja_produccion_id'=>$hojaIds[8], 'eventualidad_trabajo_id'=>$evs[2]],
            ['hoja_produccion_id'=>$hojaIds[12],'eventualidad_trabajo_id'=>$evs[5]],
            ['hoja_produccion_id'=>$hojaIds[15],'eventualidad_trabajo_id'=>$evs[3]],
        ]);

        // ══════════════════════════════════════════════════════════════════════
        // 17. REGISTRO DE ASISTENCIA (6 semanas × 12 empleados activos)
        // ══════════════════════════════════════════════════════════════════════
        $fechasAsistencia = [
            // Semana 1 (28 abr – 3 may)
            '2026-04-28','2026-04-29','2026-04-30','2026-05-01','2026-05-02','2026-05-03',
            // Semana 2 (5 – 10 may)
            '2026-05-05','2026-05-06','2026-05-07','2026-05-08','2026-05-09','2026-05-10',
            // Semana 3 (12 – 17 may)
            '2026-05-12','2026-05-13','2026-05-14','2026-05-15','2026-05-16','2026-05-17',
            // Semana 4 (19 – 24 may)
            '2026-05-19','2026-05-20','2026-05-21','2026-05-22','2026-05-23','2026-05-24',
            // Semana 5 (26 – 31 may)
            '2026-05-26','2026-05-27','2026-05-28','2026-05-29','2026-05-30','2026-05-31',
            // Semana 6 (2 – 7 jun)
            '2026-06-02','2026-06-03','2026-06-04','2026-06-05','2026-06-06','2026-06-07',
        ];
        // Índices activos: 0..10 y 11..13 (emp[14] inactivo)
        $empActivos = array_slice($emp, 0, 14, true);
        foreach ($empActivos as $eIdx => $empId) {
            foreach ($fechasAsistencia as $fecha) {
                $dow = (int) date('N', strtotime($fecha));
                if ($dow === 7) continue; // domingo: no
                $seed    = ($eIdx * 17 + (int) substr($fecha, -2)) % 11;
                if ($seed === 0) continue; // ~9% de ausencias
                $tarde    = ($eIdx + (int) substr($fecha, 8, 2)) % 7 === 0;
                $temprano = ($eIdx * 3 + (int) substr($fecha, -2)) % 9 === 0;
                $esSabado = ($dow === 6);
                DB::table('registro_asistencia')->insertOrIgnore([
                    'empleado_id'    => $empId,
                    'fecha'          => $fecha,
                    'entrada'        => $tarde ? '08:19:00' : '07:56:00',
                    'entrada_comida' => $esSabado ? null : '13:00:00',
                    'salida_comida'  => $esSabado ? null : '14:00:00',
                    'salida'         => $esSabado ? '14:00:00' : ($temprano ? '16:45:00' : '17:02:00'),
                    'observaciones'  => $tarde ? 'Llegada tarde' : null,
                    'created_at'     => now(), 'updated_at' => now(),
                ]);
            }
        }

        // ══════════════════════════════════════════════════════════════════════
        // 18. PROVEEDORES (5)
        // ══════════════════════════════════════════════════════════════════════
        $prov = [];
        foreach ([
            ['Textiles Orienta S.A.',       'Textiles Orienta S.A. de C.V.',    'TOSA900312AB1','Blvd. Textil 200, Puebla',            '2224567890','ventas@textilorienta.com',   'Pedro Olvera',    'activo'],
            ['Avíos y Accesorios MX',       'Avíos y Accesorios de México S.A.','AAMX150623CD2','Av. Industrial 55, CDMX',             '5556781234','pedidos@aviosmx.com',        'Lucía Ramírez',   'activo'],
            ['Hilados del Golfo',            'Hilados del Golfo S.R.L.',          'HGO180901EF3', 'Calle Mar 12, Veracruz',             '2294561234','hilo.golfo@gmail.com',       'Carlos Soto',     'activo'],
            ['Importaciones Textiles GH',   'Importaciones Textiles GH S.A.',   'ITGH200415GH4','Periférico Norte 890, Guadalajara',   '3331234567','importaciones@itgh.com.mx',  'Ana Gutiérrez',   'activo'],
            ['Distribuidora Fibras del Sur', 'Fibras del Sur Distribuidora S.A.','FIDS210903IJ5','Calle Cordobesa 12, Córdoba, Ver.',  '2712345678','fibrassur@distribuidora.com','Miguel Herrera',  'activo'],
        ] as [$n,$r,$rfc,$dom,$tel,$email,$cont,$sts]) {
            $prov[] = DB::table('proveedores')->insertGetId(['empresa_id'=>$eid,'nombre'=>$n,'razon_social'=>$r,'rfc'=>$rfc,'domicilio'=>$dom,'telefono'=>$tel,'email'=>$email,'contacto'=>$cont,'observaciones'=>null,'status'=>$sts,'created_at'=>now(),'updated_at'=>now()]);
        }

        // ══════════════════════════════════════════════════════════════════════
        // 19. TELAS (5) + ROLLOS + MOVIMIENTOS
        // ══════════════════════════════════════════════════════════════════════
        $telas = [];
        foreach ([
            ['TEL-001','Algodón Pima 140 g/m²',     '100% Algodón Pima',           150,'metro',45.00,215.50,50,$prov[0]],
            ['TEL-002','Gabardina Stretch 260 g/m²', '65% Poliéster 35% Algodón',  148,'metro',62.00,130.50,30,$prov[0]],
            ['TEL-003','Jersey Licra',                '92% Poliéster 8% Elastano',  160,'metro',38.50, 95.00,20,$prov[3]],
            ['TEL-004','Tela de Seda Sintética',      '100% Poliéster',             140,'metro',55.00, 42.50,15,$prov[3]],
            ['TEL-005','Fleece Polar 280 g/m²',       '100% Poliéster',             150,'metro',72.00, 60.00,20,$prov[4]],
        ] as [$cod,$nom,$comp,$ancho,$unidad,$precio,$stock,$stockMin,$provId]) {
            $telas[] = DB::table('telas')->insertGetId(['empresa_id'=>$eid,'proveedor_id'=>$provId,'codigo'=>$cod,'nombre'=>$nom,'composicion'=>$comp,'ancho_cm'=>$ancho,'unidad'=>$unidad,'precio_unitario'=>$precio,'stock_actual'=>$stock,'stock_minimo'=>$stockMin,'status'=>'activo','created_at'=>now(),'updated_at'=>now()]);
        }

        // Rollos
        $rollos = [];
        foreach ([
            [$telas[0],'LOTE-A1','Blanco',    'L250501', 80.00, 80.00, 45.00,'2026-05-01'],
            [$telas[0],'LOTE-A2','Azul Rey',  'L250502', 75.50, 75.50, 45.00,'2026-05-03'],
            [$telas[0],'LOTE-A3','Negro',     'L250503', 60.00, 60.00, 45.00,'2026-05-03'],
            [$telas[1],'LOTE-B1','Gris Oxford','L250510',50.00, 50.00, 62.00,'2026-05-05'],
            [$telas[1],'LOTE-B2','Negro',     'L250511', 45.00, 40.50, 62.00,'2026-05-08'],
            [$telas[2],'LOTE-C1','Rojo',      'L250515', 30.00, 30.00, 38.50,'2026-05-10'],
            [$telas[3],'LOTE-D1','Blanco',    'L250520', 25.00, 25.00, 55.00,'2026-05-12'],
            [$telas[4],'LOTE-E1','Gris mezcla','L250525',40.00, 40.00, 72.00,'2026-05-15'],
            [$telas[4],'LOTE-E2','Negro',     'L250526', 20.00, 20.00, 72.00,'2026-05-15'],
        ] as [$telaId,$num,$color,$lote,$inicial,$disponible,$precio,$fecha]) {
            $rollos[] = DB::table('rollos_tela')->insertGetId(['tela_id'=>$telaId,'numero_rollo'=>$num,'color'=>$color,'lote'=>$lote,'metros_iniciales'=>$inicial,'metros_disponibles'=>$disponible,'precio_unitario'=>$precio,'fecha_entrada'=>$fecha,'status'=>$disponible > 0 ? 'disponible' : 'agotado','created_at'=>now(),'updated_at'=>now()]);
        }

        // Movimientos de tela (entradas)
        foreach ([
            [$telas[0],$rollos[0],'Rollo Blanco 80 m',      80.00,45.00],
            [$telas[0],$rollos[1],'Rollo Azul Rey 75.5 m',  75.50,45.00],
            [$telas[0],$rollos[2],'Rollo Negro 60 m',        60.00,45.00],
            [$telas[1],$rollos[3],'Rollo Gris Oxford 50 m',  50.00,62.00],
            [$telas[1],$rollos[4],'Rollo Negro 45 m',        45.00,62.00],
            [$telas[2],$rollos[5],'Rollo Rojo 30 m',         30.00,38.50],
            [$telas[3],$rollos[6],'Rollo Blanco seda 25 m',  25.00,55.00],
            [$telas[4],$rollos[7],'Rollo Polar gris 40 m',   40.00,72.00],
            [$telas[4],$rollos[8],'Rollo Polar negro 20 m',  20.00,72.00],
        ] as [$telaId,$rolloId,$ref,$cant,$costo]) {
            DB::table('movimientos_almacen')->insert(['empresa_id'=>$eid,'tipo_item'=>'tela','item_id'=>$telaId,'nombre_item'=>DB::table('telas')->where('id',$telaId)->value('nombre'),'tipo_movimiento'=>'entrada','cantidad'=>$cant,'unidad'=>'metro','costo_unitario'=>$costo,'orden_produccion_id'=>null,'proveedor_id'=>null,'referencia'=>"Rollo #{$rolloId}",'observaciones'=>$ref,'created_at'=>now(),'updated_at'=>now()]);
        }
        // Salidas por producción
        foreach ([
            [$telas[0],$ord[0], 4.50, 45.00, 'Corte blusa ML semana 2'],
            [$telas[0],$ord[0], 3.80, 45.00, 'Corte blusa ML semana 3'],
            [$telas[1],$ord[1], 4.50, 62.00, 'Corte pantalón slim semana 2'],
            [$telas[3],$ord[5], 2.20, 55.00, 'Corte falda midi exportación'],
            [$telas[4],$ord[6], 3.00, 72.00, 'Corte sudadera capucha'],
        ] as [$telaId,$ordId,$cant,$costo,$obs]) {
            DB::table('movimientos_almacen')->insert(['empresa_id'=>$eid,'tipo_item'=>'tela','item_id'=>$telaId,'nombre_item'=>DB::table('telas')->where('id',$telaId)->value('nombre'),'tipo_movimiento'=>'salida','cantidad'=>$cant,'unidad'=>'metro','costo_unitario'=>$costo,'orden_produccion_id'=>$ordId,'proveedor_id'=>null,'referencia'=>null,'observaciones'=>$obs,'created_at'=>now(),'updated_at'=>now()]);
        }

        // ══════════════════════════════════════════════════════════════════════
        // 20. AVÍOS (12) + MOVIMIENTOS
        // ══════════════════════════════════════════════════════════════════════
        $avios = [];
        foreach ([
            ['AV-001','Hilo Poliéster Blanco Nm50/2',  'hilo',     'cono',  12.00,  85,  20,$prov[2]],
            ['AV-002','Hilo Poliéster Negro Nm50/2',   'hilo',     'cono',  12.00,  60,  20,$prov[2]],
            ['AV-003','Hilo Poliéster Gris Nm50/2',    'hilo',     'cono',  12.00,  45,  15,$prov[2]],
            ['AV-004','Cierre YKK Invisible 18 cm',    'cierre',   'pieza',  4.50, 300,  50,$prov[1]],
            ['AV-005','Cierre YKK Visible 20 cm',      'cierre',   'pieza',  5.00, 200,  50,$prov[1]],
            ['AV-006','Cierre YKK Invisible 22 cm',    'cierre',   'pieza',  5.50, 120,  30,$prov[1]],
            ['AV-007','Etiqueta Marca Tejida',          'etiqueta', 'pieza',  1.20,1500, 200,$prov[1]],
            ['AV-008','Etiqueta Composición y Talla',  'etiqueta', 'pieza',  0.30,3000, 500,$prov[1]],
            ['AV-009','Entretela Fusionable 90 cm',    'entretela','metro',  8.50,  40,  10,$prov[0]],
            ['AV-010','Bolsa Polietileno 30x40',        'bolsa',    'pieza',  0.80,2000, 300,$prov[1]],
            ['AV-011','Remache Dorado 10 mm',           'remache',  'pieza',  0.25,1000, 100,$prov[1]],
            ['AV-012','Elástico 3 cm ancho',            'elastico', 'metro',  5.50,  80,  20,$prov[1]],
        ] as [$cod,$nom,$cat,$unidad,$precio,$stock,$stockMin,$provId]) {
            $avios[] = DB::table('avios')->insertGetId(['empresa_id'=>$eid,'proveedor_id'=>$provId,'codigo'=>$cod,'nombre'=>$nom,'categoria'=>$cat,'unidad'=>$unidad,'precio_unitario'=>$precio,'stock_actual'=>$stock,'stock_minimo'=>$stockMin,'status'=>'activo','created_at'=>now(),'updated_at'=>now()]);
        }
        // Entradas de inventario inicial
        foreach ($avios as $avioId) {
            $a = DB::table('avios')->find($avioId);
            DB::table('movimientos_almacen')->insert(['empresa_id'=>$eid,'tipo_item'=>'avio','item_id'=>$avioId,'nombre_item'=>$a->nombre,'tipo_movimiento'=>'entrada','cantidad'=>$a->stock_actual,'unidad'=>$a->unidad,'costo_unitario'=>$a->precio_unitario,'orden_produccion_id'=>null,'proveedor_id'=>$a->proveedor_id,'referencia'=>'Inventario inicial','observaciones'=>null,'created_at'=>now(),'updated_at'=>now()]);
        }
        // Salidas por producción
        foreach ([
            [$avios[0], $ord[0], 60,  'cono',  12.00, 'Hilo blanco OP-2026-001'],
            [$avios[1], $ord[1], 40,  'cono',  12.00, 'Hilo negro OP-2026-002'],
            [$avios[3], $ord[1], 180, 'pieza',  4.50, 'Cierres YKK OP-2026-002'],
            [$avios[6], $ord[0], 600, 'pieza',  1.20, 'Etiquetas marca OP-2026-001'],
            [$avios[7], $ord[0], 600, 'pieza',  0.30, 'Etiquetas talla OP-2026-001'],
            [$avios[5], $ord[5], 200, 'pieza',  5.50, 'Cierres falda midi OP-2026-006'],
        ] as [$avioId,$ordId,$cant,$unidad,$costo,$obs]) {
            DB::table('movimientos_almacen')->insert(['empresa_id'=>$eid,'tipo_item'=>'avio','item_id'=>$avioId,'nombre_item'=>DB::table('avios')->where('id',$avioId)->value('nombre'),'tipo_movimiento'=>'salida','cantidad'=>$cant,'unidad'=>$unidad,'costo_unitario'=>$costo,'orden_produccion_id'=>$ordId,'proveedor_id'=>null,'referencia'=>null,'observaciones'=>$obs,'created_at'=>now(),'updated_at'=>now()]);
        }

        // ══════════════════════════════════════════════════════════════════════
        // 21. ARTÍCULOS / SKU
        // ══════════════════════════════════════════════════════════════════════
        $arts = [];
        foreach (['S','M','L'] as $ti => $talNom) {
            $talId = $tallasIds[$ti + 1];
            foreach ([['BL','Blanco'],['AZ','Azul Rey'],['NE','Negro']] as [$cc,$cn]) {
                $arts[] = DB::table('articulos')->insertGetId(['empresa_id'=>$eid,'estilo_id'=>$est[0],'talla_id'=>$talId,'codigo_sku'=>"BL-MLR-{$cc}-{$talNom}",'nombre'=>"Blusa Manga Larga – {$cn}",'color'=>$cn,'descripcion'=>"Blusa ML dama, {$cn}, talla {$talNom}",'precio_costo'=>85.00,'precio_venta'=>189.00,'stock_actual'=>rand(10,80),'status'=>'activo','created_at'=>now(),'updated_at'=>now()]);
            }
        }
        foreach (['S','M','L','XL'] as $ti => $talNom) {
            $talId = $tallasIds[$ti + 1];
            foreach ([['GR','Gris Oxford'],['NE','Negro']] as [$cc,$cn]) {
                $arts[] = DB::table('articulos')->insertGetId(['empresa_id'=>$eid,'estilo_id'=>$est[1],'talla_id'=>$talId,'codigo_sku'=>"PT-SLM-{$cc}-{$talNom}",'nombre'=>"Pantalón Slim – {$cn}",'color'=>$cn,'descripcion'=>"Pantalón slim dama, {$cn}, talla {$talNom}",'precio_costo'=>120.00,'precio_venta'=>280.00,'stock_actual'=>rand(5,50),'status'=>'activo','created_at'=>now(),'updated_at'=>now()]);
            }
        }
        foreach (['XS','S','M','L','XL'] as $ti => $talNom) {
            $talId = $tallasIds[$ti];
            $arts[] = DB::table('articulos')->insertGetId(['empresa_id'=>$eid,'estilo_id'=>$est[5],'talla_id'=>$talId,'codigo_sku'=>"FA-MIDI-BL-{$talNom}",'nombre'=>"Falda Midi – Blanco",'color'=>'Blanco','descripcion'=>"Falda midi, Blanco, talla {$talNom}",'precio_costo'=>95.00,'precio_venta'=>210.00,'stock_actual'=>rand(5,30),'status'=>'activo','created_at'=>now(),'updated_at'=>now()]);
        }

        // ══════════════════════════════════════════════════════════════════════
        // 22. BOM (Listas de Materiales)
        // ══════════════════════════════════════════════════════════════════════
        foreach ([
            ['tela',$telas[0],'Algodón Pima 140 g/m²',      1.80,'metro', 'Incluye merma 15%'],
            ['tela',$telas[3],'Entretela cuello',             0.20,'metro', null],
            ['avio',$avios[0],'Hilo Poliéster Blanco',        0.05,'cono',  null],
            ['avio',$avios[6],'Etiqueta Marca Tejida',         1.00,'pieza', null],
            ['avio',$avios[7],'Etiqueta Composición',          1.00,'pieza', null],
            ['avio',$avios[9],'Bolsa Polietileno',             1.00,'pieza', null],
        ] as [$tipo,$itemId,$nomRef,$cant,$unidad,$obs]) {
            DB::table('bom_items')->insert(['estilo_id'=>$est[0],'tipo'=>$tipo,'item_id'=>$itemId,'nombre_referencia'=>$nomRef,'cantidad_por_prenda'=>$cant,'unidad'=>$unidad,'observaciones'=>$obs,'created_at'=>now(),'updated_at'=>now()]);
        }
        foreach ([
            ['tela',$telas[1],'Gabardina Stretch',            1.40,'metro', 'Merma 12%'],
            ['tela',$telas[3],'Entretela pretina',             0.15,'metro', null],
            ['avio',$avios[3],'Cierre YKK 18 cm',              1.00,'pieza', null],
            ['avio',$avios[1],'Hilo Poliéster Negro',          0.05,'cono',  null],
            ['avio',$avios[10],'Remache Dorado 10 mm',         4.00,'pieza', '2 delanteros + 2 traseros'],
            ['avio',$avios[7],'Etiqueta Composición',          1.00,'pieza', null],
            ['avio',$avios[9],'Bolsa Polietileno',             1.00,'pieza', null],
        ] as [$tipo,$itemId,$nomRef,$cant,$unidad,$obs]) {
            DB::table('bom_items')->insert(['estilo_id'=>$est[1],'tipo'=>$tipo,'item_id'=>$itemId,'nombre_referencia'=>$nomRef,'cantidad_por_prenda'=>$cant,'unidad'=>$unidad,'observaciones'=>$obs,'created_at'=>now(),'updated_at'=>now()]);
        }
        foreach ([
            ['tela',$telas[3],'Seda Sintética',                1.60,'metro', 'Incluye forro 0.5 m'],
            ['avio',$avios[5],'Cierre YKK 22 cm invisible',    1.00,'pieza', null],
            ['avio',$avios[1],'Hilo Poliéster Negro',          0.04,'cono',  null],
            ['avio',$avios[6],'Etiqueta Marca Tejida',          1.00,'pieza', null],
            ['avio',$avios[9],'Bolsa Polietileno',             1.00,'pieza', null],
        ] as [$tipo,$itemId,$nomRef,$cant,$unidad,$obs]) {
            DB::table('bom_items')->insert(['estilo_id'=>$est[5],'tipo'=>$tipo,'item_id'=>$itemId,'nombre_referencia'=>$nomRef,'cantidad_por_prenda'=>$cant,'unidad'=>$unidad,'observaciones'=>$obs,'created_at'=>now(),'updated_at'=>now()]);
        }

        // ══════════════════════════════════════════════════════════════════════
        // 23. CURVA DE TALLAS
        // ══════════════════════════════════════════════════════════════════════
        foreach ([[$tallasIds[1],200],[$tallasIds[2],500],[$tallasIds[3],400],[$tallasIds[4],100]] as [$talId,$cant]) {
            DB::table('curva_tallas')->insert(['orden_produccion_id'=>$ord[0],'talla_id'=>$talId,'cantidad'=>$cant,'created_at'=>now(),'updated_at'=>now()]);
        }
        foreach ([[$tallasIds[1],150],[$tallasIds[2],350],[$tallasIds[3],200],[$tallasIds[4],100]] as [$talId,$cant]) {
            DB::table('curva_tallas')->insert(['orden_produccion_id'=>$ord[1],'talla_id'=>$talId,'cantidad'=>$cant,'created_at'=>now(),'updated_at'=>now()]);
        }
        foreach ([[$tallasIds[0],80],[$tallasIds[1],150],[$tallasIds[2],200],[$tallasIds[3],120],[$tallasIds[4],50]] as [$talId,$cant]) {
            DB::table('curva_tallas')->insert(['orden_produccion_id'=>$ord[5],'talla_id'=>$talId,'cantidad'=>$cant,'created_at'=>now(),'updated_at'=>now()]);
        }

        // ══════════════════════════════════════════════════════════════════════
        // 24. TALLERES EXTERNOS + ENVÍOS
        // ══════════════════════════════════════════════════════════════════════
        $talleres = [];
        foreach ([
            ['Bordados Don Pepe',      'José Fuentes',   '2311234567','bordados.donpepe@gmail.com',  'Calle Bordado 34, Teziutlán',  'Bordado y serigrafía'],
            ['Maquiladora Rápida TZ',  'Laura Méndez',   '2319876543','maq.rapida.tz@gmail.com',     'Av. Industrial 88, Teziutlán', 'Ensamble y acabados'],
            ['Lavandería Industrial',  'Roberto Cruz',   '2316543210','lavindustrial.pue@gmail.com', 'Blvd. Norte 212, Teziutlán',   'Lavado industrial y teñido'],
        ] as [$n,$resp,$tel,$email,$dom,$esp]) {
            $talleres[] = DB::table('talleres_externos')->insertGetId(['empresa_id'=>$eid,'nombre'=>$n,'responsable'=>$resp,'telefono'=>$tel,'email'=>$email,'domicilio'=>$dom,'especialidad'=>$esp,'observaciones'=>null,'status'=>'activo','created_at'=>now(),'updated_at'=>now()]);
        }
        DB::table('envios_taller')->insert([
            ['empresa_id'=>$eid,'taller_id'=>$talleres[0],'orden_produccion_id'=>$ord[0],'concepto'=>'Bordado de logo en blusa ML (OP-2026-001)','piezas_enviadas'=>600,'piezas_recibidas'=>598,'precio_por_pieza'=>8.50,'importe_total'=>5100.00,'fecha_envio'=>'2026-05-08','fecha_compromiso'=>'2026-05-14','fecha_recepcion'=>'2026-05-14','status'=>'recibido','created_at'=>now(),'updated_at'=>now()],
            ['empresa_id'=>$eid,'taller_id'=>$talleres[1],'orden_produccion_id'=>$ord[1],'concepto'=>'Ensamble pretinas pantalón slim (OP-2026-002)','piezas_enviadas'=>400,'piezas_recibidas'=>350,'precio_por_pieza'=>6.00,'importe_total'=>2400.00,'fecha_envio'=>'2026-05-12','fecha_compromiso'=>'2026-05-20','fecha_recepcion'=>null,'status'=>'recibido_parcial','created_at'=>now(),'updated_at'=>now()],
            ['empresa_id'=>$eid,'taller_id'=>$talleres[2],'orden_produccion_id'=>null,'concepto'=>'Lavado industrial – 3 rollos antes de corte','piezas_enviadas'=>3,'piezas_recibidas'=>0,'precio_por_pieza'=>120.00,'importe_total'=>360.00,'fecha_envio'=>'2026-05-20','fecha_compromiso'=>'2026-05-27','fecha_recepcion'=>null,'status'=>'enviado','created_at'=>now(),'updated_at'=>now()],
            ['empresa_id'=>$eid,'taller_id'=>$talleres[0],'orden_produccion_id'=>$ord[5],'concepto'=>'Bordado exportadora en falda midi (OP-2026-006)','piezas_enviadas'=>300,'piezas_recibidas'=>0,'precio_por_pieza'=>9.00,'importe_total'=>2700.00,'fecha_envio'=>'2026-05-28','fecha_compromiso'=>'2026-06-06','fecha_recepcion'=>null,'status'=>'enviado','created_at'=>now(),'updated_at'=>now()],
        ]);

        // ══════════════════════════════════════════════════════════════════════
        // 25. LISTAS DE PRECIOS
        // ══════════════════════════════════════════════════════════════════════
        $listas = [];
        foreach ([
            ['Lista General 2026',       'Precios sugeridos al público',              'general','2026-01-01','2026-12-31',true],
            ['Lista Mayoreo Temporada',  'Precio especial pedidos > 100 pzas',       'mayoreo','2026-04-01','2026-09-30',true],
            ['Lista Boutique Primavera', 'Precios acordados con Boutique Primavera', 'cliente','2026-01-01','2026-12-31',true],
        ] as [$n,$d,$t,$fi,$ff,$act]) {
            $listas[] = DB::table('listas_precios')->insertGetId(['empresa_id'=>$eid,'nombre'=>$n,'descripcion'=>$d,'tipo'=>$t,'fecha_vigencia_inicio'=>$fi,'fecha_vigencia_fin'=>$ff,'activa'=>$act,'created_at'=>now(),'updated_at'=>now()]);
        }
        foreach (array_slice($arts, 0, 9) as $artId) {
            $precio = DB::table('articulos')->where('id',$artId)->value('precio_venta');
            DB::table('lista_precio_articulos')->insert(['lista_precio_id'=>$listas[0],'articulo_id'=>$artId,'precio'=>$precio,'created_at'=>now(),'updated_at'=>now()]);
            DB::table('lista_precio_articulos')->insert(['lista_precio_id'=>$listas[1],'articulo_id'=>$artId,'precio'=>round($precio * 0.80, 2),'created_at'=>now(),'updated_at'=>now()]);
        }

        // ══════════════════════════════════════════════════════════════════════
        // 26. CUENTAS POR PAGAR (6)
        // ══════════════════════════════════════════════════════════════════════
        DB::table('cuentas_pagar')->insert([
            ['empresa_id'=>$eid,'proveedor_id'=>$prov[0],'folio'=>'FAC-2026-0089','concepto'=>'Compra de rollos algodón pima (3 rollos)','monto_total'=>9697.50,'monto_pagado'=>0,'fecha_emision'=>'2026-05-01','fecha_vencimiento'=>'2026-05-31','metodo_pago'=>'transferencia','status'=>'pendiente','created_at'=>now(),'updated_at'=>now()],
            ['empresa_id'=>$eid,'proveedor_id'=>$prov[1],'folio'=>'FAC-2026-0102','concepto'=>'Avíos: cierres YKK, etiquetas y bolsas (lote mensual)','monto_total'=>8450.00,'monto_pagado'=>4000.00,'fecha_emision'=>'2026-05-05','fecha_vencimiento'=>'2026-06-05','metodo_pago'=>'transferencia','status'=>'parcial','created_at'=>now(),'updated_at'=>now()],
            ['empresa_id'=>$eid,'proveedor_id'=>$prov[2],'folio'=>'FAC-2026-0045','concepto'=>'Hilos poliéster Nm50/2 en 5 colores – 30 conos c/u','monto_total'=>5400.00,'monto_pagado'=>5400.00,'fecha_emision'=>'2026-04-20','fecha_vencimiento'=>'2026-05-20','metodo_pago'=>'efectivo','status'=>'pagado','created_at'=>now(),'updated_at'=>now()],
            ['empresa_id'=>$eid,'proveedor_id'=>$prov[0],'folio'=>'FAC-2026-0110','concepto'=>'Gabardina stretch gris y negra – 2 rollos','monto_total'=>5890.00,'monto_pagado'=>0,'fecha_emision'=>'2026-05-10','fecha_vencimiento'=>'2026-05-25','metodo_pago'=>'transferencia','status'=>'pendiente','created_at'=>now(),'updated_at'=>now()],
            ['empresa_id'=>$eid,'proveedor_id'=>$prov[4],'folio'=>'FAC-2026-0128','concepto'=>'Fleece polar 280 g/m² – 2 rollos (60 m)','monto_total'=>4320.00,'monto_pagado'=>0,'fecha_emision'=>'2026-05-15','fecha_vencimiento'=>'2026-06-15','metodo_pago'=>'transferencia','status'=>'pendiente','created_at'=>now(),'updated_at'=>now()],
            ['empresa_id'=>$eid,'proveedor_id'=>$prov[1],'folio'=>'FAC-2026-0135','concepto'=>'Elástico 3 cm ancho – 200 m y entretelas','monto_total'=>2350.00,'monto_pagado'=>2350.00,'fecha_emision'=>'2026-04-28','fecha_vencimiento'=>'2026-05-28','metodo_pago'=>'efectivo','status'=>'pagado','created_at'=>now(),'updated_at'=>now()],
        ]);

        // ══════════════════════════════════════════════════════════════════════
        // 27. PERMISOS DE EMPLEADOS (8)
        // ══════════════════════════════════════════════════════════════════════
        DB::table('permisos_empleado')->insert([
            ['empresa_id'=>$eid,'empleado_id'=>$emp[3],'tipo'=>'permiso_personal','fecha_inicio'=>'2026-05-15','fecha_fin'=>'2026-05-15','motivo'=>'Cita médica pediatra (hija)','status'=>'aprobado','observaciones_encargado'=>'Autorizado. Cubre su turno Karla.','created_at'=>now(),'updated_at'=>now()],
            ['empresa_id'=>$eid,'empleado_id'=>$emp[1],'tipo'=>'vacaciones','fecha_inicio'=>'2026-06-09','fecha_fin'=>'2026-06-13','motivo'=>'Vacaciones anuales programadas (1 semana)','status'=>'aprobado','observaciones_encargado'=>'Conforme a calendario. Sin observaciones.','created_at'=>now(),'updated_at'=>now()],
            ['empresa_id'=>$eid,'empleado_id'=>$emp[6],'tipo'=>'incapacidad','fecha_inicio'=>'2026-05-20','fecha_fin'=>'2026-05-22','motivo'=>'Incapacidad IMSS por esguince de tobillo','status'=>'aprobado','observaciones_encargado'=>'Presenta incapacidad folio 382910. Se cubre con personal disponible.','created_at'=>now(),'updated_at'=>now()],
            ['empresa_id'=>$eid,'empleado_id'=>$emp[4],'tipo'=>'permiso_personal','fecha_inicio'=>'2026-05-28','fecha_fin'=>'2026-05-28','motivo'=>'Diligencias personales urgentes','status'=>'pendiente','observaciones_encargado'=>null,'created_at'=>now(),'updated_at'=>now()],
            ['empresa_id'=>$eid,'empleado_id'=>$emp[9],'tipo'=>'vacaciones','fecha_inicio'=>'2026-06-16','fecha_fin'=>'2026-06-20','motivo'=>'Vacaciones anuales (primera parte)','status'=>'pendiente','observaciones_encargado'=>null,'created_at'=>now(),'updated_at'=>now()],
            ['empresa_id'=>$eid,'empleado_id'=>$emp[2],'tipo'=>'otro','fecha_inicio'=>'2026-05-06','fecha_fin'=>'2026-05-06','motivo'=>'Graduación de su hijo, ceremonia matutina','status'=>'aprobado','observaciones_encargado'=>'Autorizado. Solo turno mañana.','created_at'=>now(),'updated_at'=>now()],
            ['empresa_id'=>$eid,'empleado_id'=>$emp[7],'tipo'=>'incapacidad','fecha_inicio'=>'2026-05-12','fecha_fin'=>'2026-05-14','motivo'=>'Incapacidad por gripe con fiebre','status'=>'rechazado','observaciones_encargado'=>'No presentó incapacidad del IMSS dentro del plazo. Se descuenta del período.','created_at'=>now(),'updated_at'=>now()],
            ['empresa_id'=>$eid,'empleado_id'=>$emp[12],'tipo'=>'permiso_personal','fecha_inicio'=>'2026-06-03','fecha_fin'=>'2026-06-03','motivo'=>'Boda de familiar','status'=>'pendiente','observaciones_encargado'=>null,'created_at'=>now(),'updated_at'=>now()],
        ]);

        // ══════════════════════════════════════════════════════════════════════
        // 28. ACLARACIONES DE PRODUCCIÓN (6)
        // ══════════════════════════════════════════════════════════════════════
        DB::table('aclaraciones_produccion')->insert([
            ['empresa_id'=>$eid,'empleado_id'=>$emp[3],'hoja_produccion_id'=>$hojaIds[4],'descripcion'=>'En mi hoja de la semana del 12-16 de mayo aparecen 200 piezas de dobladillo pero yo hice 230. Solicito revisión del conteo.','status'=>'resuelta','respuesta'=>'Se revisó el conteo en el taller y se confirman 228 piezas. Se ajusta el pago de la diferencia en la siguiente quincena.','created_at'=>now(),'updated_at'=>now()],
            ['empresa_id'=>$eid,'empleado_id'=>$emp[0],'hoja_produccion_id'=>$hojaIds[2],'descripcion'=>'El precio registrado para Unir hombros es $0.80 pero cuando entré tenía acuerdo de $0.85 por pieza por dificultad del modelo.','status'=>'en_revision','respuesta'=>null,'created_at'=>now(),'updated_at'=>now()],
            ['empresa_id'=>$eid,'empleado_id'=>$emp[1],'hoja_produccion_id'=>$hojaIds[3],'descripcion'=>'Mi hoja del 5-9 de mayo no incluye el día sábado 10. Trabajé ese sábado 3 horas y registré 80 piezas de cuello.','status'=>'resuelta','respuesta'=>'Se confirma trabajo el sábado 10 de mayo. Se genera ajuste y se pagará en próxima quincena junto con las 80 piezas correspondientes.','created_at'=>now(),'updated_at'=>now()],
            ['empresa_id'=>$eid,'empleado_id'=>$emp[6],'hoja_produccion_id'=>null,'descripcion'=>'Tengo dudas sobre el cálculo de mi bono de productividad del mes de abril. No está reflejado en ninguna hoja ni en el sistema.','status'=>'pendiente','respuesta'=>null,'created_at'=>now(),'updated_at'=>now()],
            ['empresa_id'=>$eid,'empleado_id'=>$emp[11],'hoja_produccion_id'=>$hojaIds[11],'descripcion'=>'En mi hoja de la semana 19-23 de mayo aparecen 280 piezas revisadas pero en realidad hice 310. La encargada puede confirmarlo.','status'=>'en_revision','respuesta'=>null,'created_at'=>now(),'updated_at'=>now()],
            ['empresa_id'=>$eid,'empleado_id'=>$emp[9],'hoja_produccion_id'=>$hojaIds[7],'descripcion'=>'Se registró como inhábil el martes 13 de mayo pero ese día sí trabajamos. Solicito corrección.','status'=>'resuelta','respuesta'=>'Error confirmado. El martes 13/05 fue día laborable. Se corrige y abona la diferencia.','created_at'=>now(),'updated_at'=>now()],
        ]);

        // ══════════════════════════════════════════════════════════════════════
        // RESUMEN
        // ══════════════════════════════════════════════════════════════════════
        $this->command->info('');
        $this->command->info('✔  Base de datos poblada correctamente.');
        $this->command->info('');
        $this->command->info('   ── ACCESOS ──────────────────────────────────────────────────');
        $this->command->info('   ADMIN     admin@maewallis.com        / Admin2026!');
        $this->command->info('   ENCARGADO encargado@maewallis.com    / Encargado2026!');
        $this->command->info('   EMPLEADO  empleado@maewallis.com     / Empleado2026!');
        $this->command->info('   ────────────────────────────────────────────────────────────');
        $this->command->info('');
        $this->command->table(['Tabla','Registros'], [
            ['empresas',                DB::table('empresas')->count()],
            ['users',                   DB::table('users')->count()],
            ['empleados',               DB::table('empleados')->count()],
            ['areas / encargados',      DB::table('areas')->count().' / '.DB::table('area_encargados')->count()],
            ['clientes',                DB::table('clientes')->count()],
            ['estilos',                 DB::table('estilos')->count()],
            ['tallas',                  DB::table('tallas')->count()],
            ['lineas_produccion',       DB::table('lineas_produccion')->count()],
            ['eventualidades_trabajo',  DB::table('eventualidades_trabajo')->count()],
            ['operaciones_prenda',      DB::table('operaciones_prenda')->count()],
            ['ordenes_produccion',      DB::table('ordenes_produccion')->count()],
            ['muestras',                DB::table('muestras')->count()],
            ['fichas_especificaciones', DB::table('fichas_especificaciones')->count()],
            ['procesos_produccion',     DB::table('procesos_produccion')->count()],
            ['hojas_produccion',        DB::table('hojas_produccion')->count()],
            ['hoja_operaciones',        DB::table('hoja_operaciones')->count()],
            ['registro_asistencia',     DB::table('registro_asistencia')->count()],
            ['dias_laborables',         DB::table('dias_laborables')->count()],
            ['proveedores',             DB::table('proveedores')->count()],
            ['telas / rollos',          DB::table('telas')->count().' / '.DB::table('rollos_tela')->count()],
            ['avios',                   DB::table('avios')->count()],
            ['movimientos_almacen',     DB::table('movimientos_almacen')->count()],
            ['articulos',               DB::table('articulos')->count()],
            ['bom_items',               DB::table('bom_items')->count()],
            ['curva_tallas',            DB::table('curva_tallas')->count()],
            ['talleres / envios',        DB::table('talleres_externos')->count().' / '.DB::table('envios_taller')->count()],
            ['listas_precios / items',  DB::table('listas_precios')->count().' / '.DB::table('lista_precio_articulos')->count()],
            ['cuentas_pagar',           DB::table('cuentas_pagar')->count()],
            ['permisos_empleado',       DB::table('permisos_empleado')->count()],
            ['aclaraciones_produccion', DB::table('aclaraciones_produccion')->count()],
        ]);
    }
}
