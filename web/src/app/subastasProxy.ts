"use client";
import { PublicKey, Connection, SystemProgram, SYSVAR_RENT_PUBKEY } from "@solana/web3.js";
import { Program, AnchorProvider, BN, Idl, Wallet } from "@coral-xyz/anchor";
import subastasIdl from "./idl/subastas.json";
import { Subastas } from "./idl/subastas";
import bs58 from "bs58";
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
    creador: account.creador.toBase58(),
    ganador: account.ganador.toBase58(),
    importe_ganador: account.importeGanador.toString(),
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
  const id = new BN(Date.now()); 
  console.log(SUBASTAS_PROGRAM_ID.toBase58()); // or use a better unique id
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

// Bid on a subasta
export async function crearPuja(
  wallet: Wallet,
  { id, importe_puja }: { id: string; importe_puja: string }
) {

  
  // El error ocurre porque la PDA de la puja es única por subasta+usuario,
  // y solo puedes crear UNA cuenta Puja por usuario por subasta.
  // Si intentas ejecutar esto dos veces, la segunda vez la cuenta ya existe y Anchor lanza error.
  // Solución: Si quieres permitir varias pujas por usuario, debes usar un seed único extra (ej: timestamp o un contador incremental).
  // Si solo quieres una puja por usuario por subasta, debes actualizar la cuenta en vez de crearla de nuevo.

  // --- Código actual: solo permite una puja por usuario por subasta ---
  const program = getProgram(wallet);
  const bnId = new BN(id);
  const bnImporte = new BN(importe_puja);
  const ts = new BN(Date.now());
  const [subastaPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("subasta33"), bnId.toArrayLike(Buffer, "le", 8)],
    SUBASTAS_PROGRAM_ID
  );
  const [pujaPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("puja2222"), bnId.toArrayLike(Buffer, "le", 8), wallet.publicKey.toBuffer()],
    SUBASTAS_PROGRAM_ID
  );
  await program.methods.crearPuja(
    bnId,
    bnImporte,
    ts
  ).accounts({
    subasta: subastaPda,
    puja: pujaPda,
    user: wallet.publicKey,
    systemProgram: SystemProgram.programId,
    rent: SYSVAR_RENT_PUBKEY,
  }).rpc();
} 

// Obtener todas las pujas de una subasta
export async function getPujas(wallet: Wallet, subastaId: string) {
  const program = getProgram(wallet);
  const bnId = new BN(subastaId);
  // El campo id está después del discriminator (8 bytes)
  // El id es un u64 little endian (8 bytes)
  const idBuffer = bnId.toArrayLike(Buffer, 'le', 8);
  const pujas = await program.account.puja.all([
    {
      memcmp: {
        offset: 8, // 8 bytes del discriminator
        bytes: bs58.encode(idBuffer), // <-- base58 correcto
      },
    },
  ]);
  return pujas.map(({ account, publicKey }: any) => ({
    id: account.id.toString(),
    nombre: account.nombre,
    importe_puja: account.importePuja ? account.importePuja.toString() : account.importe_puja?.toString(),
    ts: account.ts.toString(),
    pk: account.pk.toBase58(),
    publicKey: publicKey.toBase58(),
  }));
} 