"use client";
import { PublicKey, Connection, SystemProgram, SYSVAR_RENT_PUBKEY } from "@solana/web3.js";
import { Program, AnchorProvider, BN, Idl, Wallet } from "@coral-xyz/anchor";
import subastasIdl from "./idl/subastas.json";
import { Subastas } from "./idl/subastas";
const SUBASTAS_PROGRAM_ID = new PublicKey(subastasIdl.address);

// Helper: get AnchorProvider using Phantom wallet
function getProvider(wallet: any) {
  const connection = new Connection("http://127.0.0.1:8899", "confirmed");
  return new AnchorProvider(connection, wallet, { preflightCommitment: "confirmed" });
}

// Helper: get Program instance
function getProgram(wallet: any) {
  const provider = getProvider(wallet);
  return new Program<Subastas>
    (subastasIdl as Idl, provider);
}

// Get all subastas
export async function getSubastas(wallet: any) {
  const program = getProgram(wallet);
  const subastas = await program.account.subasta.all();
  return subastas.map(({ account, publicKey }: any) => ({
    id: account.id.toString(),
    nombre: account.nombre,
    descripcion: account.descripcion,
    importe_minimo: account.importeMinimo.toString(),
    fecha_inicio: account.fechaInicio.toString(),
    fecha_fin: account.fechaFin.toString(),
    estado: account.estado.toString(),
    publicKey: publicKey.toBase58(),
  }));
}

// Create a new subasta
export async function createSubasta(
  wallet: Wallet,
  { nombre, descripcion, importe_minimo, fecha_inicio, fecha_fin }: {
    nombre: string;
    descripcion: string;
    importe_minimo: string;
    fecha_inicio: string;
    fecha_fin: string;
  } 
) {
  const program = getProgram(wallet);
  const id = new BN(Date.now()); // or use a better unique id
  const [subastaPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("subasta33"), id.toArrayLike(Buffer, "le", 8)],
    SUBASTAS_PROGRAM_ID
  );
  await program.methods.crearSubasta(
    id,
    nombre,
    descripcion,
    new BN(importe_minimo),
    new BN(fecha_inicio),
    new BN(fecha_fin)
  ).accounts({
    subasta: subastaPda,
    user: wallet.publicKey,
    systemProgram: SystemProgram.programId,
    rent: SYSVAR_RENT_PUBKEY,
  }).rpc();
}

// Finalize (delete) a subasta
export async function deleteSubasta(wallet: any, id: string) {
  const program = getProgram(wallet);
  const bnId = new BN(id);
  const [subastaPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("subasta33"), bnId.toArrayLike(Buffer, "le", 8)],
    SUBASTAS_PROGRAM_ID
  );
  await program.methods.finalizarSubasta(bnId).accounts({
    subasta: subastaPda,
    user: wallet.publicKey,
  }).rpc();
} 