import { useState, useEffect, useMemo, useCallback } from 'react'
import { ReleasePlansCCService } from './generated/services/ReleasePlansCCService'
import './ReleasePlansExplorer.css'

// ── Types ──────────────────────────────────────────────────────────────────────

interface Feature {
  'Product name': string
  'Feature name': string
  'Investment area': string
  'Business value': string
  'Feature details': string
  'Enabled for': string
  'Early access date': string
  'Public preview date': string
  'GA date': string
  'GA Release Wave': string
  'Public Preview Release Wave': string
  'Release Plan ID': string
  ProductId: string
  GeographicAreasDetails?: string | string[]
}

type Cloud = 'commercial' | 'gcc' | 'gcc-high' | 'dod'

const CLOUD_LABELS: Record<Cloud, string> = {
  commercial: 'Commercial',
  gcc: 'GCC',
  'gcc-high': 'GCC High',
  dod: 'DoD',
}

interface CloudInfo {
  status: 'available' | 'not-supported' | 'not-announced'
  date?: string
}

function getCloudInfo(details: string | string[] | undefined, cloud: Exclude<Cloud, 'commercial'>): CloudInfo {
  if (!details) return { status: 'not-announced' }
  const text = Array.isArray(details) ? details.join('\n') : details
  if (!text) return { status: 'not-announced' }

  const parenPatterns = {
    'gcc-high': /US\s+GCC\s+High\b\s*\(([^)]*)\)/i,
    dod: /US\s+DoD\b\s*\(([^)]*)\)/i,
    gcc: /US\s+GCC(?!\s+High)\b\s*\(([^)]*)\)/i,
  } as const

  const m = text.match(parenPatterns[cloud])
  if (m) {
    const content = m[1].trim()
    if (/not\s+supported/i.test(content)) return { status: 'not-supported' }
    return { status: 'available', date: content }
  }

  const notSupportedPatterns = {
    'gcc-high': /US\s+GCC\s+High[^.,;]*not\s+supported/i,
    dod: /US\s+DoD[^.,;]*not\s+supported/i,
    gcc: /US\s+GCC(?!\s+High)[^.,;]*not\s+supported/i,
  } as const
  if (notSupportedPatterns[cloud].test(text)) return { status: 'not-supported' }

  return { status: 'not-announced' }
}

function formatCloudDate(dateStr: string): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

interface ApiResponse {
  morerecords: boolean
  totalrecords: string
  'paging-cookie-encoded': string
  results: Feature[]
}

type Status = 'GA' | 'Preview' | 'Early Access' | 'Planned'

// ── Utilities ─────────────────────────────────────────────────────────────────

function decodeEntities(text: string): string {
  if (!text) return ''
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
}

function stripHtml(html: string): string {
  if (!html) return ''
  return decodeEntities(html.replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim()
}

/** Sanitize HTML: keep safe formatting tags, make all links open in new tab */
function sanitizeHtml(html: string): string {
  if (!html) return ''
  let safe = html.replace(/<a\s/gi, '<a target="_blank" rel="noopener noreferrer" ')
  safe = safe.replace(/<(script|style|iframe)[^>]*>[\s\S]*?<\/\1>/gi, '')
  safe = safe.replace(/\s*on\w+="[^"]*"/gi, '')
  safe = safe.replace(/\s*on\w+='[^']*'/gi, '')
  return safe
}


function RichHtml({ html, className }: { html: string; className?: string }) {
  const sanitized = sanitizeHtml(html)
  if (!sanitized) return null
  return <div className={`rpe-rich ${className ?? ''}`} dangerouslySetInnerHTML={{ __html: sanitized }} />
}

function buildMailtoUrl(f: Feature): string {
  const status = f['GA date'] || f['GA Release Wave'] ? 'GA'
    : f['Public preview date'] || f['Public Preview Release Wave'] ? 'Preview'
    : f['Early access date'] ? 'Early Access' : 'Planned'
  const wave = f['GA Release Wave'] || f['Public Preview Release Wave']
  const bizValue = stripHtml(f['Business value'])

  const divider = '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'

  const lines: string[] = []
  lines.push(`📋  MICROSOFT RELEASE PLAN`)
  lines.push(divider)
  lines.push('')
  lines.push(`🚀  ${f['Feature name']}`)
  lines.push('')

  // Key details table
  lines.push(`📦  Product:          ${f['Product name']}`)
  lines.push(`📊  Status:           ${status}`)
  if (f['Investment area'])
    lines.push(`🏷️  Investment Area:  ${f['Investment area']}`)
  if (f['Enabled for'])
    lines.push(`👥  Enabled For:      ${f['Enabled for']}`)

  lines.push('')
  lines.push(`📅  KEY DATES`)
  lines.push('─────────────────────────────────────────')
  if (f['GA date'])
    lines.push(`    ✅  GA Date:              ${formatDate(f['GA date'])}`)
  if (f['Public preview date'])
    lines.push(`    🔵  Public Preview:       ${formatDate(f['Public preview date'])}`)
  if (f['Early access date'])
    lines.push(`    🟠  Early Access:         ${formatDate(f['Early access date'])}`)
  if (wave)
    lines.push(`    📦  Release Wave:         ${wave}`)
  if (!f['GA date'] && !f['Public preview date'] && !f['Early access date'])
    lines.push(`    ⏳  No dates announced yet`)

  if (bizValue) {
    lines.push('')
    lines.push(`💼  BUSINESS VALUE`)
    lines.push('─────────────────────────────────────────')
    lines.push(bizValue)
  }

  lines.push('')
  lines.push(divider)
  lines.push(`🔗  Source: https://releaseplans.microsoft.com`)
  lines.push('')
  lines.push(`— Shared from Microsoft Release Plans Explorer`)

  const subject = `[${status}] ${f['Feature name']} — ${f['Product name']}`
  return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join('\n'))}`
}

function buildBulkMailtoUrl(features: Feature[]): string {
  const divider = '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
  const lines: string[] = []
  lines.push(`📋  MICROSOFT RELEASE PLANS — ${features.length} Feature${features.length !== 1 ? 's' : ''}`)
  lines.push(divider)

  features.forEach((f, i) => {
    const status = f['GA date'] || f['GA Release Wave'] ? 'GA'
      : f['Public preview date'] || f['Public Preview Release Wave'] ? 'Preview'
      : f['Early access date'] ? 'Early Access' : 'Planned'
    const wave = f['GA Release Wave'] || f['Public Preview Release Wave']

    lines.push('')
    lines.push(`${i + 1}.  🚀  ${f['Feature name']}`)
    lines.push(`    📦  Product: ${f['Product name']}    |    📊  Status: ${status}`)
    if (f['Investment area'])
      lines.push(`    🏷️  Investment Area: ${f['Investment area']}`)

    const dates: string[] = []
    if (f['GA date']) dates.push(`✅ GA: ${formatDate(f['GA date'])}`)
    if (f['Public preview date']) dates.push(`🔵 Preview: ${formatDate(f['Public preview date'])}`)
    if (f['Early access date']) dates.push(`🟠 Early Access: ${formatDate(f['Early access date'])}`)
    if (wave) dates.push(`📦 Wave: ${wave}`)
    if (dates.length > 0) lines.push(`    📅  ${dates.join('    |    ')}`)

    if (f['Enabled for']) lines.push(`    👥  Enabled For: ${f['Enabled for']}`)
    lines.push('    ─────────────────────────────────────────')
  })

  lines.push('')
  lines.push(divider)
  lines.push(`🔗  Source: https://releaseplans.microsoft.com`)
  lines.push(`— Shared from Microsoft Release Plans Explorer`)

  const products = [...new Set(features.map(f => f['Product name']))]
  const subject = `Microsoft Release Plans: ${features.length} features — ${products.slice(0, 3).join(', ')}${products.length > 3 ? ` +${products.length - 3} more` : ''}`
  return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join('\n'))}`
}

function extractMailtoBody(mailto: string): string {
  const m = mailto.match(/[?&]body=([^&]*)/)
  return m ? decodeURIComponent(m[1]) : ''
}

function buildSingleHtml(f: Feature): { html: string; text: string } {
  const status = getStatus(f)
  const wave = f['GA Release Wave'] || f['Public Preview Release Wave']
  const badgeStyle = (s: Status) => {
    const map: Record<Status, string> = {
      'GA':           'background:#dff6dd;color:#0b6a0b;border:1px solid #9fd89f;',
      'Preview':      'background:#deecf9;color:#004578;border:1px solid #b3d4f0;',
      'Early Access': 'background:#fff4ce;color:#7a2e0b;border:1px solid #f4b183;',
      'Planned':      'background:#f3f2f1;color:#605e5c;border:1px solid #c8c6c4;',
    }
    return `display:inline-block;padding:3px 10px;font-size:12px;font-weight:600;border-radius:10px;${map[s]}`
  }

  const labelStyle = 'padding:6px 12px 6px 0;color:#605e5c;font-weight:600;width:140px;white-space:nowrap;vertical-align:top;'
  const valueStyle = 'padding:6px 0;color:#323130;vertical-align:top;'

  let html = `<div style="font-family:Segoe UI,Calibri,Arial,sans-serif;color:#323130;max-width:720px;">`
  html += `<div style="font-size:11px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;color:#605e5c;margin-bottom:4px;">Microsoft Release Plan</div>`
  html += `<h2 style="margin:0 0 8px;font-size:20px;color:#0078d4;">${escapeHtml(f['Feature name'] ?? '')}</h2>`
  html += `<div style="margin-bottom:16px;"><span style="${badgeStyle(status)}">${status}</span></div>`

  html += `<table style="border-collapse:collapse;font-size:14px;margin-bottom:16px;" cellpadding="0" cellspacing="0">`
  html += `<tr><td style="${labelStyle}">Product</td><td style="${valueStyle}">${escapeHtml(f['Product name'] ?? '')}</td></tr>`
  if (f['Investment area']) html += `<tr><td style="${labelStyle}">Investment Area</td><td style="${valueStyle}">${escapeHtml(f['Investment area'])}</td></tr>`
  if (f['Enabled for']) html += `<tr><td style="${labelStyle}">Enabled For</td><td style="${valueStyle}">${escapeHtml(f['Enabled for'])}</td></tr>`
  if (f['GA date']) html += `<tr><td style="${labelStyle}">GA Date</td><td style="${valueStyle}">${escapeHtml(formatDate(f['GA date']))}</td></tr>`
  if (f['Public preview date']) html += `<tr><td style="${labelStyle}">Public Preview</td><td style="${valueStyle}">${escapeHtml(formatDate(f['Public preview date']))}</td></tr>`
  if (f['Early access date']) html += `<tr><td style="${labelStyle}">Early Access</td><td style="${valueStyle}">${escapeHtml(formatDate(f['Early access date']))}</td></tr>`
  if (wave) html += `<tr><td style="${labelStyle}">Release Wave</td><td style="${valueStyle}">${escapeHtml(wave)}</td></tr>`
  html += `</table>`

  const bizValue = stripHtml(f['Business value'])
  if (bizValue) {
    html += `<div style="font-size:11px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;color:#605e5c;margin:18px 0 6px;">Business Value</div>`
    html += `<div style="font-size:14px;line-height:1.5;">${escapeHtml(bizValue)}</div>`
  }

  html += `<p style="margin:24px 0 0;color:#605e5c;font-size:12px;border-top:1px solid #edebe9;padding-top:12px;">`
  html += `Source: <a href="https://releaseplans.microsoft.com" style="color:#0078d4;">releaseplans.microsoft.com</a><br>`
  html += `— Shared from Microsoft Release Plans Explorer`
  html += `</p></div>`

  return { html, text: extractMailtoBody(buildMailtoUrl(f)) }
}

function buildBulkHtml(features: Feature[]): { html: string; text: string } {
  const badgeStyle = (s: Status) => {
    const map: Record<Status, string> = {
      'GA':           'background:#dff6dd;color:#0b6a0b;border:1px solid #9fd89f;',
      'Preview':      'background:#deecf9;color:#004578;border:1px solid #b3d4f0;',
      'Early Access': 'background:#fff4ce;color:#7a2e0b;border:1px solid #f4b183;',
      'Planned':      'background:#f3f2f1;color:#605e5c;border:1px solid #c8c6c4;',
    }
    return `display:inline-block;padding:2px 8px;font-size:11px;font-weight:600;border-radius:10px;${map[s]}`
  }

  const tableStyle = 'border-collapse:collapse;width:100%;font-family:Segoe UI,Calibri,Arial,sans-serif;font-size:13px;'
  const thStyle = 'text-align:left;padding:8px 10px;background:#f3f2f1;color:#323130;border-bottom:2px solid #d2d0ce;font-weight:600;'
  const tdStyle = 'padding:8px 10px;border-bottom:1px solid #edebe9;vertical-align:top;'

  let html = `<div style="font-family:Segoe UI,Calibri,Arial,sans-serif;color:#323130;">`
  html += `<h2 style="margin:0 0 6px;font-size:18px;color:#0078d4;">Microsoft Release Plans — ${features.length} Feature${features.length !== 1 ? 's' : ''}</h2>`
  html += `<p style="margin:0 0 18px;color:#605e5c;font-size:13px;">Selected from Microsoft Release Plans Explorer</p>`

  html += `<table style="${tableStyle}" border="0" cellspacing="0" cellpadding="0">`
  html += `<thead><tr>`
  html += `<th style="${thStyle}width:32px;">#</th>`
  html += `<th style="${thStyle}width:88px;">Status</th>`
  html += `<th style="${thStyle}">Feature</th>`
  html += `<th style="${thStyle}width:150px;">Product</th>`
  html += `<th style="${thStyle}width:130px;">Investment Area</th>`
  html += `<th style="${thStyle}width:110px;">Date</th>`
  html += `</tr></thead><tbody>`

  features.forEach((f, i) => {
    const status = getStatus(f)
    const date = f['GA date'] || f['Public preview date'] || f['Early access date'] || ''
    html += `<tr>`
    html += `<td style="${tdStyle}color:#605e5c;">${i + 1}</td>`
    html += `<td style="${tdStyle}"><span style="${badgeStyle(status)}">${status}</span></td>`
    html += `<td style="${tdStyle}"><span style="font-weight:600;">${escapeHtml(f['Feature name'] ?? '')}</span></td>`
    html += `<td style="${tdStyle}color:#605e5c;">${escapeHtml(f['Product name'] ?? '')}</td>`
    html += `<td style="${tdStyle}color:#605e5c;">${escapeHtml(f['Investment area'] ?? '')}</td>`
    html += `<td style="${tdStyle}color:#605e5c;white-space:nowrap;">${escapeHtml(date)}</td>`
    html += `</tr>`
  })
  html += `</tbody></table>`

  html += `<p style="margin:24px 0 0;color:#605e5c;font-size:12px;border-top:1px solid #edebe9;padding-top:12px;">`
  html += `Source: <a href="https://releaseplans.microsoft.com" style="color:#0078d4;">releaseplans.microsoft.com</a><br>`
  html += `— Shared from Microsoft Release Plans Explorer`
  html += `</p></div>`

  return { html, text: extractMailtoBody(buildBulkMailtoUrl(features)) }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function buildTimelineHtml(months: { year: number; month: number; features: Feature[] }[], days: number): { html: string; text: string } {
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  let total = 0
  months.forEach(m => { total += m.features.length })

  const badgeStyle = (status: Status) => {
    const map: Record<Status, string> = {
      'GA':           'background:#dff6dd;color:#0b6a0b;border:1px solid #9fd89f;',
      'Preview':      'background:#deecf9;color:#004578;border:1px solid #b3d4f0;',
      'Early Access': 'background:#fff4ce;color:#7a2e0b;border:1px solid #f4b183;',
      'Planned':      'background:#f3f2f1;color:#605e5c;border:1px solid #c8c6c4;',
    }
    return `display:inline-block;padding:2px 8px;font-size:11px;font-weight:600;border-radius:10px;${map[status]}`
  }

  const tableStyle = 'border-collapse:collapse;width:100%;font-family:Segoe UI,Calibri,Arial,sans-serif;font-size:13px;margin-bottom:18px;'
  const thStyle = 'text-align:left;padding:8px 10px;background:#f3f2f1;color:#323130;border-bottom:2px solid #d2d0ce;font-weight:600;'
  const tdStyle = 'padding:8px 10px;border-bottom:1px solid #edebe9;vertical-align:top;'

  let html = `<div style="font-family:Segoe UI,Calibri,Arial,sans-serif;color:#323130;">`
  html += `<h2 style="margin:0 0 4px;font-size:18px;color:#0078d4;">Microsoft Release Timeline — Next ${days} Days</h2>`
  html += `<p style="margin:0 0 20px;color:#605e5c;font-size:13px;">${total} feature${total !== 1 ? 's' : ''} upcoming</p>`

  months.forEach(({ year, month, features }) => {
    if (features.length === 0) return
    html += `<h3 style="margin:0 0 6px;font-size:15px;color:#323130;">${monthNames[month]} ${year} <span style="color:#605e5c;font-weight:400;font-size:13px;">(${features.length} feature${features.length !== 1 ? 's' : ''})</span></h3>`
    html += `<table style="${tableStyle}" border="0" cellspacing="0" cellpadding="0">`
    html += `<thead><tr>`
    html += `<th style="${thStyle}width:32px;">#</th>`
    html += `<th style="${thStyle}width:88px;">Status</th>`
    html += `<th style="${thStyle}">Feature</th>`
    html += `<th style="${thStyle}width:140px;">Product</th>`
    html += `<th style="${thStyle}width:100px;">Date</th>`
    html += `<th style="${thStyle}">Enabled For</th>`
    html += `</tr></thead><tbody>`

    features.forEach((f, i) => {
      const status = getStatus(f)
      const date = f['GA date'] || f['Public preview date'] || f['Early access date'] || ''
      html += `<tr>`
      html += `<td style="${tdStyle}color:#605e5c;">${i + 1}</td>`
      html += `<td style="${tdStyle}"><span style="${badgeStyle(status)}">${status}</span></td>`
      html += `<td style="${tdStyle}"><span style="font-weight:600;">${escapeHtml(f['Feature name'] ?? '')}</span></td>`
      html += `<td style="${tdStyle}color:#605e5c;">${escapeHtml(f['Product name'] ?? '')}</td>`
      html += `<td style="${tdStyle}color:#605e5c;white-space:nowrap;">${escapeHtml(date)}</td>`
      html += `<td style="${tdStyle}color:#605e5c;">${escapeHtml(f['Enabled for'] ?? '')}</td>`
      html += `</tr>`
    })
    html += `</tbody></table>`
  })

  html += `<p style="margin:24px 0 0;color:#605e5c;font-size:12px;border-top:1px solid #edebe9;padding-top:12px;">`
  html += `Source: <a href="https://releaseplans.microsoft.com" style="color:#0078d4;">releaseplans.microsoft.com</a><br>`
  html += `— Shared from Microsoft Release Plans Explorer`
  html += `</p></div>`

  // Plain-text fallback (reuses existing text builder logic, inlined for clarity)
  const text = buildTimelineMailtoUrl(months, days)
    .replace(/^mailto:\?subject=[^&]*&body=/, '')
  return { html, text: decodeURIComponent(text) }
}

