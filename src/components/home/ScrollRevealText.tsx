"use client";

import React from "react";
import { motion, Variants } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";

interface ScrollRevealTextProps {
  text: string;
  className?: string;
  as?: React.ElementType;
  delayOffset?: number;
  useOrange?: boolean;
}

/**
 * ScrollRevealText
 * Animates text word-by-word when it enters the viewport.
 * Each word flashes UIUPC Orange for 200ms before settling to its final color.
 */
const ScrollRevealText: React.FC<ScrollRevealTextProps> = ({
  text,
  className = "",
  as: Tag = "h2",
  delayOffset = 0,
  useOrange = false,
}) => {
  const words = text.split(" ");
  const { theme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [hasAnimated, setHasAnimated] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Use hex values for reliability in Framer Motion animations
  const finalThemeColor = theme === "dark" ? "#FFFFFF" : "#1A1A1A";
  const finalColor = useOrange ? "#f58920" : finalThemeColor;

  if (!mounted) {
    return (
      <Tag className={`${className} opacity-0`}>
        {text}
      </Tag>
    );
  }

  // Once the sequence has fully completed, swap to a purely functional DOM node.
  // This ensures changing the theme later instantly toggles color WITHOUT re-playing the intro!
  if (hasAnimated) {
    return (
      <Tag className={`${className} inline-flex flex-wrap`} style={{ color: finalColor }}>
        {words.map((word, i) => (
          <span key={i} className="inline-block mr-[0.3em] whitespace-nowrap">
            {word}
          </span>
        ))}
      </Tag>
    );
  }

  const wordVariants: Variants = {
    hidden: { opacity: 0 },
    visible: (i: number) => {
      const revealDelay = i * 0.12 + (i % 3) * 0.05 + delayOffset;
      return {
        opacity: 1,
        color: ["#FFF176", "#EF6C00", "#f58920", finalColor, finalColor],
        transition: {
          opacity: { duration: 0.15, delay: revealDelay },
          color: { 
            duration: 0.8, 
            times: [0, 0.15, 0.4, 0.65, 0.67, 1], 
            delay: revealDelay,
            ease: "linear"
          },
        },
      };
    },
  };

  return (
    <Tag className={`${className} inline-flex flex-wrap`}>
      {words.map((word, i) => (
        <motion.span
          // Removed 'theme' from the key to prevent re-mounting on theme switch
          key={`${i}-${mounted}`}
          custom={i}
          variants={wordVariants}
          initial="hidden"
          whileInView="visible"
          animate={{ color: finalColor }}
          transition={{ duration: 0.3 }}
          viewport={{ once: true, margin: "20%" }}
          onAnimationComplete={(def) => {
            // Once the absolutely final word finishes its "visible" sequence, lock it
            if (def === "visible" && i === words.length - 1) {
              setHasAnimated(true);
            }
          }}
          className="inline-block mr-[0.3em] whitespace-nowrap"
        >
          {word}
        </motion.span>
      ))}
    </Tag>
  );
};

export default React.memo(ScrollRevealText);
