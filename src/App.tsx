import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Instrutores from "./pages/Instrutores";
import InstructorProfile from "./pages/InstructorProfile";
import InstructorPlans from "./pages/InstructorPlans";
import InstructorRegister from "./pages/InstructorRegister";
import CadastroSucesso from "./pages/CadastroSucesso";
import Cadastro from "./pages/Cadastro";
import CadastroAluno from "./pages/CadastroAluno";
import AuthCallback from "./pages/AuthCallback";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/instrutores" element={<Instrutores />} />
            <Route path="/instrutor/:id" element={<InstructorProfile />} />
            <Route path="/planos-instrutor" element={<InstructorPlans />} />
            <Route path="/cadastro" element={<Cadastro />} />
            <Route path="/cadastro-aluno" element={<CadastroAluno />} />
            <Route path="/cadastro-instrutor" element={<InstructorRegister />} />
            <Route path="/cadastro-sucesso" element={<CadastroSucesso />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/login" element={<Login />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute requiredUserType="instructor">
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
