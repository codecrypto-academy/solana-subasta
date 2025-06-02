import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Subastas } from "../target/types/subastas";

describe("subastas", () => {
  // Configure the client to use the local cluster.
  
  anchor.setProvider(anchor.AnchorProvider.env());
  const provider = anchor.AnchorProvider.env();

  const random = (Math.floor(Math.random() * 1000) + 1).toString();
  const program = anchor.workspace.subastas as Program<Subastas>;
  const [subastaPda] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("subasta"), Buffer.from(random)],
    program.programId
  );
  console.log("subastaPda", subastaPda.toBase58());
  it("create subasta", async () => {
    const tx = await program.methods.crearSubasta(
      random,
      "Subasta 1", 
      "Descripción de la subasta 1", 
      new anchor.BN(100), 
      new anchor.BN(1717334400), 
      new anchor.BN(1717334400)
    ).accounts({
      subasta: subastaPda,
      user: provider.wallet.publicKey,
      system_program: anchor.web3.SystemProgram.programId,
      rent: anchor.web3.SYSVAR_RENT_PUBKEY,
    }).signers([provider.wallet.payer])
    .rpc();
    console.log("Your transaction signature", tx);
  });
});
