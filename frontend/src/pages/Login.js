import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../contexts/AppContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { toast } from "sonner";
import { 
  GraduationCap, 
  UserCog, 
  LogIn, 
  UserPlus,
  Package,
  Eye,
  EyeOff
} from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const { login, registrar, seedDemoData } = useApp();
  
  const [tipo, setTipo] = useState("aluno");
  const [isRegistro, setIsRegistro] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Form fields
  const [nome, setNome] = useState("");
  const [turma, setTurma] = useState("");
  const [matricula, setMatricula] = useState("");
  const [senha, setSenha] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!nome || !senha) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }
    
    if (isRegistro && tipo === "aluno" && !turma) {
      toast.error("Informe a turma");
      return;
    }
    
    setLoading(true);
    
    try {
      if (isRegistro) {
        await registrar(nome, turma, matricula, senha, tipo);
        toast.success("Cadastro realizado com sucesso!");
      } else {
        await login(nome, senha, tipo);
        toast.success(`Bem-vindo, ${nome}!`);
      }
      
      // Seed demo data on first login
      await seedDemoData();
      
      // Redirect based on type
      if (tipo === "professor") {
        navigate("/professor");
      } else {
        navigate("/aluno");
      }
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error("Credenciais inválidas");
      } else if (error.response?.status === 400) {
        toast.error("Usuário já existe. Faça login.");
      } else {
        toast.error("Erro ao processar. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (tipoDemo) => {
    setLoading(true);
    try {
      if (tipoDemo === "professor") {
        await login("Professor Demo", "123456", "professor");
        await seedDemoData();
        navigate("/professor");
      } else {
        // Create demo student
        try {
          await registrar("Aluno Demo", "3º Ano A", "DEMO001", "123456", "aluno");
        } catch {
          await login("Aluno Demo", "123456", "aluno");
        }
        await seedDemoData();
        navigate("/aluno");
      }
      toast.success("Bem-vindo ao modo demonstração!");
    } catch (error) {
      toast.error("Erro ao entrar no modo demonstração");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary text-white mb-4">
            <Package className="w-8 h-8" />
          </div>
          <h1 className="font-heading text-3xl font-black text-foreground">
            Logi3A Soluções
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Escola Estadual Professora Elídia Tedesco de Oliveira
          </p>
        </div>

        {/* Login Card */}
        <Card className="shadow-lg" data-testid="login-card">
          <CardHeader className="text-center pb-2">
            <CardTitle className="font-heading text-xl">
              {isRegistro ? "Criar Conta" : "Entrar"}
            </CardTitle>
            <CardDescription>
              Simulador Educacional de Logística
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {/* Type Selector */}
            <Tabs value={tipo} onValueChange={setTipo} className="mb-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="aluno" className="gap-2" data-testid="tab-aluno">
                  <GraduationCap className="w-4 h-4" />
                  Aluno
                </TabsTrigger>
                <TabsTrigger value="professor" className="gap-2" data-testid="tab-professor">
                  <UserCog className="w-4 h-4" />
                  Professor
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome *</Label>
                <Input
                  id="nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder={tipo === "professor" ? "Nome do professor" : "Seu nome completo"}
                  data-testid="input-nome"
                />
              </div>

              {tipo === "aluno" && isRegistro && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="turma">Turma *</Label>
                    <Input
                      id="turma"
                      value={turma}
                      onChange={(e) => setTurma(e.target.value)}
                      placeholder="Ex: 3º Ano A"
                      data-testid="input-turma"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="matricula">Matrícula (opcional)</Label>
                    <Input
                      id="matricula"
                      value={matricula}
                      onChange={(e) => setMatricula(e.target.value)}
                      placeholder="Número da matrícula"
                      data-testid="input-matricula"
                    />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="senha">Senha *</Label>
                <div className="relative">
                  <Input
                    id="senha"
                    type={showPassword ? "text" : "password"}
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    placeholder="Digite sua senha"
                    data-testid="input-senha"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full gap-2"
                disabled={loading}
                data-testid="submit-btn"
              >
                {isRegistro ? (
                  <>
                    <UserPlus className="w-4 h-4" />
                    Cadastrar
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    Entrar
                  </>
                )}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => setIsRegistro(!isRegistro)}
                className="text-sm text-primary hover:underline"
              >
                {isRegistro ? "Já tem conta? Faça login" : "Não tem conta? Cadastre-se"}
              </button>
            </div>

            {/* Demo Buttons */}
            <div className="mt-6 pt-6 border-t">
              <p className="text-xs text-muted-foreground text-center mb-3">
                Modo demonstração
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleDemoLogin("aluno")}
                  disabled={loading}
                  data-testid="demo-aluno-btn"
                >
                  <GraduationCap className="w-4 h-4 mr-1" />
                  Aluno Demo
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleDemoLogin("professor")}
                  disabled={loading}
                  data-testid="demo-professor-btn"
                >
                  <UserCog className="w-4 h-4 mr-1" />
                  Professor Demo
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          Sistema educacional para ensino de logística
        </p>
      </div>
    </div>
  );
}
