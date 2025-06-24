"use client";
import React, { useEffect, useState } from "react";
import { getSubastas, createSubasta } from "../subastasProxy";
import { useGlobalContext } from "../GlobalContext";

interface Subasta {
  id: string;
  nombre: string;
  descripcion: string;
  importe_minimo: string;
  fecha_inicio: string;
  fecha_fin: string;
  estado: string;
  publicKey: string;
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
    await createSubasta(wallet, form);
    setForm({ nombre: "", descripcion: "", importe_minimo: "", fecha_inicio: "", fecha_fin: "" });
    setShowForm(false);
    setCreating(false);
    fetchData();
  }

  return (
    <div style={{ maxWidth: 700, margin: "2rem auto" }}>
      <h2>Subastas</h2>
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
          transition: "all 0.2s"
        }}
        onMouseOver={e => (e.currentTarget.style.background = showForm ? "#dbeafe" : "#1d4ed8")}
        onMouseOut={e => (e.currentTarget.style.background = showForm ? "#e0e7ef" : "#2563eb")}
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
            boxShadow: "0 2px 8px rgba(0,0,0,0.03)"
          }}
        >
          <input
            required
            placeholder="Nombre"
            value={form.nombre}
            onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
            style={{
              padding: "10px 12px",
              border: "1px solid #cbd5e1",
              borderRadius: 6,
              fontSize: 15,
              outline: "none",
              background: "#fff"
            }}
          />
          <input
            required
            placeholder="Descripción"
            value={form.descripcion}
            onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
            style={{
              padding: "10px 12px",
              border: "1px solid #cbd5e1",
              borderRadius: 6,
              fontSize: 15,
              outline: "none",
              background: "#fff"
            }}
          />
          <input
            required
            placeholder="Importe mínimo"
            type="number"
            value={form.importe_minimo}
            onChange={e => setForm(f => ({ ...f, importe_minimo: e.target.value }))}
            style={{
              padding: "10px 12px",
              border: "1px solid #cbd5e1",
              borderRadius: 6,
              fontSize: 15,
              outline: "none",
              background: "#fff"
            }}
          />
          <input
            required
            placeholder="Fecha inicio (timestamp)"
            type="number"
            value={form.fecha_inicio}
            onChange={e => setForm(f => ({ ...f, fecha_inicio: e.target.value }))}
            style={{
              padding: "10px 12px",
              border: "1px solid #cbd5e1",
              borderRadius: 6,
              fontSize: 15,
              outline: "none",
              background: "#fff"
            }}
          />
          <input
            required
            placeholder="Fecha fin (timestamp)"
            type="number"
            value={form.fecha_fin}
            onChange={e => setForm(f => ({ ...f, fecha_fin: e.target.value }))}
            style={{
              padding: "10px 12px",
              border: "1px solid #cbd5e1",
              borderRadius: 6,
              fontSize: 15,
              outline: "none",
              background: "#fff"
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
              transition: "all 0.2s"
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
        <ul style={{ listStyle: "none", padding: 0 }}>
          {subastas.map((s) => (
            <li key={s.id} style={{ border: "1px solid #eee", marginBottom: 12, padding: 12, borderRadius: 6 }}>
              <div><b>{s.nombre}</b> (ID: {s.id})</div>
              <div>{s.descripcion}</div>
              <div>Importe mínimo: {s.importe_minimo}</div>
              <div>Inicio: {s.fecha_inicio} | Fin: {s.fecha_fin}</div>
              <div>Estado: {s.estado}</div>
              <div style={{ fontSize: "0.85em", color: "#888" }}>PDA: {s.publicKey}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
} 