export const brl = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
export const brlK = (v) => (v >= 1e6 ? `R$ ${(v / 1e6).toFixed(1)} mi` : `R$ ${(v / 1e3).toFixed(0)} mil`)
export const num = (v) => v.toLocaleString('pt-BR')
export const pct = (v) => `${v >= 0 ? '+' : ''}${v.toFixed(1)}%`

export function groupSum(rows, key, field = 'valor') {
  const m = new Map()
  rows.forEach((r) => m.set(r[key], (m.get(r[key]) || 0) + r[field]))
  return [...m.entries()].map(([nome, valor]) => ({ nome, valor })).sort((a, b) => b.valor - a.valor)
}

export function exportCSV(filename, rows) {
  if (!rows.length) return
  const cols = Object.keys(rows[0])
  const esc = (v) => {
    let s = String(v instanceof Date ? v.toLocaleDateString('pt-BR') : v)
    // Evita que textos externos (consultas de busca) virem fórmulas no Excel
    if (typeof v === 'string' && /^[=+\-@\t\r]/.test(s)) s = `'${s}`
    return `"${s.replace(/"/g, '""')}"`
  }
  const csv = [cols.join(';'), ...rows.map((r) => cols.map((c) => esc(r[c])).join(';'))].join('\n')
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }))
  a.download = filename
  a.click()
}

export const CORES = ['#e4572e', '#1f6f8b', '#f3a712', '#4c956c', '#7b5ea7', '#8c8c8c']
