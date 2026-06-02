import { useState, useEffect, useCallback } from 'react'
import { articulosApi } from '../../api/comercial'
import { catalogosApi } from '../../api/catalogos'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import Badge from '../../components/ui/Badge'

const emptyForm = { estilo_id:'', talla_id:'', codigo_sku:'', nombre:'', color:'', descripcion:'', precio_costo:'', precio_venta:'', status:'activo' }
const emptyVariantes = { estilo_id:'', nombre_base:'', colores:'', talla_ids:[], precio_costo:'', precio_venta:'' }

export default function ArticulosPage() {
  const [rows, setRows] = useState([]); const [meta, setMeta] = useState({}); const [page, setPage] = useState(1)
  const [estilos, setEstilos] = useState([]); const [tallas, setTallas] = useState([])
  const [open, setOpen] = useState(false); const [form, setForm] = useState(emptyForm); const [editing, setEditing] = useState(null)
  const [varOpen, setVarOpen] = useState(false); const [varForm, setVarForm] = useState(emptyVariantes)
  const [saving, setSaving] = useState(false); const [q, setQ] = useState('')

  const load = useCallback(async () => {
    const { data } = await articulosApi.list({ page, q: q||undefined })
    setRows(data.data); setMeta(data)
  }, [page, q])

  useEffect(() => {
    load()
    catalogosApi.estilos({status:'activo',per_page:100}).then(r=>setEstilos(r.data.data||[]))
    catalogosApi.tallas({per_page:100}).then(r=>setTallas(r.data.data||[]))
  }, [load])

  const set = (k,v) => setForm(f=>({...f,[k]:v}))
  const save = async () => {
    setSaving(true)
    try { editing ? await articulosApi.update(editing,form) : await articulosApi.create(form); setOpen(false); load() }
    finally { setSaving(false) }
  }
  const generarVariantes = async () => {
    if (!varForm.estilo_id||!varForm.nombre_base||!varForm.colores||!varForm.talla_ids.length) return
    setSaving(true)
    try {
      const colores = varForm.colores.split(',').map(s=>s.trim()).filter(Boolean)
      await articulosApi.generarVariantes({...varForm, colores, talla_ids:varForm.talla_ids.map(Number)})
      setVarOpen(false); setVarForm(emptyVariantes); load()
    } finally { setSaving(false) }
  }
  const del = async (id) => { if(!confirm('¿Eliminar artículo?')) return; await articulosApi.remove(id); load() }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-semibold text-slate-800">Artículos / SKU</h1><p className="text-sm text-slate-500">{meta.total??0} artículos · Administración por SKU, color y talla</p></div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={()=>{setVarForm(emptyVariantes);setVarOpen(true)}}>⚡ Generar variantes</Button>
          <Button onClick={()=>{setForm(emptyForm);setEditing(null);setOpen(true)}}>+ Nuevo artículo</Button>
        </div>
      </div>
      <Input placeholder="Buscar por nombre o SKU…" value={q} onChange={e=>{setQ(e.target.value);setPage(1)}} className="max-w-xs" />

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600 text-xs uppercase">
            <tr>{['SKU','Nombre','Color','Talla','Estilo','P.Costo','P.Venta','Stock','Estado',''].map(h=><th key={h} className="px-4 py-3 text-left font-medium">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map(r=>(
              <tr key={r.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-mono text-xs text-slate-500">{r.codigo_sku}</td>
                <td className="px-4 py-3 font-medium">{r.nombre}</td>
                <td className="px-4 py-3">{r.color&&<span className="inline-block px-2 py-0.5 rounded-full text-xs bg-slate-100">{r.color}</span>}</td>
                <td className="px-4 py-3 text-slate-600">{r.talla?.nombre||'—'}</td>
                <td className="px-4 py-3 text-slate-500">{r.estilo?.nombre||'—'}</td>
                <td className="px-4 py-3 text-slate-500">${parseFloat(r.precio_costo||0).toFixed(2)}</td>
                <td className="px-4 py-3 font-medium text-slate-700">${parseFloat(r.precio_venta||0).toFixed(2)}</td>
                <td className="px-4 py-3">{parseFloat(r.stock_actual||0).toFixed(0)}</td>
                <td className="px-4 py-3"><Badge color={r.status==='activo'?'green':'gray'}>{r.status}</Badge></td>
                <td className="px-4 py-3 flex gap-2 justify-end">
                  <button onClick={()=>{setForm({...r,estilo_id:r.estilo_id||'',talla_id:r.talla_id||''});setEditing(r.id);setOpen(true)}} className="text-blue-600 hover:underline text-xs">Editar</button>
                  <button onClick={()=>del(r.id)} className="text-red-500 hover:underline text-xs">✕</button>
                </td>
              </tr>
            ))}
            {rows.length===0&&<tr><td colSpan={10} className="px-4 py-8 text-center text-slate-400">Sin artículos registrados</td></tr>}
          </tbody>
        </table>
      </div>

      {/* Modal artículo */}
      <Modal isOpen={open} onClose={()=>setOpen(false)} title={editing?'Editar artículo':'Nuevo artículo'}>
        <div className="grid grid-cols-2 gap-4 p-1">
          <div><label className="text-xs font-medium text-slate-600">Nombre *</label><Input value={form.nombre} onChange={e=>set('nombre',e.target.value)} /></div>
          <div><label className="text-xs font-medium text-slate-600">SKU</label><Input value={form.codigo_sku} onChange={e=>set('codigo_sku',e.target.value)} placeholder="Auto si vacío" /></div>
          <div><label className="text-xs font-medium text-slate-600">Color</label><Input value={form.color} onChange={e=>set('color',e.target.value)} /></div>
          <div><label className="text-xs font-medium text-slate-600">Estilo</label>
            <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" value={form.estilo_id} onChange={e=>set('estilo_id',e.target.value)}>
              <option value="">Sin estilo</option>
              {estilos.map(e=><option key={e.id} value={e.id}>{e.nombre}</option>)}
            </select>
          </div>
          <div><label className="text-xs font-medium text-slate-600">Talla</label>
            <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" value={form.talla_id} onChange={e=>set('talla_id',e.target.value)}>
              <option value="">Sin talla</option>
              {tallas.map(t=><option key={t.id} value={t.id}>{t.nombre}</option>)}
            </select>
          </div>
          <div><label className="text-xs font-medium text-slate-600">Precio costo</label><Input type="number" value={form.precio_costo} onChange={e=>set('precio_costo',e.target.value)} /></div>
          <div><label className="text-xs font-medium text-slate-600">Precio venta</label><Input type="number" value={form.precio_venta} onChange={e=>set('precio_venta',e.target.value)} /></div>
        </div>
        <div className="flex justify-end gap-3 pt-4 border-t mt-4">
          <Button variant="secondary" onClick={()=>setOpen(false)}>Cancelar</Button>
          <Button onClick={save} disabled={saving}>{saving?'Guardando…':'Guardar'}</Button>
        </div>
      </Modal>

      {/* Modal generar variantes */}
      <Modal isOpen={varOpen} onClose={()=>setVarOpen(false)} title="⚡ Generar variantes por color × talla">
        <p className="text-xs text-slate-500 mb-4">Crea automáticamente un artículo SKU por cada combinación de color y talla.</p>
        <div className="space-y-3">
          <div><label className="text-xs font-medium text-slate-600">Estilo *</label>
            <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" value={varForm.estilo_id} onChange={e=>setVarForm(f=>({...f,estilo_id:e.target.value}))}>
              <option value="">Seleccionar…</option>
              {estilos.map(e=><option key={e.id} value={e.id}>{e.nombre}</option>)}
            </select>
          </div>
          <div><label className="text-xs font-medium text-slate-600">Nombre base *</label><Input value={varForm.nombre_base} onChange={e=>setVarForm(f=>({...f,nombre_base:e.target.value}))} placeholder="Blusa manga larga" /></div>
          <div><label className="text-xs font-medium text-slate-600">Colores (separados por coma) *</label><Input value={varForm.colores} onChange={e=>setVarForm(f=>({...f,colores:e.target.value}))} placeholder="Blanco, Negro, Azul marino" /></div>
          <div><label className="text-xs font-medium text-slate-600">Tallas *</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {tallas.map(t=>(
                <label key={t.id} className="flex items-center gap-1 text-sm cursor-pointer">
                  <input type="checkbox" checked={varForm.talla_ids.includes(t.id)} onChange={e=>setVarForm(f=>({...f,talla_ids:e.target.checked?[...f.talla_ids,t.id]:f.talla_ids.filter(x=>x!==t.id)}))} />
                  {t.nombre}
                </label>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs font-medium text-slate-600">Precio costo</label><Input type="number" value={varForm.precio_costo} onChange={e=>setVarForm(f=>({...f,precio_costo:e.target.value}))} /></div>
            <div><label className="text-xs font-medium text-slate-600">Precio venta</label><Input type="number" value={varForm.precio_venta} onChange={e=>setVarForm(f=>({...f,precio_venta:e.target.value}))} /></div>
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-4 border-t mt-4">
          <Button variant="secondary" onClick={()=>setVarOpen(false)}>Cancelar</Button>
          <Button onClick={generarVariantes} disabled={saving||!varForm.estilo_id||!varForm.nombre_base||!varForm.colores||!varForm.talla_ids.length}>{saving?'Generando…':'Generar variantes'}</Button>
        </div>
      </Modal>
    </div>
  )
}
