"use client";

import { useEffect, useState } from "react";
import "./LogoRevealLoader.css";

/**
 * Full-screen logo intro that reveals the website rendered behind it.
 */
export default function LogoRevealLoader({
  children,
  logoSrc = "/logo.svg",
  backgroundColor = "#f4f2ed",
  panelColor = "#476960",
  duration = 3200,
}) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!visible) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [visible]);

  function finishIntro(event) {
    // animationend bubbles from children, so only react to the animation
    // attached to the main intro container.
    if (
      event.target === event.currentTarget &&
      event.animationName === "introExit"
    ) {
      setVisible(false);
    }
  }

  const introStyle = {
    "--intro-background": backgroundColor,
    "--intro-panel": panelColor,
    "--intro-duration": `${duration}ms`,
  };

  return (
    <div className="logo-reveal-root" aria-busy={visible}>
      <div
        className={
          visible
            ? "site-content site-content--loading"
            : "site-content site-content--ready"
        }
      >
        {children}
      </div>

      {visible && (
        <div
          className="logo-intro"
          style={introStyle}
          aria-hidden="true"
          onAnimationEnd={finishIntro}
        >
          <div className="logo-intro__reveal" />

          <div className="logo-intro__card">
            <img
              className="logo-intro__mark"
              src={logoSrc}
              alt=""
              draggable="false"
            />
          </div>
        </div>
      )}
    </div>
  );
}