async function copyRichToClipboard(html: string, text: string): Promise<boolean> {
  try {
    if (typeof ClipboardItem !== 'undefined' && navigator.clipboard?.write) {
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html': new Blob([html], { type: 'text/html' }),
          'text/plain': new Blob([text], { type: 'text/plain' }),
        }),
      ])
      return true
    }
  } catch {
    // fall through to plain-text fallback
  }
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

function buildTimelineMailtoUrl(months: { year: number; month: number; features: Feature[] }[], days: number): string {
  const divider = '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  const lines: string[] = []
  let total = 0
  months.forEach(m => { total += m.features.length })

  lines.push(`📋  MICROSOFT RELEASE TIMELINE — Next ${days} Days`)
  lines.push(`📊  ${total} feature${total !== 1 ? 's' : ''} upcoming`)
  lines.push(divider)

  months.forEach(({ year, month, features }) => {
    if (features.length === 0) return
    lines.push('')
    lines.push(`📅  ${monthNames[month]} ${year}  (${features.length} feature${features.length !== 1 ? 's' : ''})`)
    lines.push('─────────────────────────────────────────')

    features.forEach((f, i) => {
      const status = f['GA date'] || f['GA Release Wave'] ? 'GA'
        : f['Public preview date'] || f['Public Preview Release Wave'] ? 'Preview'
        : f['Early access date'] ? 'Early Access' : 'Planned'
      const date = f['GA date'] || f['Public preview date'] || f['Early access date']
      const icon = status === 'GA' ? '🟢' : status === 'Preview' ? '🔵' : status === 'Early Access' ? '🟠' : '⏳'
      lines.push(`  ${i + 1}. ${icon} [${status}] ${f['Feature name']}`)
      lines.push(`     📦 ${f['Product name']}${date ? `  |  📅 ${date}` : ''}`)
      if (f['Enabled for']) lines.push(`     👥 Enabled for: ${f['Enabled for']}`)
    })
  })

  lines.push('')
  lines.push(divider)
  lines.push(`🔗  Source: https://releaseplans.microsoft.com`)
  lines.push(`— Shared from Microsoft Release Plans Explorer`)

  const subject = `Microsoft Release Timeline: ${total} features in the next ${days} days`
  return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join('\n'))}`
}

function getStatus(f: Feature): Status {
  if (f['GA date'] || f['GA Release Wave']) return 'GA'
  if (f['Public preview date'] || f['Public Preview Release Wave']) return 'Preview'
  if (f['Early access date']) return 'Early Access'
  return 'Planned'
}

function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return dateStr
    return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  } catch {
    return dateStr
  }
}

function statusSlug(s: Status): string {
  return s.toLowerCase().replace(/\s+/g, '-')
}

function parseDate(dateStr: string): Date | null {
  if (!dateStr) return null
  const d = new Date(dateStr)
  if (!isNaN(d.getTime())) return d
  const match = dateStr.match(/^(\w+)\s+(\d{4})$/)
  if (match) {
    const d2 = new Date(`${match[1]} 1, ${match[2]}`)
    if (!isNaN(d2.getTime())) return d2
  }
  return null
}

// ── Product branding ─────────────────────────────────────────────────────────

const PRODUCT_BRANDING: Record<string, { color: string; abbr: string }> = {
  'Dynamics 365':        { color: '#002050', abbr: 'D365' },
  'Microsoft 365':       { color: '#D83B01', abbr: 'M365' },
  'Power BI':            { color: '#E8B800', abbr: 'PBI' },
  'Power Apps':          { color: '#742774', abbr: 'PApps' },
  'Power Automate':      { color: '#0066FF', abbr: 'PAuto' },
  'Power Pages':         { color: '#2B579A', abbr: 'PP' },
  'Microsoft Teams':     { color: '#6264A7', abbr: 'Tms' },
  'Microsoft Viva':      { color: '#6264A7', abbr: 'Vv' },
  'Microsoft Copilot':   { color: '#5B5FC7', abbr: 'MCS' },
  'Copilot Studio':      { color: '#5B5FC7', abbr: 'MCS' },
  'Azure':               { color: '#0078D4', abbr: 'Az' },
  'Microsoft Fabric':    { color: '#117865', abbr: 'Fab' },
  'Microsoft Supply Chain Center': { color: '#0B6A0B', abbr: 'SC' },
  'Industry Solutions':  { color: '#0B6A0B', abbr: 'IS' },
  'Commerce':            { color: '#003C71', abbr: 'Com' },
  'Finance':             { color: '#003C71', abbr: 'Fin' },
  'Human Resources':     { color: '#9B59B6', abbr: 'HR' },
  'Customer Service':    { color: '#008272', abbr: 'CS' },
  'Field Service':       { color: '#498205', abbr: 'FS' },
  'Sales':               { color: '#004B87', abbr: 'Sal' },
  'Marketing':           { color: '#C43E1C', abbr: 'Mkt' },
  'Supply Chain Management': { color: '#0B6A0B', abbr: 'SCM' },
  'Project Operations':  { color: '#004B1C', abbr: 'PO' },
  'Business Central':    { color: '#004B87', abbr: 'BC' },
  'Guides':              { color: '#0078D4', abbr: 'Gd' },
  'Remote Assist':       { color: '#0078D4', abbr: 'RA' },
  'Customer Insights':   { color: '#008272', abbr: 'CI' },
}

function getProductBranding(name: string): { color: string; abbr: string } {
  if (!name) return { color: '#605e5c', abbr: '?' }
  // Exact match
  if (PRODUCT_BRANDING[name]) return PRODUCT_BRANDING[name]
  // Partial match: "Dynamics 365 Sales" → "Dynamics 365"
  for (const [key, val] of Object.entries(PRODUCT_BRANDING)) {
    if (name.includes(key)) return { ...val }
  }
  // Generate from name
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  const hue = Math.abs(hash % 360)
  const words = name.split(/[\s-]+/).filter(Boolean)
  const abbr = words.length >= 2
    ? (words[0][0] + words[1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase()
  return { color: `hsl(${hue}, 50%, 38%)`, abbr }
}

// ── Product SVG icons ─────────────────────────────────────────────────────────

const PowerAppsSvg = () => (
  <svg viewBox="0 0 96 96" fill="none">
    <path d="M44.16 9.77L62.93 42.62c1.9 3.33 1.9 7.43 0 10.76L44.16 86.23c-5.38 9.4-18.94 9.41-24.31 0L2.25 55.44a10.98 10.98 0 010-14.88L19.84 9.77c5.38-9.41 18.94-9.41 24.31 0z" fill="url(#_pa0)"/>
    <path d="M66 48L44.16 86.23c-5.38 9.4-18.94 9.4-24.31 0L2 55c5.31 9.29 18.69 9.29 24 0L48 16.5 66 48z" fill="url(#_pa1)"/>
    <path d="M54.95 28.66L82 76l11.39-19.93a16.46 16.46 0 000-16.14L76.16 9.77c-5.38-9.41-18.94-9.41-24.31 0L41.05 28.66c3.07-5.38 10.82-5.38 13.89 0z" fill="url(#_pa2)"/>
    <path d="M79.73 23.97L48 79.5l3.84 6.73c5.38 9.4 18.94 9.41 24.31 0l17.88-31.28a16.46 16.46 0 000-13.89L79.73 16.03c1.41 2.46 1.41 5.48 0 7.94z" fill="url(#_pa3)"/>
    <path d="M51.84 86.23L48 79.5 66 48l16 28-5.84 10.23c-5.38 9.4-18.94 9.4-24.31 0z" fill="url(#_pa4)"/>
    <defs>
      <linearGradient id="_pa0" x1="16" y1="60.5" x2="28" y2="5" gradientUnits="userSpaceOnUse"><stop stopColor="#520B56"/><stop offset="1" stopColor="#742774"/></linearGradient>
      <linearGradient id="_pa1" x1="12" y1="71" x2="59.5" y2="41.5" gradientUnits="userSpaceOnUse"><stop stopColor="#D467B9"/><stop offset=".31" stopColor="#982F90"/><stop offset="1" stopColor="#742774"/></linearGradient>
      <linearGradient id="_pa2" x1="43" y1="29" x2="82.5" y2="56" gradientUnits="userSpaceOnUse"><stop stopColor="#E9A1CB"/><stop offset=".41" stopColor="#D467B9"/><stop offset="1" stopColor="#BB35A4"/></linearGradient>
      <linearGradient id="_pa3" x1="89.26" y1="77.16" x2="76.45" y2="41.38" gradientUnits="userSpaceOnUse"><stop stopColor="#E48CC7"/><stop offset="1" stopColor="#F7C4E2"/></linearGradient>
      <linearGradient id="_pa4" x1="75.2" y1="77.58" x2="54.87" y2="32.08" gradientUnits="userSpaceOnUse"><stop stopColor="#E48CC7" stopOpacity="0"/><stop offset=".68" stopColor="#D467B9" stopOpacity=".5"/><stop offset="1" stopColor="#BB35A4"/></linearGradient>
    </defs>
  </svg>
)

const DataverseSvg = () => (
  <svg viewBox="0 0 96 96" fill="none">
    <path d="M13.88 21.82c15.23-13.69 35.87-13.64 49.08-2.91 12.03 9.77 14.52 25.4 7.9 36.87-6.62 11.46-18.32 14.36-31.35 6.84l-7.77 13.46c-4.31 7.45-13.83 10-21.28 5.7A15.97 15.97 0 013.97 74.55C-4.08 55.78.2 34.12 13.88 21.82z" fill="url(#_dv0)"/>
    <path d="M85.43 14.22a15.97 15.97 0 016.52 7.32C99.94 40.29 95.65 61.91 82 74.18c-15.23 13.69-35.87 13.64-49.08 2.91-12.03-9.77-14.52-25.4-7.9-36.87 6.62-11.46 18.32-14.36 31.35-6.84l7.77-13.46c4.3-7.45 13.83-10 21.28-5.7z" fill="url(#_dv1)"/>
    <path d="M39.5 62.63c13.03 7.52 24.73 4.62 31.35-6.84 6.4-11.08 4.29-26.04-6.7-35.85L56.38 33.38 39.5 62.63z" fill="url(#_dv2)"/>
    <path d="M56.38 33.38c-13.03-7.52-24.73-4.62-31.35 6.84-6.4 11.08-4.29 26.04 6.7 35.85l7.77-13.45 16.88-29.25z" fill="url(#_dv3)"/>
    <circle cx="47.94" cy="47.9" r="14.63" transform="rotate(-30 47.94 47.9)" fill="url(#_dv4)"/>
    <defs>
      <radialGradient id="_dv0" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(46 49.5) rotate(-148.7) scale(46.2 47.5)"><stop offset=".47" stopColor="#09442A"/><stop offset=".7" stopColor="#136C6C"/><stop offset="1" stopColor="#22918B"/></radialGradient>
      <radialGradient id="_dv1" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(50.5 44.5) rotate(30.8) scale(46 44.5)"><stop offset=".36" stopColor="#136C6C"/><stop offset=".79" stopColor="#42B870"/><stop offset="1" stopColor="#76D45E"/></radialGradient>
      <radialGradient id="_dv2" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(47.5 48) rotate(-58.9) scale(32.7)"><stop offset=".49" stopColor="#22918B"/><stop offset=".73" stopColor="#42B870"/><stop offset="1" stopColor="#43E5CA"/></radialGradient>
      <radialGradient id="_dv3" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(47.4 49) rotate(119.9) scale(31.1 29.4)"><stop offset=".46" stopColor="#08494E"/><stop offset=".74" stopColor="#1A7F7C"/><stop offset="1" stopColor="#309C61"/></radialGradient>
      <radialGradient id="_dv4" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(52.5 40) rotate(120.8) scale(27.4)"><stop stopColor="#C8F5B7"/><stop offset=".25" stopColor="#98F0B0"/><stop offset=".64" stopColor="#52D17C"/><stop offset="1" stopColor="#119FC5"/></radialGradient>
    </defs>
  </svg>
)

const PowerAutomateSvg = () => (
  <svg viewBox="0 0 96 96" fill="none">
    <path d="M52.51 3c2.86 0 5.58 1.22 7.47 3.36L82.66 31.86c6.25 7.04 2.34 18.2-6.94 19.8L21.5 61l6.8-7.69c2.68-3.03 2.68-7.59-.01-10.61L7.79 19.64C2.06 13.19 6.64 3 15.27 3h37.24z" fill="url(#_pf0)"/>
    <path d="M15.27 93C6.64 93 2.06 82.81 7.79 76.36L59.09 18.64c3.37-3.79 3.37-9.5 0-13.28L57 3l34.09 38.36c3.37 3.79 3.37 9.5 0 13.28L59.98 89.64A10.98 10.98 0 0152.51 93H15.27z" fill="url(#_pf1)"/>
    <path d="M38.36 93c-5.18 0-7.93-6.12-4.48-9.99L75.09 36.64c3.37-3.79 3.37-9.5 0-13.28L71 18.75l20.09 22.61c3.37 3.79 3.37 9.5 0 13.28L59.98 89.64A10.98 10.98 0 0152.51 93H38.36z" fill="url(#_pf2)"/>
    <defs>
      <linearGradient id="_pf0" x1="48" y1="31.5" x2="14" y2="-2.5" gradientUnits="userSpaceOnUse"><stop stopColor="#102784"/><stop offset=".27" stopColor="#1B44B1"/><stop offset="1" stopColor="#2764E7"/></linearGradient>
      <linearGradient id="_pf1" x1="76.5" y1="25" x2="11.5" y2="91.5" gradientUnits="userSpaceOnUse"><stop stopColor="#0FAFFF"/><stop offset=".18" stopColor="#4894FE"/><stop offset="1" stopColor="#2764E7"/></linearGradient>
      <linearGradient id="_pf2" x1="89" y1="38.5" x2="43" y2="90.5" gradientUnits="userSpaceOnUse"><stop stopColor="#6CE0FF"/><stop offset=".21" stopColor="#66C0FF"/><stop offset="1" stopColor="#58AAFE"/></linearGradient>
    </defs>
  </svg>
)

const PowerPagesSvg = () => (
  <svg viewBox="0 0 96 96" fill="none">
    <path d="M17 59.68l36.83-27.71a10.98 10.98 0 0111.68-.01l25.2 18.9c5.18 3.89 5.19 11.66.01 15.55L54.2 93.91a10.98 10.98 0 01-12.39 0L17 75.22c-5.17-3.89-5.17-11.65 0-15.54z" fill="url(#_pp0)"/>
    <path d="M5.3 29.59l36.5-27.5a10.98 10.98 0 0112.39 0l24.81 18.68c5.17 3.89 5.17 11.65 0 15.54L42.17 64.03a10.98 10.98 0 01-11.68.01L5.31 45.14c-5.18-3.89-5.19-11.65 0-15.55z" fill="url(#_pp1)"/>
    <path d="M43.16 65.67l38.86-15.7a10.98 10.98 0 019.08 1.19L65.56 32a10.98 10.98 0 00-12.71-1.66L13.98 46.03a10.98 10.98 0 01-9.08-1.19l25.55 19.16a10.98 10.98 0 0012.71 1.66z" fill="url(#_pp2)"/>
    <defs>
      <linearGradient id="_pp0" x1="45.57" y1="98.57" x2="72.8" y2="40.22" gradientUnits="userSpaceOnUse"><stop stopColor="#6864F6"/><stop offset=".53" stopColor="#4A43CB"/><stop offset="1" stopColor="#5B2AB5"/></linearGradient>
      <linearGradient id="_pp1" x1="71.67" y1="5.52" x2="8.44" y2="47.39" gradientUnits="userSpaceOnUse"><stop stopColor="#AC80FF"/><stop offset=".66" stopColor="#7B7BFF"/><stop offset="1" stopColor="#5750E2"/></linearGradient>
      <linearGradient id="_pp2" x1="21" y1="69.5" x2="70.72" y2="29.64" gradientUnits="userSpaceOnUse"><stop stopColor="#58AAFE"/><stop offset=".28" stopColor="#8F8FFF"/><stop offset=".67" stopColor="#A3A3FF"/><stop offset="1" stopColor="#CEB0FF"/></linearGradient>
    </defs>
  </svg>
)

const PowerPlatformSvg = () => (
  <svg viewBox="0 0 96 96" fill="none">
    <path d="M38.1 71.69L31.65 91.04c-1.53 4.6-7.17 6.29-10.98 3.28L4.9 81.87A10.98 10.98 0 011.97 72.08C3.18 68.45 6.58 66 10.41 66H46c-3.58 0-6.76 2.29-7.9 5.69z" fill="url(#_pl0)"/>
    <path d="M24.32 30h36.51c13.95 0 28.31 10.02 24.45 21.59l10.12-30.31C98.19 13.12 89.45 0 69.82 0H30.32a5.49 5.49 0 00-5.69 4.1L18.63 22.1C17.34 25.99 20.23 30 24.32 30z" fill="url(#_pl1)"/>
    <path d="M59.83 66H11.21a10.98 10.98 0 00-9.49 6.83l10-30C13.08 38.75 16.9 36 21.21 36h48.6c13.45 0 22.81-6.33 25.69-14.97l-10.2 30.67C82.95 58.69 74.5 66 59.83 66z" fill="url(#_pl2)"/>
    <defs>
      <linearGradient id="_pl0" x1="4" y1="70" x2="16" y2="105.5" gradientUnits="userSpaceOnUse"><stop stopColor="#309C61"/><stop offset="1" stopColor="#1EC8B0"/></linearGradient>
      <linearGradient id="_pl1" x1="30" y1="12.5" x2="90.42" y2="29.19" gradientUnits="userSpaceOnUse"><stop stopColor="#20AC9D"/><stop offset=".57" stopColor="#1A7F7C"/><stop offset="1" stopColor="#024169"/></linearGradient>
      <linearGradient id="_pl2" x1="16" y1="41" x2="74" y2="65.5" gradientUnits="userSpaceOnUse"><stop stopColor="#76EB95"/><stop offset=".18" stopColor="#52D17C"/><stop offset=".71" stopColor="#22918B"/><stop offset="1" stopColor="#0C74A1"/></linearGradient>
    </defs>
  </svg>
)

const CopilotStudioSvg = () => (
  <svg viewBox="0 0 96 96" fill="none">
    <path d="M64.32 4.77C52.31.77 46.3-1.23 42.15 1.76 38 4.76 38 11.09 38 23.75V34l-9.68-3.23C16.31 26.77 10.3 24.77 6.15 27.76 2 30.76 2 37.09 2 49.75v17.84c0 6.95 0 10.43 1.89 13.05 1.89 2.62 5.19 3.72 11.79 5.92l4.33 1.44 13.89 4.63c7.16 2.39 10.74 3.58 14.33 3.03 3.58-.55 6.64-2.77 12.75-7.2l18.62-13.48c5.03-3.64 7.98-5.78 9.77-8.23.56-.73 1.07-1.52 1.6-2.41C93 61.95 92 58.19 92 50.68V28.42c0-6.96 0-10.44-1.89-13.05-1.89-2.62-5.19-3.72-11.79-5.92l-14-4.67z" fill="url(#_cs0)"/>
    <path d="M56 54.42c0-6.96 0-10.44-1.89-13.06-1.89-2.62-5.19-3.72-11.79-5.92L28.32 30.77C16.31 26.77 10.3 24.77 6.15 27.76 2 30.76 2 37.09 2 49.75v17.84c0 6.95 0 10.43 1.89 13.05 1.89 2.62 5.19 3.72 11.79 5.92l14 4.67c12.01 4 18.02 6 22.17 3.01C56 91.24 56 84.91 56 72.25V54.42z" fill="url(#_cs1)"/>
    <path d="M92 50.68c0 7.51 0 11.27-1.64 14.48l-.52.84c-.16.26-.33.52-.51.75-1.8 2.45-4.75 4.59-9.77 8.23L60.97 88.47c-6.12 4.43-9.17 6.64-12.75 7.19-3.59.55-7.17-.64-14.33-3.03L25.22 89.74 20 88l.002-.001 1.78-.63 1.56-.52c6.3-2.1 9.51-3.21 11.4-5.83C37 78.02 37 74.54 37 67.58V49.75c0-11.33 0-18.87 3.07-21.87s9.12-1.23 21.25 2.83l14 4.67c6.6 2.2 9.9 3.3 11.79 5.92C89 43.98 89 47.46 89 54.42" fill="url(#_cs2)"/>
    <defs>
      <linearGradient id="_cs0" x1="53.5" y1="77" x2="81" y2="10" gradientUnits="userSpaceOnUse"><stop stopColor="#2764E7"/><stop offset=".31" stopColor="#8B52F4"/><stop offset=".54" stopColor="#BB45EA"/><stop offset=".8" stopColor="#DB56C6"/><stop offset="1" stopColor="#F462AB"/></linearGradient>
      <radialGradient id="_cs1" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(61.4 89.3) rotate(-124.9) scale(82.1)"><stop stopColor="#2764E7"/><stop offset=".23" stopColor="#0094F0"/><stop offset=".44" stopColor="#19B2CE"/><stop offset=".7" stopColor="#52D17C"/><stop offset="1" stopColor="#FFD638"/></radialGradient>
      <radialGradient id="_cs2" cx="0" cy="0" r="1" gradientTransform="matrix(23 13 8.91 -13.05 43 68)" gradientUnits="userSpaceOnUse"><stop stopColor="#1B44B1"/><stop offset="1" stopColor="#367AF2" stopOpacity="0"/></radialGradient>
    </defs>
  </svg>
)

// Map product names to SVG components
function getProductSvg(name: string): (() => React.JSX.Element) | null {
  const lower = name.toLowerCase()
  if (lower.includes('power apps'))      return PowerAppsSvg
  if (lower.includes('power automate'))  return PowerAutomateSvg
  if (lower.includes('power pages'))     return PowerPagesSvg
  if (lower.includes('power platform'))  return PowerPlatformSvg
  if (lower.includes('copilot studio'))  return CopilotStudioSvg
  if (lower.includes('dataverse'))       return DataverseSvg
  return null
}

function ProductAvatar({ name, size = 'sm' }: { name: string; size?: 'sm' | 'xs' }) {
  const SvgIcon = getProductSvg(name)
  if (SvgIcon) {
    return (
      <span className={`rpe-pavatar rpe-pavatar--svg rpe-pavatar--${size}`} title={name} aria-label={name}>
        <SvgIcon />
      </span>
    )
  }
  const { color, abbr } = getProductBranding(name)
  return (
    <span
      className={`rpe-pavatar rpe-pavatar--${size}`}
      style={{ backgroundColor: color }}
      title={name}
      aria-label={name}
    >
      {abbr}
    </span>
  )
}

// ── Constants ────────────────────────────────────────────────────────────────

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

// Broad product categories
type Category = '' | 'dynamics' | 'power' | 'copilot'

const DYNAMICS_KEYWORDS = [
  'dynamics 365', 'commerce', 'finance', 'human resources', 'customer service',
  'field service', 'sales', 'marketing', 'supply chain', 'project operations',
  'business central', 'customer insights', 'guides', 'remote assist',
  'industry solutions', 'mixed reality',
]
const POWER_KEYWORDS = [
  'power bi', 'power apps', 'power automate', 'power pages', 'power platform',
  'power virtual',
]
const COPILOT_KEYWORDS = [
  'copilot', 'microsoft copilot', 'copilot studio',
]

const CATEGORY_KEYWORDS: Record<Exclude<Category, ''>, string[]> = {
  dynamics: DYNAMICS_KEYWORDS,
  power: POWER_KEYWORDS,
  copilot: COPILOT_KEYWORDS,
}

function matchesCategory(productName: string, cat: Category): boolean {
  if (!cat) return true
  const lower = productName.toLowerCase()
  return CATEGORY_KEYWORDS[cat].some(kw => lower.includes(kw))
}
const ITEMS_PER_PAGE = 10
const API_FALLBACK = 'https://releaseplans.microsoft.com/en-US/allreleaseplans'

async function fetchPage(page: number): Promise<ApiResponse> {
  // Try the generated Power Apps connector service
  try {
    const result = await ReleasePlansCCService.GetReleasePlans(page)
    if (result.success && result.data) return result.data as unknown as ApiResponse
  } catch {
    // Connector unavailable (local mode) — fall through to direct fetch
  }

  // Fallback: direct fetch. Hint pageSize=500 in case server honors it (no-op otherwise).
  const params = new URLSearchParams()
  if (page > 1) params.set('page', String(page))
  params.set('pageSize', '500')
  const url = `${API_FALLBACK}/${params.toString() ? `?${params}` : ''}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`)
  return res.json()
}

// ── Icons ────────────────────────────────────────────────────────────────────

const IconLayers = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
)
const IconWave = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>
)
const IconCalendar = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
)
const IconUsers = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg>
)
const IconShare = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
)

const IconSearch = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
)

// ── Component ────────────────────────────────────────────────────────────────

export default function ReleasePlansExplorer() {
  const [allFeatures, setAllFeatures] = useState<Feature[]>([])
  const [loading, setLoading] = useState(true)
  const [loadedPages, setLoadedPages] = useState(0)
  const [estimatedPages, setEstimatedPages] = useState(5)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<Category>('')
  const [search, setSearch] = useState('')
  const [selectedProduct, setSelectedProduct] = useState('')
  const [selectedWave, setSelectedWave] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [selectedCloud, setSelectedCloud] = useState<Cloud>('commercial')
  const [cloudAvail, setCloudAvail] = useState<Set<CloudInfo['status']>>(
    () => new Set(['available', 'not-supported', 'not-announced'] as CloudInfo['status'][])
  )
  const [dateRange, setDateRange] = useState('last12')

  // Card pagination + expand + bulk select
  const [currentPage, setCurrentPage] = useState(1)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  // View toggle
  const [view, setView] = useState<'cards' | 'calendar' | 'timeline'>('cards')
  const [toast, setToast] = useState<string | null>(null)
  const [debugMode, setDebugMode] = useState(false)
  const [calYear, setCalYear] = useState(() => new Date().getFullYear())
  const [selectedCalMonth, setSelectedCalMonth] = useState<number | null>(null)
  const [timelineDays, setTimelineDays] = useState(90)

  // ── Fetch ──────────────────────────────────────────────────────────────────

  useEffect(() => {
    let cancelled = false

    function processResults(rawResults: Feature[]): Feature[] {
      return (rawResults ?? []).map(f => {
        const cleaned = { ...f }
        for (const key of ['Feature name', 'Product name', 'Investment area', 'Enabled for', 'Early access date', 'Public preview date', 'GA date', 'GA Release Wave', 'Public Preview Release Wave'] as const) {
          if (cleaned[key]) cleaned[key] = decodeEntities(cleaned[key])
        }
        if (cleaned.GeographicAreasDetails) {
          const gad = cleaned.GeographicAreasDetails
          cleaned.GeographicAreasDetails = Array.isArray(gad)
            ? gad.map(s => typeof s === 'string' ? decodeEntities(s) : s)
            : typeof gad === 'string' ? decodeEntities(gad) : gad
        }
        return cleaned
      })
    }

    async function fetchAll() {
      try {
        // Page 1 gives us totalrecords + actual per-page size
        const first = await fetchPage(1)
        if (cancelled) return

        const pageMap = new Map<number, Feature[]>()
        pageMap.set(1, processResults(first.results ?? []))

        const pageSize = first.results?.length ?? 100
        const total = parseInt(first.totalrecords, 10) || 0
        const totalPages = first.morerecords && pageSize > 0
          ? Math.max(1, Math.ceil(total / pageSize))
          : 1

        setEstimatedPages(totalPages)
        setLoadedPages(1)
        setAllFeatures(pageMap.get(1)!.slice())

        if (totalPages <= 1) return

        // Fan out remaining pages with bounded concurrency
        const CONCURRENCY = 6
        let nextPage = 2
        let completed = 1

        const flatten = () => {
          const flat: Feature[] = []
          for (let p = 1; p <= totalPages; p++) {
            const arr = pageMap.get(p)
            if (arr) flat.push(...arr)
          }
          return flat
        }

        const worker = async () => {
          while (!cancelled) {
            const page = nextPage++
            if (page > totalPages) return
            const data = await fetchPage(page)
            if (cancelled) return
            pageMap.set(page, processResults(data.results ?? []))
            completed++
            setLoadedPages(completed)
            setAllFeatures(flatten())
          }
        }

        await Promise.all(Array.from({ length: Math.min(CONCURRENCY, totalPages - 1) }, () => worker()))
      } catch (e) {
        if (e instanceof Error) {
          setError(e.message)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchAll()
    return () => { cancelled = true }
  }, [])

  // ── Derived data ───────────────────────────────────────────────────────────

  const products = useMemo(() => {
    const s = new Set(
      allFeatures
        .map(f => f['Product name'])
        .filter(p => p && matchesCategory(p, selectedCategory))
    )
    return [...s].sort()
  }, [allFeatures, selectedCategory])

  const waves = useMemo(() => {
    const s = new Set<string>()
    allFeatures.forEach(f => {
      if (f['GA Release Wave']) s.add(f['GA Release Wave'])
      if (f['Public Preview Release Wave']) s.add(f['Public Preview Release Wave'])
    })
    return [...s].sort()
  }, [allFeatures])

  const availableYears = useMemo(() => {
    const currentYear = new Date().getFullYear()
    return [currentYear, currentYear - 1]
  }, [])

  const dateRangeBounds = useMemo<{ from: Date; to: Date } | null>(() => {
    if (dateRange === 'all') return null
    if (dateRange === 'last12') {
      const from = new Date()
      from.setMonth(from.getMonth() - 6)
      const to = new Date()
      to.setMonth(to.getMonth() + 6)
      return { from, to }
    }
    const year = parseInt(dateRange)
    if (isNaN(year)) return null
    return { from: new Date(year, 0, 1), to: new Date(year, 11, 31, 23, 59, 59) }
  }, [dateRange])

  const preCloudFiltered = useMemo(() => {
    const q = search.toLowerCase().trim()
    return allFeatures.filter(f => {
      // Date range
      if (dateRangeBounds) {
        const ds = f['GA date'] || f['Public preview date'] || f['Early access date']
        if (!ds) return false
        const d = parseDate(ds)
        if (!d || d < dateRangeBounds.from || d > dateRangeBounds.to) return false
      }
      if (q) {
        const hay = [f['Feature name'], f['Product name'], f['Investment area'], stripHtml(f['Business value'])].join(' ').toLowerCase()
        if (!hay.includes(q)) return false
      }
      if (selectedCategory && !matchesCategory(f['Product name'] ?? '', selectedCategory)) return false
      if (selectedProduct && f['Product name'] !== selectedProduct) return false
      if (selectedWave && f['GA Release Wave'] !== selectedWave && f['Public Preview Release Wave'] !== selectedWave) return false
      if (selectedStatus && getStatus(f) !== selectedStatus) return false
      return true
    })
  }, [allFeatures, search, selectedCategory, selectedProduct, selectedWave, selectedStatus, dateRangeBounds])

  const cloudCounts = useMemo(() => {
    if (selectedCloud === 'commercial') return null
    const counts: Record<CloudInfo['status'], number> = { available: 0, 'not-supported': 0, 'not-announced': 0 }
    preCloudFiltered.forEach(f => {
      const info = getCloudInfo(f.GeographicAreasDetails, selectedCloud)
      counts[info.status]++
    })
    return counts
  }, [preCloudFiltered, selectedCloud])

  const filtered = useMemo(() => {
    if (selectedCloud === 'commercial') return preCloudFiltered
    return preCloudFiltered.filter(f => {
      const info = getCloudInfo(f.GeographicAreasDetails, selectedCloud)
      return cloudAvail.has(info.status)
    })
  }, [preCloudFiltered, selectedCloud, cloudAvail])

  const gaCount = useMemo(() => filtered.filter(f => getStatus(f) === 'GA').length, [filtered])
  const previewCount = useMemo(() => filtered.filter(f => getStatus(f) === 'Preview').length, [filtered])

  // Month-wise grouping for calendar
  const featuresByMonth = useMemo(() => {
    const map = new Map<string, Feature[]>()
    filtered.forEach(f => {
      const ds = f['GA date'] || f['Public preview date'] || f['Early access date']
      if (!ds) return
      const d = parseDate(ds)
      if (!d) return
      const key = `${d.getFullYear()}-${d.getMonth()}`
      const arr = map.get(key)
      if (arr) arr.push(f)
      else map.set(key, [f])
    })
    return map
  }, [filtered])

  const selectedMonthFeatures = useMemo(() => {
    if (selectedCalMonth == null) return []
    return featuresByMonth.get(`${calYear}-${selectedCalMonth}`) ?? []
  }, [featuresByMonth, calYear, selectedCalMonth])

  // Timeline data — features from today forward, grouped by month
  const timelineData = useMemo(() => {
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    const end = new Date(now)
    end.setDate(end.getDate() + timelineDays)

    const inRange = filtered.filter(f => {
      const ds = f['GA date'] || f['Public preview date'] || f['Early access date']
      if (!ds) return false
      const d = parseDate(ds)
      return d != null && d >= now && d <= end
    })

    const monthMap = new Map<string, Feature[]>()
    inRange.forEach(f => {
      const ds = f['GA date'] || f['Public preview date'] || f['Early access date']
      const d = parseDate(ds)!
      const key = `${d.getFullYear()}-${d.getMonth()}`
      const arr = monthMap.get(key)
      if (arr) arr.push(f)
      else monthMap.set(key, [f])
    })

    const months: { year: number; month: number; features: Feature[] }[] = []
    const cursor = new Date(now.getFullYear(), now.getMonth(), 1)
    while (cursor <= end) {
      const key = `${cursor.getFullYear()}-${cursor.getMonth()}`
      months.push({ year: cursor.getFullYear(), month: cursor.getMonth(), features: monthMap.get(key) ?? [] })
      cursor.setMonth(cursor.getMonth() + 1)
    }

    return { months, total: inRange.length }
  }, [filtered, timelineDays])

  // Cards pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE))
  const safePage = Math.min(currentPage, totalPages)
  const paginated = filtered.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE)

  useEffect(() => { setCurrentPage(1) }, [selectedCategory, search, selectedProduct, selectedWave, selectedStatus, selectedCloud, cloudAvail, dateRange])

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleShareCopy = useCallback(async (getContent: () => { html: string; text: string }) => {
    const { html, text } = getContent()
    const ok = await copyRichToClipboard(html, text)
    setToast(ok
      ? 'Copied — paste into your email (Ctrl+V)'
      : 'Copy failed — your browser may block clipboard access')
    setTimeout(() => setToast(null), 3500)
  }, [])

  const resetFilters = useCallback(() => {
    setSelectedCategory('')
    setSearch('')
    setSelectedProduct('')
    setSelectedWave('')
    setSelectedStatus('')
    setSelectedCloud('commercial')
    setCloudAvail(new Set(['available', 'not-supported', 'not-announced'] as CloudInfo['status'][]))
    setDateRange('last12')
  }, [])

  const toggleExpand = useCallback((id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }, [])

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }, [])

  const selectAllOnPage = useCallback(() => {
    const ids = paginated.map(f => f['Release Plan ID'] || f['Feature name'])
    setSelectedIds(prev => {
      const next = new Set(prev)
      ids.forEach(id => next.add(id))
      return next
    })
  }, [paginated])

  const clearSelection = useCallback(() => setSelectedIds(new Set()), [])

  const bulkSelectedFeatures = useMemo(() => {
    if (selectedIds.size === 0) return []
    return filtered.filter(f => selectedIds.has(f['Release Plan ID'] || f['Feature name']))
  }, [filtered, selectedIds])

  const hasFilters = Boolean(selectedCategory || search || selectedProduct || selectedWave || selectedStatus || selectedCloud !== 'commercial' || cloudAvail.size !== 3 || dateRange !== 'last12')
  const progressPct = loading ? Math.min(Math.round((loadedPages / estimatedPages) * 90), 90) : 100

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="rpe-root">
      {/* Header */}
      <header className={`rpe-header${selectedCategory ? ` rpe-header--${selectedCategory}` : ''}`}>
        <div className="rpe-header-inner">
          <div className="rpe-header-left">
            <svg className="rpe-ms-logo" width="22" height="22" viewBox="0 0 23 23" aria-label="Microsoft">
              <rect x="1" y="1" width="10" height="10" fill="#f25022" />
              <rect x="12" y="1" width="10" height="10" fill="#7fba00" />
              <rect x="1" y="12" width="10" height="10" fill="#00a4ef" />
              <rect x="12" y="12" width="10" height="10" fill="#ffb900" />
            </svg>
            <div>
              <h1 className="rpe-title">Microsoft Release Plans Explorer</h1>
              <p className="rpe-subtitle">Browse and filter upcoming Microsoft product features</p>
            </div>
          </div>
          <img src="data:image/png;base64,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9TiiLULbldKuRw/w434T7+a1atXqM5LMtNpOTpkpQMu0DWQRZD2k30u51KEOuI3csGHDpceOHR3McXNtiotP19u9e0/1zZs3b3jrrbfmUodPFy1a9C74qHFX0YSkm87vJk2Q7ZUKtm4T2jPaitl+JzLU4f4A5wWuorOd0A2eClD4PWcpoPpgCiH5T5jQ96iBSUarJpCTJ0/+d/rT3+yoI51u9+7dV7dp00aYRDplS175KwVkl8WLF9+BMLyydevWnWvXru0pLixB10t37Ni+8fDhI+/37dv3L7Vq1VoPXKGhMDEvEwhVnz59+tSoWbP6H5HNrc4999wGTZo0rrVnz95T06ZNK0RA/3LZsmUHgJtO3csE+eDBAy7r0KHzHUOGDK5Tr1796tu3by+eNm06geYP/c+cOctlC05a5ej8I0b0aXLyZI2fDxx4dr/GjRsVbNy46Vhh4ebTkOnNhQsXTiSdV74n2mNEBAsTm25r1679Yb169a5q27ZtR9pPYLn6oVmWbtu2bTMntr09aNCgx+FfhYb4l6rP4MED/wtBd3b79u2rgFfBmjVroWfpJwsXLn7GQjC2Ht/eu3fPXa1atR6AAE/og7t27aoyYcKrVcaOfXEK+S8mv5e+5YoeWU0khBcEYDyD33vvvb+/88478yZNmrSOv7UTJ05czOx53IIFc863kBQCS+fMtZ/qfDt37rxy+vTp09avX3eIOJslYhbbv39/8ZIlS3bMnDnzKZhORxAX/HOxDrlG01zER7WzCEknkyfm1rEW4qbauEBit9J3LuEQ561O5aJFridNIz2efBBPm9aqyIki9OPn161bt9+pPK/vBZbAjDmtRMa9axrpep133rkznnjiiSgHTkehRxQtIjpu3Ljogw8+eJ1VZ9VGPuovWYQxK3704IP3T2UoR2lPdW4obR599dVXo/fcc8+dklDaRK5+f7qc0aOvOO+xxx6LctxZFHN59PXXX49+97vfjSKYtKXCdX00TOEzs2fPfnr16lVG2m/NmjW7gPd74Na16usap3j6aByp34Tf/OY30Q8//CBKv4i+8ML/RX/0ox9+GANfNNxehYWFY5kAKV6arM8JjFtv/e7L8eXl/bMQDMK3xqT616KibSeciLBly5bTc+fOfVXSUumcEjJi1gCvbnSiyczckjYmne0AdbkbwS8D0XdHy/uGz98KqDZL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"  alt="Power Apps"
            className="rpe-header-logo"></img>
        </div>
      </header>

      {/* Progress bar */}
      <div className="rpe-progress-track" role="progressbar" aria-valuenow={progressPct} aria-valuemin={0} aria-valuemax={100}>
        <div className={`rpe-progress-fill${!loading ? ' rpe-progress-fill--done' : ''}`} style={{ width: `${progressPct}%` }} />
      </div>

      <main className="rpe-main">
        {loading && allFeatures.length === 0 && !error && (
          <div className="rpe-splash">
            <div className="rpe-spinner" aria-label="Loading" />
            <p className="rpe-splash-text">Fetching release plans from Microsoft…</p>
          </div>
        )}

        {error && (
          <div className="rpe-error" role="alert">
            <strong>Failed to load data</strong>
            <p>{error}</p>
            <p>The Microsoft Release Plans API may be blocked by CORS. See the <strong>README</strong> for proxy setup.</p>
          </div>
        )}

        {allFeatures.length > 0 && (
          <>
            {loading && (
              <div className="rpe-loading-banner" role="status">
                <div className="rpe-loading-dot" />
                Loading page {loadedPages}… {allFeatures.length.toLocaleString()} features so far
              </div>
            )}

            {/* Stat cards */}
            <div className="rpe-stats">
              <div className="rpe-stat">
                <span className="rpe-stat-num">{allFeatures.length.toLocaleString()}</span>
                <span className="rpe-stat-lbl">Total Records</span>
              </div>
              <div className="rpe-stat rpe-stat--blue">
                <span className="rpe-stat-num">{filtered.length.toLocaleString()}</span>
                <span className="rpe-stat-lbl">Showing</span>
              </div>
              <div className="rpe-stat rpe-stat--green">
                <span className="rpe-stat-num">{gaCount.toLocaleString()}</span>
                <span className="rpe-stat-lbl">Generally Available</span>
              </div>
              <div className="rpe-stat rpe-stat--purple">
                <span className="rpe-stat-num">{previewCount.toLocaleString()}</span>
                <span className="rpe-stat-lbl">In Preview</span>
              </div>
            </div>

            {/* Category toggle */}
            <div className="rpe-category-bar">
              <button className={`rpe-cat-btn${selectedCategory === '' ? ' rpe-cat-btn--active' : ''}`} onClick={() => { setSelectedCategory(''); setSelectedProduct('') }}>
                All
              </button>
              <button className={`rpe-cat-btn rpe-cat-btn--dynamics${selectedCategory === 'dynamics' ? ' rpe-cat-btn--active' : ''}`} onClick={() => { setSelectedCategory('dynamics'); setSelectedProduct('') }}>
                <svg width="14" height="14" viewBox="0 0 23 23" aria-hidden="true"><rect x="1" y="1" width="10" height="10" fill="#002050"/><rect x="12" y="1" width="10" height="10" fill="#002050"/><rect x="1" y="12" width="10" height="10" fill="#002050"/><rect x="12" y="12" width="10" height="10" fill="#002050"/></svg>
                Dynamics 365
              </button>
              <button className={`rpe-cat-btn rpe-cat-btn--power${selectedCategory === 'power' ? ' rpe-cat-btn--active' : ''}`} onClick={() => { setSelectedCategory('power'); setSelectedProduct('') }}>
                <svg width="14" height="14" viewBox="0 0 23 23" aria-hidden="true"><rect x="1" y="1" width="10" height="10" fill="#742774"/><rect x="12" y="1" width="10" height="10" fill="#742774"/><rect x="1" y="12" width="10" height="10" fill="#742774"/><rect x="12" y="12" width="10" height="10" fill="#742774"/></svg>
                Power Platform
              </button>
              <button className={`rpe-cat-btn rpe-cat-btn--copilot${selectedCategory === 'copilot' ? ' rpe-cat-btn--active' : ''}`} onClick={() => { setSelectedCategory('copilot'); setSelectedProduct('') }}>
                <svg width="14" height="14" viewBox="0 0 23 23" aria-hidden="true"><rect x="1" y="1" width="10" height="10" fill="#5B5FC7"/><rect x="12" y="1" width="10" height="10" fill="#5B5FC7"/><rect x="1" y="12" width="10" height="10" fill="#5B5FC7"/><rect x="12" y="12" width="10" height="10" fill="#5B5FC7"/></svg>
                Copilot
              </button>
              <button
                type="button"
                className={`rpe-debug-toggle${debugMode ? ' rpe-debug-toggle--on' : ''}`}
                onClick={() => setDebugMode(d => !d)}
                title={debugMode ? 'Debug mode ON — click to disable' : 'Toggle debug mode (shows raw JSON in expanded cards)'}
                aria-pressed={debugMode}
                aria-label="Toggle debug mode"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <polyline points="8 4 4 8 8 12" /><polyline points="16 4 20 8 16 12" /><line x1="14" y1="4" x2="10" y2="20" />
                </svg>
              </button>
            </div>

            {/* Cloud picker */}
            <div className="rpe-cloud-bar" role="group" aria-label="Filter by cloud">
              <span className="rpe-cloud-bar-label">Cloud</span>
              <div className="rpe-cloud-bar-tabs">
                {(['commercial', 'gcc', 'gcc-high', 'dod'] as Cloud[]).map(c => {
                  const active = selectedCloud === c
                  const isSovereign = c !== 'commercial'
                  return (
                    <button
                      key={c}
                      type="button"
                      className={`rpe-cloud-tab rpe-cloud-tab--${c}${active ? ' rpe-cloud-tab--active' : ''}`}
                      onClick={() => {
                        setSelectedCloud(c)
                        setCloudAvail(new Set(['available', 'not-supported', 'not-announced'] as CloudInfo['status'][]))
                      }}
                      aria-pressed={active}
                    >
                      {isSovereign && (
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                          <path d="M12 2L4 6v6c0 5 3.5 9 8 10 4.5-1 8-5 8-10V6l-8-4z" />
                        </svg>
                      )}
                      {!isSovereign && (
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                          <circle cx="12" cy="12" r="10" />
                          <line x1="2" y1="12" x2="22" y2="12" />
                          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                        </svg>
                      )}
                      {CLOUD_LABELS[c]}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Filter bar */}
            <div className="rpe-filters">
              <div className="rpe-search-wrap">
                <IconSearch />
                <input type="search" className="rpe-search" placeholder="Search features, products, investment areas…" value={search} onChange={e => setSearch(e.target.value)} aria-label="Search features" />
              </div>
              <select className="rpe-select" value={selectedProduct} onChange={e => setSelectedProduct(e.target.value)} aria-label="Filter by product">
                <option value="">All Products</option>
                {products.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              <select className="rpe-select" value={selectedWave} onChange={e => setSelectedWave(e.target.value)} aria-label="Filter by release wave">
                <option value="">All Waves</option>
                {waves.map(w => <option key={w} value={w}>{w}</option>)}
              </select>
              <select className="rpe-select" value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)} aria-label="Filter by status">
                <option value="">All Status</option>
                <option value="GA">GA</option>
                <option value="Preview">Preview</option>
                <option value="Early Access">Early Access</option>
                <option value="Planned">Planned</option>
              </select>
              <select className="rpe-select" value={dateRange} onChange={e => setDateRange(e.target.value)} aria-label="Date range">
                <option value="last12">± 6 months</option>
                {availableYears.map(y => <option key={y} value={String(y)}>{y}</option>)}
                <option value="all">All time</option>
              </select>
              {hasFilters && (
                <button className="rpe-reset-btn" onClick={resetFilters}>✕ Reset</button>
              )}
            </div>

            {selectedCloud !== 'commercial' && cloudCounts && (
              <div className="rpe-cloud-pills" role="group" aria-label={`Filter by ${CLOUD_LABELS[selectedCloud]} availability`}>
                <span className="rpe-cloud-pills-label">In {CLOUD_LABELS[selectedCloud]}:</span>
                {(['available', 'not-supported', 'not-announced'] as CloudInfo['status'][]).map(status => {
                  const active = cloudAvail.has(status)
                  const label = status === 'available' ? 'Available' : status === 'not-supported' ? 'Not supported' : 'Not yet announced'
                  return (
                    <button
                      key={status}
                      className={`rpe-cloud-pill rpe-cloud-pill--${status}${active ? ' rpe-cloud-pill--active' : ''}`}
                      onClick={() => {
                        setCloudAvail(prev => {
                          const next = new Set(prev)
                          if (next.has(status)) next.delete(status)
                          else next.add(status)
                          return next
                        })
                      }}
                      aria-pressed={active}
                    >
                      {label} <span className="rpe-cloud-pill-count">{cloudCounts[status].toLocaleString()}</span>
                    </button>
                  )
                })}
              </div>
            )}

            {/* View toggle */}
            <div className="rpe-view-bar">
              <div className="rpe-view-toggle" role="tablist" aria-label="View mode">
                <button className={`rpe-view-btn${view === 'cards' ? ' rpe-view-btn--active' : ''}`} onClick={() => setView('cards')} role="tab" aria-selected={view === 'cards'}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
                  Cards
                </button>
                <button className={`rpe-view-btn${view === 'calendar' ? ' rpe-view-btn--active' : ''}`} onClick={() => setView('calendar')} role="tab" aria-selected={view === 'calendar'}>
                  <IconCalendar /> Calendar
                </button>
                <button className={`rpe-view-btn${view === 'timeline' ? ' rpe-view-btn--active' : ''}`} onClick={() => setView('timeline')} role="tab" aria-selected={view === 'timeline'}>
                  <IconWave /> Timeline
                </button>
              </div>
              {(view === 'calendar' || view === 'timeline') && (
                <button className="rpe-print-btn" onClick={() => window.print()} title="Print / Save as PDF">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                  Print / PDF
                </button>
              )}
            </div>

            {/* Content */}
            {filtered.length === 0 ? (
              <div className="rpe-empty">
                <p>No features match your current filters.</p>
                <button className="rpe-reset-btn" onClick={resetFilters}>Clear Filters</button>
              </div>

            ) : view === 'calendar' ? (
              /* ── Calendar — month view, side-by-side ──────────────────── */
              <>
                {/* Bulk bar */}
                <div className="rpe-bulk-bar">
                  {selectedCalMonth != null && selectedMonthFeatures.length > 0 && (
                    <label className="rpe-bulk-selectall">
                      <input type="checkbox" checked={selectedMonthFeatures.every(f => selectedIds.has(f['Release Plan ID'] || f['Feature name']))} onChange={e => {
                        const ids = selectedMonthFeatures.map(f => f['Release Plan ID'] || f['Feature name'])
                        setSelectedIds(prev => { const n = new Set(prev); ids.forEach(id => e.target.checked ? n.add(id) : n.delete(id)); return n })
                      }} />
                      Select all in {MONTH_SHORT[selectedCalMonth]}
                    </label>
                  )}
                  {selectedIds.size > 0 && (
                    <span className="rpe-bulk-actions">
                      <span className="rpe-bulk-count">{selectedIds.size} selected</span>
                      <button type="button" className="rpe-share-btn" onClick={() => handleShareCopy(() => buildBulkHtml(bulkSelectedFeatures))} title="Copy as table — paste into email"><IconShare /> Copy {selectedIds.size}</button>
                      <button className="rpe-reset-btn rpe-bulk-clear" onClick={clearSelection}>Clear</button>
                    </span>
                  )}
                  {selectedIds.size === 0 && selectedCalMonth == null && (
                    <span className="rpe-bulk-hint">Select a month, then check features to bulk share</span>
                  )}
                </div>

                <div className="rpe-cal-layout">
                  {/* ── Left sidebar: month grid ─────────────────────────── */}
                  <div className="rpe-cal-sidebar">
                    <div className="rpe-cal-nav">
                      {availableYears.map(y => (
                        <button key={y} className={`rpe-cal-year-btn${calYear === y ? ' rpe-cal-year-btn--active' : ''}`} onClick={() => { setCalYear(y); setSelectedCalMonth(null) }}>{y}</button>
                      ))}
                    </div>
                    <div className="rpe-mcal-grid">
                      {MONTH_NAMES.map((mName, idx) => {
                        const key = `${calYear}-${idx}`
                        const mf = featuresByMonth.get(key) ?? []
                        const count = mf.length
                        const isSelected = selectedCalMonth === idx
                        const isCurrentMonth = idx === new Date().getMonth() && calYear === new Date().getFullYear()

                        let ga = 0, preview = 0, ea = 0
                        mf.forEach(f => { const s = getStatus(f); if (s === 'GA') ga++; else if (s === 'Preview') preview++; else if (s === 'Early Access') ea++ })
                        const planned = count - ga - preview - ea

                        const uniqueProducts = [...new Set(mf.map(f => f['Product name']).filter(Boolean))]
                        const showProducts = uniqueProducts.slice(0, 4)
                        const extraCount = uniqueProducts.length - showProducts.length

                        return (
                          <button key={idx} className={['rpe-mcal-cell', count > 0 && 'rpe-mcal-cell--active', isSelected && 'rpe-mcal-cell--selected', isCurrentMonth && 'rpe-mcal-cell--current'].filter(Boolean).join(' ')} onClick={() => count > 0 && setSelectedCalMonth(isSelected ? null : idx)} disabled={count === 0} aria-label={`${mName} ${calYear}: ${count} features`}>
                            <span className="rpe-mcal-name">{MONTH_SHORT[idx]}</span>
                            {count > 0 ? (
                              <>
                                <span className="rpe-mcal-count">{count}</span>
                                <div className="rpe-mcal-bar">
                                  {ga > 0 && <div className="rpe-mcal-seg rpe-mcal-seg--ga" style={{ flex: ga }} />}
                                  {preview > 0 && <div className="rpe-mcal-seg rpe-mcal-seg--preview" style={{ flex: preview }} />}
                                  {ea > 0 && <div className="rpe-mcal-seg rpe-mcal-seg--ea" style={{ flex: ea }} />}
                                  {planned > 0 && <div className="rpe-mcal-seg rpe-mcal-seg--planned" style={{ flex: planned }} />}
                                </div>
                                <div className="rpe-mcal-products">
                                  {showProducts.map(p => <ProductAvatar key={p} name={p} size="xs" />)}
                                  {extraCount > 0 && <span className="rpe-mcal-more">+{extraCount}</span>}
                                </div>
                              </>
                            ) : <span className="rpe-mcal-empty">—</span>}
                          </button>
                        )
                      })}
                    </div>
                    <div className="rpe-cal-legend">
                      <span className="rpe-cal-legend-item"><span className="rpe-cal-dot rpe-cal-dot--ga" /> GA</span>
                      <span className="rpe-cal-legend-item"><span className="rpe-cal-dot rpe-cal-dot--preview" /> Preview</span>
                      <span className="rpe-cal-legend-item"><span className="rpe-cal-dot rpe-cal-dot--ea" /> Early Access</span>
                      <span className="rpe-cal-legend-item"><span className="rpe-cal-dot rpe-cal-dot--planned" /> Planned</span>
                    </div>
                  </div>

                  {/* ── Right panel: feature list ─────────────────────────── */}
                  <div className="rpe-cal-main">
                    {selectedCalMonth == null ? (
                      <div className="rpe-cal-placeholder">
                        <IconCalendar />
                        <p>Select a month to view features</p>
                      </div>
                    ) : selectedMonthFeatures.length === 0 ? (
                      <div className="rpe-cal-placeholder">
                        <p>No features in {MONTH_NAMES[selectedCalMonth]} {calYear}</p>
                      </div>
                    ) : (
                      <>
                        <div className="rpe-cal-detail-header">
                          <h3 className="rpe-cal-detail-title">
                            {MONTH_NAMES[selectedCalMonth]} {calYear}
                            <span className="rpe-cal-detail-count">{selectedMonthFeatures.length} feature{selectedMonthFeatures.length !== 1 ? 's' : ''}</span>
                          </h3>
                        </div>
                        <div className="rpe-cal-detail-list" role="list">
                          {selectedMonthFeatures.map(f => {
                            const id = f['Release Plan ID'] || f['Feature name']
                            const status = getStatus(f)
                            const slug = statusSlug(status)
                            const isExpanded = expandedIds.has(id)
                            const date = f['GA date'] || f['Public preview date'] || f['Early access date']
                            const isChecked = selectedIds.has(id)

                            return (
                              <div key={id} className={`rpe-cal-feature rpe-cal-feature--${slug}`} role="listitem">
                                <div className="rpe-cal-feature-top">
                                  <input type="checkbox" className="rpe-checkbox" checked={isChecked} onChange={() => toggleSelect(id)} aria-label={`Select ${f['Feature name']}`} />
                                  <ProductAvatar name={f['Product name']} />
                                  <span className={`rpe-badge rpe-badge--${slug}`}>{status}</span>
                                  <strong className="rpe-cal-feature-name">{f['Feature name']}</strong>
                                </div>
                                <div className="rpe-cal-feature-meta">
                                  <span>{f['Product name']}</span>
                                  {f['Investment area'] && <span>{f['Investment area']}</span>}
                                  {date && <span>{formatDate(date)}</span>}
                                  {f['Enabled for'] && <span>Enabled for: {f['Enabled for']}</span>}
                                </div>
                                {isExpanded && f['Business value'] && (
                                  <RichHtml html={f['Business value']} className="rpe-cal-feature-biz" />
                                )}
                                {isExpanded && f['Feature details'] && (
                                  <div className="rpe-details rpe-details--inline">
                                    <h4 className="rpe-details-heading">Feature Details</h4>
                                    <RichHtml html={f['Feature details']} className="rpe-details-body" />
                                  </div>
                                )}
                                {isExpanded && debugMode && (
                                  <div className="rpe-debug-json">
                                    <h4 className="rpe-details-heading">Raw JSON</h4>
                                    <pre className="rpe-debug-json-body">{JSON.stringify(f, null, 2)}</pre>
                                  </div>
                                )}
                                <div className="rpe-card-actions">
                                  <button className="rpe-expand-btn" onClick={() => toggleExpand(id)} aria-expanded={isExpanded}>
                                    {isExpanded ? '▲ Less' : '▼ More'}
                                  </button>
                                  <button type="button" className="rpe-share-btn" onClick={() => handleShareCopy(() => buildSingleHtml(f))} title="Copy as table — paste into email" aria-label="Copy as table">
                                    <IconShare /> Copy
                                  </button>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </>

            ) : view === 'timeline' ? (
              /* ── Timeline view ─────────────────────────────────────────── */
              <div className="rpe-timeline">
                <div className="rpe-tl-controls">
                  <span className="rpe-tl-label">Show next</span>
                  {[30, 60, 90].map(d => (
                    <button key={d} className={`rpe-tl-range-btn${timelineDays === d ? ' rpe-tl-range-btn--active' : ''}`} onClick={() => setTimelineDays(d)}>
                      {d} days
                    </button>
                  ))}
                  <span className="rpe-tl-summary">{timelineData.total} feature{timelineData.total !== 1 ? 's' : ''} upcoming</span>
                  {timelineData.total > 0 && (
                    <button
                      type="button"
                      className="rpe-share-btn"
                      title="Copy as HTML table — paste into your email"
                      onClick={async () => {
                        const { html, text } = buildTimelineHtml(timelineData.months, timelineDays)
                        const ok = await copyRichToClipboard(html, text)
                        setToast(ok
                          ? 'Copied — paste into your email (Ctrl+V)'
                          : 'Copy failed — your browser may block clipboard access')
                        setTimeout(() => setToast(null), 3500)
                      }}
                    >
                      <IconShare /> Copy as Table
                    </button>
                  )}
                </div>

                {/* Legend */}
                <div className="rpe-tl-legend">
                  <span className="rpe-tl-legend-item"><span className="rpe-tl-dot rpe-tl-dot--ea" /> Early Access</span>
                  <span className="rpe-tl-legend-item"><span className="rpe-tl-dot rpe-tl-dot--preview" /> Preview</span>
                  <span className="rpe-tl-legend-item"><span className="rpe-tl-dot rpe-tl-dot--ga" /> GA</span>
                  <span className="rpe-tl-legend-item"><span className="rpe-tl-dot rpe-tl-dot--planned" /> Planned</span>
                </div>

                {timelineData.total === 0 ? (
                  <div className="rpe-cal-placeholder">
                    <p>No features in the next {timelineDays} days matching your filters.</p>
                  </div>
                ) : (
                  <div className="rpe-tl-months">
                    {timelineData.months.map(({ year, month, features }) => {
                      if (features.length === 0) return null
                      return (
                        <div key={`${year}-${month}`} className="rpe-tl-month">
                          <div className="rpe-tl-month-header">
                            <span className="rpe-tl-month-name">{MONTH_NAMES[month]} {year}</span>
                            <span className="rpe-tl-month-count">{features.length}</span>
                          </div>
                          <div className="rpe-tl-features">
                            {features.map(f => {
                              const id = f['Release Plan ID'] || f['Feature name']
                              const status = getStatus(f)
                              const slug = statusSlug(status)
                              const date = f['GA date'] || f['Public preview date'] || f['Early access date']
                              const isExpanded = expandedIds.has(id)
                              const isChecked = selectedIds.has(id)

                              return (
                                <div key={id} className={`rpe-tl-feature rpe-tl-feature--${slug}`}>
                                  <div className="rpe-tl-feature-header">
                                    <input type="checkbox" className="rpe-checkbox" checked={isChecked} onChange={() => toggleSelect(id)} />
                                    <span className={`rpe-tl-dot rpe-tl-dot--${slug}`} />
                                    <ProductAvatar name={f['Product name']} size="xs" />
                                    <strong className="rpe-tl-feature-name">{f['Feature name']}</strong>
                                    <span className={`rpe-badge rpe-badge--${slug}`}>{status}</span>
                                    {date && <span className="rpe-tl-date">{formatDate(date)}</span>}
                                  </div>
                                  <div className="rpe-tl-feature-sub">
                                    <span>{f['Product name']}</span>
                                    {f['Investment area'] && <span>{f['Investment area']}</span>}
                                    {f['Enabled for'] && <span>Enabled for: {f['Enabled for']}</span>}
                                  </div>
                                  {isExpanded && f['Business value'] && (
                                    <RichHtml html={f['Business value']} className="rpe-tl-feature-detail" />
                                  )}
                                  {isExpanded && f['Feature details'] && (
                                    <div className="rpe-details rpe-details--inline">
                                      <h4 className="rpe-details-heading">Feature Details</h4>
                                      <RichHtml html={f['Feature details']} className="rpe-details-body" />
                                    </div>
                                  )}
                                  {isExpanded && debugMode && (
                                    <div className="rpe-debug-json">
                                      <h4 className="rpe-details-heading">Raw JSON</h4>
                                      <pre className="rpe-debug-json-body">{JSON.stringify(f, null, 2)}</pre>
                                    </div>
                                  )}
                                  <div className="rpe-card-actions">
                                    <button className="rpe-expand-btn" onClick={() => toggleExpand(id)} aria-expanded={isExpanded}>
                                      {isExpanded ? '▲ Less' : '▼ More'}
                                    </button>
                                    <button type="button" className="rpe-share-btn" onClick={() => handleShareCopy(() => buildSingleHtml(f))} title="Copy as table — paste into email"><IconShare /> Copy</button>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Bulk bar for timeline */}
                {selectedIds.size > 0 && (
                  <div className="rpe-bulk-bar rpe-tl-bulk">
                    <span className="rpe-bulk-count">{selectedIds.size} selected</span>
                    <button type="button" className="rpe-share-btn" onClick={() => handleShareCopy(() => buildBulkHtml(bulkSelectedFeatures))} title="Copy as table — paste into email"><IconShare /> Copy {selectedIds.size}</button>
                    <button className="rpe-reset-btn rpe-bulk-clear" onClick={clearSelection}>Clear</button>
                  </div>
                )}
              </div>

            ) : (
              /* ── Cards view ───────────────────────────────────────────── */
              <>
                {/* Bulk select controls */}
                <div className="rpe-bulk-bar">
                  <label className="rpe-bulk-selectall">
                    <input type="checkbox" checked={paginated.length > 0 && paginated.every(f => selectedIds.has(f['Release Plan ID'] || f['Feature name']))} onChange={e => { if (e.target.checked) selectAllOnPage(); else paginated.forEach(f => { const fid = f['Release Plan ID'] || f['Feature name']; setSelectedIds(prev => { const n = new Set(prev); n.delete(fid); return n }) }) }} />
                    Select all on page
                  </label>
                  {selectedIds.size > 0 && (
                    <span className="rpe-bulk-actions">
                      <span className="rpe-bulk-count">{selectedIds.size} selected</span>
                      <button type="button" className="rpe-share-btn" onClick={() => handleShareCopy(() => buildBulkHtml(bulkSelectedFeatures))} title="Copy as table — paste into email">
                        <IconShare /> Copy {selectedIds.size}
                      </button>
                      <button className="rpe-reset-btn rpe-bulk-clear" onClick={clearSelection}>Clear</button>
                    </span>
                  )}
                </div>

                <div className="rpe-cards" role="list">
                  {paginated.map(feature => {
                    const id = feature['Release Plan ID'] || feature['Feature name']
                    const status = getStatus(feature)
                    const slug = statusSlug(status)
                    const isExpanded = expandedIds.has(id)
                    const isChecked = selectedIds.has(id)
                    const bizValue = stripHtml(feature['Business value'])
                    const truncatedValue = !isExpanded && bizValue.length > 200 ? bizValue.slice(0, 200).trimEnd() + '…' : bizValue
                    const wave = feature['GA Release Wave'] || feature['Public Preview Release Wave']
                    const date = feature['GA date'] || feature['Public preview date'] || feature['Early access date']

                    return (
                      <article key={id} className={`rpe-card rpe-card--${slug}${isChecked ? ' rpe-card--checked' : ''}`} role="listitem">
                        <div className="rpe-card-top">
                          <div className="rpe-card-title-row">
                            <input type="checkbox" className="rpe-checkbox" checked={isChecked} onChange={() => toggleSelect(id)} aria-label={`Select ${feature['Feature name']}`} />
                            <h2 className="rpe-card-title">{feature['Feature name']}</h2>
                            <span className={`rpe-badge rpe-badge--${slug}`} aria-label={`Status: ${status}`}>{status}</span>
                          </div>
                          <ul className="rpe-meta" aria-label="Feature metadata">
                            <li className="rpe-meta-item">
                              <ProductAvatar name={feature['Product name']} size="xs" />
                              <span>{feature['Product name']}</span>
                            </li>
                            {feature['Investment area'] && (
                              <li className="rpe-meta-item"><IconLayers /><span>{feature['Investment area']}</span></li>
                            )}
                            {wave && (
                              <li className="rpe-meta-item"><IconWave /><span>{wave}</span></li>
                            )}
                            {(() => {
                              if (selectedCloud === 'commercial') {
                                return date ? <li className="rpe-meta-item"><IconCalendar /><span>{formatDate(date)}</span></li> : null
                              }
                              const info = getCloudInfo(feature.GeographicAreasDetails, selectedCloud)
                              if (info.status === 'available' && info.date) {
                                return <li className="rpe-meta-item"><IconCalendar /><span>{formatCloudDate(info.date)} <span className="rpe-cloud-tag">{CLOUD_LABELS[selectedCloud]}</span></span></li>
                              }
                              if (info.status === 'not-supported') {
                                return <li className="rpe-meta-item"><span className="rpe-badge rpe-badge--not-supported">Not supported in {CLOUD_LABELS[selectedCloud]}</span></li>
                              }
                              return <li className="rpe-meta-item"><span className="rpe-badge rpe-badge--not-announced">Not yet announced for {CLOUD_LABELS[selectedCloud]}</span></li>
                            })()}
                            {feature['Enabled for'] && (
                              <li className="rpe-meta-item rpe-meta-item--enabled"><IconUsers /><span>{feature['Enabled for']}</span></li>
                            )}
                          </ul>
                        </div>

                        {bizValue && !isExpanded && (
                          <p className="rpe-biz-value">{truncatedValue}</p>
                        )}
                        {bizValue && isExpanded && (
                          <RichHtml html={feature['Business value']} className="rpe-biz-value" />
                        )}

                        {isExpanded && feature['Feature details'] && stripHtml(feature['Feature details']) !== bizValue && (
                          <div className="rpe-details">
                            <h3 className="rpe-details-heading">Feature Details</h3>
                            <RichHtml html={feature['Feature details']} className="rpe-details-body" />
                          </div>
                        )}
                        {isExpanded && debugMode && (
                          <div className="rpe-debug-json">
                            <h4 className="rpe-details-heading">Raw JSON</h4>
                            <pre className="rpe-debug-json-body">{JSON.stringify(feature, null, 2)}</pre>
                          </div>
                        )}

                        <div className="rpe-card-actions">
                          <button className="rpe-expand-btn" onClick={() => toggleExpand(id)} aria-expanded={isExpanded}>
                            {isExpanded ? '▲ Show less' : '▼ Show details'}
                          </button>
                          <button type="button" className="rpe-share-btn" onClick={() => handleShareCopy(() => buildSingleHtml(feature))} title="Copy as table — paste into email" aria-label="Copy as table">
                            <IconShare /> Copy
                          </button>
                        </div>
                      </article>
                    )
                  })}
                </div>

                {totalPages > 1 && (
                  <nav className="rpe-pagination" aria-label="Page navigation">
                    <button className="rpe-page-btn" disabled={safePage <= 1} onClick={() => setCurrentPage(p => Math.max(1, p - 1))}>← Prev</button>
                    <span className="rpe-page-info">Page <strong>{safePage}</strong> of <strong>{totalPages}</strong><span className="rpe-page-count">&ensp;({filtered.length.toLocaleString()} features)</span></span>
                    <button className="rpe-page-btn" disabled={safePage >= totalPages} onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}>Next →</button>
                  </nav>
                )}
              </>
            )}
          </>
        )}

        {!loading && !error && allFeatures.length === 0 && (
          <div className="rpe-empty"><p>No data was returned from the API.</p></div>
        )}
      </main>

      {toast && (
        <div className="rpe-toast" role="status" aria-live="polite">{toast}</div>
      )}

      <footer className="rpe-footer">
        Data sourced from{' '}
        <a href="https://releaseplans.microsoft.com" target="_blank" rel="noopener noreferrer">releaseplans.microsoft.com</a>
      </footer>
    </div>
  )
}
