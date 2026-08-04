"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { gsap } from "gsap";

const AXA_WORDMARK =
	"M216.597 202.461c4.941 13.823 15.122 49.795 19.1695 52.661H209.038a44.571 44.571 0 0 0-1.2545-9.4335c-1.1525-4.1115-10.8205-35.215-10.8205-35.215h-42.456l-6.675 9.463s8.0175 25.0975 8.5155 26.328c.8645 2.217 4.6925 8.8575 4.6925 8.8575h-25.615s-.664-3.833-.913-5.4295c-.2005-1.289-2.427-8.3495-2.427-8.3495s-5.8055 6.362-7.3875 9.3115c-1.597 2.944-2.305 4.4675-2.305 4.4675h-20.039s-.669-3.833-.918-5.4295c-.195-1.289-2.6465-8.916-2.6465-8.916s-5.61 6.8115-7.207 9.7555c-1.587 2.9495-2.2705 4.59-2.2705 4.59H69.627s5.6005-5.332 7.5585-7.622c3.3005-3.882 15.6005-19.956 15.6005-19.956L87.72 210.473H45.586S21.5625 242.041 20.6155 243.017c-.957.962-7.959 11.011-8.1155 12.1045H0v-7.949a5.987 5.987 0 0 1 .493-.4785c.386-.2835 18.213-22.4125 34.59-44.2335 14.717-19.0285 28.5255-37.534 29.7365-39.297 2.9345-4.2625 7.163-13.4665 7.163-13.4665h21.782s.674 8.4665 1.309 10.522c.566 1.8165 13.8375 45.3615 14.15 45.8305l7.339-9.385-12.544-38.6135s-2.9395-7.2655-3.8965-8.354h25.4445a22.166 22.166 0 0 0 .83 6.9185c1.035 3.184 6.4895 22.8665 6.4895 22.8665s17.3535-21.753 18.369-23.3155a14.1 14.1 0 0 0 2.1435-6.4695h21.201s-3.8815 2.8365-10.6835 11.44c-2.285 2.8955-24.673 31.348-24.673 31.348s1.9535 6.66 2.9055 9.9755c.259.952.4395 1.5965.4395 1.665 0 .0295.493-.576 1.3425-1.665 5.7765-7.3195 32.051-41.7725 33.643-44.722 1.284-2.3825 3.1735-5.0925 4.282-8.0415h22.085s.4785 6.1765 1.1085 7.8855Zm-31.475-32.6125c-3.037 6.5335-20.913 28.296-20.913 28.296h28.3105s-5.488-16.8995-6.445-20.708a30.233 30.233 0 0 1-.557-7.4025c0-.3465-.0635-.908-.3955-.1855Zm-108.7745 0c-3.037 6.5335-20.913 28.296-20.913 28.296H83.745s-5.483-16.8995-6.44-20.708a30.233 30.233 0 0 1-.557-7.4025c0-.3465-.068-.908-.4005-.1855Zm42.6225 65.9865 7.793-10.703c-.718-.7715-5.1075-14.082-5.1075-14.082l-7.5345 9.775Z";

const svgLayerStyle = {
	transformBox: "fill-box",
	willChange: "transform, opacity",
};

const panelBaseStyle = {
	position: "absolute",
	background: "var(--loader-background)",
	backfaceVisibility: "hidden",
	willChange: "transform, opacity",
};

export const LOGO_REVEAL_ANIMATION_STYLES = Object.freeze({
	FRAME: "frame",
	CINEMATIC: "cinematic",
	DIRECTIONAL: "directional",
	PRECISION: "precision",
});

const supportedAnimationStyles = new Set(Object.values(LOGO_REVEAL_ANIMATION_STYLES));

function normalizeAnimationStyle(value) {
	return supportedAnimationStyles.has(value) ? value : LOGO_REVEAL_ANIMATION_STYLES.FRAME;
}

function toSeconds(value) {
	const milliseconds = Number(value);

	if (!Number.isFinite(milliseconds) || milliseconds <= 0) {
		return 0;
	}

	return milliseconds / 1000;
}

function enforceMinimumDuration(timeline, minimumDuration) {
	const minimumSeconds = toSeconds(minimumDuration);
	const naturalDuration = timeline.duration();

	if (minimumSeconds <= naturalDuration) {
		return;
	}

	if (naturalDuration > 0) {
		timeline.timeScale(naturalDuration / minimumSeconds);
		return;
	}

	timeline.to({}, { duration: minimumSeconds });
}

