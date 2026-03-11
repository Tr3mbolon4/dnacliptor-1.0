from fastapi import FastAPI, APIRouter, HTTPException, UploadFile, File, Form
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import hashlib
import aiofiles

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app
app = FastAPI(title="Logi3A Soluções API")
api_router = APIRouter(prefix="/api")

# Uploads directory
UPLOADS_DIR = ROOT_DIR / "uploads"
UPLOADS_DIR.mkdir(exist_ok=True)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ============ HELPERS ============

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def calculate_performance(acertos: int, erros: int, tempo_total: int, atividades: int) -> dict:
    """Calculate student performance metrics"""
    total = acertos + erros
    aproveitamento = (acertos / total * 100) if total > 0 else 0
    tempo_medio = (tempo_total / atividades) if atividades > 0 else 0
    
    # Classification
    if aproveitamento >= 90:
        classificacao = "Excelente"
    elif aproveitamento >= 70:
        classificacao = "Bom"
    elif aproveitamento >= 50:
        classificacao = "Regular"
    else:
        classificacao = "Precisa melhorar"
    
    return {
        "aproveitamento": round(aproveitamento, 1),
        "tempo_medio": round(tempo_medio, 1),
        "classificacao": classificacao
    }

# ============ MODELS ============

class Usuario(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    nome: str
    tipo: str  # "aluno" ou "professor"
    turma: Optional[str] = ""
    matricula: Optional[str] = ""
    senha_hash: str
    pontuacao_total: int = 0
    acertos: int = 0
    erros: int = 0
    tempo_total: int = 0
    atividades_concluidas: int = 0
    sequencia_acertos: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UsuarioCreate(BaseModel):
    nome: str
    tipo: str
    turma: Optional[str] = ""
    matricula: Optional[str] = ""
    senha: str

class UsuarioLogin(BaseModel):
    nome: str
    senha: str
    tipo: str

class UsuarioResponse(BaseModel):
    id: str
    nome: str
    tipo: str
    turma: Optional[str] = ""
    matricula: Optional[str] = ""
    pontuacao_total: int = 0
    acertos: int = 0
    erros: int = 0
    tempo_total: int = 0
    atividades_concluidas: int = 0
    aproveitamento: float = 0
    tempo_medio: float = 0
    classificacao: str = "Iniciante"

class Material(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    nome: str
    codigo: str
    setor: str
    quantidade: int
    tipo_operacao: str
    descricao: Optional[str] = ""
    localizacao: Optional[str] = ""
    is_demo: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class MaterialCreate(BaseModel):
    nome: str
    codigo: str
    setor: str
    quantidade: int
    tipo_operacao: str
    descricao: Optional[str] = ""
    localizacao: Optional[str] = ""

class MaterialUpdate(BaseModel):
    nome: Optional[str] = None
    codigo: Optional[str] = None
    setor: Optional[str] = None
    quantidade: Optional[int] = None
    tipo_operacao: Optional[str] = None
    descricao: Optional[str] = None
    localizacao: Optional[str] = None

class Atividade(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    usuario_id: str
    usuario_nome: str
    turma: str
    codigo_lido: str
    produto: str
    tipo_leitura: str  # qrcode ou barcode
    operacao_esperada: str
    operacao_escolhida: str
    acerto: bool
    tempo_segundos: int
    pontuacao: int
    detalhes_pontuacao: dict = {}
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AtividadeCreate(BaseModel):
    usuario_id: str
    codigo_lido: str
    produto: str
    tipo_leitura: str
    operacao_esperada: str
    operacao_escolhida: str
    tempo_segundos: int

class Estatisticas(BaseModel):
    total_leituras: int
    leituras_qrcode: int
    leituras_barcode: int
    total_materiais: int
    total_alunos: int
    total_atividades: int
    media_aproveitamento: float
    leituras_por_operacao: dict
    leituras_por_setor: dict
    acertos_total: int
    erros_total: int

class EstatisticasTurma(BaseModel):
    turma: str
    total_alunos: int
    media_pontuacao: float
    media_aproveitamento: float
    total_atividades: int
    ranking: list

# ============ LEITURA MODELS ============

class Leitura(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    codigo: str
    produto: str
    tipo_leitura: str
    tipo_operacao: str
    setor: str = ""
    quantidade: int = 1
    aluno: str = ""
    turma: str = ""
    pontuacao: int = 0
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class LeituraCreate(BaseModel):
    codigo: str
    produto: str
    tipo_leitura: str
    tipo_operacao: str
    setor: str = ""
    quantidade: int = 1
    aluno: str = ""
    turma: str = ""
    pontuacao: int = 0

# ============ QR IMAGE MODEL ============

class QRImage(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    filename: str
    original_name: str
    content_type: str
    url: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# ============ USUARIOS ENDPOINTS ============

@api_router.post("/usuarios/registro", response_model=UsuarioResponse, status_code=201)
async def registrar_usuario(input: UsuarioCreate):
    # Check if user already exists
    existing = await db.usuarios.find_one({"nome": input.nome, "tipo": input.tipo})
    if existing:
        raise HTTPException(status_code=400, detail="Usuário já existe")
    
    usuario = Usuario(
        nome=input.nome,
        tipo=input.tipo,
        turma=input.turma,
        matricula=input.matricula,
        senha_hash=hash_password(input.senha)
    )
    
    doc = usuario.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.usuarios.insert_one(doc)
    
    perf = calculate_performance(0, 0, 0, 0)
    return UsuarioResponse(
        id=usuario.id,
        nome=usuario.nome,
        tipo=usuario.tipo,
        turma=usuario.turma,
        matricula=usuario.matricula,
        pontuacao_total=0,
        acertos=0,
        erros=0,
        tempo_total=0,
        atividades_concluidas=0,
        aproveitamento=perf["aproveitamento"],
        tempo_medio=perf["tempo_medio"],
        classificacao=perf["classificacao"]
    )

@api_router.post("/usuarios/login", response_model=UsuarioResponse)
async def login_usuario(input: UsuarioLogin):
    usuario = await db.usuarios.find_one({
        "nome": input.nome,
        "tipo": input.tipo,
        "senha_hash": hash_password(input.senha)
    }, {"_id": 0})
    
    if not usuario:
        raise HTTPException(status_code=401, detail="Credenciais inválidas")
    
    perf = calculate_performance(
        usuario.get("acertos", 0),
        usuario.get("erros", 0),
        usuario.get("tempo_total", 0),
        usuario.get("atividades_concluidas", 0)
    )
    
    return UsuarioResponse(
        id=usuario["id"],
        nome=usuario["nome"],
        tipo=usuario["tipo"],
        turma=usuario.get("turma", ""),
        matricula=usuario.get("matricula", ""),
        pontuacao_total=usuario.get("pontuacao_total", 0),
        acertos=usuario.get("acertos", 0),
        erros=usuario.get("erros", 0),
        tempo_total=usuario.get("tempo_total", 0),
        atividades_concluidas=usuario.get("atividades_concluidas", 0),
        aproveitamento=perf["aproveitamento"],
        tempo_medio=perf["tempo_medio"],
        classificacao=perf["classificacao"]
    )

@api_router.get("/usuarios/{usuario_id}", response_model=UsuarioResponse)
async def get_usuario(usuario_id: str):
    usuario = await db.usuarios.find_one({"id": usuario_id}, {"_id": 0})
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    
    perf = calculate_performance(
        usuario.get("acertos", 0),
        usuario.get("erros", 0),
        usuario.get("tempo_total", 0),
        usuario.get("atividades_concluidas", 0)
    )
    
    return UsuarioResponse(
        id=usuario["id"],
        nome=usuario["nome"],
        tipo=usuario["tipo"],
        turma=usuario.get("turma", ""),
        matricula=usuario.get("matricula", ""),
        pontuacao_total=usuario.get("pontuacao_total", 0),
        acertos=usuario.get("acertos", 0),
        erros=usuario.get("erros", 0),
        tempo_total=usuario.get("tempo_total", 0),
        atividades_concluidas=usuario.get("atividades_concluidas", 0),
        aproveitamento=perf["aproveitamento"],
        tempo_medio=perf["tempo_medio"],
        classificacao=perf["classificacao"]
    )

@api_router.get("/usuarios", response_model=List[UsuarioResponse])
async def get_usuarios(tipo: Optional[str] = None, turma: Optional[str] = None):
    query = {}
    if tipo:
        query["tipo"] = tipo
    if turma:
        query["turma"] = turma
    
    usuarios = await db.usuarios.find(query, {"_id": 0}).to_list(1000)
    result = []
    
    for u in usuarios:
        perf = calculate_performance(
            u.get("acertos", 0),
            u.get("erros", 0),
            u.get("tempo_total", 0),
            u.get("atividades_concluidas", 0)
        )
        result.append(UsuarioResponse(
            id=u["id"],
            nome=u["nome"],
            tipo=u["tipo"],
            turma=u.get("turma", ""),
            matricula=u.get("matricula", ""),
            pontuacao_total=u.get("pontuacao_total", 0),
            acertos=u.get("acertos", 0),
            erros=u.get("erros", 0),
            tempo_total=u.get("tempo_total", 0),
            atividades_concluidas=u.get("atividades_concluidas", 0),
            aproveitamento=perf["aproveitamento"],
            tempo_medio=perf["tempo_medio"],
            classificacao=perf["classificacao"]
        ))
    
    return result

# ============ ATIVIDADES ENDPOINTS ============

@api_router.post("/atividades", response_model=Atividade, status_code=201)
async def registrar_atividade(input: AtividadeCreate):
    # Get user
    usuario = await db.usuarios.find_one({"id": input.usuario_id}, {"_id": 0})
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    
    # Calculate points
    acerto = input.operacao_esperada.lower() == input.operacao_escolhida.lower()
    pontuacao = 0
    detalhes = {}
    
    # Leitura correta
    pontuacao += 10
    detalhes["leitura"] = 10
    
    # Operação correta
    if acerto:
        pontuacao += 15
        detalhes["operacao"] = 15
    else:
        pontuacao -= 5
        detalhes["operacao"] = -5
    
    # Tempo
    if input.tempo_segundos <= 30:
        pontuacao += 10
        detalhes["tempo"] = 10
    elif input.tempo_segundos <= 60:
        pontuacao += 7
        detalhes["tempo"] = 7
    elif input.tempo_segundos <= 120:
        pontuacao += 4
        detalhes["tempo"] = 4
    else:
        pontuacao += 2
        detalhes["tempo"] = 2
    
    # Atividade concluída
    pontuacao += 20
    detalhes["conclusao"] = 20
    
    # Bonus por sequência de acertos
    sequencia = usuario.get("sequencia_acertos", 0)
    if acerto:
        sequencia += 1
        if sequencia >= 3:
            pontuacao += 10
            detalhes["bonus_sequencia"] = 10
            sequencia = 0  # Reset after bonus
    else:
        sequencia = 0
    
    # Create atividade
    atividade = Atividade(
        usuario_id=input.usuario_id,
        usuario_nome=usuario["nome"],
        turma=usuario.get("turma", ""),
        codigo_lido=input.codigo_lido,
        produto=input.produto,
        tipo_leitura=input.tipo_leitura,
        operacao_esperada=input.operacao_esperada,
        operacao_escolhida=input.operacao_escolhida,
        acerto=acerto,
        tempo_segundos=input.tempo_segundos,
        pontuacao=pontuacao,
        detalhes_pontuacao=detalhes
    )
    
    doc = atividade.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    await db.atividades.insert_one(doc)
    
    # Update user stats
    update_data = {
        "$inc": {
            "pontuacao_total": pontuacao,
            "acertos": 1 if acerto else 0,
            "erros": 0 if acerto else 1,
            "tempo_total": input.tempo_segundos,
            "atividades_concluidas": 1
        },
        "$set": {
            "sequencia_acertos": sequencia
        }
    }
    await db.usuarios.update_one({"id": input.usuario_id}, update_data)
    
    return atividade

@api_router.get("/atividades", response_model=List[Atividade])
async def get_atividades(
    usuario_id: Optional[str] = None,
    turma: Optional[str] = None,
    tipo_leitura: Optional[str] = None
):
    query = {}
    if usuario_id:
        query["usuario_id"] = usuario_id
    if turma:
        query["turma"] = turma
    if tipo_leitura:
        query["tipo_leitura"] = tipo_leitura
    
    atividades = await db.atividades.find(query, {"_id": 0}).sort("timestamp", -1).to_list(1000)
    for a in atividades:
        if isinstance(a.get('timestamp'), str):
            a['timestamp'] = datetime.fromisoformat(a['timestamp'])
    return atividades

@api_router.delete("/atividades")
async def delete_all_atividades():
    await db.atividades.delete_many({})
    return {"message": "Histórico limpo com sucesso"}

# ============ MATERIAIS ENDPOINTS ============

@api_router.get("/materiais", response_model=List[Material])
async def get_materiais():
    materiais = await db.materiais.find({}, {"_id": 0}).to_list(1000)
    for m in materiais:
        if isinstance(m.get('created_at'), str):
            m['created_at'] = datetime.fromisoformat(m['created_at'])
        if isinstance(m.get('updated_at'), str):
            m['updated_at'] = datetime.fromisoformat(m['updated_at'])
    return materiais

@api_router.get("/materiais/{material_id}", response_model=Material)
async def get_material(material_id: str):
    material = await db.materiais.find_one({"id": material_id}, {"_id": 0})
    if not material:
        raise HTTPException(status_code=404, detail="Material não encontrado")
    if isinstance(material.get('created_at'), str):
        material['created_at'] = datetime.fromisoformat(material['created_at'])
    if isinstance(material.get('updated_at'), str):
        material['updated_at'] = datetime.fromisoformat(material['updated_at'])
    return material

@api_router.get("/materiais/codigo/{codigo}", response_model=Material)
async def get_material_by_codigo(codigo: str):
    material = await db.materiais.find_one({"codigo": codigo}, {"_id": 0})
    if not material:
        raise HTTPException(status_code=404, detail="Material não encontrado")
    if isinstance(material.get('created_at'), str):
        material['created_at'] = datetime.fromisoformat(material['created_at'])
    if isinstance(material.get('updated_at'), str):
        material['updated_at'] = datetime.fromisoformat(material['updated_at'])
    return material

@api_router.post("/materiais", response_model=Material, status_code=201)
async def create_material(input: MaterialCreate):
    material_dict = input.model_dump()
    material_obj = Material(**material_dict)
    doc = material_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['updated_at'] = doc['updated_at'].isoformat()
    await db.materiais.insert_one(doc)
    return material_obj

@api_router.put("/materiais/{material_id}", response_model=Material)
async def update_material(material_id: str, input: MaterialUpdate):
    existing = await db.materiais.find_one({"id": material_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Material não encontrado")
    
    update_data = {k: v for k, v in input.model_dump().items() if v is not None}
    update_data['updated_at'] = datetime.now(timezone.utc).isoformat()
    
    await db.materiais.update_one({"id": material_id}, {"$set": update_data})
    updated = await db.materiais.find_one({"id": material_id}, {"_id": 0})
    if isinstance(updated.get('created_at'), str):
        updated['created_at'] = datetime.fromisoformat(updated['created_at'])
    if isinstance(updated.get('updated_at'), str):
        updated['updated_at'] = datetime.fromisoformat(updated['updated_at'])
    return updated

@api_router.delete("/materiais/{material_id}")
async def delete_material(material_id: str):
    result = await db.materiais.delete_one({"id": material_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Material não encontrado")
    return {"message": "Material deletado com sucesso"}

# ============ ESTATISTICAS ENDPOINTS ============

@api_router.get("/estatisticas", response_model=Estatisticas)
async def get_estatisticas():
    total_atividades = await db.atividades.count_documents({})
    leituras_qrcode = await db.atividades.count_documents({"tipo_leitura": "qrcode"})
    leituras_barcode = await db.atividades.count_documents({"tipo_leitura": "barcode"})
    total_materiais = await db.materiais.count_documents({})
    total_alunos = await db.usuarios.count_documents({"tipo": "aluno"})
    
    # Acertos e erros totais
    acertos_total = await db.atividades.count_documents({"acerto": True})
    erros_total = await db.atividades.count_documents({"acerto": False})
    
    # Média de aproveitamento
    alunos = await db.usuarios.find({"tipo": "aluno"}, {"_id": 0}).to_list(1000)
    if alunos:
        total_aprov = sum([
            (a.get("acertos", 0) / max(a.get("acertos", 0) + a.get("erros", 0), 1) * 100)
            for a in alunos
        ])
        media_aproveitamento = total_aprov / len(alunos)
    else:
        media_aproveitamento = 0
    
    # Atividades por operação
    pipeline_op = [{"$group": {"_id": "$operacao_escolhida", "count": {"$sum": 1}}}]
    operacoes = await db.atividades.aggregate(pipeline_op).to_list(100)
    leituras_por_operacao = {op["_id"]: op["count"] for op in operacoes if op["_id"]}
    
    # Atividades por setor (from materials)
    pipeline_setor = [{"$group": {"_id": "$setor", "count": {"$sum": 1}}}]
    setores = await db.materiais.aggregate(pipeline_setor).to_list(100)
    leituras_por_setor = {s["_id"]: s["count"] for s in setores if s["_id"]}
    
    return Estatisticas(
        total_leituras=total_atividades,
        leituras_qrcode=leituras_qrcode,
        leituras_barcode=leituras_barcode,
        total_materiais=total_materiais,
        total_alunos=total_alunos,
        total_atividades=total_atividades,
        media_aproveitamento=round(media_aproveitamento, 1),
        leituras_por_operacao=leituras_por_operacao,
        leituras_por_setor=leituras_por_setor,
        acertos_total=acertos_total,
        erros_total=erros_total
    )

@api_router.get("/estatisticas/turma/{turma}", response_model=EstatisticasTurma)
async def get_estatisticas_turma(turma: str):
    alunos = await db.usuarios.find({"tipo": "aluno", "turma": turma}, {"_id": 0}).to_list(1000)
    
    if not alunos:
        raise HTTPException(status_code=404, detail="Turma não encontrada")
    
    # Calcular métricas
    total_alunos = len(alunos)
    total_pontuacao = sum([a.get("pontuacao_total", 0) for a in alunos])
    total_atividades = sum([a.get("atividades_concluidas", 0) for a in alunos])
    
    media_pontuacao = total_pontuacao / total_alunos if total_alunos > 0 else 0
    
    # Média aproveitamento
    aproveitamentos = []
    for a in alunos:
        total = a.get("acertos", 0) + a.get("erros", 0)
        if total > 0:
            aproveitamentos.append(a.get("acertos", 0) / total * 100)
    media_aproveitamento = sum(aproveitamentos) / len(aproveitamentos) if aproveitamentos else 0
    
    # Ranking
    ranking = sorted(alunos, key=lambda x: x.get("pontuacao_total", 0), reverse=True)
    ranking_list = [
        {
            "posicao": i + 1,
            "nome": a["nome"],
            "pontuacao": a.get("pontuacao_total", 0),
            "atividades": a.get("atividades_concluidas", 0)
        }
        for i, a in enumerate(ranking[:10])
    ]
    
    return EstatisticasTurma(
        turma=turma,
        total_alunos=total_alunos,
        media_pontuacao=round(media_pontuacao, 1),
        media_aproveitamento=round(media_aproveitamento, 1),
        total_atividades=total_atividades,
        ranking=ranking_list
    )

@api_router.get("/turmas")
async def get_turmas():
    pipeline = [
        {"$match": {"tipo": "aluno"}},
        {"$group": {"_id": "$turma", "count": {"$sum": 1}}}
    ]
    turmas = await db.usuarios.aggregate(pipeline).to_list(100)
    return [{"turma": t["_id"], "alunos": t["count"]} for t in turmas if t["_id"]]

# ============ FEEDBACK ENDPOINT ============

@api_router.get("/feedback/{usuario_id}")
async def get_feedback(usuario_id: str):
    usuario = await db.usuarios.find_one({"id": usuario_id}, {"_id": 0})
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    
    # Get recent activities
    atividades = await db.atividades.find(
        {"usuario_id": usuario_id},
        {"_id": 0}
    ).sort("timestamp", -1).limit(20).to_list(20)
    
    feedbacks = []
    
    # Analyze performance
    acertos = usuario.get("acertos", 0)
    erros = usuario.get("erros", 0)
    total = acertos + erros
    aproveitamento = (acertos / total * 100) if total > 0 else 0
    
    if aproveitamento >= 80:
        feedbacks.append("Você está indo muito bem! Continue assim!")
    elif aproveitamento >= 60:
        feedbacks.append("Bom progresso! Você está no caminho certo.")
    else:
        feedbacks.append("Continue praticando para melhorar seu desempenho.")
    
    # Analyze by operation
    if atividades:
        ops_certas = {}
        ops_erradas = {}
        for a in atividades:
            op = a.get("operacao_esperada", "")
            if a.get("acerto"):
                ops_certas[op] = ops_certas.get(op, 0) + 1
            else:
                ops_erradas[op] = ops_erradas.get(op, 0) + 1
        
        # Best operation
        if ops_certas:
            melhor_op = max(ops_certas, key=ops_certas.get)
            feedbacks.append(f"Você está indo muito bem em {melhor_op}.")
        
        # Needs improvement
        if ops_erradas:
            pior_op = max(ops_erradas, key=ops_erradas.get)
            feedbacks.append(f"Você precisa melhorar em {pior_op}.")
    
    # Analyze time
    tempo_medio = usuario.get("tempo_total", 0) / max(usuario.get("atividades_concluidas", 1), 1)
    if tempo_medio <= 30:
        feedbacks.append("Seu tempo de execução está ótimo!")
    elif tempo_medio <= 60:
        feedbacks.append("Seu tempo está bom, mas pode melhorar.")
    else:
        feedbacks.append("Tente ser mais rápido nas próximas atividades.")
    
    return {
        "feedbacks": feedbacks,
        "aproveitamento": round(aproveitamento, 1),
        "tempo_medio": round(tempo_medio, 1)
    }

# ============ LEITURAS ENDPOINTS ============

@api_router.post("/leituras", response_model=Leitura, status_code=201)
async def registrar_leitura(input: LeituraCreate):
    leitura = Leitura(**input.model_dump())
    doc = leitura.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    await db.leituras.insert_one(doc)
    return leitura

@api_router.get("/leituras", response_model=List[Leitura])
async def get_leituras(
    usuario_id: Optional[str] = None,
    turma: Optional[str] = None,
    tipo_leitura: Optional[str] = None
):
    query = {}
    if usuario_id:
        query["aluno"] = usuario_id
    if turma:
        query["turma"] = turma
    if tipo_leitura:
        query["tipo_leitura"] = tipo_leitura

    leituras = await db.leituras.find(query, {"_id": 0}).sort("timestamp", -1).to_list(1000)
    for l in leituras:
        if isinstance(l.get('timestamp'), str):
            l['timestamp'] = datetime.fromisoformat(l['timestamp'])
    return leituras

@api_router.delete("/leituras")
async def delete_all_leituras():
    await db.leituras.delete_many({})
    return {"message": "Histórico de leituras limpo com sucesso"}

# ============ IMAGE UPLOAD ENDPOINTS ============

@api_router.post("/upload-image")
async def upload_image(file: UploadFile = File(...)):
    allowed_types = ["image/jpeg", "image/png", "image/gif", "image/webp"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Tipo de arquivo não suportado. Use JPEG, PNG, GIF ou WebP.")

    file_ext = file.filename.split(".")[-1] if "." in file.filename else "png"
    file_id = str(uuid.uuid4())
    filename = f"{file_id}.{file_ext}"
    filepath = UPLOADS_DIR / filename

    async with aiofiles.open(filepath, 'wb') as f:
        content = await file.read()
        if len(content) > 5 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="Arquivo muito grande. Máximo 5MB.")
        await f.write(content)

    url = f"/api/images/{filename}"

    image_doc = QRImage(
        id=file_id,
        filename=filename,
        original_name=file.filename,
        content_type=file.content_type,
        url=url
    )
    doc = image_doc.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.qr_images.insert_one(doc)

    return {"id": file_id, "url": url, "filename": filename}

@api_router.get("/images/{filename}")
async def get_image(filename: str):
    from starlette.responses import FileResponse
    filepath = UPLOADS_DIR / filename
    if not filepath.exists():
        raise HTTPException(status_code=404, detail="Imagem não encontrada")
    return FileResponse(filepath)

# ============ SEED DATA ============

@api_router.post("/seed")
async def seed_data():
    # Always ensure demo professor exists
    professor_exists = await db.usuarios.find_one({"nome": "Professor Demo", "tipo": "professor"})
    if not professor_exists:
        professor = {
            "id": str(uuid.uuid4()),
            "nome": "Professor Demo",
            "tipo": "professor",
            "turma": "",
            "matricula": "",
            "senha_hash": hash_password("123456"),
            "pontuacao_total": 0,
            "acertos": 0,
            "erros": 0,
            "tempo_total": 0,
            "atividades_concluidas": 0,
            "sequencia_acertos": 0,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.usuarios.insert_one(professor)
    
    # Check if materials already exist
    count = await db.materiais.count_documents({})
    if count > 0:
        return {"message": "Dados já existem", "materiais": count}
    
    # Demo materials
    materiais_demo = [
        {"id": str(uuid.uuid4()), "nome": "Parafuso M8", "codigo": "789456123", "setor": "Expedição", "quantidade": 500, "tipo_operacao": "Expedição", "descricao": "Parafuso de aço galvanizado M8x30mm", "localizacao": "Prateleira A3", "is_demo": True},
        {"id": str(uuid.uuid4()), "nome": "Caixa de Papelão", "codigo": "456789123", "setor": "Estoque A", "quantidade": 200, "tipo_operacao": "Recebimento", "descricao": "Caixa 40x30x20cm", "localizacao": "Estoque A - Corredor 2", "is_demo": True},
        {"id": str(uuid.uuid4()), "nome": "Porca Sextavada", "codigo": "321654987", "setor": "Estoque B", "quantidade": 1000, "tipo_operacao": "Estoque", "descricao": "Porca M8 zincada", "localizacao": "Prateleira B1", "is_demo": True},
        {"id": str(uuid.uuid4()), "nome": "Fita Adesiva", "codigo": "654321789", "setor": "Expedição", "quantidade": 50, "tipo_operacao": "Expedição", "descricao": "Fita transparente 48mm", "localizacao": "Área de Embalagem", "is_demo": True},
        {"id": str(uuid.uuid4()), "nome": "Etiqueta Logística", "codigo": "987321654", "setor": "Identificação", "quantidade": 5000, "tipo_operacao": "Identificação", "descricao": "Etiqueta 100x50mm", "localizacao": "Almoxarifado", "is_demo": True},
        {"id": str(uuid.uuid4()), "nome": "Palete de Madeira", "codigo": "111222333", "setor": "Estoque A", "quantidade": 20, "tipo_operacao": "Estoque", "descricao": "Palete 1200x1000mm", "localizacao": "Área de Paletes", "is_demo": True},
        {"id": str(uuid.uuid4()), "nome": "Bobina de Filme", "codigo": "444555666", "setor": "Expedição", "quantidade": 15, "tipo_operacao": "Expedição", "descricao": "Filme stretch 500mm", "localizacao": "Área de Embalagem", "is_demo": True},
        {"id": str(uuid.uuid4()), "nome": "Produto Devolvido", "codigo": "777888999", "setor": "Logística Reversa", "quantidade": 3, "tipo_operacao": "Logística Reversa", "descricao": "Item em processo de devolução", "localizacao": "Área de Devoluções", "is_demo": True},
        {"id": str(uuid.uuid4()), "nome": "Material Recebido", "codigo": "123123123", "setor": "Recebimento", "quantidade": 100, "tipo_operacao": "Recebimento", "descricao": "Material aguardando conferência", "localizacao": "Doca de Recebimento", "is_demo": True},
        {"id": str(uuid.uuid4()), "nome": "Produto para Envio", "codigo": "456456456", "setor": "Expedição", "quantidade": 25, "tipo_operacao": "Expedição", "descricao": "Produto pronto para despacho", "localizacao": "Doca de Expedição", "is_demo": True},
    ]
    
    for m in materiais_demo:
        m["created_at"] = datetime.now(timezone.utc).isoformat()
        m["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.materiais.insert_many(materiais_demo)
    
    return {"message": "Dados de demonstração criados com sucesso", "materiais": len(materiais_demo)}

# ============ ROOT ENDPOINTS ============

@api_router.get("/")
async def root():
    return {"message": "API Logi3A Soluções", "version": "2.0.0"}

@api_router.get("/health")
async def health():
    return {"status": "healthy"}

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
