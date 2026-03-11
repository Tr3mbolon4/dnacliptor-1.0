import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AppContext = createContext(null);

// Local storage keys
const STORAGE_KEYS = {
  USER: "logi3a_user",
  DARK_MODE: "logi3a_dark_mode",
  ALUNO_NOME: "logi3a_aluno_nome",
  TURMA_NOME: "logi3a_turma_nome",
  ACTIVITY_SCORES: "logi3a_activity_scores",
};

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [materiais, setMateriais] = useState([]);
  const [atividades, setAtividades] = useState([]);
  const [leituras, setLeituras] = useState([]);
  const [estatisticas, setEstatisticas] = useState(null);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [turmas, setTurmas] = useState([]);
  const [activityMode, setActivityMode] = useState(false);
  const [alunoNome, setAlunoNome] = useState("");
  const [turmaNome, setTurmaNome] = useState("");
  const [activityScores, setActivityScores] = useState([]);

  // Load persisted state on mount
  useEffect(() => {
    const savedUser = localStorage.getItem(STORAGE_KEYS.USER);
    const savedDarkMode = localStorage.getItem(STORAGE_KEYS.DARK_MODE);
    const savedAluno = localStorage.getItem(STORAGE_KEYS.ALUNO_NOME);
    const savedTurma = localStorage.getItem(STORAGE_KEYS.TURMA_NOME);
    const savedScores = localStorage.getItem(STORAGE_KEYS.ACTIVITY_SCORES);

    if (savedUser) {
      try { setUser(JSON.parse(savedUser)); } catch (e) { /* ignore */ }
    }
    if (savedDarkMode === "true") {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    }
    if (savedAluno) setAlunoNome(savedAluno);
    if (savedTurma) setTurmaNome(savedTurma);
    if (savedScores) {
      try { setActivityScores(JSON.parse(savedScores)); } catch (e) { /* ignore */ }
    }
  }, []);

  // Persist aluno/turma
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.ALUNO_NOME, alunoNome); }, [alunoNome]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.TURMA_NOME, turmaNome); }, [turmaNome]);

  // Toggle dark mode
  const toggleDarkMode = useCallback(() => {
    setDarkMode((prev) => {
      const newValue = !prev;
      localStorage.setItem(STORAGE_KEYS.DARK_MODE, String(newValue));
      if (newValue) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      return newValue;
    });
  }, []);

  // ============ AUTH ============

  const login = useCallback(async (nome, senha, tipo) => {
    setLoading(true);
    try {
      const response = await axios.post(`${API}/usuarios/login`, { nome, senha, tipo });
      const userData = response.data;
      setUser(userData);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
      return userData;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const registrar = useCallback(async (nome, turma, matricula, senha, tipo = "aluno") => {
    setLoading(true);
    try {
      const response = await axios.post(`${API}/usuarios/registro`, {
        nome, turma, matricula, senha, tipo,
      });
      const userData = response.data;
      setUser(userData);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
      return userData;
    } catch (error) {
      console.error("Register error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEYS.USER);
  }, []);

  const refreshUser = useCallback(async () => {
    if (!user?.id) return;
    try {
      const response = await axios.get(`${API}/usuarios/${user.id}`);
      const userData = response.data;
      setUser(userData);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
      return userData;
    } catch (error) {
      console.error("Refresh user error:", error);
    }
  }, [user?.id]);

  // ============ MATERIAIS ============

  const fetchMateriais = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/materiais`);
      setMateriais(response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching materiais:", error);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const createMaterial = useCallback(async (data) => {
    const response = await axios.post(`${API}/materiais`, data);
    setMateriais((prev) => [...prev, response.data]);
    return response.data;
  }, []);

  const updateMaterial = useCallback(async (id, data) => {
    const response = await axios.put(`${API}/materiais/${id}`, data);
    setMateriais((prev) => prev.map((m) => (m.id === id ? response.data : m)));
    return response.data;
  }, []);

  const deleteMaterial = useCallback(async (id) => {
    await axios.delete(`${API}/materiais/${id}`);
    setMateriais((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const findMaterialByCode = useCallback(
    (codigo) => materiais.find((m) => m.codigo === codigo),
    [materiais]
  );

  // ============ LEITURAS (Simple Scan Records) ============

  const fetchLeituras = useCallback(async (filters = {}) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.turma) params.append("turma", filters.turma);
      if (filters.tipo_leitura) params.append("tipo_leitura", filters.tipo_leitura);
      const response = await axios.get(`${API}/leituras?${params.toString()}`);
      setLeituras(response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching leituras:", error);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const createLeitura = useCallback(async (data) => {
    try {
      const leituraData = {
        ...data,
        aluno: data.aluno || alunoNome || user?.nome || "",
        turma: data.turma || turmaNome || user?.turma || "",
      };
      const response = await axios.post(`${API}/leituras`, leituraData);
      setLeituras((prev) => [response.data, ...prev]);
      return response.data;
    } catch (error) {
      console.error("Error creating leitura:", error);
      throw error;
    }
  }, [alunoNome, turmaNome, user]);

  const clearLeituras = useCallback(async () => {
    try {
      await axios.delete(`${API}/leituras`);
      setLeituras([]);
    } catch (error) {
      console.error("Error clearing leituras:", error);
    }
  }, []);

  // ============ ATIVIDADES (Scored Activities) ============

  const fetchAtividades = useCallback(async (filters = {}) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.usuario_id) params.append("usuario_id", filters.usuario_id);
      if (filters.turma) params.append("turma", filters.turma);
      if (filters.tipo_leitura) params.append("tipo_leitura", filters.tipo_leitura);
      const response = await axios.get(`${API}/atividades?${params.toString()}`);
      setAtividades(response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching atividades:", error);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const registrarAtividade = useCallback(async (data) => {
    if (!user?.id) throw new Error("Usuário não logado");
    const atividadeData = { usuario_id: user.id, ...data };
    const response = await axios.post(`${API}/atividades`, atividadeData);
    setAtividades((prev) => [response.data, ...prev]);
    await refreshUser();
    return response.data;
  }, [user?.id, refreshUser]);

  const clearAtividades = useCallback(async () => {
    await axios.delete(`${API}/atividades`);
    setAtividades([]);
  }, []);

  // ============ ACTIVITY MODE ============

  const startActivityMode = useCallback(() => {
    setActivityMode(true);
  }, []);

  const endActivityMode = useCallback(() => {
    setActivityMode(false);
  }, []);

  const saveActivityScore = useCallback((scoreData) => {
    const record = {
      id: Date.now().toString(),
      aluno: alunoNome,
      turma: turmaNome,
      ...scoreData,
      timestamp: new Date().toISOString(),
    };
    setActivityScores((prev) => {
      const updated = [record, ...prev].slice(0, 50);
      localStorage.setItem(STORAGE_KEYS.ACTIVITY_SCORES, JSON.stringify(updated));
      return updated;
    });
  }, [alunoNome, turmaNome]);

  // ============ ESTATISTICAS ============

  const fetchEstatisticas = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/estatisticas`);
      setEstatisticas(response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching estatisticas:", error);
      return null;
    }
  }, []);

  const fetchEstatisticasTurma = useCallback(async (turma) => {
    try {
      const response = await axios.get(`${API}/estatisticas/turma/${encodeURIComponent(turma)}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching turma stats:", error);
      return null;
    }
  }, []);

  const fetchTurmas = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/turmas`);
      setTurmas(response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching turmas:", error);
      return [];
    }
  }, []);

  const fetchAlunos = useCallback(async (turma = null) => {
    try {
      let url = `${API}/usuarios?tipo=aluno`;
      if (turma) url += `&turma=${encodeURIComponent(turma)}`;
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error("Error fetching alunos:", error);
      return [];
    }
  }, []);

  // ============ FEEDBACK ============

  const fetchFeedback = useCallback(async (usuarioId) => {
    try {
      const response = await axios.get(`${API}/feedback/${usuarioId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching feedback:", error);
      return { feedbacks: [], aproveitamento: 0, tempo_medio: 0 };
    }
  }, []);

  // ============ SEED ============

  const seedDemoData = useCallback(async () => {
    try {
      await axios.post(`${API}/seed`);
      await fetchMateriais();
    } catch (error) {
      console.error("Error seeding data:", error);
    }
  }, [fetchMateriais]);

  // ============ IMAGE UPLOAD ============

  const uploadImage = useCallback(async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await axios.post(`${API}/upload-image`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  }, []);

  const value = {
    // State
    user, materiais, atividades, leituras, estatisticas, loading, darkMode, turmas,
    activityMode, alunoNome, turmaNome, activityScores,

    // Auth
    login, registrar, logout, refreshUser,

    // Settings
    toggleDarkMode,
    setAlunoNome, setTurmaNome,

    // Materiais
    fetchMateriais, createMaterial, updateMaterial, deleteMaterial, findMaterialByCode,

    // Leituras
    fetchLeituras, createLeitura, clearLeituras,

    // Atividades
    fetchAtividades, registrarAtividade, clearAtividades,

    // Activity Mode
    startActivityMode, endActivityMode, saveActivityScore,

    // Estatisticas
    fetchEstatisticas, fetchEstatisticasTurma, fetchTurmas, fetchAlunos, fetchFeedback,

    // Seed & Upload
    seedDemoData, uploadImage,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
