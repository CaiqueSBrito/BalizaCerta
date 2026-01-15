import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PricingSection from '@/components/PricingSection';
import FeaturesDetailSection from '@/components/FeaturesDetailSection';
import InstructorFAQ from '@/components/InstructorFAQ';

const InstructorPlans = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20">
        {/* Hero */}
        <section className="py-16 bg-gradient-to-b from-primary/5 to-background">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Planos para <span className="text-accent">Instrutores</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Escolha o plano ideal para impulsionar sua carreira e atrair mais alunos qualificados
            </p>
          </div>
        </section>
        
        <PricingSection />
        <FeaturesDetailSection />
        <InstructorFAQ />
      </main>
      <Footer />
    </div>
  );
};

export default InstructorPlans;
