import Hero from "../components/Hero";
import Solutions from "../components/Solutions";
import FeatureStrip from "../components/FeatureStrip";
import Brands from "../components/Brands";

export default function Home() {
  return (
    <>
      <div className="hero-block">
        <Hero />
        <Solutions />
        <FeatureStrip />
      </div>
      <Brands />
    </>
  );
}