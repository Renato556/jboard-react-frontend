# JBoard - Portal de Vagas de Emprego

Uma aplicação React moderna para busca e visualização de vagas de emprego.

## 🚀 Funcionalidades

- **Listagem de Vagas**: Exibe todas as vagas disponíveis da API
- **Filtros Inteligentes**: Filtre por nível de senioridade e área de atuação sem fazer novas requisições
- **Interface Responsiva**: Design moderno que se adapta a diferentes tamanhos de tela
- **API Parametrizável**: URL da API configurável através do arquivo de configuração

## 🛠️ Tecnologias Utilizadas

- React 19
- Axios para requisições HTTP
- CSS3 com gradientes e animações
- Vite como bundler

## 📦 Instalação e Execução

1. **Instalar dependências:**
   ```bash
   npm install
   ```

2. **Executar o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

3. **Acessar a aplicação:**
   Abra o navegador em `http://localhost:5173`

## ⚙️ Configuração

### URL da API
A URL da API pode ser configurada no arquivo `src/config.js`:

```javascript
export const API_CONFIG = {
  BASE_URL: 'http://localhost:8081', // Altere aqui a URL base
  ENDPOINTS: {
    JOBS: '/api/jobs'
  }
};
```

### Formato da API
A aplicação espera que a API retorne dados no seguinte formato:

```json
{
  "data": [
    {
      "id": "d0574ff3-1f90-4a6a-98ce-8d08e68f65d2",
      "title": "Senior Software Engineer, RCM (Brazil)",
      "updatedAt": "2025-08-20T21:17:00.853Z",
      "employmentType": "Contract",
      "publishedDate": "2025-08-12",
      "applicationDeadline": "",
      "compensationTierSummary": "",
      "workplaceType": "Remote",
      "officeLocation": "",
      "company": "commure-athelas",
      "url": "https://jobs.ashbyhq.com/commure-athelas/d0574ff3-1f90-4a6a-98ce-8d08e68f65d2",
      "seniorityLevel": "Senior",
      "field": "Engineering"
    }
  ],
  "meta": {
    "totalRecords": 1
  }
}
```

## 🎯 Funcionalidades Implementadas

### 1. Requisição GET para API
- Endpoint: `GET http://localhost:8081/api/jobs`
- URL parametrizável através do arquivo de configuração
- Tratamento de erros e estados de loading

### 2. Interface de Listagem
- Cards modernos para cada vaga
- Informações detalhadas: título, empresa, nível, área, tipo de trabalho
- Botão para candidatura que abre o link da vaga

### 3. Sistema de Filtros
- Filtro por nível de senioridade (Junior, Mid, Senior, etc.)
- Filtro por área de atuação (Engineering, Design, etc.)
- Filtros funcionam sem fazer novas requisições à API
- Opção para limpar todos os filtros

### 4. Design de Portal de Vagas
- Header com gradiente e informações da empresa JBoard
- Layout responsivo com sidebar para filtros
- Animações suaves e efeitos hover
- Indicadores de quantidade de vagas (total e filtradas)

## 📱 Responsividade

A aplicação é totalmente responsiva:
- **Desktop**: Layout em duas colunas (filtros + vagas)
- **Tablet**: Layout adaptativo
- **Mobile**: Layout em coluna única com filtros no topo

## 🎨 Design System

- **Cores primárias**: Gradiente roxo/azul (#667eea → #764ba2)
- **Tipografia**: Segoe UI system font
- **Componentes**: Cards com sombras e bordas arredondadas
- **Animações**: Transições suaves em hover e focus

## 🔧 Estrutura do Projeto

```
src/
├── components/
│   ├── JobBoard.jsx       # Componente principal
│   ├── JobBoard.css
│   ├── JobCard.jsx        # Card individual de vaga
│   ├── JobCard.css
│   ├── JobFilters.jsx     # Componente de filtros
│   └── JobFilters.css
├── services/
│   └── api.js            # Serviços de API
├── config.js             # Configurações da aplicação
├── App.jsx
└── App.css
```

## 🚨 Tratamento de Erros

- Loading spinner durante o carregamento
- Mensagens de erro amigáveis
- Botão de "Tentar Novamente" em caso de falha
- Fallbacks para dados ausentes

## 📄 Licença

Este projeto foi desenvolvido para demonstração de habilidades em React e desenvolvimento frontend.
