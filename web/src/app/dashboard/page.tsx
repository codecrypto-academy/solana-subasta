"use client";
import React, { useEffect, useState } from "react";
import { getSubastas } from "../subastasProxy";
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
  const { address } = useGlobalContext();
  const [subastas, setSubastas] = useState<Subasta[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const data = await getSubastas(address as string);
      setSubastas(data);
      setLoading(false);
    }
    fetchData();
  }, []);

  return (
    <div style={{ maxWidth: 700, margin: "2rem auto" }}>
      <h2>Subastas</h2>
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