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
        background: { color: { value: "#fff5f5" } }, // Light pink background
        particles: {
          number: { value: 60, density: { enable: true, area: 800 } },
          shape: { type: "circle" },
          opacity: { value: 0.4, random: true },
          size: { value: 10, random: true },
          move: { enable: true, speed: 1, direction: "top", outMode: "out" },
          color: { value: "#ffb6c1" }, // Light pink particles
        },
      }}
    />
  );
}