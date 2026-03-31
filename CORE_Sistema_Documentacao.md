# CORE Sistema — Documentação Técnica

> Documento de contextualização para IAs e desenvolvedores.
> Leia este arquivo **antes de qualquer alteração** no projeto.

---

## 1. Visão Geral

O **CORE Sistema** é uma aplicação web interna da **Core Distribuidora Eletrônicos**. Centraliza gestão de estoque, vendas, custos operacionais e emissão de recibos/PDFs.

| Campo | Valor |
|---|---|
| Nome do projeto | `core-sistema` |
| URL de produção | https://core-eletronicos.vercel.app |
| Repositório GitHub | https://github.com/darkking4096/Core-Eletronicos- |
| Branch principal | `main` (GitHub/Vercel) |
| Branch local | `master` |
| Conta Vercel | darkking4096 (Hobby) |
| Email | diasp4096@gmail.com |

---

## 2. Stack Técnica

### Frontend
- **React 18.3.1** + **Vite 5.4.0**
- Linguagem: **JavaScript (JSX)** — sem TypeScript
- Estilização: **estilos inline** via objeto `const S = { ... }` no topo do `App.jsx` — sem CSS externo, sem Tailwind, sem CSS Modules

### Backend / Banco de Dados
- **Supabase** (BaaS — PostgreSQL + API REST)
- SDK: `@supabase/supabase-js` v2.39.3
- Conexão via variáveis de ambiente: `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`
- Arquivo de conexão: `src/lib/supabase.js`
- Schema completo: `supabase_schema.sql`

### Geração de PDF
- **html2pdf.js** v0.10.2 — gera PDF a partir de HTML montado em memória
- Funções: `gerarHTMLRecibo()` e `gerarPDF()` em `src/utils/pdfTemplates.js`

### Hospedagem e Deploy
- **Vercel** (Hobby) — deploy automático via push no branch `main` do GitHub
- Build command: `vite build` | Output: `dist/`
- Fluxo: push GitHub → Vercel detecta → build → publica

### Controle de Versão
- Git local no branch `master`, remote apontando para `origin/main`
- **Push correto:** `git push origin master:main`
- Git GUI usado: **Antigravity** (macOS)

---

## 3. Estrutura de Arquivos

```
core-sistema/
├── src/
│   ├── App.jsx                  # Toda a UI e lógica de negócio (~2300 linhas)
│   ├── main.jsx                 # Entry point React
│   ├── lib/
│   │   └── supabase.js          # createClient do Supabase
│   └── utils/
│       ├── constants.js         # Taxas, tipos, marcas, formas de pagamento
│       ├── formatters.js        # formatMoney, parseMoney, formatDate, genId, today
│       ├── garantias.js         # Lógica de garantia por marca/condição
│       └── pdfTemplates.js      # HTML do recibo e função gerarPDF()
├── index.html                   # HTML base com <div id="root">
├── vite.config.js               # Config Vite + plugin React
├── package.json                 # Dependências e scripts
├── supabase_schema.sql          # Schema SQL completo (executar no Supabase)
├── .env                         # NÃO commitado — VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY
├── .gitignore                   # Ignora: node_modules, dist, .env, vite timestamps, import_data.mjs
└── dist/                        # Build de produção — NÃO commitado
```

---

## 4. Banco de Dados — Tabelas Supabase

| Tabela | Conteúdo |
|---|---|
| `cadastro_aparelhos` | Catálogo de modelos (marca, modelo, capacidade, cor, cod único) |
| `estoque_aparelhos` | Unidades físicas com custo, data de aquisição e status (disponivel/vendido) |
| `cadastro_acessorios` | Catálogo de acessórios (tipo, descrição, cod único) |
| `estoque_acessorios` | Entradas de acessórios com quantidade e custo unitário (baixa por FIFO) |
| `vendas` | Registro completo de vendas (física, recibo, orçamento) |
| `custos` | Custos operacionais (aluguel, energia, salário, etc.) |

