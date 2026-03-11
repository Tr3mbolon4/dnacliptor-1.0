# Logi3A Soluções - PRD (Product Requirements Document)

## Problema Original
Sistema educacional de simulação de leitura de QR Code e código de barras para aulas de logística, com sistema de login, pontuação e acompanhamento pedagógico.

## Arquitetura
- **Frontend**: React 19 + Tailwind CSS + Shadcn UI + Recharts
- **Backend**: FastAPI + Motor (MongoDB async)
- **Database**: MongoDB
- **Scanner**: html5-qrcode (câmera traseira prioritária)

## User Personas
1. **Alunos**: Aprender sobre leitura óptica e logística
2. **Professores**: Gerenciar materiais e acompanhar desempenho

## Core Requirements - Implementado (Jan 2026)

### Sistema de Login
- [x] Login com nome, turma e senha
- [x] Perfis: Aluno e Professor
- [x] Modo demonstração (Aluno Demo, Professor Demo)

### Funcionalidades do Aluno
- [x] Leitura de QR Code (câmera traseira)
- [x] Leitura de Código de Barras
- [x] Gerador de QR Code Logístico
- [x] Painel com pontuação, acertos, erros, tempo
- [x] Feedback pedagógico personalizado
- [x] Classificação (Excelente/Bom/Regular/Precisa melhorar)

### Funcionalidades do Professor
- [x] Dashboard com estatísticas
- [x] Ranking de alunos
- [x] Filtro por turma
- [x] Gráficos de operações e acertos/erros
- [x] Exportação PDF e CSV
- [x] Gerenciamento de materiais

### Páginas Educativas
- [x] "O que o Aluno Aprende" - Conteúdo educacional
- [x] "Como Funciona" - Guia passo a passo

### Sistema de Pontuação
- Leitura correta: +10 pontos
- Operação correta: +15 pontos
- Atividade concluída: +20 pontos
- Tempo até 30s: +10 | 31-60s: +7 | 61-120s: +4 | >120s: +2
- 3 acertos seguidos: +10 bônus
- Erro de operação: -5

### Materiais de Demonstração
- 10 materiais pré-cadastrados (Parafuso, Caixa, Palete, etc.)

## APIs Backend
- POST /api/usuarios/registro - Cadastro
- POST /api/usuarios/login - Login
- GET /api/usuarios - Listar usuários
- POST /api/atividades - Registrar atividade
- GET /api/atividades - Listar atividades
- GET /api/materiais - CRUD materiais
- GET /api/estatisticas - Estatísticas gerais
- GET /api/estatisticas/turma/{turma} - Por turma
- GET /api/feedback/{usuario_id} - Feedback pedagógico
- POST /api/seed - Dados demonstração

## URLs
- App: https://logi3a-supply-chain.preview.emergentagent.com
- Login: /login
- Painel Aluno: /aluno
- Painel Professor: /professor

## Credenciais Demo
- Professor: "Professor Demo" / senha: "123456"
- Aluno: Cadastrar ou usar botão "Aluno Demo"

## Next Tasks
1. Impressão de etiquetas com QR Code
2. Relatórios por período
3. PWA para funcionamento offline
