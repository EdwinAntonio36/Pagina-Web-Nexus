import HomeCarousel from "../components/HomeCarousel";
import Solutions from "../components/Solutions";
import FeatureStrip from "../components/FeatureStrip";

export default function Home() {
  return (
    <>
      <div className="hero-block">
        <HomeCarousel />
        <Solutions />
        <FeatureStrip />
      </div>
    </>
  );
}
