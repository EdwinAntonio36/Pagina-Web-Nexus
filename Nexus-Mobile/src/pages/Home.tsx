import HomeCarousel from "../components/HomeCarousel";
import Solutions from "../components/Solutions";
import "./Home.css";

export default function Home() {
  return (
    <>
      <div className="hero-block home-viewport">
        <HomeCarousel />
        <Solutions />
      </div>
    </>
  );
}