function getViewportSize() {
	const visualViewport = window.visualViewport;
	const documentElement = document.documentElement;

	/*
	 * Use the largest reported viewport dimension. This prevents an
	 * undersized reveal on mobile browser chrome, zoomed pages and
	 * environments where visualViewport differs from the layout viewport.
	 */
	return {
		width: Math.max(1, window.innerWidth || 0, documentElement.clientWidth || 0, visualViewport?.width || 0),
		height: Math.max(1, window.innerHeight || 0, documentElement.clientHeight || 0, visualViewport?.height || 0),
	};
}

function resetAnimatedNodes(timeline, nodes, hasLoadingText) {
	const { card, base, switchMark, wordmark, textContainer, text, textRule } = nodes;

	timeline
		.set(card, {
			autoAlpha: 1,
			x: 0,
			y: 0,
			scale: 1,
			scaleX: 1,
			scaleY: 1,
			rotation: 0,
			filter: "blur(0px)",
			transformOrigin: "50% 50%",
		})
		.set(base, {
			autoAlpha: 1,
			x: 0,
			y: 0,
			scale: 1,
			scaleX: 1,
			scaleY: 1,
			rotation: 0,
			transformOrigin: "50% 50%",
		})
		.set(switchMark, {
			autoAlpha: 1,
			x: 0,
			y: 0,
			scale: 1,
			rotation: 0,
			transformOrigin: "50% 50%",
		})
		.set(wordmark, {
			autoAlpha: 1,
			x: 0,
			y: 0,
			scale: 1,
			rotation: 0,
			transformOrigin: "50% 50%",
		});

	if (hasLoadingText && textContainer && text && textRule) {
		timeline
			.set(textContainer, {
				autoAlpha: 1,
				x: 0,
				y: 0,
			})
			.set(text, {
				autoAlpha: 1,
				x: 0,
				y: 0,
				scale: 1,
				rotation: 0,
				filter: "blur(0px)",
				letterSpacing: "0.085em",
			})
			.set(textRule, {
				autoAlpha: 1,
				x: 0,
				y: 0,
				scaleX: 1,
				scaleY: 1,
				transformOrigin: "50% 50%",
			});
	}
}

function setPanelConfiguration(timeline, animationStyle, panels) {
	const { topPanel, bottomPanel, leftPanel, rightPanel } = panels;
	const allPanels = [topPanel, bottomPanel, leftPanel, rightPanel];

	timeline.set(allPanels, {
		autoAlpha: 1,
		x: 0,
		y: 0,
		force3D: true,
	});

	if (animationStyle === LOGO_REVEAL_ANIMATION_STYLES.CINEMATIC || animationStyle === LOGO_REVEAL_ANIMATION_STYLES.DIRECTIONAL) {
		timeline.set([leftPanel, rightPanel], { autoAlpha: 0 });
	}

	if (animationStyle === LOGO_REVEAL_ANIMATION_STYLES.PRECISION) {
		timeline.set([topPanel, bottomPanel], { autoAlpha: 0 });
	}
}

function addFrameEntry(timeline, nodes, motionTime, hasLoadingText) {
	const { card, base, switchMark, wordmark, textContainer, text, textRule } = nodes;

	timeline
		.set(card, {
			autoAlpha: 0,
			scale: 0.78,
			rotation: -2,
		})
		.set(base, {
			scale: 0.95,
			transformOrigin: "50% 50%",
		})
		.set(switchMark, {
			autoAlpha: 0,
			x: 34,
			rotation: 4,
			transformOrigin: "50% 50%",
		})
		.set(wordmark, {
			autoAlpha: 0,
			x: -34,
			scale: 0.96,
			transformOrigin: "50% 50%",
		});

	if (hasLoadingText && textContainer && text && textRule) {
		timeline
			.set(textContainer, { autoAlpha: 1 })
			.set(text, {
				autoAlpha: 0,
				y: 14,
				filter: "blur(1.5px)",
				letterSpacing: "0.125em",
			})
			.set(textRule, {
				autoAlpha: 1,
				scaleX: 0,
				transformOrigin: "0% 50%",
			});
	}

	timeline
		.addLabel("arrival")
		.to(
			card,
			{
				autoAlpha: 1,
				scale: 1,
				rotation: 0,
				duration: motionTime(0.62),
				ease: "expo.out",
			},
			"arrival"
		)
		.to(
			base,
			{
				scale: 1,
				duration: motionTime(0.42),
				ease: "power3.out",
			},
			"arrival+=0.08"
		)
		.to(
			switchMark,
			{
				autoAlpha: 1,
				x: 0,
				rotation: 0,
				duration: motionTime(0.38),
				ease: "power4.out",
			},
			"arrival+=0.2"
		)
		.to(
			wordmark,
			{
				autoAlpha: 1,
				x: 0,
				scale: 1,
				duration: motionTime(0.42),
				ease: "power4.out",
			},
			"arrival+=0.27"
		);

	if (hasLoadingText && text && textRule) {
		timeline
			.to(
				text,
				{
					autoAlpha: 1,
					y: 0,
					filter: "blur(0px)",
					letterSpacing: "0.085em",
					duration: motionTime(0.5),
					ease: "power3.out",
				},
				"arrival+=0.46"
			)
			.to(
				textRule,
				{
					scaleX: 1,
					duration: motionTime(0.44),
					ease: "power3.inOut",
				},
				"arrival+=0.61"
			);
	}
}

