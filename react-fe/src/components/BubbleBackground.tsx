import type { Engine } from "tsparticles-engine";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";
import { useCallback } from "react";
import { useTheme } from "@mui/material";

export default function BubbleBackground() {
  const theme = useTheme();
  const particlesInit = useCallback(async (engine: Engine) => {
    await loadFull(engine);
  }, []);

  // Use white background instead of semi-transparent theme color
  const backgroundColor = "#ffffff";

  // Keep particles using the theme color
  const particleColor = theme.palette.primary.main;

  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      options={{
        fullScreen: { enable: true, zIndex: -1 },
        background: { color: { value: backgroundColor } },
        particles: {
          number: { value: 60, density: { enable: true, area: 800 } },
          shape: { type: "circle" },
          opacity: { value: 0.4, random: true },
          size: { value: 10, random: true },
          move: { enable: true, speed: 1, direction: "top", outMode: "out" },
          color: { value: particleColor },
        },
      }}
    />
  );
}