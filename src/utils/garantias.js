// Lógica de garantia dinâmica por marca - migrada do N8N
export function obterGarantia(marca, versao, condicao) {
  const m = String(marca || '').toUpperCase().trim()
  const v = String(versao || '').toUpperCase().trim()
  const isSeminovo = String(condicao || 'novo').toLowerCase() === 'seminovo'

  if (m === 'APPLE') {
    if ((v.includes('MACBOOK') || v.includes('IPAD')) && !isSeminovo) {
      return {
        titulo: 'Garantia de Macbook e Ipad Novos (LACRADOS) - 12 meses', dias: 365,
        termos: [
          'A LOJA garante entregar ao cliente o produto LACRADO na caixa com devido lacre original da APPLE.',
          'A garantia do produto lacrado terá validade por 12 meses, a partir da data da ativação do produto. Garantia essa fornecida pelo próprio fabricante e que deverá ser acionada seguindo os procedimentos internos da Apple.',
          'Na hipótese de o produto apresentar falha ou vício de fabricação dentro do prazo de garantia, o consumidor deverá procurar imediatamente a fabricante Apple, não sendo permitido que terceiros avaliem ou reparem o produto, sob pena do comprador ser responsável por tal ato, eximindo a Loja do dever de reparar, além da perda da garantia junto ao fabricante.',
          'A Core Distribuidora Eletrônicos prestará total auxílio ao comprador, informando todo o procedimento necessário para exercer sua garantia junto ao fabricante.'
        ]
      }
    }
    return {
      titulo: 'Garantia de iPhone Semi Novos - 3 meses', dias: 90,
      termos: [
        'Válida a partir da data da compra realizada na loja.',
        'Garantia cobre defeitos de fabricação.',
        'Não cobre problemas decorrentes de mau uso como água, queda, empeno ou algo do tipo.',
        'Manutenção em assistência não autorizada resulta em perda da garantia.',
        'Cliente responsável pelo transporte do aparelho para a LOJA em caso de solicitação de garantia.'
      ]
    }
  }

  if (m === 'SAMSUNG') {
    return {
      titulo: 'Garantia de Aparelhos Novos da SAMSUNG - 12 meses', dias: 365,
      termos: [
        'Válida a partir da data da compra realizada na loja.',
        'Garantia cobre defeitos de fabricação.',
        'Na hipótese de o produto apresentar falha ou vício de fabricação dentro do prazo de garantia, o consumidor deverá procurar imediatamente a AUTORIZADA SAMSUNG, não sendo permitido que terceiros avaliem ou reparem o produto, sob pena do comprador ser responsável por tal ato, eximindo a Loja do dever de reparar, além da perda da garantia junto ao fabricante.',
        'A Core Distribuidora Eletrônicos prestará total auxílio ao comprador, informando todo o procedimento necessário para exercer sua garantia junto ao fabricante.'
      ]
    }
  }

  if (m === 'REALME') {
    return {
      titulo: 'Garantia de Aparelhos Novos da REALME - 12 meses', dias: 365,
      termos: [
        'Válida a partir da data da compra realizada na loja.',
        'Garantia cobre defeitos de fabricação.',
        'Na hipótese de o produto apresentar falha ou vício de fabricação dentro do prazo de garantia, o consumidor deverá procurar imediatamente a AUTORIZADA REALME, não sendo permitido que terceiros avaliem ou reparem o produto, sob pena do comprador ser responsável por tal ato, eximindo a Loja do dever de reparar, além da perda da garantia junto ao fabricante.',
        'A Core Distribuidora Eletrônicos prestará total auxílio ao comprador, informando todo o procedimento necessário para exercer sua garantia junto ao fabricante.'
      ]
    }
  }

  if (m === 'JBL') {
    return {
      titulo: 'Garantia de PRODUTOS JBL - 12 meses', dias: 365,
      termos: [
        'A LOJA garante entregar ao cliente o produto LACRADO na caixa com devido lacre original da JBL.',
        'A garantia do produto lacrado terá validade por 12 meses, a partir da data da compra na loja.',
        'Na hipótese de o produto apresentar falha ou vício de fabricação dentro do prazo de garantia, o consumidor deverá procurar imediatamente a fabricante, não sendo permitido que terceiros avaliem ou reparem o produto.',
        'A Core Distribuidora Eletrônicos prestará total auxílio ao comprador, informando todo o procedimento necessário para exercer sua garantia junto ao fabricante.'
      ]
    }
  }

  if (['XIAOMI', 'POCO', 'REDMI'].includes(m)) {
    if (isSeminovo) {
      return {
        titulo: 'Garantia de Xiaomi Semi Novos - 30 dias', dias: 30,
        termos: [
          'Válida a partir da data da compra realizada na loja.',
          'Garantia cobre defeitos de fabricação.',
          'Não cobre problemas decorrentes de mau uso como água, queda, empeno ou algo do tipo.',
          'Manutenção em assistência não autorizada resulta em perda da garantia.',
          'Cliente responsável pelo transporte do aparelho para a LOJA em caso de solicitação de garantia.'
        ]
      }
    }
    return {
      titulo: 'Garantia de Aparelhos Novos XIAOMI / POCO / REDMI - 12 meses', dias: 365,
      termos: [
        'Válida a partir da data da compra realizada na loja.',
        'Garantia cobre defeitos de fabricação.',
        'Na hipótese de o produto apresentar falha ou vício de fabricação dentro do prazo de garantia, o consumidor deverá procurar imediatamente a AUTORIZADA XIAOMI, não sendo permitido que terceiros avaliem ou reparem o produto, sob pena do comprador ser responsável por tal ato, eximindo a Loja do dever de reparar, além da perda da garantia junto ao fabricante.',
        'A Core Distribuidora Eletrônicos prestará total auxílio ao comprador, informando todo o procedimento necessário para exercer sua garantia junto ao fabricante.'
      ]
    }
  }

  if (m === 'MOTOROLA') {
    return {
      titulo: 'Garantia de Aparelhos Novos MOTOROLA - 12 meses', dias: 365,
      termos: [
        'Válida a partir da data da compra realizada na loja.',
        'Garantia cobre defeitos de fabricação.',
        'Na hipótese de o produto apresentar falha ou vício de fabricação dentro do prazo de garantia, o consumidor deverá procurar imediatamente a AUTORIZADA MOTOROLA.',
        'A Core Distribuidora Eletrônicos prestará total auxílio ao comprador, informando todo o procedimento necessário para exercer sua garantia junto ao fabricante.'
      ]
    }
  }

  // Default
  return {
    titulo: 'Garantia de 90 dias', dias: 90,
    termos: [
      'Válida a partir da data da compra realizada na loja.',
      'Garantia cobre defeitos de fabricação.',
      'Não cobre problemas decorrentes de mau uso.',
      'Cliente responsável pelo transporte do aparelho para a LOJA em caso de solicitação de garantia.'
    ]
  }
}

export function calcGarantiaDate(dateStr, dias) {
  if (!dateStr || !dias) return ''
  const d = new Date(dateStr)
  d.setDate(d.getDate() + dias)
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`
}
