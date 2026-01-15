import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import StudentFeaturesSection from '@/components/StudentFeaturesSection';
import InstructorsSection from '@/components/InstructorsSection';
import FeaturesSection from '@/components/FeaturesSection';
import CTASection from '@/components/CTASection';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <InstructorsSection />
        <StudentFeaturesSection />
        <FeaturesSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
