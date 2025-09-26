export default function HomePage() {
  return (
    <section className="glass" style={{ padding: 24, maxWidth: 720, width: "100%" }}>
      <h1 style={{ fontSize: 28, margin: 0, lineHeight: 1.2 }}>Welcome</h1>
      <p className="muted" style={{ marginTop: 8 }}>
        This is a modular Next.js + Privy starter using a glass UI. Use the top-right card to authenticate.
      </p>
    </section>
  );
}