function addCinematicEntry(timeline, nodes, motionTime, hasLoadingText) {
	const { card, base, switchMark, wordmark, textContainer, text, textRule } = nodes;

	timeline
		.set(card, {
			autoAlpha: 0,
			scale: 1.12,
			y: 10,
			rotation: 0,
			filter: "blur(4px)",
		})
		.set(base, {
			scale: 1.025,
			transformOrigin: "50% 50%",
		})
		.set(switchMark, {
			autoAlpha: 0,
			x: 16,
			y: -12,
			transformOrigin: "50% 50%",
		})
		.set(wordmark, {
			autoAlpha: 0,
			y: 10,
			scale: 0.985,
			transformOrigin: "50% 50%",
		});

	if (hasLoadingText && textContainer && text && textRule) {
		timeline
			.set(textContainer, { autoAlpha: 1 })
			.set(text, {
				autoAlpha: 0,
				y: 10,
				filter: "blur(2px)",
				letterSpacing: "0.11em",
			})
			.set(textRule, {
				autoAlpha: 1,
				scaleX: 0,
				transformOrigin: "50% 50%",
			});
	}

	timeline
		.addLabel("arrival")
		.to(
			card,
			{
				autoAlpha: 1,
				scale: 1,
				y: 0,
				filter: "blur(0px)",
				duration: motionTime(0.76),
				ease: "expo.out",
			},
			"arrival"
		)
		.to(
			base,
			{
				scale: 1,
				duration: motionTime(0.52),
				ease: "power3.out",
			},
			"arrival+=0.08"
		)
		.to(
			switchMark,
			{
				autoAlpha: 1,
				x: 0,
				y: 0,
				duration: motionTime(0.44),
				ease: "power4.out",
			},
			"arrival+=0.24"
		)
		.to(
			wordmark,
			{
				autoAlpha: 1,
				y: 0,
				scale: 1,
				duration: motionTime(0.48),
				ease: "power4.out",
			},
			"arrival+=0.31"
		);

	if (hasLoadingText && text && textRule) {
		timeline
			.to(
				text,
				{
					autoAlpha: 1,
					y: 0,
					filter: "blur(0px)",
					letterSpacing: "0.085em",
					duration: motionTime(0.46),
					ease: "power3.out",
				},
				"arrival+=0.53"
			)
			.to(
				textRule,
				{
					scaleX: 1,
					duration: motionTime(0.52),
					ease: "power3.inOut",
				},
				"arrival+=0.65"
			);
	}
}

function addDirectionalEntry(timeline, nodes, motionTime, hasLoadingText) {
	const { card, base, switchMark, wordmark, textContainer, text, textRule } = nodes;

	timeline
		.set(card, {
			autoAlpha: 0,
			x: -64,
			scale: 0.96,
			rotation: 0,
		})
		.set(base, {
			scaleX: 0.72,
			transformOrigin: "0% 50%",
		})
		.set(switchMark, {
			autoAlpha: 0,
			x: -20,
			transformOrigin: "50% 50%",
		})
		.set(wordmark, {
			autoAlpha: 0,
			x: -24,
			transformOrigin: "50% 50%",
		});

	if (hasLoadingText && textContainer && text && textRule) {
		timeline
			.set(textContainer, { autoAlpha: 1 })
			.set(text, {
				autoAlpha: 0,
				x: -18,
				letterSpacing: "0.115em",
			})
			.set(textRule, {
				autoAlpha: 1,
				scaleX: 0,
				transformOrigin: "0% 50%",
			});
	}

	timeline
		.addLabel("arrival")
		.to(
			card,
			{
				autoAlpha: 1,
				x: 0,
				scale: 1,
				duration: motionTime(0.68),
				ease: "expo.out",
			},
			"arrival"
		)
		.to(
			base,
			{
				scaleX: 1,
				duration: motionTime(0.54),
				ease: "power4.out",
			},
			"arrival+=0.06"
		)
		.to(
			switchMark,
			{
				autoAlpha: 1,
				x: 0,
				duration: motionTime(0.36),
				ease: "power4.out",
			},
			"arrival+=0.22"
		)
		.to(
			wordmark,
			{
				autoAlpha: 1,
				x: 0,
				duration: motionTime(0.4),
				ease: "power4.out",
			},
			"arrival+=0.28"
		);

	if (hasLoadingText && text && textRule) {
		timeline
			.to(
				text,
				{
					autoAlpha: 1,
					x: 0,
					letterSpacing: "0.085em",
					duration: motionTime(0.44),
					ease: "power3.out",
				},
				"arrival+=0.47"
			)
			.to(
				textRule,
				{
					scaleX: 1,
					duration: motionTime(0.46),
					ease: "power3.inOut",
				},
				"arrival+=0.57"
			);
	}
}