> O banco **não usa RLS** — acesso direto via anon key. Sistema interno sem autenticação de usuário. Nunca expor a anon key publicamente.

---

## 5. Módulos do Sistema

A navegação é controlada por um estado `activePage`. Cada módulo é um componente React renderizado condicionalmente dentro do `App.jsx`.

| activePage | Função |
|---|---|
| `dashboard` | Resumo do dia: faturamento, lucro, vendas, custos |
| `vendas` | Listagem e criação de vendas físicas (`FormVendaFisica`) |
| `orcamentos` | Listagem e criação de recibos/orçamentos online (`FormVendaOnline`) |
| `aparelhos` | Cadastro de modelos + entrada no estoque |
| `acessorios` | Cadastro de acessórios + entrada no estoque (quantidade) |
| `custos` | Lançamento de custos operacionais |
| `relatorios` | Relatórios de lucro, estoque e resumos por período |
| `configuracoes` | Reset de dados por seção (limpar tabelas) |

---

## 6. Regras de Negócio Importantes

### 6.1 Cálculo de Custo de Acessórios (FIFO)

Ao salvar uma venda, o custo dos acessórios é calculado pelo método **FIFO** (First In, First Out):

1. Busca o estoque pelo `cod` do acessório, ordenado por `data_aquisicao`
2. Debita a quantidade necessária lote a lote
3. Se um lote é totalmente consumido → deleta do banco; caso contrário → atualiza a quantidade
4. **Lucro da venda** = preço de venda − custo dos aparelhos − custo real dos acessórios (FIFO)

### 6.2 Taxas de Cartão

Definidas em `src/utils/constants.js`, aplicadas automaticamente sobre o total:

| Forma de Pagamento | Taxa |
|---|---|
| Dinheiro / PIX | 0% |
| PIX QR Code | 0,99% |
| Débito | 1,69% |
| Crédito 1x | 3,89% |
| Crédito 2x–18x | 5,51% até 18,26% |
| TROCA | 0% |

### 6.3 Garantias por Marca

Lógica em `src/utils/garantias.js`:

| Marca / Condição | Prazo | Tipo |
|---|---|---|
| Apple iPhone (novo) | 12 meses | Garantia do fabricante |
| Apple iPhone (semi-novo) | 3 meses | Garantia da loja |
| Apple MacBook / iPad (novo) | 12 meses | Garantia do fabricante |
| Samsung (novo) | 12 meses | Via autorizada Samsung |
| Xiaomi / Poco / Redmi (novo) | 12 meses | Via autorizada Xiaomi |
| Xiaomi / Poco / Redmi (semi-novo) | 30 dias | Garantia da loja |
| Motorola (novo) | 12 meses | Via autorizada Motorola |
| Realme (novo) | 12 meses | Via autorizada Realme |
| JBL | 12 meses | Garantia do fabricante |
| Outros | 90 dias | Garantia padrão da loja |

### 6.4 Tipos de Venda

| Tipo | Descrição |
|---|---|
| `FISICA` | Venda presencial — baixa estoque + registra venda |
| `RECIBO` | Venda online — gera PDF de recibo |
| `ORCAMENTO` | Orçamento — gera PDF sem baixar estoque |

---

## 7. Fluxo de Desenvolvimento

### Rodar localmente

```bash
cd core-sistema
cp .env.example .env   # preencher VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY
npm install
npm run dev            # http://localhost:5173
```

### Fazer deploy (push para produção)

```bash
git add arquivo-modificado.jsx
git commit -m "fix(modulo): descrição da mudança"
git push origin master:main
```

A Vercel detecta o push automaticamente → build → publica.

> **Atenção:** o branch local é `master` mas o do GitHub/Vercel é `main`. Sempre usar `git push origin master:main`.

### Variáveis de Ambiente

Necessárias tanto no `.env` local quanto no painel da Vercel (Settings > Environment Variables):

