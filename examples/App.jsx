import { useEffect, useState } from "react";
import LogoRevealLoader from "../src/Logo";

export default function App() {
	const requestedStyle = new URLSearchParams(window.location.search).get("style");
	const animationStyles = ["frame", "cinematic", "directional", "precision"];
	const activeStyle = animationStyles.includes(requestedStyle) ? requestedStyle : "frame";
	const [appIsLoading, setAppIsLoading] = useState(true);

	useEffect(() => {
		const exitTimer = window.setTimeout(() => setAppIsLoading(false), 2600);

		return () => {
			window.clearTimeout(exitTimer);
		};
	}, []);

	return (
		<>
			<LogoRevealLoader
				key={activeStyle}
				isVisible={appIsLoading}
				loadingText="Préparation de votre espace"
				animationStyle={activeStyle}
				minimumEntryDuration={1200}
				minimumExitDuration={1400}
				backgroundColor="#f4f2ed"
				panelColor="#00008f"
				onExitComplete={() => {
					console.info("AXA intro finished");
				}}
			/>
			<main>
				<h1>AXA Logo Test</h1>
			</main>
		</>
	);
}
