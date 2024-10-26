import Hero from "@/components/hero-home";
import BusinessCategories from "@/components/business-categories";
import FeaturesPlanet from "@/components/features-planet";
import Header from "@/components/ui/header";
export default function Home() {
  return (
    <>
      <Header />
      <Hero />
      <div className="hidden sm:block" >
      <BusinessCategories />
      </div>

      <FeaturesPlanet />
    </>
  );
}
