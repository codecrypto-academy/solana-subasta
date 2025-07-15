import Link from "next/link";

export default function Home() {
  return (
    <div style={{ maxWidth: 500, margin: "3rem auto", textAlign: "center" }}>
      <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 16 }}>Bienvenido a Solana Subastas</h1>
      <p style={{ fontSize: 18, marginBottom: 32 }}>
        Esta es una aplicación descentralizada para crear y participar en subastas sobre la blockchain de Solana.
        <br />
        Conéctate con tu wallet Phantom para comenzar.
      </p>
      <Link href="/dashboard" style={{
        display: "inline-block",
        background: "#2563eb",
        color: "#fff",
        padding: "12px 32px",
        borderRadius: 8,
        fontWeight: 600,
        fontSize: 18,
        textDecoration: "none",
        boxShadow: "0 2px 8px rgba(37,99,235,0.08)",
        transition: "background 0.2s"
      }}
      >
        Ir al Dashboard
      </Link>
    </div>
  );
}