| Variável | Descrição |
|---|---|
| `VITE_SUPABASE_URL` | URL do projeto Supabase (ex: `https://xxx.supabase.co`) |
| `VITE_SUPABASE_ANON_KEY` | Chave pública anônima do Supabase |

---

## 8. Guia para IAs — Leia Antes de Qualquer Alteração

### ❌ O que NÃO fazer

- **NÃO reescrever o `App.jsx` do zero.** O arquivo é grande (~2300 linhas) mas intencional. Faça edições cirúrgicas e pontuais.
- **NÃO mudar o sistema de estilização.** Todos os estilos ficam no objeto `const S = { ... }` no topo do `App.jsx`. Não criar arquivos CSS separados.
- **NÃO instalar bibliotecas novas** sem autorização explícita. A stack é mínima por design.
- **NÃO criar arquivos de rotas, contextos globais ou Redux.** O estado é gerenciado localmente via `useState`.
- **NÃO mudar a estrutura de tabelas** do Supabase sem atualizar também o `supabase_schema.sql`.
- **NÃO commitar o `.env`** — está no `.gitignore` propositalmente.
- **NÃO commitar arquivos `vite.config.js.timestamp-*`** — também estão no `.gitignore`.
- **NÃO editar o `.git/config` manualmente.** Corrompê-lo quebra todo o git local.

### ✅ Fluxo correto para alterações

1. Ler o arquivo relevante antes de editar (`App.jsx`, `constants.js`, etc.)
2. Identificar o componente/função específica — buscar pelo nome da página ou função
3. Fazer a edição mínima necessária — não refatorar o que não foi pedido
4. Testar localmente se possível (`npm run dev`)
5. Commitar com mensagem descritiva: `fix(modulo): descrição` ou `feat(modulo): descrição`
6. Fazer push: `git push origin master:main`

### Onde fica cada funcionalidade no App.jsx

| Funcionalidade | Buscar por |
|---|---|
| Estilos globais | `const S = {` no início do arquivo |
| Sidebar / navegação | `function Sidebar(` |
| Dashboard | `function PageDashboard(` |
| Venda física | `function FormVendaFisica(` |
| Venda online / recibo | `function FormVendaOnline(` |
| Aparelhos (cadastro + estoque) | `function PageAparelhos(` |
| Acessórios (cadastro + estoque) | `function PageAcessorios(` |
| Custos operacionais | `function PageCustos(` |
| Relatórios | `function PageRelatorios(` |
| Configurações / reset | `function PageConfiguracoes(` |
| Carregamento de dados | `async function fetchAll(` |

### Erros comuns que IAs cometem neste projeto

- Tentar `git push` sem especificar o mapeamento → sempre usar `git push origin master:main`
- Fazer `git add -A` e commitar arquivos temporários do Vite ou o `.env`
- Reescrever componentes inteiros quando foi pedida uma correção pontual
- Criar novos arquivos de componentes — a arquitetura é monolítica (tudo no `App.jsx`) por escolha do dono

---

## 9. Histórico de Commits Relevantes

| Hash | Descrição |
|---|---|
| `0008e23` | fix(vendas): corrige cálculo de custo e baixa de estoque de acessórios (FIFO) |
| `e744e99` | chore: remove arquivos temporários do Vite e atualiza .gitignore |
| `3214a0a` | fix: always use catalog preco_venda for accessories in PDF |
| `f1cc79e` | feat: add preco_venda to accessories catalog for correct PDF pricing |
| `08fb315` | feat: adicionar página de Configurações com reset de dados por seção |
| `6a300e6` | feat: adicionar exclusão em massa nos estoques de aparelhos e acessórios |
| `3717c38` | fix: substituir window.confirm() por modal React personalizado |
| `fddfa1a` | fix: corrigir garantia Apple iPhone novo |
| `02102f5` | feat: atualizar logo da Core Eletrônicos no PDF |
| `ee791bf` | Primeiro commit |

---

*Atualizar este documento sempre que houver mudanças na stack, estrutura ou regras de negócio.*
