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
            'corte_nomina_empleado','cortes_nomina',
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
            ['name'=>'Administrador General', 'email'=>'admin@maewallis.com',      'password'=>Hash::make('Admin2026!'),      'empresa_id'=>$eid,'role'=>'admin',     'email_verified_at'=>now(),'created_at'=>now(),'updated_at'=>now()],
            ['name'=>'Encargado Producción',  'email'=>'encargado@maewallis.com',   'password'=>Hash::make('Encargado2026!'), 'empresa_id'=>$eid,'role'=>'encargado', 'email_verified_at'=>now(),'created_at'=>now(),'updated_at'=>now()],
            ['name'=>'Operadora Costura',     'email'=>'empleado@maewallis.com',    'password'=>Hash::make('Empleado2026!'),  'empresa_id'=>$eid,'role'=>'empleado',  'email_verified_at'=>now(),'created_at'=>now(),'updated_at'=>now()],
            ['name'=>'Supervisor Planta',     'email'=>'supervisor@maewallis.com',  'password'=>Hash::make('Supervisor2026!'),'empresa_id'=>$eid,'role'=>'admin',     'email_verified_at'=>now(),'created_at'=>now(),'updated_at'=>now()],
        ]);
        $userAdmin     = DB::table('users')->where('email','admin@maewallis.com')->value('id');
        $userEncargado = DB::table('users')->where('email','encargado@maewallis.com')->value('id');
        $userEmpleado  = DB::table('users')->where('email','empleado@maewallis.com')->value('id');

        // ══════════════════════════════════════════════════════════════════════
        // 3. CLIENTES (12)
        // ══════════════════════════════════════════════════════════════════════
        $cli = [];
        foreach ([
            ['Moda Elegante',             'Moda Elegante S.A. de C.V.',               'Av. Independencia 320, Puebla',          '2222345678','ventas@modaelegante.com',       'activo'],
            ['Textiles del Sur',          'Textiles del Sur S.R.L.',                  'Calle Morelos 88, Tehuacán',             '2383456789','pedidos@textilesdelsur.com',    'activo'],
            ['Boutique Primavera',        'Boutique Primavera S.A.',                  'Masaryk 89, Polanco, CDMX',             '5555678901','compras@boutiqueprimavera.com', 'activo'],
            ['Uniformes Industriales',    'Uniformes Industriales del Golfo S.A.',    'Blvd. Ávila Camacho 200, Veracruz',    '2294567890','uniformes.golfo@gmail.com',     'activo'],
            ['Exportadora Moda Sur',      'Exportadora Moda Sur S.A. de C.V.',       'Blvd. Comercio 540, Monterrey',         '8181234567','pedidos@modasur.com.mx',        'activo'],
            ['Confecciones Regionales',   'Confecciones Regionales de Puebla S.A.',  'Calle 6 Oriente 18, Atlixco, Puebla',  '2444321098','ventas@confregionales.com',     'activo'],
            ['Grupo Fashion MX',          'Grupo Fashion MX S.A. de C.V.',           'Av. Insurgentes Sur 1811, CDMX',        '5541236789','ventas@groupfashionmx.com',     'activo'],
            ['Uniformes Corporativos GDL','Uniformes Corporativos de GDL S.A.',      'Av. Vallarta 3000, Guadalajara',        '3337891234','compras@ucgdl.mx',              'activo'],
            ['Tiendas Deportivas Norte',  'Tiendas Deportivas del Norte S.A.',        'Blvd. Díaz Ordaz 450, Monterrey',      '8182345678','pedidos@tdnorte.com',           'activo'],
            ['Distribuidora Jalisco',     'Distribuidora Jalisco S.R.L.',             'Calle López Mateos 112, Zapopan',       '3331234567','distribucion@jalisco.com',      'activo'],
            ['Marca Propia Teziutlán',    'Marca Propia Teziutlán S.A.',             'Av. 5 de Mayo 44, Teziutlán',          '2317001122','mpteziutlan@gmail.com',         'activo'],
            ['Exportaciones Textil Pue',  'Exportaciones Textil Puebla S.A. de C.V.','Blvd. Norte 890, Puebla',               '2224445566','exports@textilpue.com',         'activo'],
        ] as [$n,$r,$d,$t,$e,$s]) {
            $cli[] = DB::table('clientes')->insertGetId(['empresa_id'=>$eid,'nombre'=>$n,'razon_social'=>$r,'domicilio'=>$d,'telefono'=>$t,'email'=>$e,'status'=>$s,'created_at'=>now(),'updated_at'=>now()]);
        }

        // ══════════════════════════════════════════════════════════════════════
        // 4. EMPLEADOS (30: 27 activos, 3 inactivos)
        // ══════════════════════════════════════════════════════════════════════
        $emp = [];
        foreach ([
            ['001','María Elena',      'Ramos Vázquez',       '2317654321','mariaelenasew@gmail.com',    'activo'],
            ['002','Rosa Isela',       'Hernández Cruz',      '2317543210','rosa.hernandez@gmail.com',   'activo'],
            ['003','Ana Patricia',     'López Jiménez',       '2317432109','alopez.maq@gmail.com',       'activo'],
            ['004','Beatriz',          'Sánchez Torres',      '2317321098', null,                         'activo'],
            ['005','Gloria Martínez',  'Pérez Reyes',         '2317210987','gloria.prez@hotmail.com',    'activo'],
            ['006','Karla Yazmín',     'Flores González',     '2317109876', null,                         'activo'],
            ['007','Sandra Monserrat', 'Reyes Luna',          '2316098765','sandrarey.costura@gmail.com','activo'],
            ['008','Juana Emilia',     'García Castillo',     '2315987654','juana.garcia.c@gmail.com',   'activo'],
            ['009','Lucía del Carmen', 'Pérez Mendoza',       '2314876543', null,                         'activo'],
            ['010','Patricia',         'Morales Ríos',        '2313765432','p.moralesrios@gmail.com',    'activo'],
            ['011','Esperanza',        'Domínguez Salinas',    null,         null,                         'inactivo'],
            ['012','Verónica',         'Castro Mejía',        '2316112233','vero.castro.m@gmail.com',    'activo'],
            ['013','Claudia Ivette',   'Méndez Ortiz',        '2317334455', null,                         'activo'],
            ['014','Silvia',           'Gutiérrez Paredes',   '2315556677','silviagtz.cos@gmail.com',    'activo'],
            ['015','Norma Leticia',    'Aguilar Bravo',        null,         null,                         'inactivo'],
            ['016','Leticia',          'Fuentes Barrios',     '2317778899','leticia.fuentes@gmail.com',  'activo'],
            ['017','Irma Concepción',  'Valdés Ríos',         '2316667788','irma.valdes@hotmail.com',    'activo'],
            ['018','Carmen Gloria',    'Ruiz Espinoza',       '2315559900','carmen.ruiz.cos@gmail.com',  'activo'],
            ['019','Alicia',           'Pérez Téllez',        '2317112233','alicia.pt@gmail.com',        'activo'],
            ['020','Marisela',         'González Arriaga',    '2316223344','marisela.ga@hotmail.com',    'activo'],
            ['021','Teresa de Jesús',  'Olvera Campos',       '2315334455', null,                         'activo'],
            ['022','Hilda Margarita',  'Vargas Serrano',      '2317445566','hilda.vargas@gmail.com',     'activo'],
            ['023','Yolanda',          'Espinosa Lugo',       '2316556677','yolanda.el@gmail.com',       'activo'],
            ['024','Rebeca',           'Montoya Torres',      '2315667788', null,                         'activo'],
            ['025','Adriana',          'Cisneros Bravo',      '2317889900','adriana.cis@hotmail.com',    'activo'],
            ['026','Fernanda',         'Herrera Jiménez',     '2316001122','fernanda.hj@gmail.com',      'activo'],
            ['027','Josefina',         'Salinas Medina',      '2315112233', null,                         'activo'],
            ['028','Graciela',         'Bautista Quiroz',     '2317223344','graciela.bq@gmail.com',      'activo'],
            ['029','Minerva',          'Cortés Santiago',     '2316334455','minerva.cs@gmail.com',       'activo'],
            ['030','Eugenia',          'Maldonado Rivas',      null,         null,                         'inactivo'],
        ] as [$hue,$nom,$ape,$tel,$eml,$sts]) {
            $emp[] = DB::table('empleados')->insertGetId(['empresa_id'=>$eid,'numero_huella'=>$hue,'nombre'=>$nom,'apellidos'=>$ape,'domicilio'=>"Col. Centro, Teziutlán, Pue.",'telefono'=>$tel,'email'=>$eml,'status'=>$sts,'created_at'=>now(),'updated_at'=>now()]);
        }
        DB::table('users')->where('id',$userEncargado)->update(['empleado_id'=>$emp[0]]);
        DB::table('users')->where('id',$userEmpleado)->update(['empleado_id'=>$emp[3]]);

        // ══════════════════════════════════════════════════════════════════════
        // 5. ÁREAS (5)
        // ══════════════════════════════════════════════════════════════════════
        $areas = [];
        foreach ([
            ['Corte',             'Área de corte de tela y materiales'],
            ['Ensamble A',        'Línea A: blusas, vestidos y faldas'],
            ['Ensamble B',        'Línea B: pantalones, conjuntos y sudaderas'],
            ['Acabado y Calidad', 'Revisión, planchado, etiquetado y empaque final'],
            ['Almacén',           'Recepción, resguardo y despacho de materiales'],
        ] as [$n,$d]) {
            $areas[] = DB::table('areas')->insertGetId(['empresa_id'=>$eid,'nombre'=>$n,'descripcion'=>$d,'created_at'=>now(),'updated_at'=>now()]);
        }
        foreach ([[$areas[0],$emp[0]],[$areas[1],$emp[1]],[$areas[2],$emp[2]],[$areas[3],$emp[5]],[$areas[4],$emp[11]]] as [$aid,$empId]) {
            DB::table('area_encargados')->insert(['area_id'=>$aid,'empleado_id'=>$empId,'fecha_inicio'=>'2026-01-06','status'=>'activo','created_at'=>now(),'updated_at'=>now()]);
        }

        // ══════════════════════════════════════════════════════════════════════
        // 6. ESTILOS (10)
        // ══════════════════════════════════════════════════════════════════════
        $est = [];
        foreach ([
            ['EST-001','Blusa Manga Larga Dama',      'Blusa clásica manga larga para dama',              'Blusas'],
            ['EST-002','Pantalón de Vestir Dama',     'Pantalón de corte recto para dama',                'Pantalones'],
            ['EST-003','Vestido Casual',              'Vestido de uso diario, largo a la rodilla',        'Vestidos'],
            ['EST-004','Conjunto Deportivo',          'Top y short deportivo unisex',                     'Deportivo'],
            ['EST-005','Camisa Formal Caballero',     'Camisa de vestir manga larga caballero',           'Camisas'],
            ['EST-006','Falda Midi',                  'Falda hasta media pierna, corte A',                'Faldas'],
            ['EST-007','Sudadera con Capucha',        'Sudadera unisex con capucha y bolsillo canguro',   'Deportivo'],
            ['EST-008','Blusa Sin Manga Dama',        'Blusa casual sin mangas, cuello en V',             'Blusas'],
            ['EST-009','Uniforme Polo Caballero',     'Polo piqué manga corta con bordado',               'Uniformes'],
            ['EST-010','Pantalón Cargo Dama',         'Pantalón cargo con bolsillos laterales',           'Pantalones'],
        ] as [$cod,$n,$d,$c]) {
            $est[] = DB::table('estilos')->insertGetId(['empresa_id'=>$eid,'codigo'=>$cod,'nombre'=>$n,'descripcion'=>$d,'categoria'=>$c,'status'=>'activo','created_at'=>now(),'updated_at'=>now()]);
        }

        // ══════════════════════════════════════════════════════════════════════
        // 7. TALLAS (8)
        // ══════════════════════════════════════════════════════════════════════
        $tal = [];
        foreach ([['XS',0],['S',1],['M',2],['L',3],['XL',4],['XXL',5],['XXXL',6],['Única',99]] as [$n,$o]) {
            $tal[] = DB::table('tallas')->insertGetId(['nombre'=>$n,'descripcion'=>"Talla $n",'orden'=>$o,'created_at'=>now(),'updated_at'=>now()]);
        }

        // ══════════════════════════════════════════════════════════════════════
        // 8. LÍNEAS DE PRODUCCIÓN (4)
        // ══════════════════════════════════════════════════════════════════════
        $lin = [];
        foreach ([
            ['LP-A01','Nave A – Zona Norte', 'Blusas y vestidos'],
            ['LP-B01','Nave B – Zona Centro','Pantalones y conjuntos'],
            ['LP-C01','Nave A – Zona Sur',   'Acabados y calidad'],
            ['LP-D01','Nave B – Zona Norte', 'Deportivo y uniformes'],
        ] as [$c,$u,$d]) {
            $lin[] = DB::table('lineas_produccion')->insertGetId(['empresa_id'=>$eid,'codigo'=>$c,'ubicacion'=>$u,'descripcion'=>$d,'status'=>'activo','created_at'=>now(),'updated_at'=>now()]);
        }

        // ══════════════════════════════════════════════════════════════════════
        // 9. DÍAS LABORABLES
        // ══════════════════════════════════════════════════════════════════════
        foreach ([['lunes',true,'08:00','17:00'],['martes',true,'08:00','17:00'],['miercoles',true,'08:00','17:00'],['jueves',true,'08:00','17:00'],['viernes',true,'08:00','17:00'],['sabado',true,'08:00','14:00'],['domingo',false,null,null]] as [$dia,$act,$ent,$sal]) {
            DB::table('dias_laborables')->insert(['empresa_id'=>$eid,'dia_semana'=>$dia,'activo'=>$act,'hora_entrada'=>$ent,'hora_salida'=>$sal,'created_at'=>now(),'updated_at'=>now()]);
        }

        // ══════════════════════════════════════════════════════════════════════
        // 10. EVENTUALIDADES (8)
        // ══════════════════════════════════════════════════════════════════════
        $evs = [];
        foreach ([
            ['Falla de Maquinaria',    'Paro por descompostura de máquina de coser u overlok',   null,                 null,                 null],
            ['Falta de Material',      'Desabasto de tela, hilo u otro insumo',                  null,                 null,                 null],
            ['Corte de Energía',       'Interrupción del suministro eléctrico',                  '2026-05-10 09:30:00','2026-05-10 11:00:00','Duró 1.5 hrs, afectó línea B'],
            ['Ausentismo',             'Falta de personal por enfermedad o permiso',             null,                 null,                 null],
            ['Revisión de Calidad',    'Paro para inspección de lote por el cliente',            '2026-05-16 14:00:00','2026-05-16 15:30:00','Lote OP-001 sin rechazos'],
            ['Reparación de Overlock', 'Mantenimiento correctivo overlock 5 hilos línea A',      '2026-05-27 08:00:00','2026-05-27 10:30:00','Paro 2.5 hrs, 3 operarias afectadas'],
            ['Lluvia Intensa',         'Goteras en nave A por tormenta, suspensión parcial',     '2026-04-15 11:00:00','2026-04-15 13:00:00','Línea A parada 2 hrs'],
            ['Capacitación Interna',   'Taller de seguridad e higiene obligatorio IMSS',         '2026-03-10 09:00:00','2026-03-10 12:00:00','Asistieron 28 operarias'],
        ] as [$n,$d,$fi,$ff,$obs]) {
            $evs[] = DB::table('eventualidades_trabajo')->insertGetId(['empresa_id'=>$eid,'nombre'=>$n,'descripcion'=>$d,'fecha_hora_inicio'=>$fi,'fecha_hora_fin'=>$ff,'observaciones'=>$obs,'created_at'=>now(),'updated_at'=>now()]);
        }

        // ══════════════════════════════════════════════════════════════════════
        // 11. OPERACIONES DE PRENDA (20)
        // ══════════════════════════════════════════════════════════════════════
        $ops = [];
        foreach ([
            // [nombre, desc, precio, linea_idx]
            ['Unir hombros',              'Unión piezas delantera/trasera por hombros',      0.80, 0],
            ['Pegar mangas',              'Colocación y costura de mangas al cuerpo',         1.20, 0],
            ['Cerrar costados',           'Cierre de costados con overlock 5 hilos',          0.90, 0],
            ['Pegar cuello',              'Ensamble y costura de cuello terminado',           1.50, 0],
            ['Dobladillo inferior',       'Dobladillo 1 cm parte inferior',                  0.70, 0],
            ['Pegar cremallera',          'Colocación cierre invisible o visible',            2.00, 1],
            ['Coser bolsillos',           'Ensamble bolsillos laterales o traseros',          1.30, 1],
            ['Basta de pantalón',         'Dobladillo inferior pantalón',                    0.80, 1],
            ['Pegar pretina',             'Colocación pretina con entretela',                1.10, 1],
            ['Revisar costuras',          'Inspección y corrección de puntadas',             0.50, 2],
            ['Planchar y doblar',         'Planchado, doblado y presentación final',         0.60, 2],
            ['Empacar prenda',            'Etiqueta, bolsa y empaque individual',            0.40, 2],
            ['Pegar elástico en cintura', 'Elástico en cintura de falda/short',              0.95, 1],
            ['Sobrepespunte decorativo',  'Costura decorativa visible en orillas',           1.10, 0],
            ['Unir costados sudadera',    'Overlock 5 hilos costados manga y cuerpo',        1.00, 3],
            ['Pegar capucha',             'Ensamble y costura de capucha',                   1.60, 3],
            ['Pegar bolsillo canguro',    'Bolsillo frontal sudadera con overlock',          0.90, 3],
            ['Bordado institucional',     'Bordado de logo en pecho izquierdo',              2.50, 3],
            ['Corte de hilo',             'Limpieza de hilos en prenda terminada',           0.30, 2],
            ['Control de calidad final',  'Revisión dimensional y presentación',             0.55, 2],
        ] as [$nom,$desc,$precio,$lidx]) {
            $ops[] = DB::table('operaciones_prenda')->insertGetId([
                'estilo_id'=>null,'cliente_id'=>null,'linea_produccion_id'=>$lin[$lidx],
                'area_encargado_id'=>null,'nombre'=>$nom,'descripcion'=>$desc,
                'precio'=>$precio,'numero_piezas'=>0,
                'created_at'=>now(),'updated_at'=>now(),
            ]);
        }

        // ══════════════════════════════════════════════════════════════════════
        // 12. PROVEEDORES (6)
        // ══════════════════════════════════════════════════════════════════════
        $prov = [];
        foreach ([
            ['Textiles Orienta S.A.',       'TOSA900312AB1','ventas@textilorienta.com',   'Pedro Olvera'],
            ['Avíos y Accesorios MX',       'AAMX150623CD2','pedidos@aviosmx.com',        'Lucía Ramírez'],
            ['Hilados del Golfo',            'HGO180901EF3', 'hilo.golfo@gmail.com',       'Carlos Soto'],
            ['Importaciones Textiles GH',   'ITGH200415GH4','importaciones@itgh.com.mx',  'Ana Gutiérrez'],
            ['Fibras del Sur',              'FIDS210903IJ5','fibrassur@distribuidora.com','Miguel Herrera'],
            ['Entretelas y Forros SA',      'EFSA190707KL6','entretelasforros@gmail.com', 'Jorge Medina'],
        ] as [$n,$rfc,$email,$cont]) {
            $prov[] = DB::table('proveedores')->insertGetId(['empresa_id'=>$eid,'nombre'=>$n,'razon_social'=>$n.' S.A.','rfc'=>$rfc,'domicilio'=>'Blvd. Industrial, Puebla','telefono'=>'2221234567','email'=>$email,'contacto'=>$cont,'status'=>'activo','created_at'=>now(),'updated_at'=>now()]);
        }

        // ══════════════════════════════════════════════════════════════════════
        // 13. TELAS (8) + ROLLOS + MOVIMIENTOS
        // ══════════════════════════════════════════════════════════════════════
        $telas = [];
        foreach ([
            ['TEL-001','Algodón Pima 140 g/m²',      '100% Algodón Pima',          150, 45.00, 380.00, 60, $prov[0]],
            ['TEL-002','Gabardina Stretch 260 g/m²',  '65% PES 35% ALG',           148, 62.00, 210.00, 40, $prov[0]],
            ['TEL-003','Jersey Licra',                 '92% PES 8% ELA',            160, 38.50, 165.00, 30, $prov[3]],
            ['TEL-004','Seda Sintética 55 g/m²',      '100% Poliéster',            140, 55.00,  80.00, 20, $prov[3]],
            ['TEL-005','Fleece Polar 280 g/m²',        '100% Poliéster',            150, 72.00,  95.00, 25, $prov[4]],
            ['TEL-006','Piqué 180 g/m²',              '100% Algodón',              155, 48.00, 140.00, 30, $prov[0]],
            ['TEL-007','Denim 10 oz',                 '98% ALG 2% ELA',            148, 85.00,  75.00, 20, $prov[4]],
            ['TEL-008','Georgette Liviano',            '100% Poliéster',            145, 32.00,  55.00, 15, $prov[3]],
        ] as [$cod,$nom,$comp,$ancho,$precio,$stock,$stockMin,$provId]) {
            $telas[] = DB::table('telas')->insertGetId(['empresa_id'=>$eid,'proveedor_id'=>$provId,'codigo'=>$cod,'nombre'=>$nom,'composicion'=>$comp,'ancho_cm'=>$ancho,'unidad'=>'metro','precio_unitario'=>$precio,'stock_actual'=>$stock,'stock_minimo'=>$stockMin,'status'=>'activo','created_at'=>now(),'updated_at'=>now()]);
        }
        // Rollos (15)
        $rollos = [];
        $rollosDef = [
            [$telas[0],'RL-A01','Blanco',     'L2604A',100.0,45.00],[$telas[0],'RL-A02','Azul Rey', 'L2604B', 95.0,45.00],[$telas[0],'RL-A03','Negro',    'L2604C', 85.0,45.00],[$telas[0],'RL-A04','Beige',    'L2605A',100.0,45.00],
            [$telas[1],'RL-B01','Gris Oxford','L2605B', 60.0,62.00],[$telas[1],'RL-B02','Negro',    'L2605C', 55.0,62.00],[$telas[1],'RL-B03','Marino',   'L2606A', 50.0,62.00],
            [$telas[2],'RL-C01','Rojo',       'L2605D', 40.0,38.50],[$telas[2],'RL-C02','Morado',   'L2605E', 35.0,38.50],
            [$telas[4],'RL-E01','Gris mezcla','L2606B', 55.0,72.00],[$telas[4],'RL-E02','Negro',    'L2606C', 40.0,72.00],
            [$telas[5],'RL-F01','Blanco',     'L2606D', 70.0,48.00],[$telas[5],'RL-F02','Azul',     'L2606E', 65.0,48.00],
            [$telas[6],'RL-G01','Azul indigo','L2606F', 45.0,85.00],
            [$telas[3],'RL-D01','Blanco',     'L2606G', 30.0,55.00],
        ];
        foreach ($rollosDef as [$telaId,$num,$color,$lote,$metros,$precio]) {
            $rollos[] = DB::table('rollos_tela')->insertGetId(['tela_id'=>$telaId,'numero_rollo'=>$num,'color'=>$color,'lote'=>$lote,'metros_iniciales'=>$metros,'metros_disponibles'=>$metros,'precio_unitario'=>$precio,'fecha_entrada'=>'2026-04-01','status'=>'disponible','created_at'=>now(),'updated_at'=>now()]);
        }
        foreach ($rollosDef as $i=>[$telaId,$num,$color,$lote,$metros,$precio]) {
            DB::table('movimientos_almacen')->insert(['empresa_id'=>$eid,'tipo_item'=>'tela','item_id'=>$telaId,'nombre_item'=>DB::table('telas')->where('id',$telaId)->value('nombre'),'tipo_movimiento'=>'entrada','cantidad'=>$metros,'unidad'=>'metro','costo_unitario'=>$precio,'orden_produccion_id'=>null,'proveedor_id'=>null,'referencia'=>"Rollo $num",'observaciones'=>null,'created_at'=>now(),'updated_at'=>now()]);
        }

        // ══════════════════════════════════════════════════════════════════════
        // 14. AVÍOS (15)
        // ══════════════════════════════════════════════════════════════════════
        $avios = [];
        foreach ([
            ['AV-001','Hilo Poliéster Blanco Nm50/2',  'hilo',    'cono',  12.00, 150, 30,$prov[2]],
            ['AV-002','Hilo Poliéster Negro Nm50/2',   'hilo',    'cono',  12.00, 120, 30,$prov[2]],
            ['AV-003','Hilo Poliéster Gris Nm50/2',    'hilo',    'cono',  12.00,  80, 20,$prov[2]],
            ['AV-004','Hilo Poliéster Azul Nm50/2',    'hilo',    'cono',  12.00,  60, 20,$prov[2]],
            ['AV-005','Cierre YKK Invisible 18 cm',    'cierre',  'pieza',  4.50, 500, 80,$prov[1]],
            ['AV-006','Cierre YKK Invisible 22 cm',    'cierre',  'pieza',  5.50, 300, 50,$prov[1]],
            ['AV-007','Cierre YKK Visible 20 cm',      'cierre',  'pieza',  5.00, 250, 50,$prov[1]],
            ['AV-008','Etiqueta Marca Tejida',          'etiqueta','pieza',  1.20,3500,400,$prov[1]],
            ['AV-009','Etiqueta Composición y Talla',  'etiqueta','pieza',  0.30,6000,800,$prov[1]],
            ['AV-010','Entretela Fusionable 90 cm',    'entretela','metro',  8.50,  80, 15,$prov[5]],
            ['AV-011','Bolsa Polietileno 30x40',        'bolsa',   'pieza',  0.80,4000,600,$prov[1]],
            ['AV-012','Remache Dorado 10 mm',           'remache', 'pieza',  0.25,2000,200,$prov[1]],
            ['AV-013','Elástico 3 cm ancho',            'elastico','metro',  5.50, 160, 30,$prov[1]],
            ['AV-014','Botón 4 hoyos 18 mm',            'boton',   'pieza',  0.35,3000,400,$prov[1]],
            ['AV-015','Hilo de bordar multicolor',      'hilo',    'cono',  28.00,  45, 10,$prov[2]],
        ] as [$cod,$nom,$cat,$unidad,$precio,$stock,$stockMin,$provId]) {
            $avios[] = DB::table('avios')->insertGetId(['empresa_id'=>$eid,'proveedor_id'=>$provId,'codigo'=>$cod,'nombre'=>$nom,'categoria'=>$cat,'unidad'=>$unidad,'precio_unitario'=>$precio,'stock_actual'=>$stock,'stock_minimo'=>$stockMin,'status'=>'activo','created_at'=>now(),'updated_at'=>now()]);
        }
        foreach ($avios as $avioId) {
            $a = DB::table('avios')->find($avioId);
            DB::table('movimientos_almacen')->insert(['empresa_id'=>$eid,'tipo_item'=>'avio','item_id'=>$avioId,'nombre_item'=>$a->nombre,'tipo_movimiento'=>'entrada','cantidad'=>$a->stock_actual,'unidad'=>$a->unidad,'costo_unitario'=>$a->precio_unitario,'orden_produccion_id'=>null,'proveedor_id'=>$a->proveedor_id,'referencia'=>'Inventario inicial','observaciones'=>null,'created_at'=>now(),'updated_at'=>now()]);
        }

        // ══════════════════════════════════════════════════════════════════════
        // 15. ÓRDENES DE PRODUCCIÓN (20)
        // ══════════════════════════════════════════════════════════════════════
        $ord = [];
        $ordenesDef = [
            // [$cod,$cliIdx,$prio,$mod,$cor,$ent,$sts,$cortC,$obs,$estIdx,$cant]
            ['OP-2026-001',$cli[0],'alta',  'BL-MANGA-045','C-0501','2026-06-05','en_proceso', false,'Entrega urgente. Algodón pima.',       0,1200],
            ['OP-2026-002',$cli[1],'media', 'PT-VESTIR-12','C-0489','2026-06-15','en_proceso', true, 'Slim fit. Verificar medidas.',          1, 800],
            ['OP-2026-003',$cli[2],'alta',  'VE-CASUAL-08','C-0502','2026-06-02','pendiente',  false,'Muestra pendiente de aprobación.',      2, 500],
            ['OP-2026-004',$cli[3],'baja',  'UN-POLO-031', 'C-0478','2026-05-20','completada', true, 'Entrega completada sin observaciones.', 8, 750],
            ['OP-2026-005',$cli[0],'media', 'BL-FORMAL-22','C-0510','2026-06-20','pendiente',  false,null,                                    0, 600],
            ['OP-2026-006',$cli[4],'alta',  'FA-MIDI-004', 'C-0518','2026-06-10','en_proceso', true, 'Exportación. Tres lotes parciales.',    5, 600],
            ['OP-2026-007',$cli[5],'media', 'SD-CAP-007',  'C-0522','2026-06-28','pendiente',  false,'Primera orden de este cliente.',        6, 400],
            ['OP-2026-008',$cli[2],'baja',  'CM-FORM-010', 'C-0495','2026-05-20','cancelada',  false,'Cancelada. Reutilizar tela en OP-005.', 4,null],
            ['OP-2026-009',$cli[6],'alta',  'BL-SIN-MAN-3','C-0530','2026-06-08','en_proceso', true, 'Blusa sin manga, colección verano.',    7, 900],
            ['OP-2026-010',$cli[7],'media', 'UN-POLO-044', 'C-0535','2026-06-25','pendiente',  false,'Uniformes corporativos. Bordado logo.', 8, 500],
            ['OP-2026-011',$cli[8],'alta',  'CJ-DEP-015',  'C-0540','2026-06-12','en_proceso', false,'Conjunto deportivo. Urgente.',          3, 700],
            ['OP-2026-012',$cli[9],'baja',  'FA-MIDI-008', 'C-0544','2026-07-05','pendiente',  false,'Segunda remesa falda midi.',            5, 400],
            ['OP-2026-013',$cli[10],'media','PT-CARGO-001','C-0548','2026-06-30','pendiente',  false,'Pantalón cargo, primera orden.',         9, 350],
            ['OP-2026-014',$cli[11],'alta', 'VE-CASUAL-12','C-0552','2026-06-18','en_proceso', true, 'Exportación vestidos casuales.',         2, 650],
            ['OP-2026-015',$cli[0],'media', 'BL-MANGA-060','C-0556','2026-07-10','pendiente',  false,'Reorden blusa manga larga.',             0, 800],
            ['OP-2026-016',$cli[1],'alta',  'PT-VESTIR-20','C-0560','2026-06-22','en_proceso', true, 'Pantalón vestir dama colores.',          1, 600],
            ['OP-2026-017',$cli[3],'baja',  'UN-POLO-055', 'C-0564','2026-07-15','pendiente',  false,'Próxima temporada uniformes.',           8, 1000],
            ['OP-2026-018',$cli[4],'media', 'FA-MIDI-010', 'C-0568','2026-07-20','pendiente',  false,'Lote exportación faldas.',               5, 450],
            ['OP-2026-019',$cli[5],'alta',  'SD-CAP-012',  'C-0572','2026-07-01','pendiente',  false,'Sudadera negra y gris.',                 6, 600],
            ['OP-2026-020',$cli[6],'media', 'BL-SIN-MAN-5','C-0576','2026-07-08','pendiente',  false,'Blusa sin manga colores básicos.',       7, 700],
        ];
        foreach ($ordenesDef as [$cod,$cliId,$prio,$mod,$cor,$ent,$sts,$cortC,$obs,$estIdx,$cant]) {
            $ord[] = DB::table('ordenes_produccion')->insertGetId([
                'empresa_id'=>$eid,'cliente_id'=>$cliId,'estilo_id'=>$estIdx!==null?$est[$estIdx]:null,
                'codigo'=>$cod,'modelo'=>$mod,'corte'=>$cor,'cantidad_piezas'=>$cant,
                'fecha_entrega'=>$ent,'prioridad'=>$prio,'corte_comenzado'=>$cortC,
                'status'=>$sts,'observaciones'=>$obs,'created_at'=>now(),'updated_at'=>now(),
            ]);
        }

        // Curvas de talla para las primeras 6 órdenes
        $curvasDef = [
            [$ord[0],  [[$tal[1],200],[$tal[2],500],[$tal[3],400],[$tal[4],100]]],
            [$ord[1],  [[$tal[1],150],[$tal[2],350],[$tal[3],200],[$tal[4],100]]],
            [$ord[2],  [[$tal[0], 80],[$tal[1],150],[$tal[2],170],[$tal[3],100]]],
            [$ord[5],  [[$tal[0], 80],[$tal[1],150],[$tal[2],200],[$tal[3],120],[$tal[4],50]]],
            [$ord[8],  [[$tal[1],200],[$tal[2],350],[$tal[3],250],[$tal[4],100]]],
            [$ord[10], [[$tal[1],150],[$tal[2],250],[$tal[3],200],[$tal[4],100]]],
        ];
        foreach ($curvasDef as [$ordId,$curva]) {
            foreach ($curva as [$talId,$cant]) {
                DB::table('curva_tallas')->insert(['orden_produccion_id'=>$ordId,'talla_id'=>$talId,'cantidad'=>$cant,'created_at'=>now(),'updated_at'=>now()]);
            }
        }

        // Muestras (12)
        DB::table('muestras')->insert([
            ['orden_produccion_id'=>$ord[0],'estilo_id'=>$est[0],'nombre'=>'Piloto Blusa ML – Blanco',   'descripcion'=>'Tela provisional talla M',            'observaciones'=>'Aprobada, ajuste en escote','status'=>'aprobada', 'created_at'=>now(),'updated_at'=>now()],
            ['orden_produccion_id'=>$ord[1],'estilo_id'=>$est[1],'nombre'=>'Pantalón slim fit – Gris',   'descripcion'=>'Talla M sin basta',                   'observaciones'=>'Pendiente aprobación',       'status'=>'pendiente','created_at'=>now(),'updated_at'=>now()],
            ['orden_produccion_id'=>$ord[2],'estilo_id'=>$est[2],'nombre'=>'Vestido casual – Azul',      'descripcion'=>'Talla S muestra inicial',             'observaciones'=>null,                         'status'=>'pendiente','created_at'=>now(),'updated_at'=>now()],
            ['orden_produccion_id'=>$ord[3],'estilo_id'=>$est[8],'nombre'=>'Polo blanco con bordado',    'descripcion'=>'Bordado empresa logística',           'observaciones'=>'Aprobada',                   'status'=>'aprobada', 'created_at'=>now(),'updated_at'=>now()],
            ['orden_produccion_id'=>$ord[5],'estilo_id'=>$est[5],'nombre'=>'Falda midi – Blanco',        'descripcion'=>'Talla M largo 65 cm forrada',         'observaciones'=>'Aprobada +2 cm largo',       'status'=>'aprobada', 'created_at'=>now(),'updated_at'=>now()],
            ['orden_produccion_id'=>$ord[6],'estilo_id'=>$est[6],'nombre'=>'Sudadera capucha – Gris',    'descripcion'=>'Talla L color gris mezcla',           'observaciones'=>'En espera cliente',          'status'=>'pendiente','created_at'=>now(),'updated_at'=>now()],
            ['orden_produccion_id'=>$ord[8],'estilo_id'=>$est[7],'nombre'=>'Blusa sin manga – Coral',    'descripcion'=>'Talla M cuello en V',                 'observaciones'=>'Aprobada sin cambios',       'status'=>'aprobada', 'created_at'=>now(),'updated_at'=>now()],
            ['orden_produccion_id'=>$ord[9],'estilo_id'=>$est[8],'nombre'=>'Polo corporativo – Azul',    'descripcion'=>'Talla L bordado logo',                'observaciones'=>'Pendiente aprobación logo',  'status'=>'pendiente','created_at'=>now(),'updated_at'=>now()],
            ['orden_produccion_id'=>$ord[10],'estilo_id'=>$est[3],'nombre'=>'Conjunto deportivo – Negro','descripcion'=>'Top y short talla M',                 'observaciones'=>'Aprobada',                   'status'=>'aprobada', 'created_at'=>now(),'updated_at'=>now()],
            ['orden_produccion_id'=>$ord[13],'estilo_id'=>$est[2],'nombre'=>'Vestido casual – Verde',    'descripcion'=>'Exportación, talla S',                'observaciones'=>'Aprobada exportación',       'status'=>'aprobada', 'created_at'=>now(),'updated_at'=>now()],
            ['orden_produccion_id'=>$ord[15],'estilo_id'=>$est[1],'nombre'=>'Pantalón vestir – Negro',   'descripcion'=>'Talla M slim fit nueva temporada',    'observaciones'=>'En revisión',                'status'=>'pendiente','created_at'=>now(),'updated_at'=>now()],
            ['orden_produccion_id'=>$ord[3],'estilo_id'=>$est[8],'nombre'=>'Polo azul marino rechazado', 'descripcion'=>'Tono incorrecto de azul',             'observaciones'=>'Rechazada, tono incorrecto', 'status'=>'rechazada','created_at'=>now(),'updated_at'=>now()],
        ]);

        // ══════════════════════════════════════════════════════════════════════
        // 16. HOJAS DE PRODUCCIÓN (40 hojas, 10 semanas)
        // [empIdx, ordIdx, inicio, fin, dias_inh, [[opIdx,piezas,precio,dayOffset],...]]
        // ══════════════════════════════════════════════════════════════════════
        $hojasDef = [
            // ─ Semana 1: 24 feb – 28 feb ─
            [5,  3, '2026-02-24','2026-02-28',0,[[0,350,0.80,0],[2,350,0.90,1],[9,350,0.50,2],[0,300,0.80,3],[2,300,0.90,4]]],
            [6,  3, '2026-02-24','2026-02-28',0,[[10,380,0.60,0],[11,380,0.40,1],[18,380,0.30,2],[10,320,0.60,3],[11,320,0.40,4]]],
            // ─ Semana 2: 3 mar – 7 mar ─
            [16, 3, '2026-03-03','2026-03-07',0,[[0,300,0.80,0],[1,240,1.20,1],[2,300,0.90,2],[0,260,0.80,3],[1,200,1.20,4]]],
            [17, 8, '2026-03-03','2026-03-07',0,[[14,280,1.00,0],[15,200,1.60,1],[16,200,0.90,2],[14,250,1.00,4]]],
            // ─ Semana 3: 10 mar – 14 mar ─
            [0,  0, '2026-03-10','2026-03-14',0,[[0,280,0.80,0],[1,200,1.20,1],[3,200,1.50,2],[0,250,0.80,3],[4,280,0.70,4]]],
            [1,  0, '2026-03-10','2026-03-14',0,[[3,230,1.50,0],[3,200,1.50,2],[0,230,0.80,4]]],
            [20, 8, '2026-03-10','2026-03-14',0,[[17,200,2.50,0],[18,250,0.30,1],[19,250,0.55,2],[17,180,2.50,4]]],
            // ─ Semana 4: 17 mar – 21 mar ─
            [3,  1, '2026-03-17','2026-03-21',0,[[6,200,1.30,0],[7,200,0.80,1],[4,200,0.70,2],[6,170,1.30,3],[8,170,1.10,4]]],
            [21, 0, '2026-03-17','2026-03-21',0,[[2,300,0.90,0],[4,300,0.70,1],[9,300,0.50,2],[2,260,0.90,3],[4,260,0.70,4]]],
            // ─ Semana 5: 24 mar – 28 mar ─
            [4,  1, '2026-03-24','2026-03-28',1,[[4,200,0.70,0],[5,120,2.00,2],[12,200,0.95,4]]],
            [7,  1, '2026-03-24','2026-03-28',0,[[8,200,1.10,0],[7,200,0.80,1],[6,200,1.30,3],[8,180,1.10,4]]],
            [22, 3, '2026-03-24','2026-03-28',0,[[14,200,1.00,0],[15,150,1.60,1],[16,200,0.90,2],[18,200,0.30,4]]],
            // ─ Semana 6: 31 mar – 4 abr ─
            [0,  0, '2026-03-31','2026-04-04',0,[[1,220,1.20,0],[3,220,1.50,2],[1,180,1.20,4]]],
            [1,  5, '2026-03-31','2026-04-04',0,[[12,280,0.95,0],[12,250,0.95,2],[9,280,0.50,4]]],
            [23, 5, '2026-03-31','2026-04-04',0,[[4,220,0.70,0],[5,150,2.00,1],[12,220,0.95,2],[9,220,0.50,4]]],
            // ─ Semana 7: 7 abr – 11 abr ─
            [3,  3, '2026-04-07','2026-04-11',0,[[9,300,0.50,0],[10,280,0.60,1],[18,280,0.30,2],[9,250,0.50,3],[10,250,0.60,4]]],
            [24, 5, '2026-04-07','2026-04-11',0,[[5,180,2.00,0],[12,200,0.95,1],[4,200,0.70,2],[9,200,0.50,4]]],
            [25, 8, '2026-04-07','2026-04-11',0,[[17,200,2.50,0],[14,250,1.00,1],[16,250,0.90,2],[18,250,0.30,4]]],
            // ─ Semana 8: 28 abr – 2 may ─
            [5,  3, '2026-04-28','2026-05-02',0,[[0,400,0.80,0],[2,400,0.90,1],[9,400,0.50,2],[0,350,0.80,3],[2,350,0.90,4]]],
            [6,  3, '2026-04-28','2026-05-02',0,[[10,380,0.60,0],[11,380,0.40,1],[10,320,0.60,3],[11,320,0.40,4]]],
            [26, 8, '2026-04-28','2026-05-02',0,[[14,300,1.00,0],[15,220,1.60,1],[17,220,2.50,2],[16,220,0.90,4]]],
            // ─ Semana 9: 5 may – 9 may ─
            [0,  0, '2026-05-05','2026-05-09',0,[[0,250,0.80,0],[1,180,1.20,1],[2,250,0.90,2],[0,200,0.80,3],[1,160,1.20,4]]],
            [1,  0, '2026-05-05','2026-05-09',0,[[3,200,1.50,0],[3,180,1.50,2],[0,200,0.80,4]]],
            [3,  1, '2026-05-05','2026-05-09',0,[[6,150,1.30,0],[7,150,0.80,1],[4,150,0.70,2],[6,120,1.30,3],[8,130,1.10,4]]],
            [27, 5, '2026-05-05','2026-05-09',0,[[12,250,0.95,0],[4,250,0.70,1],[5,130,2.00,2],[9,250,0.50,4]]],
            // ─ Semana 10: 12 may – 16 may ─
            [2,  0, '2026-05-12','2026-05-16',0,[[9,300,0.50,0],[10,280,0.60,1],[9,250,0.50,3],[10,250,0.60,4]]],
            [4,  1, '2026-05-12','2026-05-16',1,[[4,200,0.70,0],[5,100,2.00,2],[4,180,0.70,4]]],
            [6,  0, '2026-05-12','2026-05-16',0,[[11,350,0.40,0],[11,300,0.40,2],[11,280,0.40,4]]],
            [28, 8, '2026-05-12','2026-05-16',0,[[17,200,2.50,0],[15,200,1.60,1],[16,200,0.90,2],[18,200,0.30,4]]],
            // ─ Semana 11: 19 may – 23 may ─
            [0,  0, '2026-05-19','2026-05-23',1,[[1,220,1.20,0],[3,220,1.50,2],[1,180,1.20,4]]],
            [1,  1, '2026-05-19','2026-05-23',0,[[6,180,1.30,0],[8,180,1.10,1],[6,150,1.30,3],[8,150,1.10,4]]],
            [3,  0, '2026-05-19','2026-05-23',0,[[2,300,0.90,0],[4,300,0.70,1],[2,260,0.90,3],[4,260,0.70,4]]],
            [5,  5, '2026-05-19','2026-05-23',0,[[12,280,0.95,0],[12,250,0.95,2],[9,280,0.50,4]]],
            // ─ Semana 12: 26 may – 30 may ─
            [0,  0, '2026-05-26','2026-05-30',0,[[0,200,0.80,0],[3,200,1.50,1],[1,180,1.20,3],[2,180,0.90,4]]],
            [1,  5, '2026-05-26','2026-05-30',0,[[0,240,0.80,0],[12,240,0.95,1],[0,200,0.80,3],[12,200,0.95,4]]],
            [4,  1, '2026-05-26','2026-05-30',0,[[7,200,0.80,0],[8,200,1.10,2],[5,120,2.00,4]]],
            [7,  5, '2026-05-26','2026-05-30',0,[[9,300,0.50,0],[10,300,0.60,1],[11,300,0.40,3],[9,250,0.50,4]]],
            [29, 8, '2026-05-26','2026-05-30',0,[[14,280,1.00,0],[15,200,1.60,1],[17,200,2.50,2],[18,280,0.30,4]]],
            // ─ Semana 13: 2 jun – 6 jun ─
            [0,  0, '2026-06-02','2026-06-06',0,[[1,180,1.20,0],[3,180,1.50,1],[0,180,0.80,3],[4,180,0.70,4]]],
            [3,  5, '2026-06-02','2026-06-06',0,[[0,220,0.80,0],[12,220,0.95,2],[9,220,0.50,4]]],
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

        // Eventualidades en hojas
        DB::table('hoja_eventualidades')->insert([
            ['hoja_produccion_id'=>$hojaIds[4],  'eventualidad_trabajo_id'=>$evs[0]],
            ['hoja_produccion_id'=>$hojaIds[9],  'eventualidad_trabajo_id'=>$evs[1]],
            ['hoja_produccion_id'=>$hojaIds[15], 'eventualidad_trabajo_id'=>$evs[4]],
            ['hoja_produccion_id'=>$hojaIds[18], 'eventualidad_trabajo_id'=>$evs[2]],
            ['hoja_produccion_id'=>$hojaIds[25], 'eventualidad_trabajo_id'=>$evs[5]],
            ['hoja_produccion_id'=>$hojaIds[31], 'eventualidad_trabajo_id'=>$evs[3]],
            ['hoja_produccion_id'=>$hojaIds[6],  'eventualidad_trabajo_id'=>$evs[6]],
            ['hoja_produccion_id'=>$hojaIds[2],  'eventualidad_trabajo_id'=>$evs[7]],
        ]);

        // ══════════════════════════════════════════════════════════════════════
        // 17. REGISTRO DE ASISTENCIA (13 semanas × 27 empleados activos)
        // ══════════════════════════════════════════════════════════════════════
        $fechasAsistencia = [];
        $inicio = new \DateTime('2026-02-23');
        $fin    = new \DateTime('2026-06-07');
        for ($d = clone $inicio; $d <= $fin; $d->modify('+1 day')) {
            $fechasAsistencia[] = $d->format('Y-m-d');
        }
        $empActivos = array_filter($emp, fn($id) => DB::table('empleados')->where('id',$id)->value('status') === 'activo');
        foreach ($empActivos as $eIdx => $empId) {
            $batch = [];
            foreach ($fechasAsistencia as $fecha) {
                $dow  = (int) date('N', strtotime($fecha));
                if ($dow === 7) continue;
                $seed = ($eIdx * 13 + (int) substr($fecha, -2) + (int) substr($fecha,5,2)) % 12;
                if ($seed === 0) continue; // ~8% ausencias
                $tarde    = ($eIdx + (int)substr($fecha,8,2)) % 8 === 0;
                $temprano = ($eIdx * 3 + (int)substr($fecha,-2)) % 10 === 0;
                $esSabado = ($dow === 6);
                $batch[] = [
                    'empleado_id'    => $empId,
                    'fecha'          => $fecha,
                    'entrada'        => $tarde ? '08:22:00' : '07:58:00',
                    'entrada_comida' => $esSabado ? null : '13:00:00',
                    'salida_comida'  => $esSabado ? null : '14:00:00',
                    'salida'         => $esSabado ? '14:00:00' : ($temprano ? '16:48:00' : '17:03:00'),
                    'observaciones'  => $tarde ? 'Llegada tarde' : null,
                    'created_at'     => now(), 'updated_at' => now(),
                ];
                if (count($batch) >= 200) {
                    DB::table('registro_asistencia')->insertOrIgnore($batch);
                    $batch = [];
                }
            }
            if (!empty($batch)) DB::table('registro_asistencia')->insertOrIgnore($batch);
        }

        // ══════════════════════════════════════════════════════════════════════
        // 18. TALLERES EXTERNOS + ENVÍOS
        // ══════════════════════════════════════════════════════════════════════
        $talleres = [];
        foreach ([
            ['Bordados Don Pepe',     'José Fuentes',  '2311234567','bordados.donpepe@gmail.com', 'Bordado y serigrafía'],
            ['Maquiladora Rápida TZ', 'Laura Méndez',  '2319876543','maq.rapida.tz@gmail.com',    'Ensamble y acabados'],
            ['Lavandería Industrial', 'Roberto Cruz',  '2316543210','lavindustrial.pue@gmail.com','Lavado y teñido'],
            ['Acabados Finos SA',     'Elena Bravo',   '2317112233','acabadosfinos@gmail.com',    'Planchado y empaque'],
        ] as [$n,$resp,$tel,$email,$esp]) {
            $talleres[] = DB::table('talleres_externos')->insertGetId(['empresa_id'=>$eid,'nombre'=>$n,'responsable'=>$resp,'telefono'=>$tel,'email'=>$email,'domicilio'=>'Teziutlán, Pue.','especialidad'=>$esp,'status'=>'activo','created_at'=>now(),'updated_at'=>now()]);
        }
        DB::table('envios_taller')->insert([
            ['empresa_id'=>$eid,'taller_id'=>$talleres[0],'orden_produccion_id'=>$ord[0],'concepto'=>'Bordado logo blusa ML','piezas_enviadas'=>600,'piezas_recibidas'=>598,'precio_por_pieza'=>8.50,'importe_total'=>5100.00,'fecha_envio'=>'2026-04-15','fecha_compromiso'=>'2026-04-22','fecha_recepcion'=>'2026-04-22','status'=>'recibido','created_at'=>now(),'updated_at'=>now()],
            ['empresa_id'=>$eid,'taller_id'=>$talleres[1],'orden_produccion_id'=>$ord[1],'concepto'=>'Ensamble pretinas pantalón','piezas_enviadas'=>400,'piezas_recibidas'=>350,'precio_por_pieza'=>6.00,'importe_total'=>2400.00,'fecha_envio'=>'2026-04-28','fecha_compromiso'=>'2026-05-06','fecha_recepcion'=>null,'status'=>'recibido_parcial','created_at'=>now(),'updated_at'=>now()],
            ['empresa_id'=>$eid,'taller_id'=>$talleres[2],'orden_produccion_id'=>null,'concepto'=>'Lavado industrial 4 rollos','piezas_enviadas'=>4,'piezas_recibidas'=>0,'precio_por_pieza'=>120.00,'importe_total'=>480.00,'fecha_envio'=>'2026-05-05','fecha_compromiso'=>'2026-05-12','fecha_recepcion'=>null,'status'=>'enviado','created_at'=>now(),'updated_at'=>now()],
            ['empresa_id'=>$eid,'taller_id'=>$talleres[0],'orden_produccion_id'=>$ord[5],'concepto'=>'Bordado exportadora falda midi','piezas_enviadas'=>300,'piezas_recibidas'=>0,'precio_por_pieza'=>9.00,'importe_total'=>2700.00,'fecha_envio'=>'2026-05-20','fecha_compromiso'=>'2026-05-30','fecha_recepcion'=>null,'status'=>'enviado','created_at'=>now(),'updated_at'=>now()],
            ['empresa_id'=>$eid,'taller_id'=>$talleres[3],'orden_produccion_id'=>$ord[3],'concepto'=>'Planchado y empaque uniformes','piezas_enviadas'=>750,'piezas_recibidas'=>750,'precio_por_pieza'=>3.50,'importe_total'=>2625.00,'fecha_envio'=>'2026-03-10','fecha_compromiso'=>'2026-03-17','fecha_recepcion'=>'2026-03-17','status'=>'recibido','created_at'=>now(),'updated_at'=>now()],
            ['empresa_id'=>$eid,'taller_id'=>$talleres[1],'orden_produccion_id'=>$ord[8],'concepto'=>'Acabado blusa sin manga','piezas_enviadas'=>450,'piezas_recibidas'=>0,'precio_por_pieza'=>4.00,'importe_total'=>1800.00,'fecha_envio'=>'2026-05-26','fecha_compromiso'=>'2026-06-03','fecha_recepcion'=>null,'status'=>'enviado','created_at'=>now(),'updated_at'=>now()],
        ]);

        // ══════════════════════════════════════════════════════════════════════
        // 19. ARTÍCULOS / SKU
        // ══════════════════════════════════════════════════════════════════════
        $arts = [];
        $skuDef = [
            [$est[0],['S','M','L','XL'],['Blanco','Azul Rey','Negro'],   89.00,199.00,'BL-MLR'],
            [$est[1],['S','M','L','XL'],['Gris Oxford','Negro','Marino'],120.00,280.00,'PT-SLM'],
            [$est[5],['XS','S','M','L','XL'],['Blanco','Negro'],          95.00,210.00,'FA-MIDI'],
            [$est[6],['S','M','L','XL'],['Gris','Negro','Azul'],         110.00,250.00,'SD-CAP'],
            [$est[7],['S','M','L','XL'],['Blanco','Coral','Verde'],       75.00,170.00,'BL-SIN'],
            [$est[8],['S','M','L','XL','XXL'],['Blanco','Azul','Negro'],  65.00,149.00,'UN-POLO'],
        ];
        foreach ($skuDef as [$estiloId,$talNoms,$colores,$costo,$venta,$prefix]) {
            foreach ($talNoms as $ti=>$talNom) {
                $talId = $tal[min($ti, count($tal)-1)];
                foreach ($colores as [$cc,$cn] ?? array_map(fn($c)=>[$c,$c],$colores) as $cn) {
                    $cc = strtoupper(substr(str_replace(' ','',$cn),0,2));
                    $arts[] = DB::table('articulos')->insertGetId(['empresa_id'=>$eid,'estilo_id'=>$estiloId,'talla_id'=>$talId,'codigo_sku'=>"{$prefix}-{$cc}-{$talNom}",'nombre'=>basename(DB::table('estilos')->where('id',$estiloId)->value('nombre'))." – {$cn}",'color'=>$cn,'descripcion'=>"{$cn}, talla {$talNom}",'precio_costo'=>$costo,'precio_venta'=>$venta,'stock_actual'=>rand(8,60),'status'=>'activo','created_at'=>now(),'updated_at'=>now()]);
                }
            }
        }

        // ══════════════════════════════════════════════════════════════════════
        // 20. BOM
        // ══════════════════════════════════════════════════════════════════════
        $bomDef = [
            $est[0] => [['tela',$telas[0],'Algodón Pima',1.80,'metro','Merma 15%'],['avio',$avios[9],'Entretela cuello',0.20,'metro',null],['avio',$avios[0],'Hilo Blanco',0.05,'cono',null],['avio',$avios[7],'Etiqueta Marca',1.00,'pieza',null],['avio',$avios[8],'Etiqueta Talla',1.00,'pieza',null],['avio',$avios[10],'Bolsa empaque',1.00,'pieza',null]],
            $est[1] => [['tela',$telas[1],'Gabardina Stretch',1.40,'metro','Merma 12%'],['avio',$avios[9],'Entretela pretina',0.15,'metro',null],['avio',$avios[4],'Cierre YKK 18cm',1.00,'pieza',null],['avio',$avios[1],'Hilo Negro',0.05,'cono',null],['avio',$avios[11],'Remache dorado',4.00,'pieza',null],['avio',$avios[8],'Etiqueta Talla',1.00,'pieza',null]],
            $est[5] => [['tela',$telas[3],'Seda Sintética',1.60,'metro','Incl. forro 0.5m'],['avio',$avios[5],'Cierre invisible 22cm',1.00,'pieza',null],['avio',$avios[1],'Hilo Negro',0.04,'cono',null],['avio',$avios[7],'Etiqueta Marca',1.00,'pieza',null]],
            $est[6] => [['tela',$telas[4],'Fleece Polar',1.80,'metro','Merma 10%'],['avio',$avios[0],'Hilo Blanco',0.06,'cono',null],['avio',$avios[12],'Elástico cintura',0.80,'metro',null],['avio',$avios[7],'Etiqueta Marca',1.00,'pieza',null],['avio',$avios[10],'Bolsa empaque',1.00,'pieza',null]],
            $est[8] => [['tela',$telas[5],'Piqué 180g',1.20,'metro','Merma 8%'],['avio',$avios[3],'Hilo Azul',0.05,'cono',null],['avio',$avios[14],'Hilo bordar',0.02,'cono','Logo frontal'],['avio',$avios[7],'Etiqueta Marca',1.00,'pieza',null],['avio',$avios[10],'Bolsa empaque',1.00,'pieza',null]],
        ];
        foreach ($bomDef as $estiloId => $items) {
            foreach ($items as [$tipo,$itemId,$nomRef,$cant,$unidad,$obs]) {
                DB::table('bom_items')->insert(['estilo_id'=>$estiloId,'tipo'=>$tipo,'item_id'=>$itemId,'nombre_referencia'=>$nomRef,'cantidad_por_prenda'=>$cant,'unidad'=>$unidad,'observaciones'=>$obs,'created_at'=>now(),'updated_at'=>now()]);
            }
        }

        // ══════════════════════════════════════════════════════════════════════
        // 21. LISTAS DE PRECIOS
        // ══════════════════════════════════════════════════════════════════════
        $listas = [];
        foreach ([
            ['Lista General 2026',       'Precios sugeridos al público',           'general','2026-01-01','2026-12-31'],
            ['Lista Mayoreo Temporada',  'Pedidos mayores a 100 pzas. –20%',      'mayoreo','2026-04-01','2026-09-30'],
            ['Lista Boutique Primavera', 'Precios acordados Boutique Primavera',  'cliente','2026-01-01','2026-12-31'],
            ['Lista Exportación',        'Precios exportación USD equivalente',   'cliente','2026-01-01','2026-12-31'],
        ] as [$n,$d,$t,$fi,$ff]) {
            $listas[] = DB::table('listas_precios')->insertGetId(['empresa_id'=>$eid,'nombre'=>$n,'descripcion'=>$d,'tipo'=>$t,'fecha_vigencia_inicio'=>$fi,'fecha_vigencia_fin'=>$ff,'activa'=>true,'created_at'=>now(),'updated_at'=>now()]);
        }
        foreach (array_slice($arts,0,20) as $artId) {
            $pv = DB::table('articulos')->where('id',$artId)->value('precio_venta');
            DB::table('lista_precio_articulos')->insert(['lista_precio_id'=>$listas[0],'articulo_id'=>$artId,'precio'=>$pv,'created_at'=>now(),'updated_at'=>now()]);
            DB::table('lista_precio_articulos')->insert(['lista_precio_id'=>$listas[1],'articulo_id'=>$artId,'precio'=>round($pv*0.80,2),'created_at'=>now(),'updated_at'=>now()]);
            DB::table('lista_precio_articulos')->insert(['lista_precio_id'=>$listas[3],'articulo_id'=>$artId,'precio'=>round($pv*1.15,2),'created_at'=>now(),'updated_at'=>now()]);
        }

        // ══════════════════════════════════════════════════════════════════════
        // 22. CUENTAS POR PAGAR (10)
        // ══════════════════════════════════════════════════════════════════════
        DB::table('cuentas_pagar')->insert([
            ['empresa_id'=>$eid,'proveedor_id'=>$prov[0],'folio'=>'FAC-0089','concepto'=>'Rollos algodón pima (4 rollos)','monto_total'=>18000.00,'monto_pagado'=>0,'fecha_emision'=>'2026-04-01','fecha_vencimiento'=>'2026-04-30','metodo_pago'=>'transferencia','status'=>'pendiente','created_at'=>now(),'updated_at'=>now()],
            ['empresa_id'=>$eid,'proveedor_id'=>$prov[1],'folio'=>'FAC-0102','concepto'=>'Avíos lote abril: cierres, etiquetas, bolsas','monto_total'=>12500.00,'monto_pagado'=>6000.00,'fecha_emision'=>'2026-04-05','fecha_vencimiento'=>'2026-05-05','metodo_pago'=>'transferencia','status'=>'parcial','created_at'=>now(),'updated_at'=>now()],
            ['empresa_id'=>$eid,'proveedor_id'=>$prov[2],'folio'=>'FAC-0045','concepto'=>'Hilos poliéster 4 colores – 40 conos c/u','monto_total'=>7200.00,'monto_pagado'=>7200.00,'fecha_emision'=>'2026-03-20','fecha_vencimiento'=>'2026-04-20','metodo_pago'=>'efectivo','status'=>'pagado','created_at'=>now(),'updated_at'=>now()],
            ['empresa_id'=>$eid,'proveedor_id'=>$prov[0],'folio'=>'FAC-0110','concepto'=>'Gabardina stretch gris/negro/marino – 3 rollos','monto_total'=>9930.00,'monto_pagado'=>0,'fecha_emision'=>'2026-04-10','fecha_vencimiento'=>'2026-04-25','metodo_pago'=>'transferencia','status'=>'pendiente','created_at'=>now(),'updated_at'=>now()],
            ['empresa_id'=>$eid,'proveedor_id'=>$prov[4],'folio'=>'FAC-0128','concepto'=>'Fleece polar – 2 rollos (95 m)','monto_total'=>6840.00,'monto_pagado'=>0,'fecha_emision'=>'2026-04-15','fecha_vencimiento'=>'2026-05-15','metodo_pago'=>'transferencia','status'=>'pendiente','created_at'=>now(),'updated_at'=>now()],
            ['empresa_id'=>$eid,'proveedor_id'=>$prov[1],'folio'=>'FAC-0135','concepto'=>'Elástico, entretela y botones – lote','monto_total'=>4200.00,'monto_pagado'=>4200.00,'fecha_emision'=>'2026-03-28','fecha_vencimiento'=>'2026-04-28','metodo_pago'=>'efectivo','status'=>'pagado','created_at'=>now(),'updated_at'=>now()],
            ['empresa_id'=>$eid,'proveedor_id'=>$prov[3],'folio'=>'FAC-0156','concepto'=>'Jersey licra y seda sintética – 4 rollos','monto_total'=>8750.00,'monto_pagado'=>4000.00,'fecha_emision'=>'2026-05-02','fecha_vencimiento'=>'2026-06-02','metodo_pago'=>'transferencia','status'=>'parcial','created_at'=>now(),'updated_at'=>now()],
            ['empresa_id'=>$eid,'proveedor_id'=>$prov[0],'folio'=>'FAC-0172','concepto'=>'Piqué 180g blanco y azul – 2 rollos','monto_total'=>6720.00,'monto_pagado'=>0,'fecha_emision'=>'2026-05-10','fecha_vencimiento'=>'2026-06-10','metodo_pago'=>'transferencia','status'=>'pendiente','created_at'=>now(),'updated_at'=>now()],
            ['empresa_id'=>$eid,'proveedor_id'=>$prov[5],'folio'=>'FAC-0188','concepto'=>'Entretelas y forros lote mayo','monto_total'=>3150.00,'monto_pagado'=>3150.00,'fecha_emision'=>'2026-05-01','fecha_vencimiento'=>'2026-05-31','metodo_pago'=>'efectivo','status'=>'pagado','created_at'=>now(),'updated_at'=>now()],
            ['empresa_id'=>$eid,'proveedor_id'=>$prov[4],'folio'=>'FAC-0195','concepto'=>'Denim 10oz azul índigo – 1 rollo','monto_total'=>3825.00,'monto_pagado'=>0,'fecha_emision'=>'2026-05-15','fecha_vencimiento'=>'2026-06-15','metodo_pago'=>'transferencia','status'=>'pendiente','created_at'=>now(),'updated_at'=>now()],
        ]);

        // ══════════════════════════════════════════════════════════════════════
        // 23. PERMISOS DE EMPLEADOS (15)
        // ══════════════════════════════════════════════════════════════════════
        DB::table('permisos_empleado')->insert([
            ['empresa_id'=>$eid,'empleado_id'=>$emp[3], 'tipo'=>'permiso_personal','fecha_inicio'=>'2026-03-15','fecha_fin'=>'2026-03-15','motivo'=>'Cita médica pediatra','status'=>'aprobado','observaciones_encargado'=>'Autorizado. Cubre Karla.','created_at'=>now(),'updated_at'=>now()],
            ['empresa_id'=>$eid,'empleado_id'=>$emp[1], 'tipo'=>'vacaciones','fecha_inicio'=>'2026-04-06','fecha_fin'=>'2026-04-10','motivo'=>'Vacaciones anuales Semana Santa','status'=>'aprobado','observaciones_encargado'=>'Conforme a calendario.','created_at'=>now(),'updated_at'=>now()],
            ['empresa_id'=>$eid,'empleado_id'=>$emp[6], 'tipo'=>'incapacidad','fecha_inicio'=>'2026-03-20','fecha_fin'=>'2026-03-22','motivo'=>'Incapacidad IMSS esguince','status'=>'aprobado','observaciones_encargado'=>'Folio 382910. Se cubre.','created_at'=>now(),'updated_at'=>now()],
            ['empresa_id'=>$eid,'empleado_id'=>$emp[4], 'tipo'=>'permiso_personal','fecha_inicio'=>'2026-04-28','fecha_fin'=>'2026-04-28','motivo'=>'Diligencias urgentes','status'=>'pendiente','observaciones_encargado'=>null,'created_at'=>now(),'updated_at'=>now()],
            ['empresa_id'=>$eid,'empleado_id'=>$emp[9], 'tipo'=>'vacaciones','fecha_inicio'=>'2026-05-18','fecha_fin'=>'2026-05-22','motivo'=>'Vacaciones anuales','status'=>'aprobado','observaciones_encargado'=>'Autorizado.','created_at'=>now(),'updated_at'=>now()],
            ['empresa_id'=>$eid,'empleado_id'=>$emp[2], 'tipo'=>'otro','fecha_inicio'=>'2026-04-07','fecha_fin'=>'2026-04-07','motivo'=>'Graduación de su hijo','status'=>'aprobado','observaciones_encargado'=>'Autorizado turno mañana.','created_at'=>now(),'updated_at'=>now()],
            ['empresa_id'=>$eid,'empleado_id'=>$emp[7], 'tipo'=>'incapacidad','fecha_inicio'=>'2026-04-14','fecha_fin'=>'2026-04-16','motivo'=>'Gripe con fiebre','status'=>'rechazado','observaciones_encargado'=>'Sin incapacidad IMSS. Se descuenta.','created_at'=>now(),'updated_at'=>now()],
            ['empresa_id'=>$eid,'empleado_id'=>$emp[12],'tipo'=>'permiso_personal','fecha_inicio'=>'2026-05-05','fecha_fin'=>'2026-05-05','motivo'=>'Boda familiar','status'=>'aprobado','observaciones_encargado'=>'Autorizado.','created_at'=>now(),'updated_at'=>now()],
            ['empresa_id'=>$eid,'empleado_id'=>$emp[16],'tipo'=>'permiso_personal','fecha_inicio'=>'2026-04-22','fecha_fin'=>'2026-04-22','motivo'=>'Trámite notarial','status'=>'aprobado','observaciones_encargado'=>'Autorizado medio día.','created_at'=>now(),'updated_at'=>now()],
            ['empresa_id'=>$eid,'empleado_id'=>$emp[20],'tipo'=>'incapacidad','fecha_inicio'=>'2026-05-12','fecha_fin'=>'2026-05-16','motivo'=>'Cirugía menor programada','status'=>'aprobado','observaciones_encargado'=>'Incapacidad IMSS presentada.','created_at'=>now(),'updated_at'=>now()],
            ['empresa_id'=>$eid,'empleado_id'=>$emp[22],'tipo'=>'vacaciones','fecha_inicio'=>'2026-05-25','fecha_fin'=>'2026-05-29','motivo'=>'Vacaciones anuales','status'=>'pendiente','observaciones_encargado'=>null,'created_at'=>now(),'updated_at'=>now()],
            ['empresa_id'=>$eid,'empleado_id'=>$emp[14],'tipo'=>'permiso_personal','fecha_inicio'=>'2026-03-25','fecha_fin'=>'2026-03-25','motivo'=>'Reunión escolar urgente','status'=>'aprobado','observaciones_encargado'=>'Autorizado.','created_at'=>now(),'updated_at'=>now()],
            ['empresa_id'=>$eid,'empleado_id'=>$emp[18],'tipo'=>'otro','fecha_inicio'=>'2026-04-30','fecha_fin'=>'2026-04-30','motivo'=>'Aniversario de comunidad','status'=>'pendiente','observaciones_encargado'=>null,'created_at'=>now(),'updated_at'=>now()],
            ['empresa_id'=>$eid,'empleado_id'=>$emp[24],'tipo'=>'incapacidad','fecha_inicio'=>'2026-05-19','fecha_fin'=>'2026-05-21','motivo'=>'Infección respiratoria','status'=>'aprobado','observaciones_encargado'=>'Presentó incapacidad.','created_at'=>now(),'updated_at'=>now()],
            ['empresa_id'=>$eid,'empleado_id'=>$emp[8], 'tipo'=>'vacaciones','fecha_inicio'=>'2026-06-01','fecha_fin'=>'2026-06-05','motivo'=>'Vacaciones pendientes 2025','status'=>'aprobado','observaciones_encargado'=>'Autorizado por gerencia.','created_at'=>now(),'updated_at'=>now()],
        ]);

        // ══════════════════════════════════════════════════════════════════════
        // 24. ACLARACIONES DE PRODUCCIÓN (10)
        // ══════════════════════════════════════════════════════════════════════
        DB::table('aclaraciones_produccion')->insert([
            ['empresa_id'=>$eid,'empleado_id'=>$emp[3],'hoja_produccion_id'=>$hojaIds[7],'descripcion'=>'Aparecen 200 pzas dobladillo pero hice 230. Solicito revisión.','status'=>'resuelta','respuesta'=>'Revisado: 228 pzas confirmadas. Se ajusta en siguiente quincena.','created_at'=>now(),'updated_at'=>now()],
            ['empresa_id'=>$eid,'empleado_id'=>$emp[0],'hoja_produccion_id'=>$hojaIds[4],'descripcion'=>'Precio "Unir hombros" es $0.80 pero acordamos $0.85 por dificultad del modelo.','status'=>'en_revision','respuesta'=>null,'created_at'=>now(),'updated_at'=>now()],
            ['empresa_id'=>$eid,'empleado_id'=>$emp[1],'hoja_produccion_id'=>$hojaIds[5],'descripcion'=>'Mi hoja no incluye el sábado. Trabajé ese día y registré 80 pzas cuello.','status'=>'resuelta','respuesta'=>'Confirmado. Se genera ajuste para pago en próxima quincena.','created_at'=>now(),'updated_at'=>now()],
            ['empresa_id'=>$eid,'empleado_id'=>$emp[6],'hoja_produccion_id'=>null,'descripcion'=>'No veo mi bono de productividad de marzo en el sistema.','status'=>'pendiente','respuesta'=>null,'created_at'=>now(),'updated_at'=>now()],
            ['empresa_id'=>$eid,'empleado_id'=>$emp[11],'hoja_produccion_id'=>$hojaIds[31],'descripcion'=>'Aparecen 280 pzas pero hice 310. La encargada puede confirmarlo.','status'=>'en_revision','respuesta'=>null,'created_at'=>now(),'updated_at'=>now()],
            ['empresa_id'=>$eid,'empleado_id'=>$emp[9],'hoja_produccion_id'=>$hojaIds[26],'descripcion'=>'Se registró el martes como inhábil pero ese día sí trabajamos.','status'=>'resuelta','respuesta'=>'Error confirmado. Se corrige y abona diferencia.','created_at'=>now(),'updated_at'=>now()],
            ['empresa_id'=>$eid,'empleado_id'=>$emp[16],'hoja_produccion_id'=>$hojaIds[2],'descripcion'=>'Mi operación "Pegar capucha" aparece a $1.40 y el precio acordado era $1.60.','status'=>'resuelta','respuesta'=>'Precio correcto es $1.60. Se ajustó en hoja y se paga diferencia.','created_at'=>now(),'updated_at'=>now()],
            ['empresa_id'=>$eid,'empleado_id'=>$emp[21],'hoja_produccion_id'=>$hojaIds[11],'descripcion'=>'La semana del 24 de marzo me faltan 2 días registrados de trabajo.','status'=>'en_revision','respuesta'=>null,'created_at'=>now(),'updated_at'=>now()],
            ['empresa_id'=>$eid,'empleado_id'=>$emp[4],'hoja_produccion_id'=>$hojaIds[9],'descripcion'=>'No aparece el pago por 50 cremalleras extra que hice el jueves.','status'=>'pendiente','respuesta'=>null,'created_at'=>now(),'updated_at'=>now()],
            ['empresa_id'=>$eid,'empleado_id'=>$emp[28],'hoja_produccion_id'=>$hojaIds[17],'descripcion'=>'Mi nombre aparece mal escrito en la hoja impresa. Solicito corrección.','status'=>'resuelta','respuesta'=>'Corregido en el sistema. Se genera nueva hoja.','created_at'=>now(),'updated_at'=>now()],
        ]);

        // ══════════════════════════════════════════════════════════════════════
        // 25. CORTES DE NÓMINA (4)
        // ══════════════════════════════════════════════════════════════════════
        // Corte 1 — Quincena Feb (pagado)
        $c1 = DB::table('cortes_nomina')->insertGetId(['empresa_id'=>$eid,'nombre'=>'Quincena 24 Feb – 14 Mar 2026','fecha_inicio'=>'2026-02-24','fecha_fin'=>'2026-03-14','status'=>'pagado','observaciones'=>'Primeras 3 semanas de temporada.','creado_por'=>$userAdmin,'created_at'=>now(),'updated_at'=>now()]);
        foreach ([[$emp[5],[$hojaIds[0],$hojaIds[1]]],[$emp[16],[$hojaIds[2]]],[$emp[17],[$hojaIds[3]]],[$emp[0],[$hojaIds[4]]],[$emp[1],[$hojaIds[5]]],[$emp[20],[$hojaIds[6]]]] as [$empId,$hIds]) {
            $imp = DB::table('hojas_produccion')->whereIn('id',$hIds)->sum('total_a_pagar');
            DB::table('corte_nomina_empleado')->insert(['corte_nomina_id'=>$c1,'empleado_id'=>$empId,'total_hojas'=>count($hIds),'importe'=>$imp,'ajuste'=>0,'total_a_pagar'=>$imp,'monto_pagado'=>$imp,'status'=>'pagado','metodo_pago'=>'transferencia','fecha_pago'=>'2026-03-16','observaciones'=>null,'created_at'=>now(),'updated_at'=>now()]);
        }

        // Corte 2 — Quincena Mar (pagado)
        $c2 = DB::table('cortes_nomina')->insertGetId(['empresa_id'=>$eid,'nombre'=>'Quincena 17 Mar – 4 Abr 2026','fecha_inicio'=>'2026-03-17','fecha_fin'=>'2026-04-04','status'=>'pagado','observaciones'=>'Semanas 4, 5 y 6.','creado_por'=>$userAdmin,'created_at'=>now(),'updated_at'=>now()]);
        foreach ([[$emp[3],[$hojaIds[7]]],[$emp[21],[$hojaIds[8]]],[$emp[4],[$hojaIds[9]]],[$emp[7],[$hojaIds[10]]],[$emp[22],[$hojaIds[11]]],[$emp[0],[$hojaIds[12]]],[$emp[1],[$hojaIds[13]]],[$emp[23],[$hojaIds[14]]]] as [$empId,$hIds]) {
            $imp = DB::table('hojas_produccion')->whereIn('id',$hIds)->sum('total_a_pagar');
            DB::table('corte_nomina_empleado')->insert(['corte_nomina_id'=>$c2,'empleado_id'=>$empId,'total_hojas'=>count($hIds),'importe'=>$imp,'ajuste'=>0,'total_a_pagar'=>$imp,'monto_pagado'=>$imp,'status'=>'pagado','metodo_pago'=>'transferencia','fecha_pago'=>'2026-04-05','observaciones'=>null,'created_at'=>now(),'updated_at'=>now()]);
        }

        // Corte 3 — Quincena Abr-May (pagado)
        $c3 = DB::table('cortes_nomina')->insertGetId(['empresa_id'=>$eid,'nombre'=>'Quincena 7 Abr – 16 May 2026','fecha_inicio'=>'2026-04-07','fecha_fin'=>'2026-05-16','status'=>'pagado','observaciones'=>'Semanas 7, 8, 9 y 10.','creado_por'=>$userAdmin,'created_at'=>now(),'updated_at'=>now()]);
        foreach ([[$emp[3],[$hojaIds[15]]],[$emp[24],[$hojaIds[16]]],[$emp[25],[$hojaIds[17]]],[$emp[5],[$hojaIds[18],$hojaIds[22]]],[$emp[6],[$hojaIds[19],$hojaIds[26]]],[$emp[26],[$hojaIds[20]]],[$emp[0],[$hojaIds[21],$hojaIds[29]]],[$emp[1],[$hojaIds[22],$hojaIds[30]]],[$emp[3],[$hojaIds[23]]],[$emp[27],[$hojaIds[24]]],[$emp[2],[$hojaIds[25]]],[$emp[4],[$hojaIds[26]]],[$emp[28],[$hojaIds[27]]]] as [$empId,$hIds]) {
            $imp = DB::table('hojas_produccion')->whereIn('id',$hIds)->sum('total_a_pagar');
            if ($imp == 0) continue;
            DB::table('corte_nomina_empleado')->insert(['corte_nomina_id'=>$c3,'empleado_id'=>$empId,'total_hojas'=>count($hIds),'importe'=>$imp,'ajuste'=>0,'total_a_pagar'=>$imp,'monto_pagado'=>$imp,'status'=>'pagado','metodo_pago'=>'transferencia','fecha_pago'=>'2026-05-17','observaciones'=>null,'created_at'=>now(),'updated_at'=>now()]);
        }

        // Corte 4 — Quincena May-Jun (borrador)
        $c4 = DB::table('cortes_nomina')->insertGetId(['empresa_id'=>$eid,'nombre'=>'Quincena 19 May – 6 Jun 2026','fecha_inicio'=>'2026-05-19','fecha_fin'=>'2026-06-06','status'=>'borrador','observaciones'=>'Pendiente revisión y autorización.','creado_por'=>$userAdmin,'created_at'=>now(),'updated_at'=>now()]);
        foreach ([[$emp[0],[$hojaIds[29],$hojaIds[37]]],[$emp[1],[$hojaIds[30],$hojaIds[34]]],[$emp[3],[$hojaIds[31],$hojaIds[38]]],[$emp[5],[$hojaIds[32]]],[$emp[4],[$hojaIds[35]]],[$emp[7],[$hojaIds[36]]],[$emp[29],[$hojaIds[37]]]] as [$empId,$hIds]) {
            $hIds = array_unique(array_filter($hIds, fn($id) => DB::table('hojas_produccion')->where('id',$id)->exists()));
            if (empty($hIds)) continue;
            $imp = DB::table('hojas_produccion')->whereIn('id',$hIds)->sum('total_a_pagar');
            DB::table('corte_nomina_empleado')->insert(['corte_nomina_id'=>$c4,'empleado_id'=>$empId,'total_hojas'=>count($hIds),'importe'=>$imp,'ajuste'=>0,'total_a_pagar'=>$imp,'monto_pagado'=>0,'status'=>'pendiente','metodo_pago'=>null,'fecha_pago'=>null,'observaciones'=>null,'created_at'=>now(),'updated_at'=>now()]);
        }

        // ══════════════════════════════════════════════════════════════════════
        // RESUMEN
        // ══════════════════════════════════════════════════════════════════════
        if ($this->command) {
            $this->command->info('');
            $this->command->info('✔  Base de datos poblada correctamente.');
            $this->command->info('');
            $this->command->info('   ADMIN     admin@maewallis.com      / Admin2026!');
            $this->command->info('   ENCARGADO encargado@maewallis.com  / Encargado2026!');
            $this->command->info('   EMPLEADO  empleado@maewallis.com   / Empleado2026!');
            $this->command->info('');
            $this->command->table(['Tabla','Registros'], [
                ['empleados',              DB::table('empleados')->count()],
                ['clientes',               DB::table('clientes')->count()],
                ['estilos',                DB::table('estilos')->count()],
                ['ordenes_produccion',     DB::table('ordenes_produccion')->count()],
                ['hojas_produccion',       DB::table('hojas_produccion')->count()],
                ['hoja_operaciones',       DB::table('hoja_operaciones')->count()],
                ['registro_asistencia',    DB::table('registro_asistencia')->count()],
                ['telas / rollos',         DB::table('telas')->count().' / '.DB::table('rollos_tela')->count()],
                ['avios',                  DB::table('avios')->count()],
                ['movimientos_almacen',    DB::table('movimientos_almacen')->count()],
                ['articulos (SKU)',         DB::table('articulos')->count()],
                ['bom_items',              DB::table('bom_items')->count()],
                ['talleres / envios',      DB::table('talleres_externos')->count().' / '.DB::table('envios_taller')->count()],
                ['cuentas_pagar',          DB::table('cuentas_pagar')->count()],
                ['cortes_nomina / lineas', DB::table('cortes_nomina')->count().' / '.DB::table('corte_nomina_empleado')->count()],
                ['permisos_empleado',      DB::table('permisos_empleado')->count()],
                ['aclaraciones',           DB::table('aclaraciones_produccion')->count()],
            ]);
        }
    }
}
