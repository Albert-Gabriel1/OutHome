# OutHome

Projeto de planejamento de viagens com frontend HTML/CSS/JavaScript, API Node.js/Express, JWT e MySQL.

## Estrutura

- Frontend: arquivos `.html`, `estilo.css`, `js.js`, `api.js` e `js/`
- Backend: `backend/src/`
- Banco: `backend/sql/schema.sql`

## 1. Banco de dados

Abra o MySQL e execute:

```sql
SOURCE caminho/para/OutHome/backend/sql/schema.sql;
```

Ou copie o conteúdo de `backend/sql/schema.sql` para o MySQL Workbench.

## 2. Variáveis do backend

O arquivo `backend/.env` deve conter:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=sua_senha
DB_NAME=site_viagens
JWT_SECRET=uma_chave_longa_e_aleatoria
PORT=3000
```

Não envie o `.env` para o Git.

## 3. Instalar dependências

No terminal:

```bash
cd backend
npm install
```

## 4. Iniciar API

Modo normal:

```bash
npm start
```

Modo desenvolvimento:

```bash
npm run dev
```

A API ficará em:

`http://localhost:3000`

Teste:

`http://localhost:3000/`

Teste do banco:

`http://localhost:3000/testar-banco`

## 5. Abrir o frontend

Você pode usar o Live Server do VS Code para abrir `index.html`.

O frontend já está configurado para chamar:

`http://localhost:3000`

O fluxo funcional implementado é:

1. Cadastro
2. Login
3. JWT armazenado no navegador
4. Meus Projetos
5. Criação de roteiro
6. Criação de dias
7. Criação de atividades
8. Exclusão de atividades
9. Exclusão de dias
10. Exclusão de roteiros
11. Consulta autenticada dos dados

## Principais arquivos de integração

- `api.js`: cliente da API e gerenciamento do token
- `js/auth.js`: cadastro e login
- `js/meus_projetos.js`: CRUD de roteiros no frontend
- `js/roteiro.js`: dias e atividades
- `backend/src/routes/auth.js`: autenticação
- `backend/src/routes/roteiros.js`: CRUD dos roteiros
- `backend/src/middleware/auth.js`: validação JWT
- `backend/sql/schema.sql`: estrutura do banco

## Observação

A recuperação de senha por e-mail ainda não foi implementada, pois o projeto não possui serviço de envio de e-mails configurado. A página antiga apontava para um arquivo PHP inexistente, então ela foi corrigida para não fingir que esse recurso está funcionando.
