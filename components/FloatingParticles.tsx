"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";

interface Particle {
  id: number;
  initialX: number;
  animateX: number;
  duration: number;
  delay: number;
}

export function FloatingParticles() {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Generate particles only on client side to avoid hydration mismatch
    const generateParticles = (): Particle[] => {
      return Array.from({ length: 20 }, (_, i) => ({
        id: i,
        initialX: Math.random() * 1920,
        animateX: Math.random() * 1920,
        duration: Math.random() * 10 + 10,
        delay: Math.random() * 5,
      }));
    };

    setParticles(generateParticles());
    setMounted(true);
  }, []);

  if (!mounted) {
    return null; // Don't render anything during SSR
  }

  return (
    <div className="absolute inset-0 overflow-hidden">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute w-2 h-2 bg-yellow-300 rounded-full opacity-60"
          initial={{
            x: particle.initialX,
            y: 1090,
          }}
          animate={{
            y: -10,
            x: particle.animateX,
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            ease: "linear",
            delay: particle.delay,
          }}
        />
      ))}
    </div>
  );
}
