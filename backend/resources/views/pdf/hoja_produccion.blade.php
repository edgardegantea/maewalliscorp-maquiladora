<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: DejaVu Sans, sans-serif; font-size: 10px; color: #1e293b; background: #fff; }
  .page { padding: 20px 24px; }

  /* ── Encabezado ── */
  .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #2563eb; padding-bottom: 10px; margin-bottom: 14px; }
  .header-left h1 { font-size: 15px; font-weight: 700; color: #1e40af; }
  .header-left p  { font-size: 9px; color: #64748b; margin-top: 2px; }
  .header-right   { text-align: right; }
  .header-right .folio { font-size: 13px; font-weight: 700; color: #2563eb; }
  .header-right small  { font-size: 8.5px; color: #94a3b8; display: block; }

  /* ── Bloque info ── */
  .info-grid { display: table; width: 100%; border-collapse: collapse; margin-bottom: 14px; }
  .info-row  { display: table-row; }
  .info-cell { display: table-cell; padding: 4px 8px; border: 1px solid #e2e8f0; vertical-align: top; width: 25%; }
  .info-label{ font-size: 8px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.04em; display: block; margin-bottom: 2px; }
  .info-value{ font-size: 10px; font-weight: 600; color: #0f172a; }

  /* ── Tabla de operaciones ── */
  .section-title { font-size: 10px; font-weight: 700; color: #1e40af; text-transform: uppercase;
                   letter-spacing: 0.06em; margin-bottom: 6px; padding-bottom: 3px;
                   border-bottom: 1px solid #bfdbfe; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 14px; }
  thead th { background: #eff6ff; color: #1e40af; font-size: 8.5px; font-weight: 700;
             text-transform: uppercase; letter-spacing: 0.04em;
             padding: 5px 6px; text-align: left; border-bottom: 1px solid #bfdbfe; }
  thead th.right { text-align: right; }
  tbody tr { border-bottom: 1px solid #f1f5f9; }
  tbody tr:nth-child(even) { background: #f8fafc; }
  tbody td { padding: 4px 6px; font-size: 9px; vertical-align: middle; }
  tbody td.right { text-align: right; }
  tbody td.mono  { font-family: DejaVu Sans Mono, monospace; font-size: 8.5px; }

  /* ── Subtotales por día ── */
  .day-header { background: #dbeafe !important; }
  .day-header td { font-weight: 700; font-size: 8.5px; color: #1e40af; padding: 3px 6px; }

  /* ── Resumen ── */
  .summary { float: right; width: 220px; border: 1px solid #e2e8f0; border-radius: 6px; overflow: hidden; margin-bottom: 16px; }
  .summary-row { display: table-row; }
  .summary-table { display: table; width: 100%; border-collapse: collapse; }
  .summary-cell  { display: table-cell; padding: 5px 10px; border-top: 1px solid #f1f5f9; }
  .summary-cell:last-child { text-align: right; font-weight: 600; }
  .summary-total { background: #2563eb; color: #fff; }
  .summary-total .summary-cell { border-top: none; font-weight: 700; font-size: 11px; }

  /* ── Eventualidades ── */
  .event-chip { display: inline-block; background: #fef3c7; color: #92400e;
               border: 1px solid #fde68a; border-radius: 10px;
               padding: 1px 7px; font-size: 8px; margin: 2px 2px 0 0; }

  /* ── Firma ── */
  .firma-section { margin-top: 28px; display: flex; justify-content: space-around; }
  .firma-box { text-align: center; width: 160px; }
  .firma-line { border-top: 1px solid #94a3b8; padding-top: 4px; font-size: 8.5px; color: #475569; }

  /* ── Footer ── */
  .footer { margin-top: 18px; border-top: 1px solid #e2e8f0; padding-top: 6px;
            font-size: 7.5px; color: #94a3b8; display: flex; justify-content: space-between; }

  .clearfix::after { content: ''; display: table; clear: both; }
</style>
</head>
<body>
<div class="page">

  {{-- ── Encabezado ─────────────────────────────────────────────────────── --}}
  <div class="header">
    <div class="header-left">
      <h1>{{ $empresa->nombre ?? 'Maquiladora' }}</h1>
      @if($empresa->razon_social ?? false)
        <p>{{ $empresa->razon_social }}</p>
      @endif
      <p style="margin-top:4px; color:#2563eb; font-weight:600">Hoja de Producción</p>
    </div>
    <div class="header-right">
      <div class="folio">#{{ str_pad($hoja->id, 5, '0', STR_PAD_LEFT) }}</div>
      <small>Generado el {{ now()->format('d/m/Y H:i') }}</small>
    </div>
  </div>

  {{-- ── Info principal ───────────────────────────────────────────────────── --}}
  <div class="info-grid">
    <div class="info-row">
      <div class="info-cell">
        <span class="info-label">Empleado</span>
        <span class="info-value">{{ $hoja->empleado->apellidos }} {{ $hoja->empleado->nombre }}</span>
      </div>
      <div class="info-cell">
        <span class="info-label">Orden de producción</span>
        <span class="info-value">{{ $hoja->orden->codigo ?? '—' }}</span>
        @if($hoja->orden->modelo ?? false)
          <span style="font-size:8.5px;color:#64748b;display:block">{{ $hoja->orden->modelo }}</span>
        @endif
      </div>
      <div class="info-cell">
        <span class="info-label">Período</span>
        <span class="info-value">
          {{ $hoja->fecha_inicio ? $hoja->fecha_inicio->format('d/m/Y') : '—' }}
          — {{ $hoja->fecha_fin ? $hoja->fecha_fin->format('d/m/Y') : '—' }}
        </span>
      </div>
      <div class="info-cell">
        <span class="info-label">Días inhabiles</span>
        <span class="info-value">{{ $hoja->dias_inhabiles ?? 0 }}</span>
      </div>
    </div>
    <div class="info-row">
      <div class="info-cell">
        <span class="info-label">Cliente</span>
        <span class="info-value">{{ $hoja->orden->cliente->nombre ?? '—' }}</span>
      </div>
      <div class="info-cell">
        <span class="info-label">Fecha registro</span>
        <span class="info-value">{{ $hoja->fecha_registro ? $hoja->fecha_registro->format('d/m/Y') : '—' }}</span>
      </div>
      <div class="info-cell" colspan="2">
        <span class="info-label">Observaciones</span>
        <span class="info-value" style="font-weight:400">{{ $hoja->observaciones ?: '—' }}</span>
      </div>
    </div>
  </div>

  {{-- ── Operaciones ──────────────────────────────────────────────────────── --}}
  <p class="section-title">Operaciones realizadas</p>

  @php
    $porDia = $hoja->operaciones->sortBy('fecha')->groupBy(fn($op) => optional($op->fecha)->toDateString() ?? '');
    $totalPiezas = $hoja->operaciones->sum('numero_piezas');
  @endphp

  @if($hoja->operaciones->isEmpty())
    <p style="font-size:9px;color:#94a3b8;margin-bottom:14px">Sin operaciones registradas.</p>
  @else
  <table>
    <thead>
      <tr>
        <th style="width:80px">Fecha</th>
        <th>Operación</th>
        <th class="right" style="width:60px">Piezas</th>
        <th class="right" style="width:65px">Precio U.</th>
        <th class="right" style="width:70px">Total</th>
      </tr>
    </thead>
    <tbody>
      @foreach($porDia as $fecha => $ops)
        {{-- Subtítulo por día --}}
        <tr class="day-header">
          <td colspan="2">
            @php
              $dt = \Carbon\Carbon::parse($fecha);
              $dias = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
            @endphp
            {{ $dias[$dt->dayOfWeek] }}, {{ $dt->format('d/m/Y') }}
          </td>
          <td class="right">{{ $ops->sum('numero_piezas') }} pzs</td>
          <td></td>
          <td class="right">${{ number_format($ops->sum('total_por_operacion'), 2) }}</td>
        </tr>
        @foreach($ops as $op)
        <tr>
          <td class="mono">{{ optional($op->fecha)->format('d/m/Y') }}</td>
          <td>{{ $op->operacion->nombre ?? '—' }}</td>
          <td class="right">{{ number_format($op->numero_piezas) }}</td>
          <td class="right mono">${{ number_format($op->operacion->precio ?? 0, 4) }}</td>
          <td class="right mono">${{ number_format($op->total_por_operacion, 2) }}</td>
        </tr>
        @endforeach
      @endforeach
    </tbody>
  </table>
  @endif

  {{-- ── Eventualidades ──────────────────────────────────────────────────── --}}
  @if($hoja->eventualidades->isNotEmpty())
  <p class="section-title">Eventualidades</p>
  <p style="margin-bottom:14px">
    @foreach($hoja->eventualidades as $ev)
      <span class="event-chip">{{ $ev->nombre }}</span>
    @endforeach
  </p>
  @endif

  {{-- ── Resumen financiero ───────────────────────────────────────────────── --}}
  <div class="clearfix">
    <div class="summary">
      <div class="summary-table">
        <div class="summary-row">
          <div class="summary-cell" style="background:#f8fafc;font-weight:700;color:#475569;border-top:none">Concepto</div>
          <div class="summary-cell" style="background:#f8fafc;font-weight:700;color:#475569;border-top:none">Monto</div>
        </div>
        <div class="summary-row">
          <div class="summary-cell">Total piezas</div>
          <div class="summary-cell">{{ number_format($totalPiezas) }}</div>
        </div>
        <div class="summary-row">
          <div class="summary-cell">Importe bruto</div>
          <div class="summary-cell">${{ number_format($hoja->importe_total, 2) }}</div>
        </div>
        <div class="summary-row summary-total">
          <div class="summary-cell">Total a pagar</div>
          <div class="summary-cell">${{ number_format($hoja->total_a_pagar, 2) }}</div>
        </div>
      </div>
    </div>
  </div>

  {{-- ── Firmas ───────────────────────────────────────────────────────────── --}}
  <div class="firma-section">
    <div class="firma-box">
      <div style="height:35px"></div>
      <div class="firma-line">Elaborado por</div>
    </div>
    <div class="firma-box">
      <div style="height:35px"></div>
      <div class="firma-line">{{ $hoja->empleado->apellidos }} {{ $hoja->empleado->nombre }}</div>
    </div>
    <div class="firma-box">
      <div style="height:35px"></div>
      <div class="firma-line">Encargado de área</div>
    </div>
  </div>

  {{-- ── Footer ──────────────────────────────────────────────────────────── --}}
  <div class="footer">
    <span>{{ $empresa->nombre ?? '' }} — Sistema de Maquiladora</span>
    <span>Hoja #{{ str_pad($hoja->id, 5, '0', STR_PAD_LEFT) }}</span>
  </div>

</div>
</body>
</html>