function addPrecisionEntry(timeline, nodes, motionTime, hasLoadingText) {
	const { card, base, switchMark, wordmark, textContainer, text, textRule } = nodes;

	timeline
		.set(card, {
			autoAlpha: 1,
			scaleX: 0.055,
			scaleY: 0.055,
			rotation: 0,
			transformOrigin: "50% 50%",
		})
		.set(base, {
			scale: 1,
			transformOrigin: "50% 50%",
		})
		.set(switchMark, {
			autoAlpha: 0,
			y: -18,
			transformOrigin: "50% 50%",
		})
		.set(wordmark, {
			autoAlpha: 0,
			y: 12,
			transformOrigin: "50% 50%",
		});

	if (hasLoadingText && textContainer && text && textRule) {
		timeline
			.set(textContainer, { autoAlpha: 1 })
			.set(text, {
				autoAlpha: 0,
				y: 8,
				letterSpacing: "0.13em",
			})
			.set(textRule, {
				autoAlpha: 1,
				scaleX: 0,
				transformOrigin: "50% 50%",
			});
	}

	timeline
		.addLabel("arrival")
		.to(
			card,
			{
				scaleX: 1,
				duration: motionTime(0.32),
				ease: "expo.out",
			},
			"arrival"
		)
		.to(
			card,
			{
				scaleY: 1,
				duration: motionTime(0.46),
				ease: "power4.inOut",
			},
			"arrival+=0.18"
		)
		.to(
			switchMark,
			{
				autoAlpha: 1,
				y: 0,
				duration: motionTime(0.38),
				ease: "power4.out",
			},
			"arrival+=0.36"
		)
		.to(
			wordmark,
			{
				autoAlpha: 1,
				y: 0,
				duration: motionTime(0.42),
				ease: "power4.out",
			},
			"arrival+=0.43"
		);

	if (hasLoadingText && text && textRule) {
		timeline
			.to(
				text,
				{
					autoAlpha: 1,
					y: 0,
					letterSpacing: "0.085em",
					duration: motionTime(0.42),
					ease: "power3.out",
				},
				"arrival+=0.58"
			)
			.to(
				textRule,
				{
					scaleX: 1,
					duration: motionTime(0.38),
					ease: "power3.inOut",
				},
				"arrival+=0.69"
			);
	}
}

function addEntryAnimation(timeline, animationStyle, nodes, motionTime, hasLoadingText) {
	switch (animationStyle) {
		case LOGO_REVEAL_ANIMATION_STYLES.CINEMATIC:
			addCinematicEntry(timeline, nodes, motionTime, hasLoadingText);
			break;
		case LOGO_REVEAL_ANIMATION_STYLES.DIRECTIONAL:
			addDirectionalEntry(timeline, nodes, motionTime, hasLoadingText);
			break;
		case LOGO_REVEAL_ANIMATION_STYLES.PRECISION:
			addPrecisionEntry(timeline, nodes, motionTime, hasLoadingText);
			break;
		case LOGO_REVEAL_ANIMATION_STYLES.FRAME:
		default:
			addFrameEntry(timeline, nodes, motionTime, hasLoadingText);
	}
}

