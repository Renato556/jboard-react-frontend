# JBoard - Portal de Vagas de Emprego

Uma aplicação React moderna para busca e visualização de vagas de emprego com recursos avançados de análise de habilidades e IA.

## 🎯 Objetivo da Aplicação

O JBoard é uma plataforma completa de gerenciamento de vagas de emprego que permite aos usuários:
- Visualizar e filtrar vagas de emprego em tempo real
- Analisar compatibilidade entre suas habilidades e requisitos das vagas usando IA
- Gerenciar perfil pessoal e habilidades profissionais
- Acessar recursos premium para análise avançada

## 🚀 Funcionalidades

### Ações do Usuário

#### **Autenticação e Perfil**
- **Login/Logout**: Sistema de autenticação com diferentes níveis de usuário (Free/Premium)
- **Registro de Conta**: Criação de nova conta de usuário
- **Alteração de Senha**: Atualização segura de credenciais (apenas logado)
- **Exclusão de Conta**: Remoção completa da conta do sistema (apenas logado)
- **Gerenciamento de Habilidades** (Premium): Adicionar, remover e listar habilidades técnicas

#### **Navegação e Interface**
- **Dashboard Principal**: Visualização centralizada de todas as vagas
- **Interface Responsiva**: Design adaptável para desktop, tablet e mobile
- **Filtros em Tempo Real**: Filtragem instantânea sem requisições adicionais
- **Ordenação Dinâmica**: Organização por data de publicação ou atualização

### Busca de Vagas

#### **Visualização de Vagas**
- **Listagem Completa**: Exibição de todas as vagas disponíveis
- **Informações Detalhadas**: Título, empresa, nível de senioridade, área, tipo de contrato
- **Badges Visuais**: Identificação rápida de características da vaga
- **Datas Importantes**: Publicação, atualização e prazo de candidatura
- **Link Direto**: Redirecionamento para aplicação externa

#### **Sistema de Filtros**
- **Filtro por Senioridade**: Junior, Pleno, Senior, etc.
- **Filtro por Área**: Tecnologia, Marketing, Vendas, etc.
- **Filtros Combinados**: Múltiplos filtros simultâneos
- **Contador de Resultados**: Feedback visual de vagas filtradas

#### **Ordenação Inteligente**
- **Por Data de Publicação**: Mais recentes primeiro (padrão)
- **Por Data de Atualização**: Vagas atualizadas recentemente
- **Ordem Crescente/Decrescente**: Flexibilidade na visualização

### Análise de Habilidades vs Vaga

#### **Análise com IA (Recurso Premium)**
- **Análise Automática**: Comparação entre habilidades do usuário e requisitos da vaga
- **Score de Compatibilidade**: Percentual de match entre perfil e vaga
- **Recomendações Personalizadas**: Sugestões de habilidades para desenvolver
- **Relatório Detalhado**: Análise completa em formato legível

#### **Gestão de Habilidades (Premium)**
- **Cadastro de Skills**: Adicionar habilidades técnicas e comportamentais
- **Remoção Individual**: Exclusão de habilidades específicas
- **Limpeza Completa**: Remoção de todas as habilidades cadastradas
- **Interface Intuitiva**: Gerenciamento simples e eficiente

## 🔧 Tecnologias Utilizadas

- **Frontend**: React 19 com Hooks
- **Roteamento**: React Router DOM 7.9.3
- **HTTP Client**: Axios 1.12.2
- **Build Tool**: Vite 7.1.5
- **Testing**: Vitest 3.2.4 + Testing Library
- **Linting**: ESLint 9.35.0
- **Containerização**: Docker + Nginx
- **CI/CD**: GitHub Actions
- **Cloud**: Azure Container Apps

## 📦 Instalação e Execução

### Pré-requisitos
- Node.js 20 ou superior
- NPM ou Yarn
- Git

### Instalação Local

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/Renato556/jboard-react-frontend.git
   cd jboard-react-frontend
   ```

2. **Instalar dependências:**
   ```bash
   npm install
   ```

3. **Configurar variáveis de ambiente:**
   ```bash
   # Criar arquivo .env na raiz do projeto
   VITE_API_URL=http://localhost:8081
   ```

4. **Executar em modo desenvolvimento:**
   ```bash
   npm run dev
   ```

5. **Acessar a aplicação:**
   ```
   http://localhost:5173
   ```

### Build para Produção

```bash
# Gerar build otimizado
npm run build

# Visualizar build localmente
npm run preview
```

### Execução com Docker

```bash
# Build da imagem
docker build -t jboard-frontend .

