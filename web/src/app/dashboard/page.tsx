"use client";
import React, { useEffect, useState } from "react";
import { getSubastas, createSubasta, crearPuja } from "../subastasProxy";
import { useGlobalContext } from "../GlobalContext";
import Link from "next/link";

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

export default function DashboardPage() {
  useGlobalContext();
  const [subastas, setSubastas] = useState<Subasta[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    importe_minimo: "",
    fecha_inicio: "",
    fecha_fin: "",
  });
  const [pujaForms, setPujaForms] = useState<{ [id: string]: boolean }>({});
  const [pujaValues, setPujaValues] = useState<{ [id: string]: string }>({});
  const [pujando, setPujando] = useState<{ [id: string]: boolean }>({});

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, []);

  async function fetchData() {
    setLoading(true);
    const wallet = typeof window !== "undefined" ? window.solana : null;
    const data = await getSubastas(wallet);
    setSubastas(data);
    setLoading(false);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    const wallet = typeof window !== "undefined" ? window.solana : null;
    const formWithTimestamps = {
      ...form,
      fecha_inicio: new Date(form.fecha_inicio).getTime().toString(),
      fecha_fin: new Date(form.fecha_fin).getTime().toString(),
    };
    await createSubasta(wallet, formWithTimestamps);
    setForm({
      nombre: "",
      descripcion: "",
      importe_minimo: "",
      fecha_inicio: "",
      fecha_fin: "",
    });
    setShowForm(false);
    setCreating(false);
    fetchData();
  }

  async function handlePujar(e: React.FormEvent, subastaId: string) {
    e.preventDefault();
    setPujando((p) => ({ ...p, [subastaId]: true }));
    const wallet = typeof window !== "undefined" ? window.solana : null;
    try {
      await crearPuja(wallet, {
        id: subastaId,
        importe_puja: pujaValues[subastaId],
      });
    } catch (error: any) {
      alert("Error al pujar: " + (error?.message || error));
      console.error("Error al crear puja:", error);
    }
    setPujaForms((f) => ({ ...f, [subastaId]: false }));
    setPujaValues((v) => ({ ...v, [subastaId]: "" }));
    setPujando((p) => ({ ...p, [subastaId]: false }));
    fetchData();
  }

  return (
    <div style={{ maxWidth: 700, margin: "2rem auto" }}>
      <h2
        style={{
          textAlign: "center",
          fontSize: 24,
          fontWeight: 700,
          marginBottom: 16,
        }}
      >
        Subastas
      </h2>
      <button
        onClick={() => setShowForm((v) => !v)}
        style={{
          marginBottom: 16,
          background: showForm ? "#e0e7ef" : "#2563eb",
          color: showForm ? "#2563eb" : "#fff",
          border: "none",
          borderRadius: 8,
          padding: "10px 24px",
          fontWeight: 600,
          fontSize: 16,
          cursor: "pointer",
          boxShadow: showForm ? "none" : "0 2px 8px rgba(37,99,235,0.08)",
          transition: "all 0.2s",
        }}
        onMouseOver={(e) =>
          (e.currentTarget.style.background = showForm ? "#dbeafe" : "#1d4ed8")
        }
        onMouseOut={(e) =>
          (e.currentTarget.style.background = showForm ? "#e0e7ef" : "#2563eb")
        }
      >
        {showForm ? "Cancelar" : "Crear Subasta"}
      </button>
      {showForm && (
        <form
          onSubmit={handleCreate}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
            marginBottom: 24,
            border: "1px solid #e5e7eb",
            padding: 24,
            borderRadius: 12,
            background: "#f8fafc",
            boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
          }}
        >
          <input
            required
            placeholder="Nombre"
            value={form.nombre}
            onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
            style={{
              padding: "10px 12px",
              border: "1px solid #cbd5e1",
              borderRadius: 6,
              fontSize: 15,
              outline: "none",
              background: "#fff",
            }}
          />
          <input
            required
            placeholder="Descripción"
            value={form.descripcion}
            onChange={(e) =>
              setForm((f) => ({ ...f, descripcion: e.target.value }))
            }
            style={{
              padding: "10px 12px",
              border: "1px solid #cbd5e1",
              borderRadius: 6,
              fontSize: 15,
              outline: "none",
              background: "#fff",
            }}
          />
          <input
            required
            placeholder="Importe mínimo"
            type="number"
            value={form.importe_minimo}
            onChange={(e) =>
              setForm((f) => ({ ...f, importe_minimo: e.target.value }))
            }
            style={{
              padding: "10px 12px",
              border: "1px solid #cbd5e1",
              borderRadius: 6,
              fontSize: 15,
              outline: "none",
              background: "#fff",
            }}
          />
          <input
            required
            placeholder="Fecha inicio"
            type="datetime-local"
            value={form.fecha_inicio}
            onChange={(e) =>
              setForm((f) => ({ ...f, fecha_inicio: e.target.value }))
            }
            style={{
              padding: "10px 12px",
              border: "1px solid #cbd5e1",
              borderRadius: 6,
              fontSize: 15,
              outline: "none",
              background: "#fff",
            }}
          />
          <input
            required
            placeholder="Fecha fin"
            type="datetime-local"
            value={form.fecha_fin}
            onChange={(e) =>
              setForm((f) => ({ ...f, fecha_fin: e.target.value }))
            }
            style={{
              padding: "10px 12px",
              border: "1px solid #cbd5e1",
              borderRadius: 6,
              fontSize: 15,
              outline: "none",
              background: "#fff",
            }}
          />
          <button
            type="submit"
            disabled={creating}
            style={{
              background: creating ? "#93c5fd" : "#2563eb",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "10px 24px",
              fontWeight: 600,
              fontSize: 16,
              cursor: creating ? "not-allowed" : "pointer",
              boxShadow: creating ? "none" : "0 2px 8px rgba(37,99,235,0.08)",
              transition: "all 0.2s",
            }}
          >
            {creating ? "Creando..." : "Crear"}
          </button>
        </form>
      )}
      {loading ? (
        <div>Cargando...</div>
      ) : subastas.length === 0 ? (
        <div>No hay subastas.</div>
      ) : (
          <ul style={{alignItems: "center", listStyle: "none", padding: 0 }}>
            {subastas.map((s, index) => (
              <li
                key={index}
                style={{
                  border: "1px solid #eee",
                  marginBottom: 12,
                  padding: 12,
                  borderRadius: 6,
                }}
              >
                <div>
                  <b>{s.nombre}</b> (ID: {s.id})
                </div>
                <div>{s.descripcion}</div>
                <div>Creador: {s.creador}</div>
                <div>Importe mínimo: {s.importe_minimo}</div>
                <div>
                  Inicio: {new Date(Number(s.fecha_inicio)).toLocaleString()} |
                  Fin: {new Date(Number(s.fecha_fin)).toLocaleString()}
                </div>
                <div>Estado: {s.estado}</div>
                <div style={{ fontSize: "0.85em", color: "#888" }}>
                  PDA: {s.publicKey}
                </div>
                <button
                  style={{
                    marginTop: 8,
                    background: "#22c55e",
                    color: "#fff",
                    border: "none",
                    borderRadius: 6,
                    padding: "6px 18px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                  onClick={() =>
                    setPujaForms((f) => ({ ...f, [s.id]: !pujaForms[s.id] }))
                  }
                >
                  {pujaForms[s.id] ? "Cancelar" : "Pujar"}
                </button>
                <Link
                  href={`/dashboard/${s.id}`}
                  style={{
                    marginLeft: 12,
                    color: "#2563eb",
                    textDecoration: "underline",
                    cursor: "pointer",
                    fontSize: 14,
                  }}
                >
                  Ver detalle y pujas
                </Link>
                {pujaForms[s.id] && (
                  <form
                    onSubmit={(e) => handlePujar(e, s.id)}
                    style={{
                      marginTop: 10,
                      display: "flex",
                      gap: 8,
                      alignItems: "center",
                    }}
                  >
                    <input
                      required
                      type="number"
                      min={Number(s.importe_minimo) + 1}
                      placeholder="Importe de la puja"
                      value={pujaValues[s.id] || ""}
                      onChange={(e) =>
                        setPujaValues((v) => ({ ...v, [s.id]: e.target.value }))
                      }
                      style={{
                        padding: "6px 10px",
                        border: "1px solid #cbd5e1",
                        borderRadius: 5,
                        fontSize: 15,
                        width: 120,
                      }}
                    />
                    <button
                      type="submit"
                      disabled={pujando[s.id]}
                      style={{
                        background: pujando[s.id] ? "#a7f3d0" : "#22c55e",
                        color: "#fff",
                        border: "none",
                        borderRadius: 6,
                        padding: "6px 18px",
                        fontWeight: 600,
                        cursor: pujando[s.id] ? "not-allowed" : "pointer",
                      }}
                    >
                      {pujando[s.id] ? "Pujando..." : "Confirmar Puja"}
                    </button>
                  </form>
                )}
              </li>
            ))}
          </ul>
      )}
    </div>
  );
}