function addFrameExit(timeline, nodes, panels, metrics, motionTime, hasLoadingText) {
	const { card, switchMark, wordmark, text, textRule } = nodes;
	const { topPanel, bottomPanel, leftPanel, rightPanel } = panels;
	const { frameHorizontalTravel, frameVerticalTravel } = metrics;

	timeline.addLabel("exit");

	if (hasLoadingText && text && textRule) {
		timeline
			.set(textRule, { transformOrigin: "100% 50%" })
			.to(textRule, { scaleX: 0, duration: motionTime(0.2), ease: "power2.in" }, "exit")
			.to(
				text,
				{
					autoAlpha: 0,
					y: -12,
					filter: "blur(1.5px)",
					letterSpacing: "0.105em",
					duration: motionTime(0.28),
					ease: "power2.in",
				},
				"exit+=0.03"
			);
	}

	timeline
		.to(wordmark, { autoAlpha: 0, x: -38, duration: motionTime(0.28), ease: "power2.in" }, "exit+=0.09")
		.to(switchMark, { autoAlpha: 0, x: 38, duration: motionTime(0.28), ease: "power2.in" }, "exit+=0.09")
		.addLabel("collapse", ">-0.02")
		.to(
			card,
			{
				autoAlpha: 0,
				scale: 0.12,
				rotation: 1.5,
				duration: motionTime(0.34),
				ease: "power3.in",
			},
			"collapse"
		)
		.addLabel("reveal", ">")
		.to(topPanel, { y: -frameVerticalTravel, duration: motionTime(0.95), ease: "power3.inOut" }, "reveal")
		.to(bottomPanel, { y: frameVerticalTravel, duration: motionTime(0.95), ease: "power3.inOut" }, "reveal")
		.to(leftPanel, { x: -frameHorizontalTravel, duration: motionTime(0.95), ease: "power3.inOut" }, "reveal")
		.to(rightPanel, { x: frameHorizontalTravel, duration: motionTime(0.95), ease: "power3.inOut" }, "reveal");
}

function addCinematicExit(timeline, nodes, panels, metrics, motionTime, hasLoadingText) {
	const { card, switchMark, wordmark, text, textRule } = nodes;
	const { topPanel, bottomPanel } = panels;
	const { cinematicVerticalTravel } = metrics;

	timeline.addLabel("exit");

	if (hasLoadingText && text && textRule) {
		timeline
			.set(textRule, { transformOrigin: "50% 50%" })
			.to(textRule, { scaleX: 0, duration: motionTime(0.24), ease: "power2.inOut" }, "exit")
			.to(
				text,
				{
					autoAlpha: 0,
					y: -8,
					filter: "blur(1.5px)",
					duration: motionTime(0.28),
					ease: "power2.in",
				},
				"exit+=0.02"
			);
	}

	timeline
		.to([wordmark, switchMark], { autoAlpha: 0, y: -5, duration: motionTime(0.28), ease: "power2.in" }, "exit+=0.08")
		.to(
			card,
			{
				autoAlpha: 0,
				scale: 0.9,
				y: -6,
				filter: "blur(3px)",
				duration: motionTime(0.38),
				ease: "power3.in",
			},
			"exit+=0.13"
		)
		.addLabel("reveal", ">-0.01")
		.to(topPanel, { y: -cinematicVerticalTravel, duration: motionTime(0.92), ease: "power4.inOut" }, "reveal")
		.to(bottomPanel, { y: cinematicVerticalTravel, duration: motionTime(0.92), ease: "power4.inOut" }, "reveal");
}

function addDirectionalExit(timeline, nodes, panels, metrics, motionTime, hasLoadingText) {
	const { card, switchMark, wordmark, text, textRule } = nodes;
	const { topPanel, bottomPanel } = panels;
	const { directionalTravel } = metrics;

	timeline.addLabel("exit");

	if (hasLoadingText && text && textRule) {
		timeline
			.set(textRule, { transformOrigin: "100% 50%" })
			.to(textRule, { scaleX: 0, duration: motionTime(0.18), ease: "power2.in" }, "exit")
			.to(
				text,
				{
					autoAlpha: 0,
					x: 20,
					duration: motionTime(0.24),
					ease: "power2.in",
				},
				"exit+=0.02"
			);
	}

	timeline
		.to([wordmark, switchMark], { autoAlpha: 0, x: 28, duration: motionTime(0.26), ease: "power2.in" }, "exit+=0.06")
		.to(
			card,
			{
				autoAlpha: 0,
				x: 46,
				scale: 0.95,
				duration: motionTime(0.34),
				ease: "power3.in",
			},
			"exit+=0.1"
		)
		.addLabel("reveal", ">-0.01")
		.to(topPanel, { x: directionalTravel, duration: motionTime(0.9), ease: "power4.inOut" }, "reveal")
		.to(bottomPanel, { x: directionalTravel, duration: motionTime(0.9), ease: "power4.inOut" }, "reveal+=0.055");
}

