import Hero from "./Hero";
import FeatureSection from "./FeatureSection";
import AboutSection from "./AboutSection";
import FeedbackSection from "./FeedbackSection";
import "./Landing.css";

export default function Landing() {
  return (
    <div className="landing">
      <Hero />
      <FeatureSection />
      <AboutSection />
      <FeedbackSection />
    </div>
  );
}
