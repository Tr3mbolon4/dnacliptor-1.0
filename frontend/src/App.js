import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { AppProvider } from "./contexts/AppContext";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import PainelAluno from "./pages/PainelAluno";
import PainelProfessor from "./pages/PainelProfessor";
import ScannerQR from "./pages/ScannerQR";
import ScannerBarcode from "./pages/ScannerBarcode";
import Historico from "./pages/Historico";
import Dashboard from "./pages/Dashboard";
import Materiais from "./pages/Materiais";
import GeradorQR from "./pages/GeradorQR";
import OQueAprende from "./pages/OQueAprende";
import ComoFunciona from "./pages/ComoFunciona";
import Configuracoes from "./pages/Configuracoes";

import "./App.css";

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-background">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/o-que-aprende" element={<OQueAprende />} />
            <Route path="/como-funciona" element={<ComoFunciona />} />
            
            {/* Protected Routes - Aluno */}
            <Route path="/aluno" element={<PainelAluno />} />
            
            {/* Protected Routes - Professor */}
            <Route path="/professor" element={<PainelProfessor />} />
            
            {/* Scanner Routes */}
            <Route path="/scanner-qr" element={<ScannerQR />} />
            <Route path="/scanner-barcode" element={<ScannerBarcode />} />
            
            {/* Other Routes */}
            <Route path="/historico" element={<Historico />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/materiais" element={<Materiais />} />
            <Route path="/gerador-qr" element={<GeradorQR />} />
            <Route path="/configuracoes" element={<Configuracoes />} />
          </Routes>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                color: "hsl(var(--foreground))",
              },
            }}
          />
        </div>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