function addPrecisionExit(timeline, nodes, panels, metrics, motionTime, hasLoadingText) {
	const { card, switchMark, wordmark, text, textRule } = nodes;
	const { leftPanel, rightPanel } = panels;
	const { precisionHorizontalTravel } = metrics;

	timeline.addLabel("exit");

	if (hasLoadingText && text && textRule) {
		timeline
			.set(textRule, { transformOrigin: "50% 50%" })
			.to(textRule, { scaleX: 0, duration: motionTime(0.18), ease: "power2.inOut" }, "exit")
			.to(
				text,
				{
					autoAlpha: 0,
					y: -7,
					letterSpacing: "0.11em",
					duration: motionTime(0.24),
					ease: "power2.in",
				},
				"exit+=0.02"
			);
	}

	timeline
		.to([wordmark, switchMark], { autoAlpha: 0, duration: motionTime(0.22), ease: "power2.in" }, "exit+=0.04")
		.to(
			card,
			{
				scaleY: 0.045,
				duration: motionTime(0.28),
				ease: "power3.inOut",
			},
			"exit+=0.08"
		)
		.to(
			card,
			{
				autoAlpha: 0,
				scaleX: 0,
				duration: motionTime(0.22),
				ease: "power3.in",
			},
			">-0.01"
		)
		.addLabel("reveal", ">")
		.to(leftPanel, { x: -precisionHorizontalTravel, duration: motionTime(0.84), ease: "expo.inOut" }, "reveal")
		.to(rightPanel, { x: precisionHorizontalTravel, duration: motionTime(0.84), ease: "expo.inOut" }, "reveal");
}

function addExitAnimation(timeline, animationStyle, nodes, panels, metrics, motionTime, hasLoadingText) {
	switch (animationStyle) {
		case LOGO_REVEAL_ANIMATION_STYLES.CINEMATIC:
			addCinematicExit(timeline, nodes, panels, metrics, motionTime, hasLoadingText);
			break;
		case LOGO_REVEAL_ANIMATION_STYLES.DIRECTIONAL:
			addDirectionalExit(timeline, nodes, panels, metrics, motionTime, hasLoadingText);
			break;
		case LOGO_REVEAL_ANIMATION_STYLES.PRECISION:
			addPrecisionExit(timeline, nodes, panels, metrics, motionTime, hasLoadingText);
			break;
		case LOGO_REVEAL_ANIMATION_STYLES.FRAME:
		default:
			addFrameExit(timeline, nodes, panels, metrics, motionTime, hasLoadingText);
	}
}

