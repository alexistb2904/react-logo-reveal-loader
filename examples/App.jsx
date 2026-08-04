import LogoRevealLoader from "../src/LogoRevealLoader";

export default function App() {
  return (
    <LogoRevealLoader
      logoSrc="/logo.svg"
      panelColor="#476960"
      backgroundColor="#f4f2ed"
      duration={3200}
    >
      <main>
        <h1>Your website</h1>
        <p>The regular page content is rendered behind the intro.</p>
      </main>
    </LogoRevealLoader>
  );
}
