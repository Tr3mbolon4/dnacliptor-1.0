# Logi3A Soluções

Aplicação educacional com frontend em React + CRACO e backend em FastAPI para cadastro/login, gerenciamento de materiais, leitura de códigos, registro de atividades e estatísticas.

## Estrutura

- `frontend/`: interface React.
- `backend/`: API FastAPI.

## Requisitos

- Node.js 20+
- npm 10+
- Python 3.11+

## Variáveis de ambiente

### Frontend

Crie `frontend/.env` a partir de [`frontend/.env.example`](./frontend/.env.example):

```env
REACT_APP_BACKEND_URL=http://localhost:8000
```

### Backend

Crie `backend/.env` a partir de [`backend/.env.example`](./backend/.env.example):

```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=logi3a
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
USE_MOCK_DB=true
```

Observações:

- Se `USE_MOCK_DB=true` ou se o Mongo não responder no startup, a API usa um banco em memória para facilitar o desenvolvimento local.
- Em modo memória, os dados são perdidos ao reiniciar o backend.

## Como rodar

### 1. Backend

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
Copy-Item .env.example .env
uvicorn server:app --reload --host 0.0.0.0 --port 8000
```

### 2. Frontend

```powershell
cd frontend
npm install
Copy-Item .env.example .env
npm start
```

Frontend: `http://localhost:3000`  
Backend: `http://localhost:8000`

## Seed de dados

Você pode popular o sistema de duas formas:

- usar os botões de demo na tela de login, que disparam o seed automaticamente
- chamar a API manualmente:

```powershell
Invoke-RestMethod -Method Post -Uri http://localhost:8000/api/seed
```

## Fluxo principal validado no código

1. Cadastro e login de aluno/professor em `/login`
2. Seed de dados demo
3. CRUD de materiais em `/materiais`
4. Leitura de QR Code ou código de barras
5. Registro automático de `leituras` e `atividades` para aluno logado
6. Estatísticas em `/dashboard` e `/professor`

## Credenciais demo

- Professor: `Professor Demo` / `123456`
- Aluno: `Aluno Demo` / `123456`

## Ajustes feitos

- correção da árvore de dependências do frontend para instalação e build com CRA/CRACO
- fallback seguro para `REACT_APP_BACKEND_URL` no frontend
- carregamento automático de materiais em telas que dependem deles
- registro automático de atividades a partir do scanner, além das leituras
- atualização do dashboard para buscar leituras recentes
- limpeza dos warnings de build do frontend
- simplificação do `requirements.txt` do backend para o fluxo real do projeto
- fallback do backend para banco em memória quando `MONGO_URL` não estiver configurado
- configuração de CORS local padrão
- criação de `.env.example` para frontend e backend

## Limitação encontrada neste ambiente

Neste workspace, a instalação do backend não pôde ser concluída porque o `pip` está bloqueado por proxy e retorna `407 Proxy Authentication Required` para o PyPI. O frontend foi instalado e buildado com sucesso; a parte do backend foi preparada para execução local, mas a validação final da API depende de um ambiente com acesso ao PyPI.