export default function LogoRevealLoader({
	isVisible = true,
	onExitComplete,
	backgroundColor = "#f4f2ed",
	panelColor = "#00008f",
	loadingText = "",
	textColor,
	minimumEntryDuration = 0,
	minimumExitDuration = 0,
	animationStyle = LOGO_REVEAL_ANIMATION_STYLES.FRAME,
}) {
	const [portalReady, setPortalReady] = useState(false);
	const [rendered, setRendered] = useState(isVisible);
	const [animationCycle, setAnimationCycle] = useState(0);

	const overlayRef = useRef(null);
	const topPanelRef = useRef(null);
	const bottomPanelRef = useRef(null);
	const leftPanelRef = useRef(null);
	const rightPanelRef = useRef(null);
	const cardRef = useRef(null);
	const baseRef = useRef(null);
	const switchRef = useRef(null);
	const wordmarkRef = useRef(null);
	const textContainerRef = useRef(null);
	const textRef = useRef(null);
	const textRuleRef = useRef(null);

	const exitCompleteRef = useRef(onExitComplete);
	const entryTimelineRef = useRef(null);
	const exitTimelineRef = useRef(null);
	const startExitRef = useRef(null);
	const entryCompleteRef = useRef(false);
	const exitRequestedRef = useRef(!isVisible);
	const isExitingRef = useRef(false);

	const hasLoadingText = typeof loadingText === "string" && loadingText.trim().length > 0;
	const resolvedTextColor = textColor ?? panelColor;
	const resolvedAnimationStyle = normalizeAnimationStyle(animationStyle);

	useEffect(() => {
		setPortalReady(true);
	}, []);

	useEffect(() => {
		exitCompleteRef.current = onExitComplete;
	}, [onExitComplete]);

	/*
	 * Prevent background scrolling without changing html/body overflow.
	 * The application keeps its exact width and scrollbar geometry.
	 */
	useEffect(() => {
		if (!portalReady || !rendered) {
			return undefined;
		}

		const preventScroll = (event) => event.preventDefault();
		const preventScrollKeys = (event) => {
			if (["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " "].includes(event.key)) {
				event.preventDefault();
			}
		};

		window.addEventListener("wheel", preventScroll, { passive: false });
		window.addEventListener("touchmove", preventScroll, { passive: false });
		window.addEventListener("keydown", preventScrollKeys);

		return () => {
			window.removeEventListener("wheel", preventScroll);
			window.removeEventListener("touchmove", preventScroll);
			window.removeEventListener("keydown", preventScrollKeys);
		};
	}, [portalReady, rendered]);

	const startExitAnimation = useCallback(() => {
		if (!portalReady || !rendered || isExitingRef.current) {
			return;
		}

		const overlay = overlayRef.current;
		const panels = {
			topPanel: topPanelRef.current,
			bottomPanel: bottomPanelRef.current,
			leftPanel: leftPanelRef.current,
			rightPanel: rightPanelRef.current,
		};
		const nodes = {
			card: cardRef.current,
			base: baseRef.current,
			switchMark: switchRef.current,
			wordmark: wordmarkRef.current,
			textContainer: textContainerRef.current,
			text: textRef.current,
			textRule: textRuleRef.current,
		};

		if (!overlay || !panels.topPanel || !panels.bottomPanel || !panels.leftPanel || !panels.rightPanel || !nodes.card || !nodes.switchMark || !nodes.wordmark) {
			return;
		}

		isExitingRef.current = true;
		entryTimelineRef.current?.kill();
		entryTimelineRef.current = null;

		const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
		const motionTime = (seconds) => (reducedMotion ? 0 : seconds);
		const { width: viewportWidth, height: viewportHeight } = getViewportSize();
		const revealRatio = 16 / 9;
		const viewportRatio = viewportWidth / viewportHeight;

		let frameWidth;
		let frameHeight;

		if (viewportRatio >= revealRatio) {
			frameWidth = viewportWidth;
			frameHeight = frameWidth / revealRatio;
		} else {
			frameHeight = viewportHeight;
			frameWidth = frameHeight * revealRatio;
		}

		frameWidth *= 1.08;
		frameHeight *= 1.08;

		const metrics = {
			frameHorizontalTravel: frameWidth / 2 + 10,
			frameVerticalTravel: frameHeight / 2 + 10,
			cinematicVerticalTravel: viewportHeight / 2 + 32,
			directionalTravel: viewportWidth + 48,
			precisionHorizontalTravel: viewportWidth / 2 + 32,
		};

		const timeline = gsap.timeline({
			paused: true,
			defaults: { overwrite: "auto" },
			onComplete: () => {
				isExitingRef.current = false;
				exitTimelineRef.current = null;
				setRendered(false);
				exitCompleteRef.current?.();
			},
		});

		exitTimelineRef.current = timeline;

		timeline.set(overlay, { autoAlpha: 1 });
		setPanelConfiguration(timeline, resolvedAnimationStyle, panels);
		addExitAnimation(timeline, resolvedAnimationStyle, nodes, panels, metrics, motionTime, hasLoadingText);

		enforceMinimumDuration(timeline, minimumExitDuration);
		timeline.play(0);
	}, [hasLoadingText, minimumExitDuration, portalReady, rendered, resolvedAnimationStyle]);

	useEffect(() => {
		startExitRef.current = startExitAnimation;
	}, [startExitAnimation]);

	useEffect(() => {
		if (isVisible) {
			exitRequestedRef.current = false;

			if (isExitingRef.current) {
				exitTimelineRef.current?.kill();
				exitTimelineRef.current = null;
				isExitingRef.current = false;
				setAnimationCycle((cycle) => cycle + 1);
			}

			setRendered(true);
			return;
		}

		exitRequestedRef.current = true;

		if (rendered && entryCompleteRef.current) {
			startExitAnimation();
		}
	}, [isVisible, rendered, startExitAnimation]);

	useLayoutEffect(() => {
		if (!portalReady || !rendered || isExitingRef.current) {
			return undefined;
		}

		const overlay = overlayRef.current;
		const panels = {
			topPanel: topPanelRef.current,
			bottomPanel: bottomPanelRef.current,
			leftPanel: leftPanelRef.current,
			rightPanel: rightPanelRef.current,
		};
		const nodes = {
			card: cardRef.current,
			base: baseRef.current,
			switchMark: switchRef.current,
			wordmark: wordmarkRef.current,
			textContainer: textContainerRef.current,
			text: textRef.current,
			textRule: textRuleRef.current,
		};

		if (!overlay || !panels.topPanel || !panels.bottomPanel || !panels.leftPanel || !panels.rightPanel || !nodes.card || !nodes.base || !nodes.switchMark || !nodes.wordmark) {
			return undefined;
		}

		entryTimelineRef.current?.kill();
		entryCompleteRef.current = false;

		const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
		const motionTime = (seconds) => (reducedMotion ? 0 : seconds);

		const timeline = gsap.timeline({
			paused: true,
			defaults: { overwrite: "auto" },
			onComplete: () => {
				entryCompleteRef.current = true;
				entryTimelineRef.current = null;

				if (exitRequestedRef.current) {
					startExitRef.current?.();
				}
			},
		});

		entryTimelineRef.current = timeline;

		timeline.set(overlay, { autoAlpha: 1 });
		setPanelConfiguration(timeline, resolvedAnimationStyle, panels);
		resetAnimatedNodes(timeline, nodes, hasLoadingText);
		addEntryAnimation(timeline, resolvedAnimationStyle, nodes, motionTime, hasLoadingText);

		enforceMinimumDuration(timeline, minimumEntryDuration);
		timeline.play(0);

		return () => {
			if (entryTimelineRef.current === timeline) {
				timeline.kill();
				entryTimelineRef.current = null;
			}
		};
	}, [animationCycle, hasLoadingText, loadingText, minimumEntryDuration, portalReady, rendered, resolvedAnimationStyle]);

	useEffect(() => {
		return () => {
			entryTimelineRef.current?.kill();
			exitTimelineRef.current?.kill();
		};
	}, []);

	if (!portalReady || !rendered) {
		return null;
	}

	return createPortal(
		<div
			ref={overlayRef}
			aria-hidden="true"
			data-animation-style={resolvedAnimationStyle}
			style={{
				"--loader-background": backgroundColor,
				position: "fixed",
				inset: 0,
				zIndex: 2147483647,
				display: "block",
				overflow: "hidden",
				overscrollBehavior: "none",
				pointerEvents: "auto",
				margin: 0,
				padding: 0,
				border: 0,
				contain: "strict",
				isolation: "isolate",
			}}>
			<div
				ref={topPanelRef}
				style={{
					...panelBaseStyle,
					zIndex: 1,
					top: -2,
					left: -2,
					right: -2,
					height: "calc(50% + 4px)",
				}}
			/>

			<div
				ref={bottomPanelRef}
				style={{
					...panelBaseStyle,
					zIndex: 1,
					right: -2,
					bottom: -2,
					left: -2,
					height: "calc(50% + 4px)",
				}}
			/>

			<div
				ref={leftPanelRef}
				style={{
					...panelBaseStyle,
					zIndex: 1,
					top: -2,
					bottom: -2,
					left: -2,
					width: "calc(50% + 4px)",
				}}
			/>

			<div
				ref={rightPanelRef}
				style={{
					...panelBaseStyle,
					zIndex: 1,
					top: -2,
					right: -2,
					bottom: -2,
					width: "calc(50% + 4px)",
				}}
			/>

			<div
				ref={cardRef}
				style={{
					position: "absolute",
					zIndex: 2,
					top: "50%",
					left: "50%",
					display: "grid",
					width: "clamp(92px, 10vw, 136px)",
					aspectRatio: "1",
					placeItems: "center",
					overflow: "hidden",
					boxShadow: "0 0 0 1px rgb(255 255 255 / 8%), 0 24px 60px rgb(0 0 43 / 26%)",
					transform: "translate(-50%, -50%)",
					transformOrigin: "center",
					willChange: "transform, opacity, filter",
				}}>
				<svg
					viewBox="0 0 283.464 283.464"
					focusable="false"
					role="presentation"
					style={{
						display: "block",
						width: "100%",
						height: "100%",
						overflow: "visible",
					}}>
					<rect ref={baseRef} width="283.464" height="283.464" fill={panelColor} style={svgLayerStyle} />
					<polygon ref={switchRef} points="159.38,139.99 175.659,139.99 283.467,0 267.544,0" fill="#ff1721" style={svgLayerStyle} />
					<path ref={wordmarkRef} fill="#fff" d={AXA_WORDMARK} style={svgLayerStyle} />
				</svg>
			</div>

			{hasLoadingText && (
				<div
					ref={textContainerRef}
					style={{
						position: "absolute",
						zIndex: 2,
						top: "calc(50% + clamp(92px, 10vw, 136px) / 2 + 28px)",
						left: "50%",
						width: "min(82vw, 520px)",
						color: resolvedTextColor,
						textAlign: "center",
						transform: "translateX(-50%)",
					}}>
					<div style={{ overflow: "hidden", paddingBlock: 4 }}>
						<div
							ref={textRef}
							style={{
								fontFamily: "inherit",
								fontSize: "clamp(0.72rem, 1.05vw, 0.86rem)",
								fontWeight: 600,
								lineHeight: 1.5,
								letterSpacing: "0.085em",
								textTransform: "uppercase",
								WebkitFontSmoothing: "antialiased",
								willChange: "transform, opacity, filter, letter-spacing",
							}}>
							{loadingText}
						</div>
					</div>

					<div style={{ display: "flex", justifyContent: "center", marginTop: 11 }}>
						<div
							ref={textRuleRef}
							style={{
								width: "clamp(42px, 5vw, 68px)",
								height: 1,
								backgroundColor: resolvedTextColor,
								opacity: 0.42,
								willChange: "transform",
							}}
						/>
					</div>
				</div>
			)}
		</div>,
		document.body
	);
}
