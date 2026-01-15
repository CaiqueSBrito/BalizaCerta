import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Instrutores from "./pages/Instrutores";
import InstructorProfile from "./pages/InstructorProfile";
import InstructorPlans from "./pages/InstructorPlans";
import InstructorRegister from "./pages/InstructorRegister";
import CadastroSucesso from "./pages/CadastroSucesso";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/instrutores" element={<Instrutores />} />
          <Route path="/instrutor/:id" element={<InstructorProfile />} />
          <Route path="/planos-instrutor" element={<InstructorPlans />} />
          <Route path="/cadastro-instrutor" element={<InstructorRegister />} />
          <Route path="/cadastro-sucesso" element={<CadastroSucesso />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
