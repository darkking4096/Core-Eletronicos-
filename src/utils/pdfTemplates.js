import { obterGarantia, calcGarantiaDate } from './garantias.js'
import { formatMoney, formatDate } from './formatters.js'

// Logo Core Distribuidora em Base64
const LOGO_BASE64 = "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"

export function gerarHTMLRecibo(pdf, isOrcamento = false) {
  const { cliente, aparelhos = [], acessorios = [], pagamentos = [], trocas = [], garantias = [] } = pdf

  const produtosRows = [...aparelhos, ...acessorios].map(p => `
    <tr>
      <td>${p.descricao}</td>
      <td class="center">${p.qtd}</td>
      <td class="right">${p.valorUnitario}</td>
      <td class="right">${p.desconto || '-'}</td>
      <td class="right">${p.valorTotal}</td>
    </tr>
  `).join('')

  const pagamentosRows = pagamentos.map(p => `
    <tr>
      <td>${p.forma}</td>
      <td>${p.detalhes || ''}</td>
      <td class="right">${p.valor}</td>
      <td class="center">${p.parcelas || '-'}</td>
    </tr>
  `).join('')

  const trocasSection = trocas && trocas.length > 0 ? `
    <div class="section">
      <div class="section-title">APARELHOS RECEBIDOS EM TROCA</div>
      <table>
        <tr><th>Aparelho</th></tr>
        ${trocas.map(t => `<tr><td>${t}</td></tr>`).join('')}
      </table>
    </div>
  ` : ''

  let garantiasHTML = ''
  if (garantias && garantias.length > 0) {
    const blocos = garantias.map(g => {
      const fimGarantia = calcGarantiaDate(pdf.dataVenda, g.dias)
      const termos = g.termos.map(t => `<p style="margin:3px 0;">- ${t}</p>`).join('')
      return `<p><strong>${g.titulo}</strong></p><p style="color:#e94560;font-size:11px;">Válida até: ${fimGarantia}</p>${termos}`
    }).join('<br/>')
    garantiasHTML = `
      <div class="section">
        <div class="section-title">GARANTIA</div>
        <div style="font-size:11px;line-height:1.5;">${blocos}</div>
      </div>
    `
  }

  const titulo = isOrcamento ? 'ORÇAMENTO' : 'RECIBO DE VENDA'
  const subtitulo = isOrcamento
    ? `Orçamento Nº ${pdf.numOrcamento || ''}`
    : `ID: ${pdf.idVenda || ''}`

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; font-size: 12px; color: #1a1a1a; background: #fff; }
    .page { max-width: 794px; margin: 0 auto; padding: 20px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 3px solid #e94560; }
    .logo { width: 80px; height: 80px; object-fit: contain; }
    .header-info { text-align: right; }
    .company-name { font-size: 20px; font-weight: bold; color: #e94560; }
    .doc-title { font-size: 16px; font-weight: bold; color: #1a1a1a; margin-top: 5px; }
    .doc-sub { font-size: 11px; color: #666; }
    .section { margin-bottom: 15px; }
    .section-title { font-size: 11px; font-weight: bold; color: #fff; background: #e94560; padding: 5px 10px; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 1px; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .info-item label { font-size: 10px; color: #666; display: block; text-transform: uppercase; }
    .info-item span { font-size: 12px; font-weight: 500; }
    table { width: 100%; border-collapse: collapse; font-size: 11px; }
    th { background: #1a1a2e; color: #fff; padding: 6px 8px; text-align: left; font-size: 10px; text-transform: uppercase; }
    td { padding: 6px 8px; border-bottom: 1px solid #eee; }
    tr:nth-child(even) td { background: #f8f8f8; }
    .center { text-align: center; }
    .right { text-align: right; }
    .totals { background: #f8f8f8; border: 2px solid #e94560; border-radius: 4px; padding: 12px; margin-top: 10px; }
    .total-row { display: flex; justify-content: space-between; padding: 3px 0; }
    .total-row.main { font-size: 15px; font-weight: bold; color: #e94560; border-top: 1px solid #e94560; margin-top: 5px; padding-top: 8px; }
    .footer { margin-top: 20px; padding-top: 15px; border-top: 1px solid #ddd; text-align: center; font-size: 10px; color: #666; }
    .assinatura { display: flex; justify-content: space-between; margin-top: 30px; }
    .ass-line { flex: 1; text-align: center; padding-top: 10px; border-top: 1px solid #333; margin: 0 20px; font-size: 10px; }
    @media print {
      body { background: #fff !important; }
      .page { padding: 10mm; }
      @page { margin: 0; size: A4; }
    }
  </style>
</head>
<body>
<div class="page">
  <div class="header">
    <img src="data:image/png;base64,${LOGO_BASE64}" class="logo" alt="Core Logo">
    <div class="header-info">
      <div class="company-name">CORE DISTRIBUIDORA</div>
      <div class="doc-title">${titulo}</div>
      <div class="doc-sub">${subtitulo}</div>
      <div class="doc-sub">Data: ${formatDate(pdf.dataVenda)}</div>
      ${pdf.vendedor ? `<div class="doc-sub">Vendedor: ${pdf.vendedor}</div>` : ''}
    </div>
  </div>

  <div class="section">
    <div class="section-title">DADOS DO CLIENTE</div>
    <div class="info-grid">
      <div class="info-item"><label>Nome</label><span>${cliente.nome || '-'}</span></div>
      <div class="info-item"><label>CPF</label><span>${cliente.cpf || '-'}</span></div>
      <div class="info-item"><label>Telefone</label><span>${cliente.telefone || '-'}</span></div>
      <div class="info-item"><label>Cidade</label><span>${cliente.cidade ? cliente.cidade + '/' + (cliente.estado || 'GO') : '-'}</span></div>
      <div class="info-item" style="grid-column:1/-1"><label>Endereço</label><span>${cliente.endereco || '-'}</span></div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">PRODUTOS / SERVIÇOS</div>
    <table>
      <tr>
        <th>Descrição</th>
        <th class="center">Qtd</th>
        <th class="right">Valor Unit.</th>
        <th class="right">Desconto</th>
        <th class="right">Total</th>
      </tr>
      ${produtosRows}
    </table>
    <div class="totals">
      <div class="total-row"><span>Subtotal:</span><span>${pdf.totalBruto || formatMoney(0)}</span></div>
      ${pdf.totalDesconto && pdf.totalDesconto !== 'R$ 0,00' ? `<div class="total-row"><span>Descontos:</span><span>${pdf.totalDesconto}</span></div>` : ''}
      ${pdf.taxaTotal && pdf.taxaTotal !== 'R$ 0,00' ? `<div class="total-row"><span>Taxas:</span><span>${pdf.taxaTotal}</span></div>` : ''}
      <div class="total-row main"><span>TOTAL:</span><span>${pdf.totalVenda || formatMoney(0)}</span></div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">PAGAMENTO</div>
    <table>
      <tr>
        <th>Forma</th>
        <th>Detalhes</th>
        <th class="right">Valor</th>
        <th class="center">Parcelas</th>
      </tr>
      ${pagamentosRows}
    </table>
  </div>

  ${trocasSection}
  ${garantiasHTML}

  ${pdf.observacao ? `
  <div class="section">
    <div class="section-title">OBSERVAÇÕES</div>
    <p style="padding:8px;background:#f8f8f8;border-radius:4px;font-size:11px;">${pdf.observacao}</p>
  </div>
  ` : ''}

  <div class="assinatura">
    <div class="ass-line">Core Distribuidora</div>
    <div class="ass-line">${cliente.nome || 'Cliente'}</div>
  </div>

  <div class="footer">
    <p>Core Distribuidora Eletrônicos — Goiânia/GO</p>
    <p>Documento gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}</p>
  </div>
</div>
</body>
</html>`
}

export function gerarPDF(htmlContent, nomeArquivo) {
  // Injeta script de impressão automática no HTML
  const htmlWithPrint = htmlContent.replace(
    '</body>',
    `<script>
      window.onload = function() {
        setTimeout(function() {
          document.title = '${(nomeArquivo || 'documento').replace(/'/g, "\\'")}';
          window.print();
        }, 400);
      };
    <\/script></body>`
  )
  const blob = new Blob([htmlWithPrint], { type: 'text/html;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const tab = window.open(url, '_blank')
  if (!tab) {
    alert('Permita popups neste site para gerar o PDF. Clique no ícone de bloqueio na barra de endereço e permita popups.')
  }
  setTimeout(() => URL.revokeObjectURL(url), 60000)
}
