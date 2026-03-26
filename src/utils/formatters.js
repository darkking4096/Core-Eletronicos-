export function formatMoney(v) {
  if (!v && v !== 0) return 'R$ 0,00'
  return 'R$ ' + Number(v).toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

export function parseMoney(str) {
  if (!str) return 0
  if (typeof str === 'number') return str
  return parseFloat(str.toString().replace('R$', '').replace(/\s/g, '').replace(/\./g, '').replace(',', '.')) || 0
}

export function formatDate(dateStr) {
  if (!dateStr) return ''
  if (dateStr instanceof Date) {
    return dateStr.toLocaleDateString('pt-BR')
  }
  const [y, m, d] = dateStr.split('-')
  return `${d}/${m}/${y}`
}

export function toInputDate(dateStr) {
  if (!dateStr) return ''
  if (dateStr.includes('/')) {
    const [d, m, y] = dateStr.split('/')
    return `${y}-${m}-${d}`
  }
  return dateStr.split('T')[0]
}

export function today() {
  return new Date().toISOString().split('T')[0]
}

export function daysAgo(n) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().split('T')[0]
}

export function genId(prefix = '') {
  return prefix + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 5).toUpperCase()
}
