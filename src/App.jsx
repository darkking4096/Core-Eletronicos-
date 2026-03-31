import { useState, useEffect, useCallback } from 'react'
import { supabase } from './lib/supabase.js'
import { formatMoney, parseMoney, formatDate, today, daysAgo, genId } from './utils/formatters.js'
import { TIPOS_CUSTO, CATEGORIAS_CUSTO, TIPOS_ACESSORIO, FORMAS_PAGAMENTO, MARCAS_TROCA, CAPACIDADES, MARCAS_APARELHO, TIPO_VENDA, getTaxaPercent } from './utils/constants.js'
import { obterGarantia, calcGarantiaDate } from './utils/garantias.js'
import { gerarHTMLRecibo, gerarPDF } from './utils/pdfTemplates.js'

// ─────────────────────────────────────────────
// ESTILOS GLOBAIS
// ─────────────────────────────────────────────
const S = {
  app: { display: 'flex', minHeight: '100vh', background: '#0f172a' },
  sidebar: { width: 220, background: '#1e293b', borderRight: '1px solid #334155', display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, height: '100vh', zIndex: 100 },
  sidebarLogo: { padding: '20px 16px 16px', borderBottom: '1px solid #334155' },
  logoTitle: { fontSize: 16, fontWeight: 700, color: '#e94560', letterSpacing: 1 },
  logoSub: { fontSize: 11, color: '#64748b', marginTop: 2 },
  navList: { flex: 1, padding: '12px 0', overflowY: 'auto' },
  navGroup: { marginBottom: 4 },
  navGroupLabel: { fontSize: 10, color: '#475569', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', padding: '8px 16px 4px' },
  navItem: (active) => ({ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 16px', cursor: 'pointer', borderLeft: `3px solid ${active ? '#e94560' : 'transparent'}`, background: active ? '#0f172a' : 'transparent', color: active ? '#e2e8f0' : '#94a3b8', fontSize: 13, fontWeight: active ? 600 : 400, transition: 'all 0.15s' }),
  main: { marginLeft: 220, flex: 1, padding: 24, minHeight: '100vh' },
  pageTitle: { fontSize: 22, fontWeight: 700, color: '#e2e8f0', marginBottom: 4 },
  pageSub: { fontSize: 13, color: '#64748b', marginBottom: 20 },
  card: { background: '#1e293b', borderRadius: 12, padding: 20, border: '1px solid #334155' },
  kpiGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 24 },
  kpiCard: (color) => ({ background: '#1e293b', borderRadius: 12, padding: '16px 20px', border: `1px solid #334155`, borderTop: `3px solid ${color || '#e94560'}` }),
  kpiLabel: { fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 },
  kpiValue: (color) => ({ fontSize: 22, fontWeight: 700, color: color || '#e2e8f0' }),
  kpiSub: { fontSize: 11, color: '#475569', marginTop: 3 },
  btn: (variant) => ({
    padding: variant === 'sm' ? '6px 12px' : '10px 20px',
    borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600,
    fontSize: variant === 'sm' ? 12 : 14,
    background: variant === 'danger' ? '#dc2626' : variant === 'ghost' ? 'transparent' : '#e94560',
    color: variant === 'ghost' ? '#94a3b8' : '#fff',
    transition: 'opacity 0.15s',
  }),
  input: { width: '100%', padding: '10px 12px', background: '#0f172a', border: '1.5px solid #334155', borderRadius: 8, color: '#e2e8f0', fontSize: 14, outline: 'none' },
  select: { width: '100%', padding: '10px 12px', background: '#0f172a', border: '1.5px solid #334155', borderRadius: 8, color: '#e2e8f0', fontSize: 14, outline: 'none' },
  label: { display: 'block', fontSize: 12, color: '#94a3b8', marginBottom: 6, fontWeight: 500 },
  formGroup: { marginBottom: 16 },
  row: (cols) => ({ display: 'grid', gridTemplateColumns: cols || '1fr 1fr', gap: 14, marginBottom: 0 }),
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 13 },
  th: { padding: '10px 12px', background: '#0f172a', color: '#94a3b8', textAlign: 'left', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, borderBottom: '1px solid #334155', cursor: 'pointer', userSelect: 'none' },
  td: { padding: '10px 12px', borderBottom: '1px solid #1e293b', color: '#cbd5e1', fontSize: 13 },
  badge: (color) => ({ display: 'inline-block', padding: '3px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: color === 'green' ? '#064e3b' : color === 'blue' ? '#1e3a5f' : color === 'yellow' ? '#451a03' : color === 'red' ? '#450a0a' : '#1e293b', color: color === 'green' ? '#34d399' : color === 'blue' ? '#60a5fa' : color === 'yellow' ? '#fbbf24' : color === 'red' ? '#f87171' : '#94a3b8' }),
  modal: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 },
  modalBox: { background: '#1e293b', borderRadius: 16, padding: 28, width: '100%', maxWidth: 640, maxHeight: '90vh', overflowY: 'auto', border: '1px solid #334155' },
  tabs: { display: 'flex', gap: 4, marginBottom: 20, borderBottom: '1px solid #334155', paddingBottom: 0 },
  tab: (active) => ({ padding: '8px 16px', cursor: 'pointer', fontSize: 13, fontWeight: active ? 600 : 400, color: active ? '#e94560' : '#64748b', borderBottom: `2px solid ${active ? '#e94560' : 'transparent'}`, marginBottom: -1, transition: 'all 0.15s', background: 'none', border: 'none' }),
  filterRow: { display: 'flex', gap: 10, marginBottom: 20, alignItems: 'center', flexWrap: 'wrap' },
  filterBtn: (active) => ({ padding: '6px 14px', borderRadius: 20, border: `1px solid ${active ? '#e94560' : '#334155'}`, background: active ? '#e94560' : 'transparent', color: active ? '#fff' : '#94a3b8', fontSize: 12, cursor: 'pointer', fontWeight: active ? 600 : 400 }),
}

// ─────────────────────────────────────────────
// COMPONENTES UTILITÁRIOS
// ─────────────────────────────────────────────
function Modal({ open, onClose, title, children, wide }) {
  if (!open) return null
  return (
    <div style={S.modal} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ ...S.modalBox, maxWidth: wide ? 820 : 640 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#e2e8f0' }}>{title}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: 22, cursor: 'pointer' }}>×</button>
        </div>
        {children}
      </div>
    </div>
  )
}

function ConfirmModal({ open, msg, onConfirm, onCancel }) {
  if (!open) return null
  return (
    <div style={S.modal}>
      <div style={{ ...S.modalBox, maxWidth: 380, textAlign: 'center' }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>⚠️</div>
        <div style={{ fontSize: 16, color: '#e2e8f0', fontWeight: 600, marginBottom: 8 }}>Confirmar exclusão</div>
        <div style={{ fontSize: 14, color: '#94a3b8', marginBottom: 24 }}>{msg}</div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <button style={S.btn('ghost')} onClick={onCancel}>Cancelar</button>
          <button style={S.btn('danger')} onClick={onConfirm}>Excluir</button>
        </div>
      </div>
    </div>
  )
}

function ResetModal({ open, title, msg, onConfirm, onCancel }) {
  const [texto, setTexto] = useState('')
  if (!open) return null
  const ok = texto === 'CONFIRMAR'
  return (
    <div style={S.modal}>
      <div style={{ ...S.modalBox, maxWidth: 440, textAlign: 'center' }}>
        <div style={{ fontSize: 44, marginBottom: 12 }}>🚨</div>
        <div style={{ fontSize: 17, color: '#f87171', fontWeight: 700, marginBottom: 8 }}>{title}</div>
        <div style={{ fontSize: 14, color: '#94a3b8', marginBottom: 20 }}>{msg}</div>
        <div style={{ marginBottom: 20, textAlign: 'left' }}>
          <label style={{ ...S.label, color: '#f87171' }}>Digite CONFIRMAR para prosseguir:</label>
          <input
            style={{ ...S.input, borderColor: ok ? '#16a34a' : '#334155', textAlign: 'center', letterSpacing: 3, fontWeight: 700 }}
            value={texto}
            onChange={e => setTexto(e.target.value.toUpperCase())}
            placeholder="CONFIRMAR"
            autoFocus
          />
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <button style={S.btn('ghost')} onClick={() => { setTexto(''); onCancel(); }}>Cancelar</button>
          <button
            style={{ ...S.btn('danger'), opacity: ok ? 1 : 0.35, cursor: ok ? 'pointer' : 'not-allowed' }}
            onClick={() => { if (ok) { setTexto(''); onConfirm(); } }}
          >
            Zerar dados
          </button>
        </div>
      </div>
    </div>
  )
}

function BulkDeleteModal({ open, title, count, onConfirm, onCancel, children }) {
  const [texto, setTexto] = useState('')
  if (!open) return null
  const ok = texto === 'CONFIRMAR' && count > 0
  return (
    <div style={S.modal}>
      <div style={{ ...S.modalBox, maxWidth: 480 }}>
        <div style={{ fontSize: 36, marginBottom: 10, textAlign: 'center' }}>🗑️</div>
        <div style={{ fontSize: 17, color: '#f87171', fontWeight: 700, marginBottom: 16, textAlign: 'center' }}>{title}</div>
        {children}
        <div style={{ background: '#0f172a', borderRadius: 8, padding: '10px 16px', marginBottom: 16, textAlign: 'center' }}>
          <span style={{ color: count > 0 ? '#f87171' : '#64748b', fontWeight: 700, fontSize: 14 }}>
            {count > 0 ? `⚠️ ${count} registro(s) serão excluídos permanentemente` : '— Nenhum registro encontrado com esses filtros —'}
          </span>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ ...S.label, color: '#f87171' }}>Digite CONFIRMAR para prosseguir:</label>
          <input
            style={{ ...S.input, borderColor: ok ? '#16a34a' : '#334155', textAlign: 'center', letterSpacing: 3, fontWeight: 700 }}
            value={texto}
            onChange={e => setTexto(e.target.value.toUpperCase())}
            placeholder="CONFIRMAR"
            autoFocus
          />
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <button style={S.btn('ghost')} onClick={() => { setTexto(''); onCancel(); }}>Cancelar</button>
          <button
            style={{ ...S.btn('danger'), opacity: ok ? 1 : 0.35, cursor: ok ? 'pointer' : 'not-allowed' }}
            onClick={() => { if (ok) { setTexto(''); onConfirm(); } }}
          >
            Excluir {count} registro(s)
          </button>
        </div>
      </div>
    </div>
  )
}

function DateFilter({ value, onChange }) {
  const [custom, setCustom] = useState(false)
  const [start, setStart] = useState(daysAgo(30))
  const [end, setEnd] = useState(today())

  function apply(type) {
    setCustom(false)
    if (type === '7') onChange({ start: daysAgo(7), end: today(), label: '7 dias' })
    else if (type === '30') onChange({ start: daysAgo(30), end: today(), label: '30 dias' })
    else if (type === 'custom') setCustom(true)
  }

  function applyCustom() {
    onChange({ start, end, label: `${formatDate(start)} a ${formatDate(end)}` })
    setCustom(false)
  }

  const presets = [
    { key: '7', label: '7 dias' },
    { key: '30', label: '30 dias' },
    { key: 'custom', label: 'Personalizado' },
  ]

  return (
    <div style={S.filterRow}>
      <span style={{ fontSize: 12, color: '#64748b' }}>Período:</span>
      {presets.map(p => (
        <button key={p.key} style={S.filterBtn(value?.label === p.label)} onClick={() => apply(p.key)}>{p.label}</button>
      ))}
      {value?.label && !presets.some(p => p.label === value.label) &&
        <span style={S.badge('blue')}>{value.label}</span>}
      {custom && (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input type="date" value={start} onChange={e => setStart(e.target.value)} style={{ ...S.input, width: 140 }} />
          <span style={{ color: '#64748b' }}>até</span>
          <input type="date" value={end} onChange={e => setEnd(e.target.value)} style={{ ...S.input, width: 140 }} />
          <button style={S.btn()} onClick={applyCustom}>Aplicar</button>
        </div>
      )}
    </div>
  )
}

function SortableTable({ columns, data, onEdit, onDelete, onView }) {
  const [sortCol, setSortCol] = useState(null)
  const [sortDir, setSortDir] = useState('asc')

  function handleSort(col) {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortCol(col); setSortDir('asc') }
  }

  const sorted = sortCol ? [...data].sort((a, b) => {
    let av = a[sortCol], bv = b[sortCol]
    if (typeof av === 'string') av = av.toLowerCase()
    if (typeof bv === 'string') bv = bv.toLowerCase()
    if (av < bv) return sortDir === 'asc' ? -1 : 1
    if (av > bv) return sortDir === 'asc' ? 1 : -1
    return 0
  }) : data

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={S.table}>
        <thead>
          <tr>
            {columns.map(c => (
              <th key={c.key} style={S.th} onClick={() => handleSort(c.key)}>
                {c.label} {sortCol === c.key ? (sortDir === 'asc' ? '↑' : '↓') : ''}
              </th>
            ))}
            {(onEdit || onDelete || onView) && <th style={S.th}>Ações</th>}
          </tr>
        </thead>
        <tbody>
          {sorted.length === 0 && (
            <tr><td colSpan={columns.length + 1} style={{ ...S.td, textAlign: 'center', color: '#475569', padding: 32 }}>Nenhum registro encontrado</td></tr>
          )}
          {sorted.map((row, i) => (
            <tr key={row.id || i} style={{ background: i % 2 === 0 ? 'transparent' : '#0f172a22' }}>
              {columns.map(c => (
                <td key={c.key} style={S.td}>
                  {c.render ? c.render(row[c.key], row) : (row[c.key] ?? '-')}
                </td>
              ))}
              {(onEdit || onDelete || onView) && (
                <td style={S.td}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {onView && <button style={S.btn('sm')} onClick={() => onView(row)}>Ver</button>}
                    {onEdit && <button style={{ ...S.btn('sm'), background: '#1d4ed8' }} onClick={() => onEdit(row)}>Editar</button>}
                    {onDelete && <button style={{ ...S.btn('sm'), background: '#dc2626' }} onClick={() => onDelete(row)}>Excluir</button>}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Autocomplete({ value, onChange, options, placeholder, getLabel }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState(value || '')
  const label = getLabel || (o => o)

  // Sincroniza o campo interno quando o valor externo muda (ex: ao limpar formulário)
  useEffect(() => {
    setQuery(value || '')
  }, [value])

  const filtered = query.length >= 1
    ? options.filter(o => label(o).toLowerCase().includes(query.toLowerCase())).slice(0, 8)
    : []

  function handleSelect(o) {
    onChange(o)
    setQuery(label(o))
    setOpen(false)
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (filtered.length > 0) {
        // Seleciona o primeiro resultado da lista
        handleSelect(filtered[0])
      } else {
        // Tenta busca exata por código (sem sugestões) e dispara onChange com string
        onChange(query)
        setOpen(false)
      }
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <div style={{ position: 'relative' }}>
      <input
        style={S.input}
        value={query}
        placeholder={placeholder}
        onChange={e => { setQuery(e.target.value); setOpen(true); onChange(e.target.value) }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onKeyDown={handleKeyDown}
      />
      {open && filtered.length > 0 && (
        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#0f172a', border: '1px solid #334155', borderRadius: 8, zIndex: 200, maxHeight: 220, overflowY: 'auto' }}>
          {filtered.map((o, i) => (
            <div key={i} style={{ padding: '8px 12px', cursor: 'pointer', color: '#e2e8f0', fontSize: 13, borderBottom: '1px solid #1e293b' }}
              onMouseDown={() => handleSelect(o)}>
              {label(o)}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────
// PÁGINA: DASHBOARD
// ─────────────────────────────────────────────
function Dashboard({ db }) {
  const [filter, setFilter] = useState({ start: daysAgo(30), end: today(), label: '30 dias' })
  const [data, setData] = useState(null)

  useEffect(() => {
    const vendas = (db.vendas || []).filter(v => v.data_venda >= filter.start && v.data_venda <= filter.end)
    const custos = (db.custos || []).filter(c => c.data >= filter.start && c.data <= filter.end)

    const totalVendas = vendas.length
    const lucroPorVenda = vendas.reduce((s, v) => s + (Number(v.lucro_venda) || 0), 0)
    const custosOp = custos.filter(c => c.tipo !== 'ESTOQUE DE APARELHOS' && c.tipo !== 'ACESSÓRIOS').reduce((s, c) => s + (Number(c.valor) || 0), 0)
    const lucroReal = lucroPorVenda - custosOp
    // Investimento = estoque atual (todos os aparelhos restantes + acessórios com quantidade > 0)
    const investAp = (db.estoque_aparelhos || []).reduce((s, e) => s + (Number(e.custo) || 0), 0)
    const investAc = (db.estoque_acessorios || []).filter(e => Number(e.quantidade) > 0).reduce((s, e) => s + (Number(e.quantidade) * Number(e.custo_unitario) || 0), 0)

    // Gastos por categoria
    const gastosPorTipo = {}
    TIPOS_CUSTO.forEach(t => {
      const val = custos.filter(c => c.tipo === t).reduce((s, c) => s + (Number(c.valor) || 0), 0)
      if (val > 0) gastosPorTipo[t] = val
    })

    setData({ totalVendas, lucroPorVenda, custosOp, lucroReal, investAp, investAc, totalInvest: investAp + investAc, gastosPorTipo, custos })
  }, [filter, db])

  if (!data) return <div style={{ color: '#64748b' }}>Carregando...</div>

  return (
    <div>
      <div style={S.pageTitle}>Dashboard</div>
      <div style={S.pageSub}>Visão geral financeira do período</div>
      <DateFilter value={filter} onChange={setFilter} />
      <div style={S.kpiGrid}>
        <div style={S.kpiCard('#3b82f6')}>
          <div style={S.kpiLabel}>Vendas no Período</div>
          <div style={S.kpiValue('#60a5fa')}>{data.totalVendas}</div>
        </div>
        <div style={S.kpiCard('#10b981')}>
          <div style={S.kpiLabel}>Lucro por Venda</div>
          <div style={S.kpiValue('#34d399')}>{formatMoney(data.lucroPorVenda)}</div>
          <div style={S.kpiSub}>Sem descontar custos op.</div>
        </div>
        <div style={S.kpiCard('#f59e0b')}>
          <div style={S.kpiLabel}>Custos Operacionais</div>
          <div style={S.kpiValue('#fbbf24')}>{formatMoney(data.custosOp)}</div>
        </div>
        <div style={S.kpiCard(data.lucroReal >= 0 ? '#10b981' : '#ef4444')}>
          <div style={S.kpiLabel}>Lucro Real</div>
          <div style={S.kpiValue(data.lucroReal >= 0 ? '#34d399' : '#f87171')}>{formatMoney(data.lucroReal)}</div>
          <div style={S.kpiSub}>Lucro/Venda - Custos Op.</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        <div style={S.card}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#e2e8f0', marginBottom: 14 }}>Investimentos no Período</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#0f172a', borderRadius: 8 }}>
              <span style={{ color: '#94a3b8', fontSize: 13 }}>Estoque de Aparelhos</span>
              <span style={{ color: '#60a5fa', fontWeight: 600 }}>{formatMoney(data.investAp)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#0f172a', borderRadius: 8 }}>
              <span style={{ color: '#94a3b8', fontSize: 13 }}>Estoque de Acessórios</span>
              <span style={{ color: '#a78bfa', fontWeight: 600 }}>{formatMoney(data.investAc)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: '#1d4ed822', borderRadius: 8, borderTop: '1px solid #334155' }}>
              <span style={{ color: '#e2e8f0', fontWeight: 700, fontSize: 13 }}>Total Investido</span>
              <span style={{ color: '#e2e8f0', fontWeight: 700 }}>{formatMoney(data.totalInvest)}</span>
            </div>
          </div>
        </div>
        <div style={S.card}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#e2e8f0', marginBottom: 14 }}>Gastos por Categoria</div>
          <div style={{ maxHeight: 200, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
            {Object.keys(data.gastosPorTipo).length === 0 && <div style={{ color: '#475569', fontSize: 13 }}>Nenhum gasto no período</div>}
            {Object.entries(data.gastosPorTipo).sort((a, b) => b[1] - a[1]).map(([tipo, val]) => (
              <div key={tipo} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', background: '#0f172a', borderRadius: 6 }}>
                <span style={{ color: '#94a3b8', fontSize: 12 }}>{tipo}</span>
                <span style={{ color: '#fbbf24', fontWeight: 600, fontSize: 12 }}>{formatMoney(val)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// PÁGINA: ESTOQUE APARELHOS
// ─────────────────────────────────────────────
function EstoqueAparelhos({ db, refresh }) {
  const [tab, setTab] = useState('cadastro')
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [form, setForm] = useState({})
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const [confirmItem, setConfirmItem] = useState(null)
  const [bulkOpen, setBulkOpen] = useState(false)
  const [bulkDataAte, setBulkDataAte] = useState('')

  function openModal(item = null) {
    setEditItem(item)
    setForm(item ? { ...item } : { cod: '', marca: '', modelo: '', capacidade: '', cor: '', custo: '', data_aquisicao: today() })
    setModalOpen(true)
    setMsg('')
  }

  async function salvar() {
    // Para cadastro, código é obrigatório. Para estoque, é opcional (gerado automaticamente)
    if (tab === 'cadastro' && (!form.cod || !form.marca || !form.modelo || !form.capacidade || !form.cor)) {
      setMsg('Preencha todos os campos obrigatórios')
      return
    }
    if (tab === 'estoque' && (!form.marca || !form.modelo || !form.capacidade || !form.cor)) {
      setMsg('Preencha marca, modelo, capacidade e cor')
      return
    }
    setLoading(true)
    try {
      if (tab === 'cadastro') {
        // Salvar em cadastro_aparelhos
        const data = { cod: form.cod.toUpperCase(), marca: form.marca, modelo: form.modelo.toUpperCase(), capacidade: form.capacidade, cor: form.cor.toUpperCase() }
        if (editItem) {
          await supabase.from('cadastro_aparelhos').update(data).eq('id', editItem.id)
        } else {
          await supabase.from('cadastro_aparelhos').insert(data)
        }
      } else {
        // Salvar em estoque_aparelhos + auto-cadastro
        if (!form.custo || !form.data_aquisicao) { setMsg('Informe custo e data'); setLoading(false); return }

        // Determinar código base (ex: AP001)
        let baseCod = form.cod ? form.cod.split('-')[0].toUpperCase() : null
        if (!baseCod) {
          // Gerar novo código base automaticamente
          const existingCods = (db.cadastro_aparelhos || []).map(c => c.cod).filter(c => /^AP\d+$/.test(c))
          const maxNum = existingCods.length > 0 ? Math.max(...existingCods.map(c => parseInt(c.replace('AP', '')))) : 0
          baseCod = 'AP' + String(maxNum + 1).padStart(3, '0')
        }

        // Criar cadastro se não existir
        const cadastroExiste = (db.cadastro_aparelhos || []).some(c => c.cod === baseCod)
        if (!cadastroExiste) {
          await supabase.from('cadastro_aparelhos').insert({ cod: baseCod, marca: form.marca, modelo: form.modelo.toUpperCase(), capacidade: form.capacidade, cor: form.cor.toUpperCase() })
        }

        // Determinar código de instância (ex: AP001-001)
        let instanceCod = form.cod ? form.cod.toUpperCase() : null
        if (!instanceCod || !instanceCod.includes('-')) {
          const existingInstances = (db.estoque_aparelhos || []).map(e => e.cod).filter(c => c.startsWith(baseCod + '-'))
          const maxInst = existingInstances.length > 0 ? Math.max(...existingInstances.map(c => parseInt(c.split('-')[1] || 0))) : 0
          instanceCod = baseCod + '-' + String(maxInst + 1).padStart(3, '0')
        }

        const data = { cod: instanceCod, marca: form.marca, modelo: form.modelo.toUpperCase(), capacidade: form.capacidade, cor: form.cor.toUpperCase(), custo: Number(form.custo), data_aquisicao: form.data_aquisicao, status: 'disponivel' }
        if (editItem) {
          await supabase.from('estoque_aparelhos').update(data).eq('id', editItem.id)
        } else {
          await supabase.from('estoque_aparelhos').insert(data)
        }
      }
      setModalOpen(false)
      refresh()
    } catch (e) { setMsg('Erro: ' + e.message) }
    setLoading(false)
  }

  function excluir(item) { setConfirmItem(item) }

  async function doExcluir(item) {
    const tbl = tab === 'cadastro' ? 'cadastro_aparelhos' : 'estoque_aparelhos'
    await supabase.from(tbl).delete().eq('id', item.id)
    setConfirmItem(null)
    refresh()
  }

  const bulkPreview = (db.estoque_aparelhos || []).filter(item => {
    if (bulkDataAte && item.data_aquisicao > bulkDataAte) return false
    return true
  })

  async function doBulkDelete() {
    const ids = bulkPreview.map(i => i.id)
    if (ids.length === 0) return
    await supabase.from('estoque_aparelhos').delete().in('id', ids)
    setBulkOpen(false)
    refresh()
  }

  // Autocomplete cadastro para preencher ao digitar código no estoque
  function onCodChange(val) {
    const cod = typeof val === 'string' ? val : val.cod
    setForm(f => {
      const base = cod.split('-')[0].toUpperCase()
      const cat = (db.cadastro_aparelhos || []).find(c => c.cod === base)
      return { ...f, cod: typeof val === 'string' ? val : cod, ...(cat ? { marca: cat.marca, modelo: cat.modelo, capacidade: cat.capacidade, cor: cat.cor } : {}) }
    })
  }

  const colsCadastro = [
    { key: 'cod', label: 'Código' },
    { key: 'marca', label: 'Marca' },
    { key: 'modelo', label: 'Modelo' },
    { key: 'capacidade', label: 'Capacidade' },
    { key: 'cor', label: 'Cor' },
  ]

  const colsEstoque = [
    { key: 'cod', label: 'Código' },
    { key: 'marca', label: 'Marca' },
    { key: 'modelo', label: 'Modelo' },
    { key: 'capacidade', label: 'Cap.' },
    { key: 'cor', label: 'Cor' },
    { key: 'custo', label: 'Custo', render: v => formatMoney(v) },
    { key: 'data_aquisicao', label: 'Aquisição', render: v => formatDate(v) },
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <div style={S.pageTitle}>Estoque de Aparelhos</div>
          <div style={S.pageSub}>Cadastro e controle de unidades</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {tab === 'estoque' && (
            <button style={S.btn('danger')} onClick={() => setBulkOpen(true)}>🗑️ Excluir em Lote</button>
          )}
          <button style={S.btn()} onClick={() => openModal()}>+ Adicionar</button>
        </div>
      </div>
      <div style={S.tabs}>
        <button style={S.tab(tab === 'cadastro')} onClick={() => setTab('cadastro')}>Cadastro de Produtos</button>
        <button style={S.tab(tab === 'estoque')} onClick={() => setTab('estoque')}>Estoque</button>
      </div>
      <div style={S.card}>
        <SortableTable
          columns={tab === 'cadastro' ? colsCadastro : colsEstoque}
          data={tab === 'cadastro' ? (db.cadastro_aparelhos || []) : (db.estoque_aparelhos || [])}
          onEdit={openModal}
          onDelete={excluir}
        />
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Editar' : (tab === 'cadastro' ? 'Novo Cadastro' : 'Adicionar ao Estoque')}>
        {tab === 'estoque' && (
          <div style={S.formGroup}>
            <label style={S.label}>Código do Aparelho *</label>
            <Autocomplete
              value={form.cod || ''}
              onChange={onCodChange}
              options={db.cadastro_aparelhos || []}
              placeholder="Ex: AP001 — digite para buscar do cadastro"
              getLabel={o => typeof o === 'string' ? o : `${o.cod} - ${o.marca} ${o.modelo} ${o.capacidade} ${o.cor}`}
            />
            <div style={{ fontSize: 11, color: '#475569', marginTop: 4 }}>Digite o código e pressione Enter para preencher os campos automaticamente</div>
          </div>
        )}
        {tab === 'cadastro' && (
          <div style={S.formGroup}>
            <label style={S.label}>Código *</label>
            <input style={S.input} value={form.cod || ''} onChange={e => setForm(f => ({ ...f, cod: e.target.value.toUpperCase() }))} placeholder="Ex: AP001" />
          </div>
        )}
        <div style={S.row('1fr 1fr')}>
          <div style={S.formGroup}>
            <label style={S.label}>Marca *</label>
            <select style={S.select} value={form.marca || ''} onChange={e => setForm(f => ({ ...f, marca: e.target.value }))}>
              <option value="">Selecione...</option>
              {MARCAS_APARELHO.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div style={S.formGroup}>
            <label style={S.label}>Modelo *</label>
            <input style={S.input} value={form.modelo || ''} onChange={e => setForm(f => ({ ...f, modelo: e.target.value.toUpperCase() }))} placeholder="Ex: NOTE 14 PRO 5G" />
          </div>
        </div>
        <div style={S.row('1fr 1fr')}>
          <div style={S.formGroup}>
            <label style={S.label}>Capacidade *</label>
            <select style={S.select} value={form.capacidade || ''} onChange={e => setForm(f => ({ ...f, capacidade: e.target.value }))}>
              <option value="">Selecione...</option>
              {CAPACIDADES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div style={S.formGroup}>
            <label style={S.label}>Cor *</label>
            <input style={S.input} value={form.cor || ''} onChange={e => setForm(f => ({ ...f, cor: e.target.value.toUpperCase() }))} placeholder="Ex: PRETO" />
          </div>
        </div>
        {tab === 'estoque' && (
          <div style={S.row('1fr 1fr')}>
            <div style={S.formGroup}>
              <label style={S.label}>Custo de Aquisição (R$) *</label>
              <input style={S.input} type="number" value={form.custo || ''} onChange={e => setForm(f => ({ ...f, custo: e.target.value }))} placeholder="0.00" />
            </div>
            <div style={S.formGroup}>
              <label style={S.label}>Data de Aquisição *</label>
              <input style={S.input} type="date" value={form.data_aquisicao || today()} onChange={e => setForm(f => ({ ...f, data_aquisicao: e.target.value }))} />
            </div>
          </div>
        )}
        {msg && <div style={{ color: '#f87171', fontSize: 13, marginBottom: 12 }}>{msg}</div>}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button style={S.btn('ghost')} onClick={() => setModalOpen(false)}>Cancelar</button>
          <button style={S.btn()} onClick={salvar} disabled={loading}>{loading ? 'Salvando...' : 'Salvar'}</button>
        </div>
      </Modal>
      <ConfirmModal open={!!confirmItem} msg={`Excluir ${confirmItem?.cod}?`} onConfirm={() => doExcluir(confirmItem)} onCancel={() => setConfirmItem(null)} />

      <BulkDeleteModal
        open={bulkOpen}
        title="Excluir Aparelhos em Lote"
        count={bulkPreview.length}
        onConfirm={doBulkDelete}
        onCancel={() => setBulkOpen(false)}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
          <div style={S.formGroup}>
            <label style={S.label}>Adquiridos até (opcional)</label>
            <input style={S.input} type="date" value={bulkDataAte} onChange={e => setBulkDataAte(e.target.value)} />
            {bulkDataAte && <span style={{ fontSize: 11, color: '#64748b', marginTop: 3, display: 'block' }}>← remove esse filtro para não limitar por data</span>}
          </div>
        </div>
      </BulkDeleteModal>
    </div>
  )
}

// ─────────────────────────────────────────────
// PÁGINA: ESTOQUE ACESSÓRIOS
// ─────────────────────────────────────────────
function EstoqueAcessorios({ db, refresh }) {
  const [tab, setTab] = useState('cadastro')
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [form, setForm] = useState({})
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const [confirmItem, setConfirmItem] = useState(null)
  const [bulkOpen, setBulkOpen] = useState(false)
  const [bulkQtdMax, setBulkQtdMax] = useState('0')
  const [bulkDataAte, setBulkDataAte] = useState('')

  function openModal(item = null) {
    setEditItem(item)
    setForm(item ? { ...item } : { cod: '', tipo: '', descricao: '', quantidade: 1, custo_unitario: '', data_aquisicao: today(), tipoEntrada: 'novo' })
    setModalOpen(true)
    setMsg('')
  }

  async function salvar() {
    setLoading(true)
    try {
      if (tab === 'cadastro') {
        // Gerar código automaticamente se não preenchido
        let cod = form.cod ? form.cod.toUpperCase() : null
        if (!cod) {
          const existingCods = (db.cadastro_acessorios || []).map(c => c.cod).filter(c => /^AC\d+$/.test(c))
          const maxNum = existingCods.length > 0 ? Math.max(...existingCods.map(c => parseInt(c.replace('AC', '')))) : 0
          cod = 'AC' + String(maxNum + 1).padStart(3, '0')
        }
        const data = { cod, tipo: form.tipo, descricao: (form.descricao || '').toUpperCase(), preco_venda: Number(form.preco_venda) || 0 }
        if (editItem) await supabase.from('cadastro_acessorios').update(data).eq('id', editItem.id)
        else await supabase.from('cadastro_acessorios').insert(data)
      } else {
        if (!form.quantidade || !form.custo_unitario || !form.data_aquisicao) { setMsg('Preencha todos os campos'); setLoading(false); return }

        // Gerar código automaticamente se não preenchido
        let cod = form.cod ? form.cod.toUpperCase() : null
        let descricao = form.descricao || ''
        let tipo = form.tipo || ''
        if (!cod) {
          const existingCods = (db.cadastro_acessorios || []).map(c => c.cod).filter(c => /^AC\d+$/.test(c))
          const maxNum = existingCods.length > 0 ? Math.max(...existingCods.map(c => parseInt(c.replace('AC', '')))) : 0
          cod = 'AC' + String(maxNum + 1).padStart(3, '0')
          // Criar no cadastro também se não existir
          const cadastroExiste = (db.cadastro_acessorios || []).some(c => c.cod === cod)
          if (!cadastroExiste) {
            await supabase.from('cadastro_acessorios').insert({ cod, tipo, descricao: descricao.toUpperCase() })
          }
        } else {
          // Buscar descrição do cadastro se não preenchida
          const cat = (db.cadastro_acessorios || []).find(c => c.cod === cod)
          if (cat) { descricao = descricao || cat.descricao; tipo = tipo || cat.tipo }
        }

        const data = { cod, tipo, descricao: descricao.toUpperCase(), quantidade: Number(form.quantidade), custo_unitario: Number(form.custo_unitario), data_aquisicao: form.data_aquisicao }
        if (editItem) await supabase.from('estoque_acessorios').update(data).eq('id', editItem.id)
        else await supabase.from('estoque_acessorios').insert(data)
      }
      setModalOpen(false)
      refresh()
    } catch (e) { setMsg('Erro: ' + e.message) }
    setLoading(false)
  }

  function excluir(item) { setConfirmItem(item) }

  async function doExcluir(item) {
    const tbl = tab === 'cadastro' ? 'cadastro_acessorios' : 'estoque_acessorios'
    await supabase.from(tbl).delete().eq('id', item.id)
    setConfirmItem(null)
    refresh()
  }

  const bulkPreviewAcess = (db.estoque_acessorios || []).filter(item => {
    const hasQtd = bulkQtdMax !== ''
    const hasDate = !!bulkDataAte
    if (!hasQtd && !hasDate) return false
    if (hasQtd && Number(item.quantidade) > Number(bulkQtdMax)) return false
    if (hasDate && item.data_aquisicao > bulkDataAte) return false
    return true
  })

  async function doBulkDeleteAcess() {
    const ids = bulkPreviewAcess.map(i => i.id)
    if (ids.length === 0) return
    await supabase.from('estoque_acessorios').delete().in('id', ids)
    setBulkOpen(false)
    refresh()
  }

  function onCodSelect(val) {
    const cod = typeof val === 'string' ? val : val.cod
    const cat = (db.cadastro_acessorios || []).find(c => c.cod === cod.toUpperCase())
    setForm(f => ({ ...f, cod, ...(cat ? { tipo: cat.tipo, descricao: cat.descricao } : {}) }))
  }

  const colsCadastro = [
    { key: 'cod', label: 'Código' },
    { key: 'tipo', label: 'Tipo' },
    { key: 'descricao', label: 'Descrição' },
    { key: 'preco_venda', label: 'Preço Venda', render: v => v > 0 ? formatMoney(v) : '-' },
  ]

  const colsEstoque = [
    { key: 'cod', label: 'Código' },
    { key: 'tipo', label: 'Tipo' },
    { key: 'descricao', label: 'Descrição' },
    { key: 'quantidade', label: 'Qtd' },
    { key: 'custo_unitario', label: 'Custo Unit.', render: v => formatMoney(v) },
    { key: 'custo_total', label: 'Total', render: (_, r) => formatMoney(Number(r.quantidade) * Number(r.custo_unitario)) },
    { key: 'data_aquisicao', label: 'Aquisição', render: v => formatDate(v) },
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <div style={S.pageTitle}>Estoque de Acessórios</div>
          <div style={S.pageSub}>Cadastro e entradas de acessórios</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {tab === 'estoque' && (
            <button style={S.btn('danger')} onClick={() => setBulkOpen(true)}>🗑️ Excluir em Lote</button>
          )}
          <button style={S.btn()} onClick={() => openModal()}>+ Adicionar</button>
        </div>
      </div>
      <div style={S.tabs}>
        <button style={S.tab(tab === 'cadastro')} onClick={() => setTab('cadastro')}>Cadastro</button>
        <button style={S.tab(tab === 'estoque')} onClick={() => setTab('estoque')}>Estoque</button>
      </div>
      <div style={S.card}>
        <SortableTable
          columns={tab === 'cadastro' ? colsCadastro : colsEstoque}
          data={tab === 'cadastro' ? (db.cadastro_acessorios || []) : (db.estoque_acessorios || [])}
          onEdit={openModal}
          onDelete={excluir}
        />
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Editar' : (tab === 'cadastro' ? 'Novo Acessório' : 'Nova Entrada de Estoque')}>
        <div style={S.formGroup}>
          <label style={S.label}>Código *</label>
          {tab === 'estoque' ? (
            <Autocomplete
              value={form.cod || ''}
              onChange={onCodSelect}
              options={db.cadastro_acessorios || []}
              placeholder="Ex: AC001"
              getLabel={o => typeof o === 'string' ? o : o.cod + ' - ' + o.descricao}
            />
          ) : (
            <input style={S.input} value={form.cod || ''} onChange={e => setForm(f => ({ ...f, cod: e.target.value.toUpperCase() }))} placeholder="Ex: AC001" />
          )}
        </div>
        <div style={S.row('1fr 1fr')}>
          <div style={S.formGroup}>
            <label style={S.label}>Tipo *</label>
            <select style={S.select} value={form.tipo || ''} onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))}>
              <option value="">Selecione...</option>
              {TIPOS_ACESSORIO.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div style={S.formGroup}>
            <label style={S.label}>Descrição *</label>
            <input style={S.input} value={form.descricao || ''} onChange={e => setForm(f => ({ ...f, descricao: e.target.value.toUpperCase() }))} placeholder="Ex: CAPINHA XIAOMI NOTE 14" />
          </div>
        </div>
        {tab === 'cadastro' && (
          <div style={S.formGroup}>
            <label style={S.label}>Preço de Venda (R$)</label>
            <input style={S.input} type="number" step="0.01" value={form.preco_venda || ''} onChange={e => setForm(f => ({ ...f, preco_venda: e.target.value }))} placeholder="Ex: 25.00 — usado no PDF quando acessório é brinde" />
          </div>
        )}
        {tab === 'estoque' && (
          <div style={S.row('1fr 1fr 1fr')}>
            <div style={S.formGroup}>
              <label style={S.label}>Quantidade *</label>
              <input style={S.input} type="number" min="1" value={form.quantidade || 1} onChange={e => setForm(f => ({ ...f, quantidade: e.target.value }))} />
            </div>
            <div style={S.formGroup}>
              <label style={S.label}>Custo Unit. (R$) *</label>
              <input style={S.input} type="number" step="0.01" value={form.custo_unitario || ''} onChange={e => setForm(f => ({ ...f, custo_unitario: e.target.value }))} placeholder="0.00" />
            </div>
            <div style={S.formGroup}>
              <label style={S.label}>Data Aquisição *</label>
              <input style={S.input} type="date" value={form.data_aquisicao || today()} onChange={e => setForm(f => ({ ...f, data_aquisicao: e.target.value }))} />
            </div>
          </div>
        )}
        {msg && <div style={{ color: '#f87171', fontSize: 13, marginBottom: 12 }}>{msg}</div>}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button style={S.btn('ghost')} onClick={() => setModalOpen(false)}>Cancelar</button>
          <button style={S.btn()} onClick={salvar} disabled={loading}>{loading ? 'Salvando...' : 'Salvar'}</button>
        </div>
      </Modal>
      <ConfirmModal open={!!confirmItem} msg={`Excluir ${confirmItem?.cod}?`} onConfirm={() => doExcluir(confirmItem)} onCancel={() => setConfirmItem(null)} />

      <BulkDeleteModal
        open={bulkOpen}
        title="Excluir Acessórios em Lote"
        count={bulkPreviewAcess.length}
        onConfirm={doBulkDeleteAcess}
        onCancel={() => setBulkOpen(false)}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
          <div style={S.formGroup}>
            <label style={S.label}>Quantidade máxima (≤)</label>
            <input
              style={S.input}
              type="number"
              min="0"
              value={bulkQtdMax}
              onChange={e => setBulkQtdMax(e.target.value)}
              placeholder="Ex: 0 = apenas zerados"
            />
            <span style={{ fontSize: 11, color: '#64748b', marginTop: 3, display: 'block' }}>Exclui lotes com quantidade ≤ esse valor. Deixe em branco para ignorar.</span>
          </div>
          <div style={S.formGroup}>
            <label style={S.label}>Adquiridos até (opcional)</label>
            <input style={S.input} type="date" value={bulkDataAte} onChange={e => setBulkDataAte(e.target.value)} />
          </div>
        </div>
      </BulkDeleteModal>
    </div>
  )
}

// ─────────────────────────────────────────────
// PÁGINA: CUSTOS
// ─────────────────────────────────────────────
function Custos({ db, refresh }) {
  const [filter, setFilter] = useState({ start: daysAgo(30), end: today(), label: '30 dias' })
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ data: today(), tipo: '', categoria: '', valor: '', observacao: '' })
  const [confirmItem, setConfirmItem] = useState(null)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  const filtered = (db.custos || []).filter(c => c.data >= filter.start && c.data <= filter.end)

  async function salvar() {
    if (!form.data || !form.tipo || !form.categoria || !form.valor) { setMsg('Preencha todos os campos obrigatórios'); return }
    setLoading(true)
    try {
      await supabase.from('custos').insert({ data: form.data, tipo: form.tipo, categoria: form.categoria, valor: Number(form.valor), observacao: form.observacao || null })
      setModalOpen(false)
      setForm({ data: today(), tipo: '', categoria: '', valor: '', observacao: '' })
      refresh()
    } catch (e) { setMsg('Erro: ' + e.message) }
    setLoading(false)
  }

  function excluir(item) { setConfirmItem(item) }

  async function doExcluir(item) {
    await supabase.from('custos').delete().eq('id', item.id)
    setConfirmItem(null)
    refresh()
  }

  const cols = [
    { key: 'data', label: 'Data', render: v => formatDate(v) },
    { key: 'tipo', label: 'Tipo' },
    { key: 'categoria', label: 'Categoria', render: v => <span style={S.badge('yellow')}>{v}</span> },
    { key: 'valor', label: 'Valor', render: v => <span style={{ color: '#f87171', fontWeight: 600 }}>{formatMoney(v)}</span> },
    { key: 'observacao', label: 'Observação' },
  ]

  const totalFiltrado = filtered.reduce((s, c) => s + Number(c.valor), 0)

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <div style={S.pageTitle}>Custos</div>
          <div style={S.pageSub}>Controle de despesas operacionais</div>
        </div>
        <button style={S.btn()} onClick={() => { setModalOpen(true); setMsg('') }}>+ Novo Custo</button>
      </div>
      <DateFilter value={filter} onChange={setFilter} />
      <div style={{ marginBottom: 16, padding: '12px 16px', background: '#1e293b', borderRadius: 10, display: 'inline-flex', gap: 24 }}>
        <div><span style={{ color: '#64748b', fontSize: 12 }}>Total no período: </span><span style={{ color: '#f87171', fontWeight: 700 }}>{formatMoney(totalFiltrado)}</span></div>
        <div><span style={{ color: '#64748b', fontSize: 12 }}>Registros: </span><span style={{ color: '#e2e8f0', fontWeight: 700 }}>{filtered.length}</span></div>
      </div>
      <div style={S.card}>
        <SortableTable columns={cols} data={filtered} onDelete={excluir} />
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Novo Custo">
        <div style={S.row('1fr 1fr')}>
          <div style={S.formGroup}>
            <label style={S.label}>Data *</label>
            <input style={S.input} type="date" value={form.data} onChange={e => setForm(f => ({ ...f, data: e.target.value }))} />
          </div>
          <div style={S.formGroup}>
            <label style={S.label}>Valor (R$) *</label>
            <input style={S.input} type="number" step="0.01" value={form.valor} onChange={e => setForm(f => ({ ...f, valor: e.target.value }))} placeholder="0.00" />
          </div>
        </div>
        <div style={S.formGroup}>
          <label style={S.label}>Tipo de Gasto *</label>
          <select style={S.select} value={form.tipo} onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))}>
            <option value="">Selecione...</option>
            {TIPOS_CUSTO.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div style={S.formGroup}>
          <label style={S.label}>Categoria *</label>
          <div style={{ display: 'flex', gap: 10 }}>
            {CATEGORIAS_CUSTO.map(c => (
              <button key={c} style={{ ...S.filterBtn(form.categoria === c), flex: 1 }} onClick={() => setForm(f => ({ ...f, categoria: c }))}>{c}</button>
            ))}
          </div>
        </div>
        <div style={S.formGroup}>
          <label style={S.label}>Observação (opcional)</label>
          <input style={S.input} value={form.observacao} onChange={e => setForm(f => ({ ...f, observacao: e.target.value }))} placeholder="Detalhes adicionais..." />
        </div>
        {msg && <div style={{ color: '#f87171', fontSize: 13, marginBottom: 12 }}>{msg}</div>}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button style={S.btn('ghost')} onClick={() => setModalOpen(false)}>Cancelar</button>
          <button style={S.btn()} onClick={salvar} disabled={loading}>{loading ? 'Salvando...' : 'Registrar'}</button>
        </div>
      </Modal>
      <ConfirmModal open={!!confirmItem} msg="Excluir este custo?" onConfirm={() => doExcluir(confirmItem)} onCancel={() => setConfirmItem(null)} />
    </div>
  )
}

// ─────────────────────────────────────────────
// PÁGINA: VENDAS
// ─────────────────────────────────────────────
function Vendas({ db, refresh }) {
  const [tab, setTab] = useState('fisica')
  const [filter, setFilter] = useState({ start: daysAgo(30), end: today(), label: '30 dias' })
  const [modalOpen, setModalOpen] = useState(false)
  const [viewItem, setViewItem] = useState(null)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const [confirmItem, setConfirmItem] = useState(null)

  // Filtrar vendas por tipo e período
  const vendas = (db.vendas || []).filter(v => {
    const tipo = tab === 'fisica' ? 'FISICA' : tab === 'online' ? 'RECIBO' : 'ORCAMENTO'
    return v.tipo_venda === tipo && v.data_venda >= filter.start && v.data_venda <= filter.end
  })

  function openModal() { setMsg(''); setModalOpen(true) }

  function excluir(item) { setConfirmItem(item) }

  async function doExcluir(item) {
    await supabase.from('vendas').delete().eq('id', item.id)
    setConfirmItem(null)
    refresh()
  }

  function gerarPDFVenda(item) {
    let dados = item.items_json

    // ── Helpers de reconstrução ────────────────────────────────────────────
    function detectarMarca(desc) {
      const d = (desc || '').toUpperCase()
      if (d.startsWith('APPLE') || d.includes('IPHONE') || d.includes('MACBOOK') || d.includes('IPAD')) return 'APPLE'
      if (d.startsWith('SAMSUNG') || d.includes('GALAXY')) return 'SAMSUNG'
      if (d.startsWith('XIAOMI')) return 'XIAOMI'
      if (d.startsWith('POCO')) return 'POCO'
      if (d.startsWith('REDMI')) return 'REDMI'
      if (d.startsWith('MOTOROLA') || d.includes('MOTO ')) return 'MOTOROLA'
      if (d.startsWith('REALME')) return 'REALME'
      return ''
    }

    function reconstruirAparelhos() {
      const imeis = (item.observacao || '').match(/\d{10,}/g) || []
      const aparelhosDescs = item.aparelhos_descricao ? item.aparelhos_descricao.split(' | ') : []
      const qtdAp = Math.max(aparelhosDescs.length, 1)
      const precoUnit = Number(item.preco_venda) / qtdAp
      const garantiasLista = []
      const garantiasVistas = new Set()
      const aps = aparelhosDescs.map((d, i) => {
        const marca = detectarMarca(d)
        const garantia = obterGarantia(marca, d, 'novo')
        const garantiaDate = calcGarantiaDate(item.data_venda, garantia?.dias || 90)
        const imei = imeis[i] || ''
        let descFull = `CELULAR - ${d} - NOVO`
        if (imei) descFull += ` | IMEI ${imei}`
        if (garantiaDate) descFull += ` | Garantia até:${garantiaDate}`
        if (garantia && !garantiasVistas.has(garantia.titulo)) {
          garantiasVistas.add(garantia.titulo)
          garantiasLista.push(garantia)
        }
        return { descricao: descFull, qtd: 1, valorUnitario: formatMoney(precoUnit), desconto: '-', valorTotal: formatMoney(precoUnit) }
      })
      return { aparelhos: aps, garantias: garantiasLista }
    }

    function reconstruirPagamentos() {
      const pagamentosRaw = item.pagamentos ? item.pagamentos.split(' | ') : []
      return pagamentosRaw.map(p => {
        const idx = p.indexOf(': R$ ')
        const forma = idx >= 0 ? p.substring(0, idx) : p
        const valorStr = idx >= 0 ? p.substring(idx + 5).trim() : '0'
        const valorNum = valorStr.includes(',') ? parseMoney('R$ ' + valorStr) : (parseFloat(valorStr) || 0)
        return { forma, valor: formatMoney(valorNum), parcelas: '', detalhes: '' }
      })
    }

    // Reconstrução de acessórios usando custo_unitário — usado apenas quando
    // items_json é completamente nulo (sem dados do N8N)
    function reconstruirAcessorios() {
      const acessoriosCods = (item.acessorios_codigos || '').split(/[,|]/).map(c => c.trim().toUpperCase()).filter(Boolean)
      const acessoriosDescs = item.acessorios_descricao ? item.acessorios_descricao.split(' | ') : []
      return acessoriosDescs.map((d, i) => {
        const cod = acessoriosCods[i] || ''
        const estoqueAc = cod ? (db.estoque_acessorios || []).find(a => a.cod === cod) : null
        const preco = estoqueAc ? Number(estoqueAc.custo_unitario) || 0 : 0
        const qtdMatch = d.match(/^(\d+)x\s/i)
        const qtd = qtdMatch ? parseInt(qtdMatch[1]) : 1
        const subtotal = preco * qtd
        return {
          descricao: `ACESSÓRIOS - ${d}`, qtd,
          valorUnitario: preco > 0 ? formatMoney(preco) : 'R$ 0,00',
          desconto: subtotal > 0 ? formatMoney(subtotal) : '-',
          valorTotal: 'R$ 0,00'
        }
      })
    }

    // ── Validação e reparo cirúrgico do items_json ─────────────────────────
    if (dados) {
      const totalJsonPags = (dados.pagamentos || [])
        .filter(p => !String(p.forma || '').toUpperCase().includes('TROCA'))
        .reduce((s, p) => s + parseMoney(p.valor), 0)
      const precoEsperado = Number(item.preco_venda) || 0
      const temProdutoBranco = (dados.aparelhos || []).some(a => /CELULAR\s*-\s*-/.test(a.descricao || ''))
      const pagamentosErrados = precoEsperado > 0 && totalJsonPags > precoEsperado * 5

      if (temProdutoBranco || pagamentosErrados) {
        // Reparo cirúrgico: corrigir apenas o que está quebrado.
        // Os acessórios do items_json são preservados — eles têm o preço de VENDA
        // correto registrado pelo N8N, não o preço de custo do estoque.
        if (temProdutoBranco) {
          const { aparelhos: aps, garantias: gars } = reconstruirAparelhos()
          dados = { ...dados, aparelhos: aps, garantias: gars }
        }
        if (pagamentosErrados) {
          dados = { ...dados, pagamentos: reconstruirPagamentos() }
        }
        // Recalcular totais com os acessórios preservados do items_json
        const totalDescontoAc = (dados.acessorios || []).reduce(
          (s, a) => s + (a.desconto && a.desconto !== '-' ? parseMoney(a.desconto) : 0), 0)
        const cidadeParts = (item.cliente_cidade || '').split('/')
        dados = {
          ...dados,
          cliente: dados.cliente || {
            nome: item.cliente_nome || '', cpf: item.cliente_cpf || '',
            telefone: (item.cliente_telefone || '').trim(), endereco: item.cliente_endereco || '',
            cidade: cidadeParts[0]?.trim() || '', estado: cidadeParts[1]?.trim() || 'GO'
          },
          trocas: dados.trocas?.length ? dados.trocas : (item.troca_info ? [item.troca_info] : []),
          observacao: dados.observacao || item.observacao || '',
          totalBruto: formatMoney(Number(item.preco_venda) + totalDescontoAc),
          totalDesconto: totalDescontoAc > 0 ? formatMoney(totalDescontoAc) : 'R$ 0,00',
          taxaTotal: formatMoney(item.taxa_total || 0),
          totalVenda: formatMoney(item.preco_venda)
        }
      }
    }

    // ── Reconstrução completa — apenas quando items_json é nulo ───────────
    if (!dados) {
      const cidadeParts = (item.cliente_cidade || '').split('/')
      const { aparelhos: aparelhosPDF, garantias } = reconstruirAparelhos()
      const acessoriosPDF = reconstruirAcessorios()
      const pagamentosPDF = reconstruirPagamentos()
      const totalDescontoAc = acessoriosPDF.reduce(
        (s, a) => s + (a.desconto && a.desconto !== '-' ? parseMoney(a.desconto) : 0), 0)
      dados = {
        cliente: {
          nome: item.cliente_nome || '', cpf: item.cliente_cpf || '',
          telefone: (item.cliente_telefone || '').trim(), endereco: item.cliente_endereco || '',
          cidade: cidadeParts[0]?.trim() || '', estado: cidadeParts[1]?.trim() || 'GO'
        },
        aparelhos: aparelhosPDF, acessorios: acessoriosPDF, pagamentos: pagamentosPDF,
        trocas: item.troca_info ? [item.troca_info] : [],
        garantias, observacao: item.observacao || '',
        totalBruto: formatMoney(Number(item.preco_venda) + totalDescontoAc),
        totalDesconto: totalDescontoAc > 0 ? formatMoney(totalDescontoAc) : 'R$ 0,00',
        taxaTotal: formatMoney(item.taxa_total || 0),
        totalVenda: formatMoney(item.preco_venda)
      }
    }

    // ── Aplicar preco_venda do cadastro nos acessórios ────────────────────────
    // O preco_venda do cadastro prevalece sempre que estiver preenchido —
    // corrige tanto R$0,00 quanto preços de custo gravados pelo N8N.
    if (dados && dados.acessorios && dados.acessorios.length > 0) {
      const acessoriosCods = (item.acessorios_codigos || '').split(/[,|]/).map(c => c.trim().toUpperCase()).filter(Boolean)
      let alterou = false
      const acessoriosCorrigidos = dados.acessorios.map((ac, i) => {
        const cod = acessoriosCods[i] || ''
        const cat = cod ? (db.cadastro_acessorios || []).find(c => c.cod === cod) : null
        const preco = cat ? (Number(cat.preco_venda) || 0) : 0
        if (preco <= 0) return ac  // sem preco_venda cadastrado — manter como está
        const precoAtual = parseMoney(ac.valorUnitario || 'R$ 0,00')
        if (precoAtual === preco) return ac  // já está correto
        alterou = true
        const qtd = Number(ac.qtd) || 1
        const subtotal = preco * qtd
        return { ...ac, valorUnitario: formatMoney(preco), desconto: formatMoney(subtotal), valorTotal: 'R$ 0,00' }
      })
      if (alterou) {
        const totalDescontoAc = acessoriosCorrigidos.reduce(
          (s, a) => s + (a.desconto && a.desconto !== '-' ? parseMoney(a.desconto) : 0), 0)
        dados = {
          ...dados,
          acessorios: acessoriosCorrigidos,
          totalBruto: formatMoney(Number(item.preco_venda) + totalDescontoAc),
          totalDesconto: totalDescontoAc > 0 ? formatMoney(totalDescontoAc) : 'R$ 0,00',
          totalVenda: formatMoney(item.preco_venda)
        }
      }
    }

    const html = gerarHTMLRecibo({ ...dados, dataVenda: item.data_venda, idVenda: item.id_venda }, item.tipo_venda === 'ORCAMENTO')
    gerarPDF(html, item.id_venda + '.pdf')
  }

  const colsFisica = [
    { key: 'data_venda', label: 'Data', render: v => formatDate(v) },
    { key: 'aparelhos_descricao', label: 'Aparelhos' },
    { key: 'acessorios_descricao', label: 'Acessórios' },
    { key: 'pagamentos', label: 'Pagamento' },
    { key: 'preco_venda', label: 'Valor', render: v => formatMoney(v) },
    { key: 'lucro_venda', label: 'Lucro', render: v => <span style={{ color: '#34d399', fontWeight: 600 }}>{formatMoney(v)}</span> },
  ]

  const colsOnline = [
    { key: 'data_venda', label: 'Data', render: v => formatDate(v) },
    { key: 'cliente_nome', label: 'Cliente' },
    { key: 'aparelhos_descricao', label: 'Produto' },
    { key: 'pagamentos', label: 'Pagamento' },
    { key: 'preco_venda', label: 'Valor', render: v => formatMoney(v) },
    { key: 'lucro_venda', label: 'Lucro', render: v => <span style={{ color: '#34d399', fontWeight: 600 }}>{formatMoney(v)}</span> },
    { key: 'taxa_total', label: 'Taxa', render: v => formatMoney(v) },
  ]

  const totalPeriodo = vendas.reduce((s, v) => s + Number(v.preco_venda || 0), 0)
  const lucroTotal = vendas.reduce((s, v) => s + Number(v.lucro_venda || 0), 0)

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <div style={S.pageTitle}>Vendas</div>
          <div style={S.pageSub}>Registro e histórico de vendas</div>
        </div>
        <button style={S.btn()} onClick={openModal}>+ Nova Venda</button>
      </div>
      <div style={S.tabs}>
        <button style={S.tab(tab === 'fisica')} onClick={() => setTab('fisica')}>Venda Física</button>
        <button style={S.tab(tab === 'online')} onClick={() => setTab('online')}>Venda Online</button>
        <button style={S.tab(tab === 'orcamento')} onClick={() => setTab('orcamento')}>Orçamentos</button>
      </div>
      <DateFilter value={filter} onChange={setFilter} />
      <div style={{ marginBottom: 16, padding: '12px 16px', background: '#1e293b', borderRadius: 10, display: 'inline-flex', gap: 24 }}>
        <div><span style={{ color: '#64748b', fontSize: 12 }}>Total vendido: </span><span style={{ color: '#60a5fa', fontWeight: 700 }}>{formatMoney(totalPeriodo)}</span></div>
        <div><span style={{ color: '#64748b', fontSize: 12 }}>Lucro: </span><span style={{ color: '#34d399', fontWeight: 700 }}>{formatMoney(lucroTotal)}</span></div>
        <div><span style={{ color: '#64748b', fontSize: 12 }}>Registros: </span><span style={{ color: '#e2e8f0', fontWeight: 700 }}>{vendas.length}</span></div>
      </div>
      <div style={S.card}>
        <SortableTable
          columns={tab === 'fisica' ? colsFisica : colsOnline}
          data={vendas}
          onDelete={excluir}
          onView={tab !== 'fisica' ? (item) => setViewItem(item) : null}
        />
      </div>

      {/* Modal de Nova Venda - seleciona o formulário correto */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={`Nova ${tab === 'fisica' ? 'Venda Física' : tab === 'online' ? 'Venda Online' : 'Orçamento'}`} wide>
        {tab === 'fisica' && <FormVendaFisica db={db} refresh={refresh} onClose={() => setModalOpen(false)} />}
        {tab === 'online' && <FormVendaOnline db={db} refresh={refresh} onClose={() => setModalOpen(false)} />}
        {tab === 'orcamento' && <FormOrcamento db={db} refresh={refresh} onClose={() => setModalOpen(false)} />}
      </Modal>

      {/* Modal de visualização */}
      {viewItem && (
        <Modal open={!!viewItem} onClose={() => setViewItem(null)} title="Detalhes da Venda">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              ['Data', formatDate(viewItem.data_venda)],
              ['Cliente', viewItem.cliente_nome],
              ['CPF', viewItem.cliente_cpf],
              ['Telefone', viewItem.cliente_telefone],
              ['Endereço', viewItem.cliente_endereco],
              ['Produto', viewItem.aparelhos_descricao],
              ['Acessórios', viewItem.acessorios_descricao],
              ['Pagamento', viewItem.pagamentos],
              ['Valor', formatMoney(viewItem.preco_venda)],
              ['Taxa', formatMoney(viewItem.taxa_total)],
              ['Lucro', formatMoney(viewItem.lucro_venda)],
              ['Observação', viewItem.observacao],
            ].filter(([, v]) => v).map(([l, v]) => (
              <div key={l} style={{ display: 'flex', gap: 10, padding: '6px 0', borderBottom: '1px solid #334155' }}>
                <span style={{ color: '#64748b', fontSize: 12, minWidth: 80 }}>{l}</span>
                <span style={{ color: '#e2e8f0', fontSize: 13 }}>{v}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 16, display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button style={S.btn()} onClick={() => gerarPDFVenda(viewItem)}>📄 Gerar PDF</button>
          </div>
        </Modal>
      )}
      <ConfirmModal open={!!confirmItem} msg="Excluir esta venda?" onConfirm={() => doExcluir(confirmItem)} onCancel={() => setConfirmItem(null)} />
    </div>
  )
}

// ─────────────────────────────────────────────
// FORMULÁRIO: VENDA FÍSICA
// ─────────────────────────────────────────────
function FormVendaFisica({ db, refresh, onClose }) {
  const [dataVenda, setDataVenda] = useState(today())
  const [aparelhos, setAparelhos] = useState([{ cod: '', preco: '' }])
  const [acessorios, setAcessorios] = useState([])
  const [pagamentos, setPagamentos] = useState([{ forma: '', valor: '', parcelas: 1 }])
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  function addAparelho() { setAparelhos(a => [...a, { cod: '', preco: '' }]) }
  function removeAparelho(i) { setAparelhos(a => a.filter((_, idx) => idx !== i)) }
  function setAparelho(i, k, v) { setAparelhos(a => a.map((x, idx) => idx === i ? { ...x, [k]: v } : x)) }

  function addAcessorio() { setAcessorios(a => [...a, { cod: '', qtd: 1, preco: 0, tipo: 'brinde' }]) }
  function removeAcessorio(i) { setAcessorios(a => a.filter((_, idx) => idx !== i)) }
  function setAcessorio(i, k, v) { setAcessorios(a => a.map((x, idx) => idx === i ? { ...x, [k]: v } : x)) }

  function addPagamento() { setPagamentos(p => [...p, { forma: '', valor: '', parcelas: 1 }]) }
  function removePagamento(i) { setPagamentos(p => p.filter((_, idx) => idx !== i)) }
  function setPagamento(i, k, v) {
    setPagamentos(p => p.map((x, idx) => idx === i ? { ...x, [k]: v } : x))
  }

  function calcTaxa(pag) {
    const taxa = getTaxaPercent(pag.forma, pag.parcelas)
    const valor = Number(pag.valor) || 0
    return valor * taxa / 100
  }

  const totalVenda = aparelhos.reduce((s, a) => s + (Number(a.preco) || 0), 0)
    + acessorios.filter(a => a.tipo === 'venda').reduce((s, a) => s + (Number(a.preco) * Number(a.qtd) || 0), 0)
  const totalTaxas = pagamentos.reduce((s, p) => s + calcTaxa(p), 0)
  const totalPago = pagamentos.filter(p => p.forma !== 'TROCA').reduce((s, p) => s + (Number(p.valor) || 0), 0)

  async function salvar() {
    if (!dataVenda) { setMsg('Informe a data'); return }
    if (aparelhos.filter(a => a.cod).length === 0) { setMsg('Informe pelo menos um aparelho'); return }
    if (pagamentos.filter(p => p.forma).length === 0) { setMsg('Informe pelo menos um pagamento'); return }
    setLoading(true)
    try {
      // Calcular custo dos aparelhos do estoque
      let custoAparelhos = 0
      const codigos = aparelhos.filter(a => a.cod).map(a => a.cod.toUpperCase())
      for (const cod of codigos) {
        const item = (db.estoque_aparelhos || []).find(e => e.cod === cod)
        if (item) custoAparelhos += Number(item.custo) || 0
      }

      // Calcular custo real dos acessórios (FIFO) e separar para baixa
      let custoAcessoriosReal = 0
      const acessoriosParaDebitar = []
      for (const ac of acessorios) {
        if (!ac.cod) continue;
        let qtdRestante = Number(ac.qtd) || 1;
        const estoqueList = (db.estoque_acessorios || [])
          .filter(e => e.cod === ac.cod.toUpperCase() && Number(e.quantidade) > 0)
          .sort((a, b) => new Date(a.data_aquisicao) - new Date(b.data_aquisicao));
        
        for (const est of estoqueList) {
          if (qtdRestante <= 0) break;
          const estQtd = Number(est.quantidade);
          const debitar = Math.min(qtdRestante, estQtd);
          custoAcessoriosReal += debitar * (Number(est.custo_unitario) || 0);
          acessoriosParaDebitar.push({ id: est.id, qtdDebitar: debitar });
          qtdRestante -= debitar;
        }
      }

      const precoVenda = totalVenda
      const lucroVenda = precoVenda - custoAparelhos - custoAcessoriosReal

      const aparelhosDesc = aparelhos.filter(a => a.cod).map(a => {
        const item = (db.estoque_aparelhos || []).find(e => e.cod === a.cod.toUpperCase())
        return item ? `${item.marca} ${item.modelo} ${item.capacidade} ${item.cor}` : a.cod
      }).join(' | ')

      const acessoriosDesc = acessorios.filter(a => a.cod).map(a => `${a.qtd}x ${a.cod}`).join(' | ')
      const pagamentosStr = pagamentos.filter(p => p.forma).map(p => {
        const taxa = calcTaxa(p)
        return `${p.forma}${p.forma === 'Credito' ? ` ${p.parcelas}x` : ''}: R$ ${p.valor}${taxa > 0 ? ` (taxa: R$ ${taxa.toFixed(2)})` : ''}`
      }).join(' | ')

      const venda = {
        id_venda: genId('VF'),
        tipo_venda: 'FISICA',
        data_venda: dataVenda,
        aparelhos_codigos: codigos.join(','),
        aparelhos_descricao: aparelhosDesc,
        qtd_aparelhos: codigos.length,
        acessorios_codigos: acessorios.filter(a => a.cod).map(a => a.cod).join(','),
        acessorios_descricao: acessoriosDesc,
        qtd_acessorios: acessorios.length,
        custo_aparelhos: custoAparelhos,
        preco_venda: precoVenda,
        lucro_venda: lucroVenda,
        valor_total_pago: totalPago,
        taxa_total: totalTaxas,
        pagamentos: pagamentosStr,
        items_json: { aparelhos, acessorios, pagamentos, dataVenda },
      }
      await supabase.from('vendas').insert(venda)
      // Remover aparelhos vendidos do estoque
      for (const cod of codigos) {
        await supabase.from('estoque_aparelhos').delete().eq('cod', cod)
      }
      // Abater acessórios do estoque
      for (const deb of acessoriosParaDebitar) {
        const est = (db.estoque_acessorios || []).find(e => e.id === deb.id);
        if (est) {
          const newQtd = Number(est.quantidade) - deb.qtdDebitar;
          if (newQtd <= 0) {
            await supabase.from('estoque_acessorios').delete().eq('id', deb.id);
          } else {
            await supabase.from('estoque_acessorios').update({ quantidade: newQtd }).eq('id', deb.id);
          }
        }
      }
      // Entrar aparelhos de troca no estoque
      for (const pag of pagamentos.filter(p => p.forma === 'TROCA')) {
        const tMarca = pag.trocaMarca || 'Outro'
        const tModelo = pag.trocaModelo || 'Aparelho de Troca'
        const tCapacidade = pag.trocaCapacidade || '64GB'
        const tCor = pag.trocaCor || 'N/A'
        const tCusto = Number(pag.trocaPreco) || 0
        const tCondicao = pag.trocaCondicao || 'seminovo'
        // Gerar código único para o estoque
        let tCod = pag.trocaCod ? pag.trocaCod.toUpperCase() : ''
        if (!tCod || (db.estoque_aparelhos || []).find(e => e.cod === tCod)) {
          tCod = genId('TR')
        }
        // Inserir no catálogo se combinação marca+modelo+capacidade+cor ainda não existir
        const jaNosCatalogo = (db.cadastro_aparelhos || []).find(e =>
          e.marca?.toUpperCase() === tMarca.toUpperCase() &&
          e.modelo?.toUpperCase() === tModelo.toUpperCase() &&
          e.capacidade === tCapacidade && e.cor?.toUpperCase() === tCor.toUpperCase()
        )
        if (!jaNosCatalogo) {
          const catCod = tMarca.slice(0, 2).toUpperCase() + Date.now().toString(36).toUpperCase().slice(-4)
          await supabase.from('cadastro_aparelhos').insert({ cod: catCod, marca: tMarca, modelo: tModelo, capacidade: tCapacidade, cor: tCor })
        }
        // Inserir unidade no estoque
        await supabase.from('estoque_aparelhos').insert({
          cod: tCod, marca: tMarca, modelo: tModelo, capacidade: tCapacidade, cor: tCor,
          custo: tCusto, data_aquisicao: dataVenda, status: 'disponivel',
          observacao: `TROCA${tCondicao === 'seminovo' ? ' - Semi-novo' : ' - Novo'}${pag.trocaObs ? ' - ' + pag.trocaObs : ''}`
        })
      }
      refresh()
      onClose()
    } catch (e) { setMsg('Erro: ' + e.message) }
    setLoading(false)
  }

  return (
    <div>
      <div style={S.formGroup}>
        <label style={S.label}>Data da Venda *</label>
        <input style={{ ...S.input, width: 200 }} type="date" value={dataVenda} onChange={e => setDataVenda(e.target.value)} />
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <label style={{ ...S.label, marginBottom: 0 }}>Aparelhos</label>
          <button style={S.btn('sm')} onClick={addAparelho}>+ Adicionar</button>
        </div>
        {aparelhos.map((ap, i) => (
          <div key={i} style={{ background: '#0f172a', borderRadius: 8, padding: 12, marginBottom: 8, border: '1px solid #334155' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: '#64748b' }}>Aparelho #{i + 1}</span>
              {i > 0 && <button style={S.btn('danger')} onClick={() => removeAparelho(i)}>×</button>}
            </div>
            <div style={S.row('2fr 1fr')}>
              <div>
                <label style={S.label}>Código do Estoque *</label>
                <Autocomplete
                  value={ap.cod}
                  onChange={v => setAparelho(i, 'cod', typeof v === 'string' ? v : v.cod)}
                  options={db.estoque_aparelhos || []}
                  placeholder="Ex: AP001-001"
                  getLabel={o => typeof o === 'string' ? o : `${o.cod} - ${o.marca} ${o.modelo} ${o.capacidade}`}
                />
              </div>
              <div>
                <label style={S.label}>Preço de Venda (R$) *</label>
                <input style={S.input} type="number" step="0.01" value={ap.preco} onChange={e => setAparelho(i, 'preco', e.target.value)} placeholder="0.00" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <label style={{ ...S.label, marginBottom: 0 }}>Acessórios (opcional)</label>
          <button style={{ ...S.btn('sm'), background: '#7c3aed' }} onClick={addAcessorio}>+ Adicionar</button>
        </div>
        {acessorios.map((ac, i) => (
          <div key={i} style={{ background: '#1a1030', borderRadius: 8, padding: 12, marginBottom: 8, border: '1px solid #4c1d95' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <button style={S.filterBtn(ac.tipo === 'brinde')} onClick={() => setAcessorio(i, 'tipo', 'brinde')}>🎁 Brinde</button>
                <button style={S.filterBtn(ac.tipo === 'venda')} onClick={() => setAcessorio(i, 'tipo', 'venda')}>💰 Venda</button>
              </div>
              <button style={S.btn('danger')} onClick={() => removeAcessorio(i)}>×</button>
            </div>
            <div style={S.row('2fr 1fr 1fr')}>
              <div>
                <label style={S.label}>Código</label>
                <Autocomplete
                  value={ac.cod}
                  onChange={v => setAcessorio(i, 'cod', typeof v === 'string' ? v : v.cod)}
                  options={db.cadastro_acessorios || []}
                  placeholder="Ex: AC001"
                  getLabel={o => typeof o === 'string' ? o : `${o.cod} - ${o.descricao}`}
                />
              </div>
              <div><label style={S.label}>Qtd</label><input style={S.input} type="number" min="1" value={ac.qtd} onChange={e => setAcessorio(i, 'qtd', e.target.value)} /></div>
              <div><label style={S.label}>Valor (R$)</label><input style={S.input} type="number" step="0.01" value={ac.preco} onChange={e => setAcessorio(i, 'preco', e.target.value)} /></div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <label style={{ ...S.label, marginBottom: 0 }}>Formas de Pagamento</label>
          <button style={{ ...S.btn('sm'), background: '#b45309' }} onClick={addPagamento}>+ Adicionar</button>
        </div>
        {pagamentos.map((pag, i) => (
          <div key={i} style={{ background: '#1a1700', borderRadius: 8, padding: 12, marginBottom: 8, border: '1px solid #78350f' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: '#64748b' }}>Pagamento #{i + 1}</span>
              {i > 0 && <button style={S.btn('danger')} onClick={() => removePagamento(i)}>×</button>}
            </div>
            <div style={S.row('1fr 1fr 1fr')}>
              <div>
                <label style={S.label}>Forma *</label>
                <select style={S.select} value={pag.forma} onChange={e => setPagamento(i, 'forma', e.target.value)}>
                  <option value="">Selecione...</option>
                  {FORMAS_PAGAMENTO.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              {pag.forma === 'Credito' && (
                <div>
                  <label style={S.label}>Parcelas</label>
                  <select style={S.select} value={pag.parcelas} onChange={e => setPagamento(i, 'parcelas', e.target.value)}>
                    {Array.from({ length: 18 }, (_, j) => <option key={j + 1} value={j + 1}>{j + 1}x</option>)}
                  </select>
                </div>
              )}
              {pag.forma !== 'TROCA' && (
                <div>
                  <label style={S.label}>Valor Cobrado (R$) *</label>
                  <input style={S.input} type="number" step="0.01" value={pag.valor} onChange={e => setPagamento(i, 'valor', e.target.value)} placeholder="0.00" />
                </div>
              )}
            </div>
            {pag.forma && pag.forma !== 'TROCA' && pag.forma !== 'Dinheiro' && pag.forma !== 'PIX' && pag.valor && (
              <div style={{ marginTop: 8, padding: '6px 10px', background: '#332b00', borderRadius: 6, fontSize: 12, color: '#fbbf24' }}>
                Taxa: {getTaxaPercent(pag.forma, pag.parcelas).toFixed(2)}% = {formatMoney(calcTaxa(pag))}
              </div>
            )}
            {pag.forma === 'TROCA' && (
              <div style={{ marginTop: 12, padding: 12, background: '#1a0505', borderRadius: 8, border: '1px dashed #991b1b' }}>
                <div style={{ fontSize: 12, color: '#e94560', marginBottom: 10, fontWeight: 600 }}>📱 Aparelho de Troca — entrará no estoque automaticamente</div>
                <div style={S.row('1fr 1fr')}>
                  <div><label style={S.label}>Marca *</label>
                    <select style={S.select} value={pag.trocaMarca || ''} onChange={e => setPagamento(i, 'trocaMarca', e.target.value)}>
                      <option value="">Selecione...</option>
                      {MARCAS_TROCA.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                  <div><label style={S.label}>Modelo *</label><input style={S.input} value={pag.trocaModelo || ''} onChange={e => setPagamento(i, 'trocaModelo', e.target.value)} placeholder="Ex: Galaxy S23" /></div>
                </div>
                <div style={S.row('1fr 1fr 1fr')}>
                  <div><label style={S.label}>Capacidade</label>
                    <select style={S.select} value={pag.trocaCapacidade || ''} onChange={e => setPagamento(i, 'trocaCapacidade', e.target.value)}>
                      <option value="">Selecione...</option>
                      {CAPACIDADES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div><label style={S.label}>Cor</label><input style={S.input} value={pag.trocaCor || ''} onChange={e => setPagamento(i, 'trocaCor', e.target.value)} placeholder="Ex: Preto" /></div>
                  <div><label style={S.label}>Condição</label>
                    <select style={S.select} value={pag.trocaCondicao || 'seminovo'} onChange={e => setPagamento(i, 'trocaCondicao', e.target.value)}>
                      <option value="seminovo">Semi-novo</option>
                      <option value="novo">Novo</option>
                    </select>
                  </div>
                </div>
                <div style={S.row('1fr 1fr')}>
                  <div><label style={S.label}>Valor da Troca / Custo (R$) *</label><input style={S.input} type="number" step="0.01" value={pag.trocaPreco || ''} onChange={e => setPagamento(i, 'trocaPreco', e.target.value)} placeholder="Valor pago na troca" /></div>
                  <div><label style={S.label}>Código no Estoque (opcional)</label><input style={S.input} value={pag.trocaCod || ''} onChange={e => setPagamento(i, 'trocaCod', e.target.value)} placeholder="Deixe em branco para gerar automático" /></div>
                </div>
                <div><label style={S.label}>Observação (estado, defeitos...)</label><input style={S.input} value={pag.trocaObs || ''} onChange={e => setPagamento(i, 'trocaObs', e.target.value)} placeholder="Ex: Tela trincada, bateria boa" /></div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{ background: '#0f172a', borderRadius: 10, padding: 16, marginBottom: 16, display: 'flex', gap: 24 }}>
        <div><span style={{ color: '#64748b', fontSize: 12 }}>Total: </span><span style={{ color: '#34d399', fontWeight: 700 }}>{formatMoney(totalVenda)}</span></div>
        <div><span style={{ color: '#64748b', fontSize: 12 }}>Taxas: </span><span style={{ color: '#f87171', fontWeight: 700 }}>{formatMoney(totalTaxas)}</span></div>
      </div>

      {msg && <div style={{ color: '#f87171', fontSize: 13, marginBottom: 12 }}>{msg}</div>}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <button style={S.btn('ghost')} onClick={onClose}>Cancelar</button>
        <button style={S.btn()} onClick={salvar} disabled={loading}>{loading ? 'Registrando...' : 'Registrar Venda'}</button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// FORMULÁRIO: VENDA ONLINE (com PDF)
// ─────────────────────────────────────────────
function FormVendaOnline({ db, refresh, onClose }) {
  const [form, setForm] = useState({ dataVenda: today(), vendedor: '', observacao: '' })
  const [cliente, setCliente] = useState({ nome: '', cpf: '', telefone: '', email: '', endereco: '', cep: '', cidade: '', estado: 'GO' })
  const [aparelhos, setAparelhos] = useState([{ cod: '', preco: '', condicao: 'novo', imei: '' }])
  const [acessorios, setAcessorios] = useState([])
  const [pagamentos, setPagamentos] = useState([{ forma: '', valor: '', parcelas: 1 }])
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  function addAparelho() { setAparelhos(a => [...a, { cod: '', preco: '', condicao: 'novo', imei: '' }]) }
  function removeAparelho(i) { setAparelhos(a => a.filter((_, idx) => idx !== i)) }
  function setAp(i, k, v) { setAparelhos(a => a.map((x, idx) => idx === i ? { ...x, [k]: v } : x)) }

  function addAcessorio() { setAcessorios(a => [...a, { cod: '', descricao: '', qtd: 1, preco: 0, tipo: 'brinde' }]) }
  function removeAcessorio(i) { setAcessorios(a => a.filter((_, idx) => idx !== i)) }
  function setAc(i, k, v) { setAcessorios(a => a.map((x, idx) => idx === i ? { ...x, [k]: v } : x)) }

  function addPagamento() { setPagamentos(p => [...p, { forma: '', valor: '', parcelas: 1 }]) }
  function removePagamento(i) { setPagamentos(p => p.filter((_, idx) => idx !== i)) }
  function setPag(i, k, v) { setPagamentos(p => p.map((x, idx) => idx === i ? { ...x, [k]: v } : x)) }

  function calcTaxa(pag) {
    const taxa = getTaxaPercent(pag.forma, pag.parcelas)
    return (Number(pag.valor) || 0) * taxa / 100
  }

  const totalBruto = aparelhos.reduce((s, a) => s + (Number(a.preco) || 0), 0)
    + acessorios.filter(a => a.tipo === 'venda').reduce((s, a) => s + (Number(a.preco) * Number(a.qtd) || 0), 0)
  const totalTaxas = pagamentos.reduce((s, p) => s + calcTaxa(p), 0)

  async function salvarERgerarPDF(gerarPdfFlag = true) {
    if (!form.dataVenda || !cliente.nome) { setMsg('Data e nome do cliente são obrigatórios'); return }
    const aparelhosPreenchidos = aparelhos.filter(a => a.cod).length;
    const acessoriosPreenchidos = acessorios.filter(a => a.cod || a.descricao).length;
    if (aparelhosPreenchidos === 0 && acessoriosPreenchidos === 0) { setMsg('Informe pelo menos um aparelho ou acessório'); return }
    setLoading(true)
    try {
      let custoAparelhos = 0
      const codigos = aparelhos.filter(a => a.cod).map(a => a.cod.toUpperCase())
      const aparelhosPDF = []
      const garantias = []

      for (const ap of aparelhos.filter(a => a.cod)) {
        const cod = ap.cod.toUpperCase()
        const estoqueItem = (db.estoque_aparelhos || []).find(e => e.cod === cod)
        const custo = estoqueItem ? Number(estoqueItem.custo) : 0
        custoAparelhos += custo
        const marca = estoqueItem?.marca || ''
        const modelo = estoqueItem?.modelo || ap.descricao || cod
        const capacidade = estoqueItem?.capacidade || ''
        const cor = estoqueItem?.cor || ''
        const garantia = obterGarantia(marca, modelo, ap.condicao)
        const garantiaDate = calcGarantiaDate(form.dataVenda, garantia.dias)
        const condicaoStr = ap.condicao === 'seminovo' ? 'SEMI-NOVO' : 'NOVO'
        const descPDF = `CELULAR - ${marca} ${modelo} ${capacidade} - ${condicaoStr} - ${cor}` +
          (ap.imei ? ` | IMEI ${ap.imei}` : '') +
          ` - Garantia até:${garantiaDate}`
        aparelhosPDF.push({ descricao: descPDF, qtd: 1, valorUnitario: formatMoney(ap.preco), desconto: '-', valorTotal: formatMoney(ap.preco) })
        if (!garantias.find(g => g.titulo === garantia.titulo)) garantias.push(garantia)
      }

      const acessoriosPDF = acessorios.filter(a => a.cod || a.descricao).map(a => ({
        descricao: `ACESSÓRIOS - ${a.cod || a.descricao}${a.tipo === 'brinde' ? ' - BRINDE' : ''}`,
        qtd: a.qtd,
        valorUnitario: formatMoney(a.preco),
        desconto: a.tipo === 'brinde' ? formatMoney(Number(a.preco) * Number(a.qtd)) : '-',
        valorTotal: a.tipo === 'brinde' ? 'R$ 0,00' : formatMoney(Number(a.preco) * Number(a.qtd))
      }))

      const pagamentosPDF = pagamentos.filter(p => p.forma && p.forma !== 'TROCA').map(p => {
        const taxa = calcTaxa(p)
        return {
          forma: p.forma.toUpperCase() + (p.forma === 'Credito' ? ` ${p.parcelas}x` : ''),
          valor: formatMoney(p.valor),
          parcelas: p.forma === 'Credito' ? `${p.parcelas}x` : '',
          detalhes: taxa > 0 ? `Taxa: ${formatMoney(taxa)}` : ''
        }
      })

      const idVenda = genId('VR')

      // Calcular custo real dos acessórios (FIFO) e separar para baixa
      let custoAcessoriosReal = 0
      const acessoriosParaDebitar = []
      for (const ac of acessorios) {
        if (!ac.cod) continue;
        let qtdRestante = Number(ac.qtd) || 1;
        const estoqueList = (db.estoque_acessorios || [])
          .filter(e => e.cod === ac.cod.toUpperCase() && Number(e.quantidade) > 0)
          .sort((a, b) => new Date(a.data_aquisicao) - new Date(b.data_aquisicao));
        
        for (const est of estoqueList) {
          if (qtdRestante <= 0) break;
          const estQtd = Number(est.quantidade);
          const debitar = Math.min(qtdRestante, estQtd);
          custoAcessoriosReal += debitar * (Number(est.custo_unitario) || 0);
          acessoriosParaDebitar.push({ id: est.id, qtdDebitar: debitar });
          qtdRestante -= debitar;
        }
      }

      const precoVenda = totalBruto
      const lucroVenda = precoVenda - custoAparelhos - custoAcessoriosReal

      const totalAcessoriosBrinde = acessorios
        .filter(a => a.tipo === 'brinde')
        .reduce((s, a) => s + (Number(a.preco) * Number(a.qtd) || 0), 0)

      const pdfData = {
        dataVenda: form.dataVenda, idVenda, vendedor: form.vendedor || 'CORE',
        cliente, aparelhos: aparelhosPDF, acessorios: acessoriosPDF, pagamentos: pagamentosPDF,
        trocas: [], garantias, observacao: form.observacao,
        totalBruto: formatMoney(totalBruto + totalAcessoriosBrinde),
        totalDesconto: totalAcessoriosBrinde > 0 ? formatMoney(totalAcessoriosBrinde) : 'R$ 0,00',
        taxaTotal: formatMoney(totalTaxas), totalVenda: formatMoney(totalBruto),
      }

      const aparelhosDesc = aparelhosPDF.map(a => a.descricao).join(' | ')
      // Salvar descrição no formato simples "Qtdx Tipo" (compatível com o padrão da planilha)
      const acessoriosDesc = acessorios.filter(a => a.cod || a.descricao).map(a => {
        const cat = a.cod ? (db.cadastro_acessorios || []).find(c => c.cod === a.cod.toUpperCase()) : null
        const label = cat ? cat.tipo : (a.descricao || a.cod)
        return `${a.qtd}x ${label}`
      }).join(' | ')
      const pagamentosStr = pagamentos.filter(p => p.forma).map(p => `${p.forma}${p.forma === 'Credito' ? ` ${p.parcelas}x` : ''}: R$ ${p.valor}`).join(' | ')

      const venda = {
        id_venda: idVenda,
        tipo_venda: 'RECIBO',
        data_venda: form.dataVenda,
        cliente_nome: cliente.nome,
        cliente_cpf: cliente.cpf,
        cliente_telefone: cliente.telefone,
        cliente_endereco: cliente.endereco,
        cliente_cidade: cliente.cidade ? cliente.cidade + '/' + cliente.estado : '',
        aparelhos_codigos: codigos.join(','),
        aparelhos_descricao: aparelhosDesc,
        qtd_aparelhos: codigos.length,
        acessorios_codigos: acessorios.filter(a => a.cod).map(a => a.cod).join(','),
        acessorios_descricao: acessoriosDesc,
        qtd_acessorios: acessorios.length,
        custo_aparelhos: custoAparelhos,
        custo_acessorios: custoAcessoriosReal,
        preco_venda: precoVenda,
        lucro_venda: lucroVenda,
        valor_total_pago: totalBruto,
        taxa_total: totalTaxas,
        pagamentos: pagamentosStr,
        observacao: form.observacao,
        items_json: pdfData,
      }

      await supabase.from('vendas').insert(venda)
      // Remover aparelhos vendidos do estoque
      for (const cod of codigos) {
        await supabase.from('estoque_aparelhos').delete().eq('cod', cod)
      }
      // Abater acessórios do estoque
      for (const deb of acessoriosParaDebitar) {
        const est = (db.estoque_acessorios || []).find(e => e.id === deb.id);
        if (est) {
          const newQtd = Number(est.quantidade) - deb.qtdDebitar;
          if (newQtd <= 0) {
            await supabase.from('estoque_acessorios').delete().eq('id', deb.id);
          } else {
            await supabase.from('estoque_acessorios').update({ quantidade: newQtd }).eq('id', deb.id);
          }
        }
      }
      // Entrar aparelhos de troca no estoque
      for (const pag of pagamentos.filter(p => p.forma === 'TROCA')) {
        const tMarca = pag.trocaMarca || 'Outro'
        const tModelo = pag.trocaModelo || 'Aparelho de Troca'
        const tCapacidade = pag.trocaCapacidade || '64GB'
        const tCor = pag.trocaCor || 'N/A'
        const tCusto = Number(pag.trocaPreco) || 0
        const tCondicao = pag.trocaCondicao || 'seminovo'
        let tCod = pag.trocaCod ? pag.trocaCod.toUpperCase() : ''
        if (!tCod || (db.estoque_aparelhos || []).find(e => e.cod === tCod)) {
          tCod = genId('TR')
        }
        const jaNosCatalogo = (db.cadastro_aparelhos || []).find(e =>
          e.marca?.toUpperCase() === tMarca.toUpperCase() &&
          e.modelo?.toUpperCase() === tModelo.toUpperCase() &&
          e.capacidade === tCapacidade && e.cor?.toUpperCase() === tCor.toUpperCase()
        )
        if (!jaNosCatalogo) {
          const catCod = tMarca.slice(0, 2).toUpperCase() + Date.now().toString(36).toUpperCase().slice(-4)
          await supabase.from('cadastro_aparelhos').insert({ cod: catCod, marca: tMarca, modelo: tModelo, capacidade: tCapacidade, cor: tCor })
        }
        await supabase.from('estoque_aparelhos').insert({
          cod: tCod, marca: tMarca, modelo: tModelo, capacidade: tCapacidade, cor: tCor,
          custo: tCusto, data_aquisicao: form.dataVenda, status: 'disponivel',
          observacao: `TROCA${tCondicao === 'seminovo' ? ' - Semi-novo' : ' - Novo'}${pag.trocaObs ? ' - ' + pag.trocaObs : ''}`
        })
      }

      if (gerarPdfFlag) {
        const html = gerarHTMLRecibo(pdfData, false)
        gerarPDF(html, `RECIBO-${cliente.nome.replace(/\s+/g, '-')}-${form.dataVenda}.pdf`)
      }

      refresh()
      onClose()
    } catch (e) { setMsg('Erro: ' + e.message) }
    setLoading(false)
  }

  return (
    <div>
      <div style={S.row('1fr 1fr')}>
        <div style={S.formGroup}>
          <label style={S.label}>Data da Venda *</label>
          <input style={S.input} type="date" value={form.dataVenda} onChange={e => setForm(f => ({ ...f, dataVenda: e.target.value }))} />
        </div>
        <div style={S.formGroup}>
          <label style={S.label}>Vendedor</label>
          <input style={S.input} value={form.vendedor} onChange={e => setForm(f => ({ ...f, vendedor: e.target.value }))} placeholder="Nome do vendedor" />
        </div>
      </div>

      <div style={{ ...S.card, marginBottom: 16, background: '#0f172a' }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8', marginBottom: 12 }}>Dados do Cliente</div>
        <div style={S.row('2fr 1fr')}>
          <div style={S.formGroup}><label style={S.label}>Nome *</label><input style={S.input} value={cliente.nome} onChange={e => setCliente(c => ({ ...c, nome: e.target.value }))} /></div>
          <div style={S.formGroup}><label style={S.label}>CPF</label><input style={S.input} value={cliente.cpf} onChange={e => setCliente(c => ({ ...c, cpf: e.target.value }))} placeholder="000.000.000-00" /></div>
        </div>
        <div style={S.row('1fr 1fr')}>
          <div style={S.formGroup}><label style={S.label}>Telefone</label><input style={S.input} value={cliente.telefone} onChange={e => setCliente(c => ({ ...c, telefone: e.target.value }))} /></div>
          <div style={S.formGroup}><label style={S.label}>E-mail</label><input style={S.input} value={cliente.email} onChange={e => setCliente(c => ({ ...c, email: e.target.value }))} /></div>
        </div>
        <div style={S.formGroup}><label style={S.label}>Endereço</label><input style={S.input} value={cliente.endereco} onChange={e => setCliente(c => ({ ...c, endereco: e.target.value }))} /></div>
        <div style={S.row('2fr 1fr')}>
          <div style={S.formGroup}><label style={S.label}>Cidade</label><input style={S.input} value={cliente.cidade} onChange={e => setCliente(c => ({ ...c, cidade: e.target.value }))} /></div>
          <div style={S.formGroup}><label style={S.label}>Estado</label><input style={S.input} value={cliente.estado} onChange={e => setCliente(c => ({ ...c, estado: e.target.value }))} /></div>
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <label style={{ ...S.label, marginBottom: 0 }}>Aparelhos</label>
          <button style={S.btn('sm')} onClick={addAparelho}>+ Adicionar</button>
        </div>
        {aparelhos.map((ap, i) => (
          <div key={i} style={{ background: '#0f172a', borderRadius: 8, padding: 12, marginBottom: 8, border: '1px solid #334155' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: '#64748b' }}>Aparelho #{i + 1}</span>
              {i > 0 && <button style={S.btn('danger')} onClick={() => removeAparelho(i)}>×</button>}
            </div>
            <div style={S.row('2fr 1fr 1fr')}>
              <div><label style={S.label}>Código do Estoque *</label>
                <Autocomplete value={ap.cod} onChange={v => setAp(i, 'cod', typeof v === 'string' ? v : v.cod)} options={db.estoque_aparelhos || []} placeholder="Ex: AP001-001" getLabel={o => typeof o === 'string' ? o : `${o.cod} - ${o.marca} ${o.modelo}`} />
              </div>
              <div><label style={S.label}>Preço de Venda (R$) *</label><input style={S.input} type="number" step="0.01" value={ap.preco} onChange={e => setAp(i, 'preco', e.target.value)} /></div>
              <div><label style={S.label}>Condição</label>
                <select style={S.select} value={ap.condicao} onChange={e => setAp(i, 'condicao', e.target.value)}>
                  <option value="novo">Novo</option>
                  <option value="seminovo">Semi-novo</option>
                </select>
              </div>
            </div>
            <div style={S.formGroup}><label style={S.label}>IMEI (opcional)</label><input style={S.input} value={ap.imei} onChange={e => setAp(i, 'imei', e.target.value)} placeholder="Ex: 864724075953307" /></div>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <label style={{ ...S.label, marginBottom: 0 }}>Acessórios (opcional)</label>
          <button style={{ ...S.btn('sm'), background: '#7c3aed' }} onClick={addAcessorio}>+ Adicionar</button>
        </div>
        {acessorios.map((ac, i) => (
          <div key={i} style={{ background: '#1a1030', borderRadius: 8, padding: 12, marginBottom: 8, border: '1px solid #4c1d95' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <button style={S.filterBtn(ac.tipo === 'brinde')} onClick={() => setAc(i, 'tipo', 'brinde')}>🎁 Brinde</button>
                <button style={S.filterBtn(ac.tipo === 'venda')} onClick={() => setAc(i, 'tipo', 'venda')}>💰 Venda</button>
              </div>
              <button style={S.btn('danger')} onClick={() => removeAcessorio(i)}>×</button>
            </div>
            <div style={S.row('2fr 1fr 1fr')}>
              <div><label style={S.label}>Código / Descrição</label>
                <Autocomplete value={ac.cod} onChange={v => {
                  const cod = typeof v === 'string' ? v : v.cod
                  const cat = (db.cadastro_acessorios || []).find(c => c.cod === (typeof cod === 'string' ? cod.toUpperCase() : cod))
                  setAc(i, 'cod', cod)
                  if (cat) {
                    setAc(i, 'descricao', cat.descricao)
                    // Auto-preencher com preço de venda do cadastro se ainda não foi definido
                    if ((!ac.preco || ac.preco === 0) && cat.preco_venda > 0) setAc(i, 'preco', cat.preco_venda)
                  }
                }} options={db.cadastro_acessorios || []} placeholder="Ex: AC001 ou Cabo" getLabel={o => typeof o === 'string' ? o : `${o.cod} - ${o.descricao}`} />
              </div>
              <div><label style={S.label}>Qtd</label><input style={S.input} type="number" min="1" value={ac.qtd} onChange={e => setAc(i, 'qtd', e.target.value)} /></div>
              <div><label style={S.label}>Valor (R$)</label><input style={S.input} type="number" step="0.01" value={ac.preco} onChange={e => setAc(i, 'preco', e.target.value)} /></div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <label style={{ ...S.label, marginBottom: 0 }}>Formas de Pagamento</label>
          <button style={{ ...S.btn('sm'), background: '#b45309' }} onClick={addPagamento}>+ Adicionar</button>
        </div>
        {pagamentos.map((pag, i) => (
          <div key={i} style={{ background: '#1a1700', borderRadius: 8, padding: 12, marginBottom: 8, border: '1px solid #78350f' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: '#64748b' }}>Pagamento #{i + 1}</span>
              {i > 0 && <button style={S.btn('danger')} onClick={() => removePagamento(i)}>×</button>}
            </div>
            <div style={S.row('1fr 1fr 1fr')}>
              <div><label style={S.label}>Forma *</label>
                <select style={S.select} value={pag.forma} onChange={e => setPag(i, 'forma', e.target.value)}>
                  <option value="">Selecione...</option>
                  {FORMAS_PAGAMENTO.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              {pag.forma === 'Credito' && (
                <div><label style={S.label}>Parcelas</label>
                  <select style={S.select} value={pag.parcelas} onChange={e => setPag(i, 'parcelas', e.target.value)}>
                    {Array.from({ length: 18 }, (_, j) => <option key={j + 1} value={j + 1}>{j + 1}x</option>)}
                  </select>
                </div>
              )}
              {pag.forma !== 'TROCA' && (
                <div><label style={S.label}>Valor (R$) *</label><input style={S.input} type="number" step="0.01" value={pag.valor} onChange={e => setPag(i, 'valor', e.target.value)} /></div>
              )}
            </div>
            {pag.forma && pag.forma !== 'TROCA' && pag.forma !== 'Dinheiro' && pag.forma !== 'PIX' && pag.valor && (
              <div style={{ marginTop: 8, padding: '6px 10px', background: '#332b00', borderRadius: 6, fontSize: 12, color: '#fbbf24' }}>
                Taxa {getTaxaPercent(pag.forma, pag.parcelas).toFixed(2)}% = {formatMoney(calcTaxa(pag))}
              </div>
            )}
            {pag.forma === 'TROCA' && (
              <div style={{ marginTop: 12, padding: 12, background: '#1a0505', borderRadius: 8, border: '1px dashed #991b1b' }}>
                <div style={{ fontSize: 12, color: '#e94560', marginBottom: 10, fontWeight: 600 }}>📱 Aparelho de Troca — entrará no estoque automaticamente</div>
                <div style={S.row('1fr 1fr')}>
                  <div><label style={S.label}>Marca *</label>
                    <select style={S.select} value={pag.trocaMarca || ''} onChange={e => setPag(i, 'trocaMarca', e.target.value)}>
                      <option value="">Selecione...</option>
                      {MARCAS_TROCA.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                  <div><label style={S.label}>Modelo *</label><input style={S.input} value={pag.trocaModelo || ''} onChange={e => setPag(i, 'trocaModelo', e.target.value)} placeholder="Ex: Galaxy S23" /></div>
                </div>
                <div style={S.row('1fr 1fr 1fr')}>
                  <div><label style={S.label}>Capacidade</label>
                    <select style={S.select} value={pag.trocaCapacidade || ''} onChange={e => setPag(i, 'trocaCapacidade', e.target.value)}>
                      <option value="">Selecione...</option>
                      {CAPACIDADES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div><label style={S.label}>Cor</label><input style={S.input} value={pag.trocaCor || ''} onChange={e => setPag(i, 'trocaCor', e.target.value)} placeholder="Ex: Preto" /></div>
                  <div><label style={S.label}>Condição</label>
                    <select style={S.select} value={pag.trocaCondicao || 'seminovo'} onChange={e => setPag(i, 'trocaCondicao', e.target.value)}>
                      <option value="seminovo">Semi-novo</option>
                      <option value="novo">Novo</option>
                    </select>
                  </div>
                </div>
                <div style={S.row('1fr 1fr')}>
                  <div><label style={S.label}>Valor da Troca / Custo (R$) *</label><input style={S.input} type="number" step="0.01" value={pag.trocaPreco || ''} onChange={e => setPag(i, 'trocaPreco', e.target.value)} placeholder="Valor pago na troca" /></div>
                  <div><label style={S.label}>Código no Estoque (opcional)</label><input style={S.input} value={pag.trocaCod || ''} onChange={e => setPag(i, 'trocaCod', e.target.value)} placeholder="Deixe em branco para gerar automático" /></div>
                </div>
                <div><label style={S.label}>Observação (estado, defeitos...)</label><input style={S.input} value={pag.trocaObs || ''} onChange={e => setPag(i, 'trocaObs', e.target.value)} placeholder="Ex: Tela trincada, bateria boa" /></div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={S.formGroup}>
        <label style={S.label}>Observação (opcional)</label>
        <input style={S.input} value={form.observacao} onChange={e => setForm(f => ({ ...f, observacao: e.target.value }))} placeholder="Ex: IMEI, detalhes adicionais..." />
      </div>

      <div style={{ background: '#0f172a', borderRadius: 10, padding: 16, marginBottom: 16, display: 'flex', gap: 24 }}>
        <div><span style={{ color: '#64748b', fontSize: 12 }}>Total: </span><span style={{ color: '#34d399', fontWeight: 700 }}>{formatMoney(totalBruto)}</span></div>
        <div><span style={{ color: '#64748b', fontSize: 12 }}>Taxas: </span><span style={{ color: '#f87171', fontWeight: 700 }}>{formatMoney(totalTaxas)}</span></div>
      </div>

      {msg && <div style={{ color: '#f87171', fontSize: 13, marginBottom: 12 }}>{msg}</div>}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <button style={S.btn('ghost')} onClick={onClose}>Cancelar</button>
        <button style={{ ...S.btn(), background: '#1d4ed8' }} onClick={() => salvarERgerarPDF(false)} disabled={loading}>Salvar sem PDF</button>
        <button style={S.btn()} onClick={() => salvarERgerarPDF(true)} disabled={loading}>{loading ? 'Processando...' : '📄 Salvar e Gerar PDF'}</button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// FORMULÁRIO: ORÇAMENTO (com PDF)
// ─────────────────────────────────────────────
function FormOrcamento({ db, refresh, onClose }) {
  const [form, setForm] = useState({ dataVenda: today(), vendedor: '', observacao: '' })
  const [cliente, setCliente] = useState({ nome: '', cpf: '', telefone: '', email: '', endereco: '', cidade: '', estado: 'GO' })
  const [itens, setItens] = useState([{ descricao: '', qtd: 1, preco: '', desconto: 0 }])
  const [pagamentos, setPagamentos] = useState([{ forma: '', valor: '', detalhe: '' }])
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  function addItem() { setItens(a => [...a, { descricao: '', qtd: 1, preco: '', desconto: 0 }]) }
  function removeItem(i) { setItens(a => a.filter((_, idx) => idx !== i)) }
  function setItem(i, k, v) { setItens(a => a.map((x, idx) => idx === i ? { ...x, [k]: v } : x)) }
  function addPag() { setPagamentos(p => [...p, { forma: '', valor: '', detalhe: '' }]) }
  function removePag(i) { setPagamentos(p => p.filter((_, idx) => idx !== i)) }
  function setPag(i, k, v) { setPagamentos(p => p.map((x, idx) => idx === i ? { ...x, [k]: v } : x)) }

  const totalBruto = itens.reduce((s, it) => s + ((Number(it.preco) * Number(it.qtd)) - Number(it.desconto || 0)), 0)

  async function salvarEGerarPDF(gerarPdfFlag = true) {
    if (!form.dataVenda || !cliente.nome) { setMsg('Data e nome são obrigatórios'); return }
    if (itens.filter(it => it.descricao).length === 0) { setMsg('Informe pelo menos um item'); return }
    setLoading(true)
    try {
      const numOrc = Math.floor(10000 + Math.random() * 90000)
      const idVenda = genId('ORC')

      const itensPDF = itens.filter(it => it.descricao).map(it => ({
        descricao: it.descricao.toUpperCase(),
        qtd: it.qtd,
        valorUnitario: formatMoney(it.preco),
        desconto: Number(it.desconto) > 0 ? formatMoney(it.desconto) : '-',
        valorTotal: formatMoney((Number(it.preco) * Number(it.qtd)) - Number(it.desconto || 0))
      }))

      const pagamentosPDF = pagamentos.filter(p => p.forma).map(p => ({
        forma: p.forma.toUpperCase(),
        valor: formatMoney(p.valor),
        parcelas: '',
        detalhes: p.detalhe || ''
      }))

      const pdfData = {
        dataVenda: form.dataVenda, idVenda, numOrcamento: numOrc, vendedor: form.vendedor,
        cliente, aparelhos: itensPDF, acessorios: [], pagamentos: pagamentosPDF,
        trocas: [], garantias: [], observacao: form.observacao,
        totalBruto: formatMoney(totalBruto), totalDesconto: formatMoney(0),
        taxaTotal: formatMoney(0), totalVenda: formatMoney(totalBruto),
      }

      const itemsDesc = itensPDF.map(it => it.descricao).join(' | ')

      await supabase.from('vendas').insert({
        id_venda: idVenda,
        tipo_venda: 'ORCAMENTO',
        data_venda: form.dataVenda,
        cliente_nome: cliente.nome,
        cliente_cpf: cliente.cpf,
        cliente_telefone: cliente.telefone,
        cliente_endereco: cliente.endereco,
        cliente_cidade: cliente.cidade ? cliente.cidade + '/' + cliente.estado : '',
        aparelhos_descricao: itemsDesc,
        qtd_aparelhos: itensPDF.length,
        preco_venda: totalBruto,
        lucro_venda: 0,
        valor_total_pago: 0,
        taxa_total: 0,
        pagamentos: pagamentos.filter(p => p.forma).map(p => `${p.forma}: R$ ${p.valor}${p.detalhe ? ' (' + p.detalhe + ')' : ''}`).join(' | '),
        observacao: form.observacao || 'ORÇAMENTO',
        items_json: pdfData,
      })

      if (gerarPdfFlag) {
        const html = gerarHTMLRecibo(pdfData, true)
        gerarPDF(html, `ORCAMENTO-${cliente.nome.replace(/\s+/g, '-')}-${form.dataVenda}.pdf`)
      }

      refresh()
      onClose()
    } catch (e) { setMsg('Erro: ' + e.message) }
    setLoading(false)
  }

  return (
    <div>
      <div style={S.row('1fr 1fr')}>
        <div style={S.formGroup}><label style={S.label}>Data *</label><input style={S.input} type="date" value={form.dataVenda} onChange={e => setForm(f => ({ ...f, dataVenda: e.target.value }))} /></div>
        <div style={S.formGroup}><label style={S.label}>Vendedor</label><input style={S.input} value={form.vendedor} onChange={e => setForm(f => ({ ...f, vendedor: e.target.value }))} /></div>
      </div>
      <div style={{ ...S.card, marginBottom: 16, background: '#0f172a' }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8', marginBottom: 12 }}>Dados do Cliente</div>
        <div style={S.row('2fr 1fr')}>
          <div style={S.formGroup}><label style={S.label}>Nome *</label><input style={S.input} value={cliente.nome} onChange={e => setCliente(c => ({ ...c, nome: e.target.value }))} /></div>
          <div style={S.formGroup}><label style={S.label}>Telefone</label><input style={S.input} value={cliente.telefone} onChange={e => setCliente(c => ({ ...c, telefone: e.target.value }))} /></div>
        </div>
        <div style={S.row('1fr 1fr')}>
          <div style={S.formGroup}><label style={S.label}>CPF</label><input style={S.input} value={cliente.cpf} onChange={e => setCliente(c => ({ ...c, cpf: e.target.value }))} /></div>
          <div style={S.formGroup}><label style={S.label}>Cidade / Estado</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input style={S.input} value={cliente.cidade} onChange={e => setCliente(c => ({ ...c, cidade: e.target.value }))} placeholder="Cidade" />
              <input style={{ ...S.input, width: 60 }} value={cliente.estado} onChange={e => setCliente(c => ({ ...c, estado: e.target.value }))} />
            </div>
          </div>
        </div>
        <div style={S.formGroup}><label style={S.label}>Endereço</label><input style={S.input} value={cliente.endereco} onChange={e => setCliente(c => ({ ...c, endereco: e.target.value }))} /></div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <label style={{ ...S.label, marginBottom: 0 }}>Itens do Orçamento</label>
          <button style={S.btn('sm')} onClick={addItem}>+ Item</button>
        </div>
        {itens.map((it, i) => (
          <div key={i} style={{ background: '#0f172a', borderRadius: 8, padding: 12, marginBottom: 8, border: '1px solid #334155' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: '#64748b' }}>Item #{i + 1}</span>
              {i > 0 && <button style={S.btn('danger')} onClick={() => removeItem(i)}>×</button>}
            </div>
            <div style={S.row('3fr 1fr 1fr 1fr')}>
              <div><label style={S.label}>Descrição / Produto *</label><input style={S.input} value={it.descricao} onChange={e => setItem(i, 'descricao', e.target.value)} placeholder="Ex: Xiaomi Note 14 Pro 256GB PRETO" /></div>
              <div><label style={S.label}>Qtd</label><input style={S.input} type="number" min="1" value={it.qtd} onChange={e => setItem(i, 'qtd', e.target.value)} /></div>
              <div><label style={S.label}>Preço Unit. (R$)</label><input style={S.input} type="number" step="0.01" value={it.preco} onChange={e => setItem(i, 'preco', e.target.value)} /></div>
              <div><label style={S.label}>Desconto (R$)</label><input style={S.input} type="number" step="0.01" value={it.desconto} onChange={e => setItem(i, 'desconto', e.target.value)} /></div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <label style={{ ...S.label, marginBottom: 0 }}>Opções de Pagamento (informativas)</label>
          <button style={{ ...S.btn('sm'), background: '#b45309' }} onClick={addPag}>+ Opção</button>
        </div>
        {pagamentos.map((pag, i) => (
          <div key={i} style={{ background: '#1a1700', borderRadius: 8, padding: 12, marginBottom: 8, border: '1px solid #78350f' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: '#64748b' }}>Opção #{i + 1}</span>
              {i > 0 && <button style={S.btn('danger')} onClick={() => removePag(i)}>×</button>}
            </div>
            <div style={S.row('1fr 1fr 1fr')}>
              <div><label style={S.label}>Forma</label>
                <select style={S.select} value={pag.forma} onChange={e => setPag(i, 'forma', e.target.value)}>
                  <option value="">Selecione...</option>
                  {FORMAS_PAGAMENTO.filter(f => f !== 'TROCA').map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div><label style={S.label}>Valor (R$)</label><input style={S.input} type="number" step="0.01" value={pag.valor} onChange={e => setPag(i, 'valor', e.target.value)} /></div>
              <div><label style={S.label}>Detalhe</label><input style={S.input} value={pag.detalhe} onChange={e => setPag(i, 'detalhe', e.target.value)} placeholder="Ex: 12x sem juros" /></div>
            </div>
          </div>
        ))}
      </div>

      <div style={S.formGroup}>
        <label style={S.label}>Observação</label>
        <input style={S.input} value={form.observacao} onChange={e => setForm(f => ({ ...f, observacao: e.target.value }))} placeholder="Informações adicionais..." />
      </div>

      <div style={{ background: '#0f172a', borderRadius: 10, padding: 16, marginBottom: 16 }}>
        <span style={{ color: '#64748b', fontSize: 12 }}>Total do Orçamento: </span>
        <span style={{ color: '#34d399', fontWeight: 700 }}>{formatMoney(totalBruto)}</span>
      </div>

      {msg && <div style={{ color: '#f87171', fontSize: 13, marginBottom: 12 }}>{msg}</div>}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <button style={S.btn('ghost')} onClick={onClose}>Cancelar</button>
        <button style={{ ...S.btn(), background: '#1d4ed8' }} onClick={() => salvarEGerarPDF(false)} disabled={loading}>Salvar sem PDF</button>
        <button style={S.btn()} onClick={() => salvarEGerarPDF(true)} disabled={loading}>{loading ? 'Processando...' : '📄 Salvar e Gerar PDF'}</button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// APP PRINCIPAL
// ─────────────────────────────────────────────
// ─────────────────────────────────────────────
// CONFIGURAÇÕES
// ─────────────────────────────────────────────
function Configuracoes({ refresh }) {
  const [resetModal, setResetModal] = useState(null)
  const [loading, setLoading] = useState(false)
  const [resultado, setResultado] = useState(null)

  async function executarReset(tables) {
    setLoading(true)
    setResetModal(null)
    try {
      await Promise.all(tables.map(t => supabase.from(t).delete().not('id', 'is', null)))
      setResultado({ ok: true, msg: 'Dados zerados com sucesso!' })
      refresh()
    } catch (e) {
      setResultado({ ok: false, msg: 'Erro ao zerar dados: ' + e.message })
    }
    setLoading(false)
  }

  const secoes = [
    {
      id: 'aparelhos',
      icon: '📱',
      titulo: 'Aparelhos',
      desc: 'Apaga todo o cadastro de produtos e unidades em estoque de aparelhos.',
      tables: ['estoque_aparelhos', 'cadastro_aparelhos'],
      cor: '#3b82f6',
    },
    {
      id: 'acessorios',
      icon: '🎧',
      titulo: 'Acessórios',
      desc: 'Apaga todo o cadastro de acessórios e unidades em estoque.',
      tables: ['estoque_acessorios', 'cadastro_acessorios'],
      cor: '#8b5cf6',
    },
    {
      id: 'vendas',
      icon: '💰',
      titulo: 'Vendas & Orçamentos',
      desc: 'Apaga todo o histórico de vendas físicas, online e orçamentos.',
      tables: ['vendas'],
      cor: '#f59e0b',
    },
    {
      id: 'custos',
      icon: '💸',
      titulo: 'Custos Operacionais',
      desc: 'Apaga todos os registros de custos e despesas.',
      tables: ['custos'],
      cor: '#10b981',
    },
  ]

  return (
    <div>
      <div style={S.pageTitle}>⚙️ Configurações</div>
      <div style={S.pageSub}>Gerencie e redefina os dados do sistema</div>

      {resultado && (
        <div style={{ background: resultado.ok ? '#064e3b' : '#450a0a', border: `1px solid ${resultado.ok ? '#16a34a' : '#dc2626'}`, borderRadius: 10, padding: '12px 16px', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: resultado.ok ? '#34d399' : '#f87171', fontSize: 14, fontWeight: 600 }}>
            {resultado.ok ? '✅' : '❌'} {resultado.msg}
          </span>
          <button style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: 18 }} onClick={() => setResultado(null)}>×</button>
        </div>
      )}

      {/* Reset Geral */}
      <div style={{ ...S.card, borderTop: '3px solid #dc2626', marginBottom: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 20 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#f87171', marginBottom: 6 }}>🚨 Reset Geral</div>
            <div style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.6 }}>
              Apaga <strong style={{ color: '#e2e8f0' }}>TODOS</strong> os dados: aparelhos, acessórios, vendas, orçamentos e custos. <span style={{ color: '#f87171' }}>Ação irreversível.</span>
            </div>
          </div>
          <button
            style={{ ...S.btn('danger'), whiteSpace: 'nowrap', flexShrink: 0 }}
            onClick={() => setResetModal({
              title: '🚨 Reset Geral — Apagar TUDO',
              msg: 'Isso vai apagar permanentemente todos os aparelhos, acessórios, vendas, orçamentos e custos do sistema.',
              tables: ['estoque_aparelhos', 'cadastro_aparelhos', 'estoque_acessorios', 'cadastro_acessorios', 'vendas', 'custos'],
            })}
          >
            Zerar Tudo
          </button>
        </div>
      </div>

      {/* Reset por Seção */}
      <div style={{ fontSize: 11, color: '#475569', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 14 }}>Reset por seção</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {secoes.map(s => (
          <div key={s.id} style={{ ...S.card, borderTop: `3px solid ${s.cor}` }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#e2e8f0', marginBottom: 6 }}>{s.icon} {s.titulo}</div>
            <div style={{ fontSize: 13, color: '#64748b', marginBottom: 18, lineHeight: 1.5 }}>{s.desc}</div>
            <button
              style={{ ...S.btn('danger'), fontSize: 13 }}
              onClick={() => setResetModal({
                title: `Zerar ${s.titulo}`,
                msg: s.desc + ' Esta ação é irreversível.',
                tables: s.tables,
              })}
            >
              Zerar {s.titulo}
            </button>
          </div>
        ))}
      </div>

      {resetModal && (
        <ResetModal
          open={true}
          title={resetModal.title}
          msg={resetModal.msg}
          onConfirm={() => executarReset(resetModal.tables)}
          onCancel={() => setResetModal(null)}
        />
      )}

      {loading && (
        <div style={S.modal}>
          <div style={{ ...S.modalBox, maxWidth: 300, textAlign: 'center' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
            <div style={{ color: '#e2e8f0', fontSize: 15, fontWeight: 600 }}>Zerando dados...</div>
          </div>
        </div>
      )}
    </div>
  )
}

const NAV = [
  { id: 'dashboard', label: '📊 Dashboard', group: 'Geral' },
  { id: 'estoque-aparelhos', label: '📱 Aparelhos', group: 'Estoque' },
  { id: 'estoque-acessorios', label: '🎧 Acessórios', group: 'Estoque' },
  { id: 'vendas', label: '💰 Vendas', group: 'Operações' },
  { id: 'custos', label: '💸 Custos', group: 'Operações' },
  { id: 'configuracoes', label: '⚙️ Configurações', group: 'Sistema' },
]

export default function App() {
  const [page, setPage] = useState('dashboard')
  const [db, setDb] = useState({ vendas: [], custos: [], cadastro_aparelhos: [], estoque_aparelhos: [], cadastro_acessorios: [], estoque_acessorios: [] })
  const [loadingDb, setLoadingDb] = useState(true)

  const loadAll = useCallback(async () => {
    setLoadingDb(true)
    try {
      const [v, c, ca, ea, cac, eac] = await Promise.all([
        supabase.from('vendas').select('*').order('data_venda', { ascending: false }),
        supabase.from('custos').select('*').order('data', { ascending: false }),
        supabase.from('cadastro_aparelhos').select('*').order('cod'),
        supabase.from('estoque_aparelhos').select('*').order('data_aquisicao', { ascending: false }),
        supabase.from('cadastro_acessorios').select('*').order('cod'),
        supabase.from('estoque_acessorios').select('*').order('data_aquisicao', { ascending: false }),
      ])
      setDb({
        vendas: v.data || [],
        custos: c.data || [],
        cadastro_aparelhos: ca.data || [],
        estoque_aparelhos: ea.data || [],
        cadastro_acessorios: cac.data || [],
        estoque_acessorios: eac.data || [],
      })
    } catch (e) { console.error('Erro ao carregar dados:', e) }
    setLoadingDb(false)
  }, [])

  useEffect(() => { loadAll() }, [loadAll])

  // Agrupar nav
  const groups = [...new Set(NAV.map(n => n.group))]

  return (
    <div style={S.app}>
      {/* Sidebar */}
      <div style={S.sidebar}>
        <div style={S.sidebarLogo}>
          <div style={S.logoTitle}>CORE</div>
          <div style={S.logoSub}>Distribuidora Eletrônicos</div>
        </div>
        <div style={S.navList}>
          {groups.map(g => (
            <div key={g} style={S.navGroup}>
              <div style={S.navGroupLabel}>{g}</div>
              {NAV.filter(n => n.group === g).map(n => (
                <div key={n.id} style={S.navItem(page === n.id)} onClick={() => setPage(n.id)}>{n.label}</div>
              ))}
            </div>
          ))}
        </div>
        <div style={{ padding: '12px 16px', borderTop: '1px solid #334155', fontSize: 11, color: '#334155' }}>
          Sistema v1.0 · Core Distribuidora
        </div>
      </div>

      {/* Main Content */}
      <div style={S.main}>
        {loadingDb ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: '#475569' }}>
            Carregando dados...
          </div>
        ) : (
          <>
            {page === 'dashboard' && <Dashboard db={db} />}
            {page === 'estoque-aparelhos' && <EstoqueAparelhos db={db} refresh={loadAll} />}
            {page === 'estoque-acessorios' && <EstoqueAcessorios db={db} refresh={loadAll} />}
            {page === 'vendas' && <Vendas db={db} refresh={loadAll} />}
            {page === 'custos' && <Custos db={db} refresh={loadAll} />}
            {page === 'configuracoes' && <Configuracoes refresh={loadAll} />}
          </>
        )}
      </div>
    </div>
  )
}
