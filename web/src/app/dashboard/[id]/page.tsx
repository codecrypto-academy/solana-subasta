"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { getSubastas, getPujas } from "../../subastasProxy";
import { FaGavel, FaUser, FaCrown, FaKey, FaMoneyBillWave } from "react-icons/fa";

interface Subasta {
  id: string;
  nombre: string;
  descripcion: string;
  importe_minimo: string;
  fecha_inicio: string;
  fecha_fin: string;
  estado: string;
  publicKey: string;
  creador: string;
  ganador: string;
  importe_ganador: string;
}

interface Puja {
  id: string;
  nombre: string;
  importe_puja: string;
  ts: string;
  pk: string;
  publicKey: string;
}

export default function SubastaDetallePage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string | undefined;
  const [subasta, setSubasta] = useState<Subasta | null>(null);
  const [pujas, setPujas] = useState<Puja[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect( () => {
    if (!id) return;
    async function fetchData() {
      setLoading(true);
      const wallet = typeof window !== "undefined" ? window.solana : null;
      // TODO REFACTORING. Solo get de la subasta
      const subastas = await getSubastas(wallet);
      const found = subastas.find((s: Subasta) => s.id === id);
      setSubasta(found || null);
      if (found) {
        const pujasList = await getPujas(wallet, id);
        setPujas(pujasList);
      }
      setLoading(false);
    }
    fetchData();
  }, [id]);

  if (!id) {
    return <div>No se proporcionó ID de subasta.</div>;
  }

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (!subasta) {
    return <div>Subasta no encontrada.</div>;
  }

  return (
    <div style={{ maxWidth: 1024, margin: "2rem auto", padding: 16, fontFamily: 'Inter, sans-serif' }}>
      {/* Header visual con icono */}
      <div style={{
        background: "linear-gradient(90deg, #2563eb 0%, #60a5fa 100%)",
        color: "#fff",
        borderRadius: 20,
        padding: "32px 24px 24px 24px",
        marginBottom: 36,
        boxShadow: "0 4px 24px rgba(37,99,235,0.08)",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: 24
      }}>
        <div style={{ fontSize: 48, background: "#fff3", borderRadius: "50%", padding: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <FaGavel />
        </div>
        <div style={{ flex: 1 }}>
          <h1 style={{ margin: 0, fontSize: 36, fontWeight: 900, letterSpacing: -1 }}>{subasta.nombre}</h1>
          <div style={{ fontSize: 18, opacity: 0.95, marginBottom: 8 }}>{subasta.descripcion}</div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 4 }}>
            <span style={{
              background: subasta.estado === "finalizada" ? "#fee2e2" : "#bbf7d0",
              color: subasta.estado === "finalizada" ? "#b91c1c" : "#166534",
              borderRadius: 8,
              padding: "2px 12px",
              fontWeight: 700,
              fontSize: 15
            }}>{subasta.estado.toUpperCase()}</span>
            <span style={{ fontSize: 15, color: "#e0e7ef" }}>•</span>
            <span style={{ fontSize: 15 }}><b>Inicio:</b> {new Date(Number(subasta.fecha_inicio)).toLocaleString()}</span>
            <span style={{ fontSize: 15, color: "#e0e7ef" }}>|</span>
            <span style={{ fontSize: 15 }}><b>Fin:</b> {new Date(Number(subasta.fecha_fin)).toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Tarjeta de información con badges y layout mejorado */}
      <div style={{
        background: "#f8fafc",
        borderRadius: 18,
        boxShadow: "0 4px 24px rgba(37,99,235,0.10)",
        padding: 32,
        marginBottom: 36,
        borderLeft: "8px solid #2563eb",
        display: "flex",
        flexDirection: "column",
        gap: 18,
        maxWidth: 600,
        marginLeft: "auto",
        marginRight: "auto"
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <FaMoneyBillWave style={{ color: '#2563eb', fontSize: 22 }} />
          <span style={{ fontWeight: 700, fontSize: 18 }}>Importe mínimo:</span>
          <span style={{ color: "#2563eb", fontWeight: 800, fontSize: 18 }}>{subasta.importe_minimo}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <FaKey style={{ color: '#64748b', fontSize: 20 }} />
          <span style={{ fontWeight: 700 }}>PDA:</span>
          <span title={subasta.publicKey} style={{ fontFamily: "monospace", fontSize: 14, cursor: 'pointer', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', display: 'inline-block', maxWidth: 220 }}>{subasta.publicKey}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <FaUser style={{ color: '#2563eb', fontSize: 20 }} />
          <span style={{ fontWeight: 700 }}>Creador:</span>
          <span style={{ background: "#e0e7ef", color: "#2563eb", borderRadius: 8, padding: "2px 8px", fontFamily: "monospace", fontSize: 14 }}>{subasta.creador}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <FaCrown style={{ color: '#059669', fontSize: 22 }} />
          <span style={{ fontWeight: 700 }}>Ganador:</span>
          <span style={{ background: "#bbf7d0", color: "#166534", borderRadius: 8, padding: "2px 8px", fontFamily: "monospace", fontSize: 14 }}>{subasta.ganador}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <FaMoneyBillWave style={{ color: '#059669', fontSize: 22 }} />
          <span style={{ fontWeight: 700, fontSize: 18 }}>Importe ganador:</span>
          <span style={{ color: "#059669", fontWeight: 900, fontSize: 20 }}>{subasta.importe_ganador}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <FaGavel style={{ color: subasta.estado === "finalizada" ? "#b91c1c" : "#2563eb", fontSize: 20 }} />
          <span style={{ fontWeight: 700 }}>Estado:</span>
          <span style={{
            background: subasta.estado === "finalizada" ? "#fee2e2" : "#bbf7d0",
            color: subasta.estado === "finalizada" ? "#b91c1c" : "#166534",
            borderRadius: 8,
            padding: "2px 12px",
            fontWeight: 700,
            fontSize: 15
          }}>{subasta.estado.toUpperCase()}</span>
        </div>
      </div>

      {/* Tabla de pujas con avatar inicial y tooltips */}
      <h3 style={{ marginBottom: 14, fontWeight: 800, fontSize: 22 }}>Pujas realizadas</h3>
      {pujas.length === 0 ? (
        <div style={{ background: "#fef3c7", color: "#92400e", padding: 18, borderRadius: 10, marginBottom: 28, fontWeight: 600 }}>No hay pujas para esta subasta.</div>
      ) : (
        <div style={{ overflowX: "auto", marginBottom: 28 }}>
          <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0, background: "#f8fafc", borderRadius: 14, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.03)" }}>
            <thead>
              <tr style={{ background: "#e0e7ef" }}>
                <th style={{ padding: 12, borderBottom: "2px solid #d1d5db", fontWeight: 800, fontSize: 16 }}>#</th>
                <th style={{ padding: 12, borderBottom: "2px solid #d1d5db", fontWeight: 800, fontSize: 16 }}>Importe</th>
                <th style={{ padding: 12, borderBottom: "2px solid #d1d5db", fontWeight: 800, fontSize: 16 }}>Usuario</th>
                <th style={{ padding: 12, borderBottom: "2px solid #d1d5db", fontWeight: 800, fontSize: 16 }}>Fecha</th>
                <th style={{ padding: 12, borderBottom: "2px solid #d1d5db", fontWeight: 800, fontSize: 16 }}>PDA</th>
              </tr>
            </thead>
            <tbody>
              {pujas
                .sort((a, b) => Number(b.importe_puja) - Number(a.importe_puja))
                .map((p, idx) => (
                  <tr key={p.publicKey} style={{ background: idx % 2 === 0 ? "#f1f5f9" : "#fff", transition: 'background 0.2s' }}>
                    <td style={{ padding: 12, textAlign: "center", fontWeight: 700 }}>{idx + 1}</td>
                    <td style={{ padding: 12, color: "#2563eb", fontWeight: 800, fontSize: 17 }}>{p.importe_puja}</td>
                    <td style={{ padding: 12, fontFamily: "monospace", fontSize: 15, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{
                        background: "#2563eb",
                        color: "#fff",
                        borderRadius: "50%",
                        width: 28,
                        height: 28,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 900,
                        fontSize: 15
                      }}>{p.pk[0]?.toUpperCase() || '?'}</span>
                      <span title={p.pk} style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: 120, display: 'inline-block', cursor: 'pointer' }}>{p.pk}</span>
                    </td>
                    <td  style={{ padding: 12 }}>{new Date(Number(p.ts)).toLocaleString()}</td>
                    <td style={{ padding: 12, fontFamily: "monospace", fontSize: 13, color: "#64748b" }} title={p.publicKey}>{p.publicKey.slice(0, 8)}...{p.publicKey.slice(-4)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
      <button
        onClick={() => router.back()}
        style={{
          marginTop: 8,
          background: "linear-gradient(90deg, #2563eb 0%, #60a5fa 100%)",
          color: "#fff",
          border: "none",
          borderRadius: 10,
          padding: "14px 36px",
          fontWeight: 800,
          fontSize: 20,
          cursor: "pointer",
          boxShadow: "0 2px 8px rgba(37,99,235,0.10)",
          transition: "background 0.2s, transform 0.1s",
          letterSpacing: 1
        }}
        onMouseOver={e => e.currentTarget.style.transform = 'scale(1.04)'}
        onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        ← Volver
      </button>
    </div>
  );
} 