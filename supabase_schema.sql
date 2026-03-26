-- ============================================================
-- SCHEMA: CORE DISTRIBUIDORA - Sistema Interno
-- Execute este arquivo no SQL Editor do Supabase
-- ============================================================

-- Catálogo de modelos de aparelhos
CREATE TABLE IF NOT EXISTS cadastro_aparelhos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cod TEXT UNIQUE NOT NULL,
  marca TEXT NOT NULL,
  modelo TEXT NOT NULL,
  capacidade TEXT NOT NULL,
  cor TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Unidades físicas em estoque
CREATE TABLE IF NOT EXISTS estoque_aparelhos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cod TEXT UNIQUE NOT NULL,
  marca TEXT NOT NULL,
  modelo TEXT NOT NULL,
  capacidade TEXT NOT NULL,
  cor TEXT NOT NULL,
  custo NUMERIC(10,2) NOT NULL DEFAULT 0,
  data_aquisicao DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'disponivel',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Catálogo de acessórios
CREATE TABLE IF NOT EXISTS cadastro_acessorios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cod TEXT UNIQUE NOT NULL,
  tipo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Entradas de acessórios em estoque
CREATE TABLE IF NOT EXISTS estoque_acessorios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cod TEXT NOT NULL,
  tipo TEXT NOT NULL,
  descricao TEXT NOT NULL DEFAULT '',
  quantidade INTEGER NOT NULL DEFAULT 0,
  custo_unitario NUMERIC(10,2) NOT NULL DEFAULT 0,
  data_aquisicao DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Migração: adicionar coluna descricao se a tabela já existir
-- Execute este comando separadamente se a tabela já foi criada:
-- ALTER TABLE estoque_acessorios ADD COLUMN IF NOT EXISTS descricao TEXT NOT NULL DEFAULT '';

-- Todas as vendas (física, recibo/online, orçamento)
CREATE TABLE IF NOT EXISTS vendas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  id_venda TEXT UNIQUE NOT NULL,
  tipo_venda TEXT NOT NULL,           -- FISICA | RECIBO | ORCAMENTO
  data_venda DATE NOT NULL,
  -- Cliente (nulo em vendas físicas)
  cliente_nome TEXT,
  cliente_cpf TEXT,
  cliente_telefone TEXT,
  cliente_endereco TEXT,
  cliente_cidade TEXT,
  -- Produtos
  aparelhos_codigos TEXT,
  aparelhos_descricao TEXT,
  qtd_aparelhos INTEGER DEFAULT 0,
  acessorios_codigos TEXT,
  acessorios_descricao TEXT,
  qtd_acessorios INTEGER DEFAULT 0,
  -- Financeiro
  custo_aparelhos NUMERIC(10,2) DEFAULT 0,
  custo_acessorios NUMERIC(10,2) DEFAULT 0,
  preco_venda NUMERIC(10,2) DEFAULT 0,
  lucro_venda NUMERIC(10,2) DEFAULT 0,
  valor_total_pago NUMERIC(10,2) DEFAULT 0,
  taxa_total NUMERIC(10,2) DEFAULT 0,
  pagamentos TEXT,
  troca_info TEXT,
  observacao TEXT,
  pdf_link TEXT,
  -- JSON completo para regenerar PDF
  items_json JSONB,
  pagamentos_json JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Custos e despesas operacionais
CREATE TABLE IF NOT EXISTS custos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  data DATE NOT NULL,
  tipo TEXT NOT NULL,
  categoria TEXT NOT NULL,
  valor NUMERIC(10,2) NOT NULL,
  periodo_referencia TEXT,
  observacao TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- ROW LEVEL SECURITY (habilitar após criar usuários)
-- Por enquanto deixar aberto para uso interno
-- ============================================================
ALTER TABLE cadastro_aparelhos ENABLE ROW LEVEL SECURITY;
ALTER TABLE estoque_aparelhos ENABLE ROW LEVEL SECURITY;
ALTER TABLE cadastro_acessorios ENABLE ROW LEVEL SECURITY;
ALTER TABLE estoque_acessorios ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendas ENABLE ROW LEVEL SECURITY;
ALTER TABLE custos ENABLE ROW LEVEL SECURITY;

-- Policies: acesso público com anon key (ajustar para auth quando necessário)
CREATE POLICY "Acesso total" ON cadastro_aparelhos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso total" ON estoque_aparelhos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso total" ON cadastro_acessorios FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso total" ON estoque_acessorios FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso total" ON vendas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso total" ON custos FOR ALL USING (true) WITH CHECK (true);
