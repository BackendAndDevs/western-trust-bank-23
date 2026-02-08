
import AppHeader from "@/components/AppHeader";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import TrustIndicators from "@/components/TrustIndicators";
import About from "@/components/About";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <Hero />
      <Services />
      <TrustIndicators />
      <About />
      <Footer />
    </div>
  );
};

export default Index;
