// Taxas de cartão por forma de pagamento
export const TAXAS_CARTAO = {
  'Dinheiro': 0,
  'PIX': 0,
  'PIX QR Code': 0.99,
  'Debito': 1.69,
  'Credito': {
    1: 3.89, 2: 5.51, 3: 6.27, 4: 7.02, 5: 7.77, 6: 8.53,
    7: 9.78, 8: 10.53, 9: 11.29, 10: 12.04, 11: 12.80, 12: 13.55,
    13: 14.49, 14: 15.25, 15: 16.00, 16: 16.75, 17: 17.51, 18: 18.26
  }
}

export function getTaxaPercent(forma, parcelas) {
  if (!forma || forma === 'TROCA') return 0
  if (forma === 'Dinheiro' || forma === 'PIX') return 0
  if (forma === 'PIX QR Code') return 0.99
  if (forma === 'Debito') return 1.69
  if (forma === 'Credito') return TAXAS_CARTAO.Credito[parseInt(parcelas) || 1] || 3.89
  return 0
}

// Tipos de custo
export const TIPOS_CUSTO = [
  'ESTACIONAMENTO', 'ALIMENTAÇÃO', 'GARANTIAS', 'CONTABILIDADE', 'INTERNET',
  'LIMPEZA LOJA', 'ALUGUEL', 'TAXAS BANCO', 'ENERGIA', 'CONDOMINIO',
  'COMPRAS ITENS LIMPEZA', 'COMPRAS DIVERSAS', 'IMPOSTO', 'FRETE MERCADORIAS',
  'ENVIOS', 'SALARIO', 'RECARGA CELULAR', 'ENTREGAS', 'TAXAS MAQUINA',
  'LEADS INSTA', 'DESCARTES'
]

// Categorias de custo
export const CATEGORIAS_CUSTO = ['Eventual', 'Frequente', 'Semanal', 'Mensal']

// Tipos de acessório
export const TIPOS_ACESSORIO = [
  'Carregador', 'Cabo', 'Capinha', 'Película', 'Fone', 'Caixinha de Som',
  'Smartwatch', 'Suporte', 'Bateria Externa', 'Adaptador', 'Leitor Cartão',
  'Mouse', 'Teclado', 'Hub USB', 'Webcam', 'Microfone', 'Outros'
]

// Formas de pagamento
export const FORMAS_PAGAMENTO = ['Dinheiro', 'PIX', 'PIX QR Code', 'Debito', 'Credito', 'TROCA']

// Marcas de aparelho (para troca)
export const MARCAS_TROCA = ['Xiaomi', 'Samsung', 'Apple', 'Motorola', 'Realme', 'Poco', 'Redmi', 'Outro']

// Capacidades
export const CAPACIDADES = ['32GB', '64GB', '128GB', '256GB', '512GB', '1TB']

// Marcas principais para cadastro
export const MARCAS_APARELHO = [
  'Xiaomi', 'Samsung', 'Apple', 'Motorola', 'Realme', 'Poco', 'Redmi',
  'JBL', 'Multilaser', 'Positivo', 'LG', 'Outro'
]

// Tipos de venda
export const TIPO_VENDA = { FISICA: 'FISICA', RECIBO: 'RECIBO', ORCAMENTO: 'ORCAMENTO' }
