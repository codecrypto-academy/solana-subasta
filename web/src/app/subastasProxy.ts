import * as anchor from "@coral-xyz/anchor";
import { Program } from '@coral-xyz/anchor';
// import { Subastas } from '../../target/types/subastas'; // Uncomment and fix path if types are available
import subastasIdl from './idl/subastas.json';




interface SubastaForm {
  nombre: string;
  descripcion: string;
  importeMinimo: string;
  fechaInicio: string;
  fechaFin: string;
}

interface SubastaAccount {
  id: anchor.BN;
  nombre: string;
  descripcion: string;
  importeMinimo: anchor.BN;
  fechaInicio: anchor.BN;
  fechaFin: anchor.BN;
  estado: anchor.BN;
}

export async function getSubastas(walletAddress: string) {

  const connection = new anchor.web3.Connection(
    "http://localhost:8899",
    "confirmed"
  );

  // Use Phantom wallet as provider
  if (typeof window !== "undefined" && window.solana?.isPhantom) {
    const phantomProvider = new anchor.AnchorProvider(
      connection,
      walletAddress,
      { commitment: "confirmed" }
    );
    anchor.setProvider(phantomProvider);
  }

  // Create program instance with the specific program ID
  const program = new anchor.Program(
    subastasIdl as anchor.Idl, // IDL - you'll need to import your actual IDL
    anchor.getProvider()
  );

  // Fetch all subasta accounts
  const subastas = await program.account.subasta.all();
  console.log(subastas);
  return subastas.map((item: { account: SubastaAccount; publicKey: anchor.web3.PublicKey }) => {
    console.log(item);
    console.log("id", item.account.id);
    console.log("nombre", item.account.nombre);
    console.log("descripcion", item.account.descripcion);
      console.log("importe_minimo", item.account.importeMinimo.toString());
    console.log("fecha_inicio", item.account.fechaInicio.toString());
    console.log("fecha_fin", item.account.fechaFin.toString());
    console.log("estado", item.account.estado.toString());
    return {
      id: item.account.id.toString(),
      nombre: item.account.nombre || "nombre no definido",
      descripcion: item.account.descripcion || "descripcion no definida",
      importe_minimo: item.account.importeMinimo.toString(),
      fecha_inicio: item.account.fechaInicio.toString(),
      fecha_fin: item.account.fechaFin.toString(),
      estado: item.account.estado.toString(),
      publicKey: item.publicKey.toBase58(),
    };
  }).filter(item => item !== null);
}

export async function createSubasta(form: SubastaForm, walletAddress: string) {
  // TODO: Implement real transaction logic
  // Placeholder: just log
  console.log('Create subasta', form, walletAddress);
}

export async function deleteSubasta(id: string, walletAddress: string) {
  // TODO: Implement real transaction logic
  // Placeholder: just log
  console.log('Delete subasta', id, walletAddress);
} 