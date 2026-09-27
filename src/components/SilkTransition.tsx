import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from '../context/ThemeContext';

export const SilkTransition: React.FC = () => {
  const { isTransitioning, transitionData } = useTheme();

  if (!isTransitioning || !transitionData) return null;

  const { origin, targetTheme } = transitionData;
  const isTargetDark = targetTheme === 'dark';

  return (
    <div
      className="fixed inset-0 pointer-events-none z-[99999] overflow-hidden"
      aria-hidden="true"
    >
      {/* 
        Silk Wave 1: Leading Specular Sheen (Soft Mint / Lime Light Fold)
        Simulates the luminous crest of the silk fabric folding across the viewport
      */}
      <motion.div
        initial={{
          clipPath: `circle(0px at ${origin.x}px ${origin.y}px)`,
          opacity: 0.95,
        }}
        animate={{
          clipPath: `circle(170vmax at ${origin.x}px ${origin.y}px)`,
          opacity: [0.95, 1, 1, 0],
        }}
        transition={{
          duration: 0.82,
          times: [0, 0.45, 0.7, 1],
          ease: [0.22, 1, 0.36, 1],
        }}
        className="absolute inset-0"
        style={{
          background: isTargetDark
            ? `radial-gradient(circle at ${origin.x}px ${origin.y}px, #10251E 0%, #0D201A 40%, #08110F 85%)`
            : `radial-gradient(circle at ${origin.x}px ${origin.y}px, #FFFFFF 0%, #FAF8F2 45%, #F7F6F0 90%)`,
        }}
      />

      {/* 
        Silk Wave 2: Liquid Fabric Fold Ripples (Soft Mint & Deep Forest Highlighting)
        Creates the distinctive multi-crease organic ripples of luxurious drapery
      */}
      <motion.div
        initial={{
          clipPath: `circle(0px at ${origin.x}px ${origin.y}px)`,
          opacity: 0.75,
        }}
        animate={{
          clipPath: `circle(150vmax at ${origin.x}px ${origin.y}px)`,
          opacity: [0.75, 0.9, 0.6, 0],
        }}
        transition={{
          duration: 0.78,
          delay: 0.04,
          times: [0, 0.4, 0.75, 1],
          ease: [0.25, 1, 0.4, 1],
        }}
        className="absolute inset-0 backdrop-blur-[1.5px]"
        style={{
          background: isTargetDark
            ? 'linear-gradient(135deg, rgba(184, 243, 107, 0.12) 0%, rgba(16, 37, 30, 0.85) 30%, rgba(8, 17, 15, 0.98) 100%)'
            : 'linear-gradient(135deg, rgba(232, 245, 216, 0.45) 0%, rgba(255, 255, 255, 0.85) 35%, rgba(247, 246, 240, 0.98) 100%)',
        }}
      />

      {/* 
        Silk Wave 3: Fine Specular Edge (Hairline wave crest)
      */}
      <motion.div
        initial={{
          clipPath: `circle(0px at ${origin.x}px ${origin.y}px)`,
          opacity: 1,
        }}
        animate={{
          clipPath: `circle(140vmax at ${origin.x}px ${origin.y}px)`,
          opacity: [1, 0.8, 0],
        }}
        transition={{
          duration: 0.72,
          times: [0, 0.5, 1],
          ease: [0.16, 1, 0.3, 1],
        }}
        className="absolute inset-0"
        style={{
          boxShadow: isTargetDark
            ? 'inset 0 0 80px rgba(184, 243, 107, 0.15)'
            : 'inset 0 0 80px rgba(184, 243, 107, 0.25)',
        }}
      />
    </div>
  );
};
