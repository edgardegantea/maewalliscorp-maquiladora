import { useState, useEffect, useCallback } from 'react'
import { talleresApi, enviosTallerApi } from '../../api/comercial'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import Badge from '../../components/ui/Badge'

const statusColor = { enviado:'blue', en_proceso:'yellow', recibido_parcial:'orange', recibido:'green', cancelado:'red' }
const emptyTaller = { nombre:'', responsable:'', telefono:'', email:'', domicilio:'', especialidad:'', status:'activo' }
const emptyEnvio = { taller_id:'', orden_produccion_id:'', concepto:'', piezas_enviadas:'', precio_por_pieza:'', fecha_envio:new Date().toISOString().slice(0,10), fecha_compromiso:'', observaciones:'' }

export default function TalleresPage() {
  const [talleres, setTalleres] = useState([]); const [envios, setEnvios] = useState([]); const [meta, setMeta] = useState({})
  const [tab, setTab] = useState('envios')
  const [open, setOpen] = useState(false); const [form, setForm] = useState(emptyTaller); const [editing, setEditing] = useState(null)
  const [envioOpen, setEnvioOpen] = useState(false); const [envioForm, setEnvioForm] = useState(emptyEnvio)
  const [editEnvio, setEditEnvio] = useState(null); const [recepcionForm, setRecepcionForm] = useState({ piezas_recibidas:'', fecha_recepcion:'', status:'recibido' })
  const [saving, setSaving] = useState(false)

  const loadTalleres = useCallback(async () => { const { data } = await talleresApi.list(); setTalleres(data.data||[]) }, [])
  const loadEnvios = useCallback(async () => { const { data } = await enviosTallerApi.list(); setEnvios(data.data||[]); setMeta(data) }, [])

  useEffect(() => { loadTalleres(); loadEnvios() }, [loadTalleres, loadEnvios])

  const set = (k,v) => setForm(f=>({...f,[k]:v}))
  const saveTaller = async () => {
    setSaving(true)
    try { editing ? await talleresApi.update(editing,form) : await talleresApi.create(form); setOpen(false); loadTalleres() }
    finally { setSaving(false) }
  }
  const saveEnvio = async () => {
    setSaving(true)
    try { await enviosTallerApi.create(envioForm); setEnvioOpen(false); loadEnvios() }
    finally { setSaving(false) }
  }
  const registrarRecepcion = async () => {
    setSaving(true)
    try { await enviosTallerApi.update(editEnvio.id, recepcionForm); setEditEnvio(null); loadEnvios() }
    finally { setSaving(false) }
  }
  const del = async (id) => { if(!confirm('¿Eliminar?')) return; await talleresApi.remove(id); loadTalleres() }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-semibold text-slate-800">Talleres Externos</h1><p className="text-sm text-slate-500">Control de etapas productivas, envío a talleres y stock de terceros</p></div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={()=>{setEnvioForm({...emptyEnvio});setEnvioOpen(true)}}>+ Nuevo envío</Button>
          <Button onClick={()=>{setForm(emptyTaller);setEditing(null);setOpen(true)}}>+ Taller</Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200">
        {[['envios','Envíos / Seguimiento'],['talleres','Directorio de Talleres']].map(([t,l])=>(
          <button key={t} onClick={()=>setTab(t)} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab===t?'border-blue-600 text-blue-700':'border-transparent text-slate-500 hover:text-slate-700'}`}>{l}</button>
        ))}
      </div>

      {tab==='envios' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600 text-xs uppercase">
              <tr>{['Taller','Concepto','Enviadas','Recibidas','Precio/pza','Importe','F.Envío','F.Compromiso','Estado',''].map(h=><th key={h} className="px-4 py-3 text-left font-medium">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {envios.map(e=>(
                <tr key={e.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium">{e.taller?.nombre||'—'}</td>
                  <td className="px-4 py-3">{e.concepto}</td>
                  <td className="px-4 py-3 text-center">{e.piezas_enviadas}</td>
                  <td className="px-4 py-3 text-center">{e.piezas_recibidas}</td>
                  <td className="px-4 py-3">{e.precio_por_pieza?`$${e.precio_por_pieza}`:'—'}</td>
                  <td className="px-4 py-3">{e.importe_total?`$${parseFloat(e.importe_total).toFixed(2)}`:'—'}</td>
                  <td className="px-4 py-3 text-slate-500">{e.fecha_envio}</td>
                  <td className="px-4 py-3 text-slate-500">{e.fecha_compromiso||'—'}</td>
                  <td className="px-4 py-3"><Badge color={statusColor[e.status]||'gray'}>{e.status.replace('_',' ')}</Badge></td>
                  <td className="px-4 py-3">
                    {e.status!=='recibido'&&e.status!=='cancelado'&&(
                      <button onClick={()=>{setEditEnvio(e);setRecepcionForm({piezas_recibidas:e.piezas_recibidas,fecha_recepcion:new Date().toISOString().slice(0,10),status:'recibido'})}} className="text-blue-600 hover:underline text-xs">Registrar recepción</button>
                    )}
                  </td>
                </tr>
              ))}
              {envios.length===0&&<tr><td colSpan={10} className="px-4 py-8 text-center text-slate-400">Sin envíos registrados</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {tab==='talleres' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600 text-xs uppercase">
              <tr>{['Nombre','Responsable','Teléfono','Especialidad','Estado',''].map(h=><th key={h} className="px-4 py-3 text-left font-medium">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {talleres.map(t=>(
                <tr key={t.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium">{t.nombre}</td>
                  <td className="px-4 py-3">{t.responsable||'—'}</td>
                  <td className="px-4 py-3">{t.telefono||'—'}</td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{t.especialidad||'—'}</td>
                  <td className="px-4 py-3"><Badge color={t.status==='activo'?'green':'gray'}>{t.status}</Badge></td>
                  <td className="px-4 py-3 flex gap-2 justify-end">
                    <button onClick={()=>{setForm({...t});setEditing(t.id);setOpen(true)}} className="text-blue-600 hover:underline text-xs">Editar</button>
                    <button onClick={()=>del(t.id)} className="text-red-500 hover:underline text-xs">✕</button>
                  </td>
                </tr>
              ))}
              {talleres.length===0&&<tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">Sin talleres registrados</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal taller */}
      <Modal isOpen={open} onClose={()=>setOpen(false)} title={editing?'Editar taller':'Nuevo taller externo'}>
        <div className="grid grid-cols-2 gap-4 p-1">
          <div className="col-span-2"><label className="text-xs font-medium text-slate-600">Nombre *</label><Input value={form.nombre} onChange={e=>set('nombre',e.target.value)} /></div>
          <div><label className="text-xs font-medium text-slate-600">Responsable</label><Input value={form.responsable} onChange={e=>set('responsable',e.target.value)} /></div>
          <div><label className="text-xs font-medium text-slate-600">Teléfono</label><Input value={form.telefono} onChange={e=>set('telefono',e.target.value)} /></div>
          <div><label className="text-xs font-medium text-slate-600">Email</label><Input type="email" value={form.email} onChange={e=>set('email',e.target.value)} /></div>
          <div className="col-span-2"><label className="text-xs font-medium text-slate-600">Especialidad</label><Input value={form.especialidad} onChange={e=>set('especialidad',e.target.value)} placeholder="Ej: Bordado, Estampado, Etiquetado…" /></div>
          <div className="col-span-2"><label className="text-xs font-medium text-slate-600">Domicilio</label><Input value={form.domicilio} onChange={e=>set('domicilio',e.target.value)} /></div>
        </div>
        <div className="flex justify-end gap-3 pt-4 border-t mt-4">
          <Button variant="secondary" onClick={()=>setOpen(false)}>Cancelar</Button>
          <Button onClick={saveTaller} disabled={saving}>{saving?'Guardando…':'Guardar'}</Button>
        </div>
      </Modal>

      {/* Modal nuevo envío */}
      <Modal isOpen={envioOpen} onClose={()=>setEnvioOpen(false)} title="Nuevo envío a taller">
        <div className="grid grid-cols-2 gap-4 p-1">
          <div className="col-span-2"><label className="text-xs font-medium text-slate-600">Taller *</label>
            <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" value={envioForm.taller_id} onChange={e=>setEnvioForm(f=>({...f,taller_id:e.target.value}))}>
              <option value="">Seleccionar…</option>
              {talleres.filter(t=>t.status==='activo').map(t=><option key={t.id} value={t.id}>{t.nombre}</option>)}
            </select>
          </div>
          <div className="col-span-2"><label className="text-xs font-medium text-slate-600">Concepto *</label><Input value={envioForm.concepto} onChange={e=>setEnvioForm(f=>({...f,concepto:e.target.value}))} placeholder="Bordado de logos, estampado…" /></div>
          <div><label className="text-xs font-medium text-slate-600">Piezas enviadas *</label><Input type="number" value={envioForm.piezas_enviadas} onChange={e=>setEnvioForm(f=>({...f,piezas_enviadas:e.target.value}))} /></div>
          <div><label className="text-xs font-medium text-slate-600">Precio / pieza</label><Input type="number" value={envioForm.precio_por_pieza} onChange={e=>setEnvioForm(f=>({...f,precio_por_pieza:e.target.value}))} /></div>
          <div><label className="text-xs font-medium text-slate-600">Fecha envío *</label><Input type="date" value={envioForm.fecha_envio} onChange={e=>setEnvioForm(f=>({...f,fecha_envio:e.target.value}))} /></div>
          <div><label className="text-xs font-medium text-slate-600">Fecha compromiso</label><Input type="date" value={envioForm.fecha_compromiso} onChange={e=>setEnvioForm(f=>({...f,fecha_compromiso:e.target.value}))} /></div>
          <div className="col-span-2"><label className="text-xs font-medium text-slate-600">Observaciones</label><Input value={envioForm.observaciones} onChange={e=>setEnvioForm(f=>({...f,observaciones:e.target.value}))} /></div>
        </div>
        <div className="flex justify-end gap-3 pt-4 border-t mt-4">
          <Button variant="secondary" onClick={()=>setEnvioOpen(false)}>Cancelar</Button>
          <Button onClick={saveEnvio} disabled={saving||!envioForm.taller_id||!envioForm.concepto||!envioForm.piezas_enviadas}>{saving?'Guardando…':'Enviar'}</Button>
        </div>
      </Modal>

      {/* Modal recepción */}
      <Modal isOpen={!!editEnvio} onClose={()=>setEditEnvio(null)} title="Registrar recepción">
        <p className="text-sm text-slate-600 mb-3">Enviadas: <strong>{editEnvio?.piezas_enviadas}</strong> pzas · Taller: <strong>{editEnvio?.taller?.nombre}</strong></p>
        <div className="space-y-3">
          <div><label className="text-xs font-medium text-slate-600">Piezas recibidas</label><Input type="number" max={editEnvio?.piezas_enviadas} value={recepcionForm.piezas_recibidas} onChange={e=>setRecepcionForm(f=>({...f,piezas_recibidas:e.target.value}))} /></div>
          <div><label className="text-xs font-medium text-slate-600">Fecha recepción</label><Input type="date" value={recepcionForm.fecha_recepcion} onChange={e=>setRecepcionForm(f=>({...f,fecha_recepcion:e.target.value}))} /></div>
          <div><label className="text-xs font-medium text-slate-600">Estado</label>
            <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" value={recepcionForm.status} onChange={e=>setRecepcionForm(f=>({...f,status:e.target.value}))}>
              <option value="recibido_parcial">Recibido parcial</option>
              <option value="recibido">Recibido completo</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-4 border-t mt-4">
          <Button variant="secondary" onClick={()=>setEditEnvio(null)}>Cancelar</Button>
          <Button onClick={registrarRecepcion} disabled={saving}>{saving?'Guardando…':'Confirmar'}</Button>
        </div>
      </Modal>
    </div>
  )
}
