import type { Engine } from "tsparticles-engine";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";
import { useCallback } from "react";

export default function BubbleBackground() {
  const particlesInit = useCallback(async (engine: Engine) => {
    await loadFull(engine);
  }, []);

  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      options={{
        fullScreen: { enable: true, zIndex: -1 },
        background: { color: { value: "#f0f8ff" } }, // Changed to a light blue color
        particles: {
          number: { value: 60, density: { enable: true, area: 800 } },
          shape: { type: "circle" },
          opacity: { value: 0.6, random: true }, // Increased opacity
          size: { value: 10, random: true },
          move: { enable: true, speed: 1, direction: "top", outMode: "out" },
          color: { value: "#87CEEB" }, // Added light blue color for particles
        },
      }}
    />
  );
}