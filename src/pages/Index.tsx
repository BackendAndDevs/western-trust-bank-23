
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import TrustIndicators from "@/components/TrustIndicators";
import About from "@/components/About";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Hero />
      <Services />
      <TrustIndicators />
      <About />
      <Footer />
    </div>
  );
};

export default Index;
