# GoLedger Challenge - TV Show Catalog

Projeto desenvolvido para gerenciar um catálogo de séries, temporadas e episódios integrado com a API Blockchain da GoLedger. A aplicação permite o CRUD completo desses itens, além de um sistema de favoritos/watchlists.

## Tecnologias principais

- **Next.js 15** (App Router)
- **Tailwind CSS v4**
- **TanStack Query v5** (React Query)
- **Zustand** (Estado Global)
- **Lucide React** (Ícones)
- **Axios** (API Client)

## Como rodar o projeto localmente

### 1. Requisitos

- Node.js lts (v18+)
- npm ou yarn

### 2. Configurando o ambiente

Crie um arquivo `.env` na raiz do projeto e preencha com as credenciais da GoLedger:

```env
API_USERNAME=seu_usuario
API_PASSWORD=sua_senha
NEXT_PUBLIC_API_BASE_URL=https://api.projeto.goledger.com.br
```

_Obs: A aplicação usa um Proxy interno no Next.js (em `/api/auth/proxy`) para fazer as chamadas à API de forma segura sem expor os tokens no navegador._

### 3. Instalação e execução

```bash
# Instalar dependências
npm install

# Rodar em desenvolvimento
npm run dev
```

O projeto estará disponível em `http://localhost:3000`.

## Estrutura de pastas

- `/src/app`: Páginas, layouts e rotas de API (Next.js App Router).
- `/src/components`: Componentes da interface, divididos por contexto (ex: `tv-show-details`).
- `/src/hooks`: Hooks do React Query para abstrair o consumo dos dados.
- `/src/services`: Onde fica o `api-client.ts` que centraliza as chamadas ao GoLedger.
- `/src/store`: Gerenciamento de estado global com Zustand (favoritos e modo escuro).
- `/src/types`: Interfaces do TypeScript para os assets de séries, temporadas e episódios.

## Observações técnicas

- **Datas**: O blockchain exige o formato RFC3339. O sistema cuida da conversão automática no envio.
- **Validações**: Os campos numéricos possuem validação para evitar valores negativos ou caracteres especiais inválidos direto no input.
- **Cache**: Utilizamos o React Query para garantir que os dados fiquem sincronizados e evitar requests desnecessários.

## 📝 Notas de Desenvolvimento e Limitações da API

Durante a integração com o backend GoLedger, foram identificadas certas restrições inerentes à arquitetura do blockchain que impactam as operações de atualização (Update):

- **Edição de Temporadas**: O campo `number` da temporada parece compor a sua **Chave Primária**. Chaves primárias são imutáveis. Por esse motivo, a API retorna `200 OK` (transação submetida), mas o valor não é alterado no registro.
- **Edição de Episódios**: Similarmente ao caso das temporadas, o `episodeNumber` é um campo identificador e não permite alteração após a criação do asset.
- **Edição de Listas (Watchlists)**: O campo `title` é utilizado para gerar o ID do asset no ledger. Alterar o título de uma lista via `updateAsset` é restrito devido à natureza do identificador único do asset.

### Estratégia de Atualização

Para contornar as limitações de imutabilidade de chaves em campos como "Número da Temporada" ou "Número do Episódio", a recomendação técnica é a exclusão do registro e a criação de um novo asset com os dados atualizados.