# Executar container
docker run -p 80:80 jboard-frontend
```

## 🧪 Execução de Testes

### Testes Unitários

```bash
# Executar todos os testes
npm run test

# Executar testes em modo watch
npm run test:watch

# Executar testes com interface visual
npm run test:ui
```

### Cobertura de Testes

```bash
# Gerar relatório de cobertura
npm run test:coverage

# Visualizar relatório no navegador
open coverage/index.html
```

### Linting

```bash
# Verificar código
npm run lint

# Corrigir problemas automaticamente
npm run lint:fix
```

### Estrutura de Testes

- **Componentes**: Testes de renderização e interação
- **Serviços**: Testes de API e autenticação
- **Hooks**: Testes de lógica customizada
- **Utils**: Testes de funções utilitárias

## 🔄 Deploy e Workflows

### Azure Deploy Workflow

O projeto utiliza GitHub Actions para deploy automático no Azure Container Apps.

#### Triggers
- **Push**: Branches `main` e `master`
- **Manual**: `workflow_dispatch` para deploy sob demanda

#### Etapas do Pipeline

1. **Test and Setup**
   - Checkout do código
   - Setup Node.js 20
   - Cache de dependências NPM
   - Instalação de dependências (`npm ci`)
   - Execução paralela de testes e linting

2. **Build and Deploy**
   - Setup Docker Buildx
   - Login no Azure
   - Obtenção da URL do backend
   - Login no Azure Container Registry
   - Build e push da imagem Docker
   - Deploy no Azure Container Apps
   - Obtenção da URL de produção

#### Variáveis de Ambiente
```yaml
AZURE_CONTAINER_REGISTRY: jboardregistry
CONTAINER_APP_NAME: jboard-react-frontend
RESOURCE_GROUP: jboard-microservices
CONTAINER_APP_ENVIRONMENT: jboard-environment
IMAGE_NAME: jboard-react-frontend
TARGET_PORT: 80
BACKEND_CONTAINER_APP_NAME: jboard-java-orchestrator
```

#### Secrets Necessários
- `AZURE_CREDENTIALS`: Credenciais de service principal
- `ACR_USERNAME`: Usuário do Container Registry
- `ACR_PASSWORD`: Senha do Container Registry

#### Características Avançadas
- **Dependency Injection**: URL do backend obtida dinamicamente
- **Multi-stage Build**: Otimização de imagem Docker
- **Health Checks**: Verificação de deploy bem-sucedido
- **Rollback Automático**: Em caso de falha
- **Relatórios Detalhados**: Summary com links e informações

## 🔐 Credenciais de Uso

### Usuário Free
```
Usuário: freeUser
Senha: 123
```

**Funcionalidades Disponíveis:**
- Visualização de todas as vagas
- Filtros e ordenação
- Candidatura direta
- Gerenciamento de perfil básico

### Usuário Premium
```
Usuário: premiumUser
Senha: 123
```

**Funcionalidades Adicionais:**
- Análise de vagas com IA
- Gerenciamento de habilidades
- Score de compatibilidade
- Recomendações personalizadas
- Relatórios detalhados de match

## 🤝 Colaboração e Desenvolvimento

### Padrões de Código
- **ESLint**: Configuração com regras do React
- **Prettier**: Formatação automática
- **Conventional Commits**: Mensagens padronizadas
- **Component Structure**: Organização modular

### Estrutura de Pastas
```
src/
├── components/
│   ├── Job/           # Componentes relacionados a vagas
│   └── User/          # Componentes de usuário
├── services/          # Serviços de API
├── test/             # Configurações de teste
└── config.js         # Configurações da aplicação
```

### Contribuindo
1. Fork o projeto
2. Crie uma branch feature (`git checkout -b feature/amazing-feature`)
3. Commit suas mudanças (`git commit -m 'Add some amazing-feature'`)
4. Push para a branch (`git push origin feature/amazing-feature`)
5. Abra um Pull Request

### Code Review
- Todos os PRs devem passar nos testes
- Cobertura mínima de 80%
- Aprovação de pelo menos 1 reviewer
- Validação automática do CI/CD

## 📄 Licenciamento

### Licença MIT

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

**Resumo da Licença:**
- ✅ Uso comercial
- ✅ Modificação
- ✅ Distribuição
- ✅ Uso privado
- ❌ Responsabilidade
- ❌ Garantia

### Direitos de Uso
- Permitido uso em projetos comerciais
- Permitida modificação do código
- Créditos aos autores originais apreciados
- Não há garantias de funcionamento
