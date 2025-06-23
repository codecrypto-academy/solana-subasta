import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Subastas } from "../target/types/subastas";
import { GetProgramAccountsFilter, GetProgramAccountsConfig } from '@solana/web3.js';
import assert from "assert";


describe("subastas", () => {
  // Configure the client to use the local cluster.

  anchor.setProvider(anchor.AnchorProvider.env());
  const provider = anchor.AnchorProvider.env();

  const random = new anchor.BN(Math.floor(Math.random() * 10000) + 1);
  const program = anchor.workspace.subastas as Program<Subastas>;
  // create de la ssubasta
  const [subastaPda] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("subasta33"), Buffer.from(random.toArray('le', 8))],
    program.programId
  );
  // create key de la cuenta puja
  const [pujaPda] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("puja2222"), Buffer.from(random.toArray('le', 8)), provider.wallet.publicKey.toBuffer()],
    program.programId
  );

  console.log("subastaPda", subastaPda.toBase58());
  it("create subasta", async () => {
    const tx = await program.methods.crearSubasta(
      random,
      "Subasta 1",
      "Descripción de la subasta 1",
      new anchor.BN(100),
      new anchor.BN(0),
      new anchor.BN(0)
    ).accountsStrict({
      subasta: subastaPda,
      user: provider.wallet.publicKey,
      systemProgram: anchor.web3.SystemProgram.programId,
      rent: anchor.web3.SYSVAR_RENT_PUBKEY,
    }).signers([provider.wallet.payer])
      .rpc();
   
    assert.ok(tx);

      
    const subastaAccount = await program.account.subasta.fetch(subastaPda);
  });

  it("iniciar subasta", async () => {
    const tx = await program.methods.iniciarSubasta(
      random
    ).accountsStrict({
      subasta: subastaPda,
      user: provider.wallet.publicKey,
    }).signers([provider.wallet.payer])
      .rpc();

    assert.ok(tx);
    

    console.log("Your transaction signature iniciar subasta", tx);
  });


  it("iniciar subasta, debe fallar", async () => {
    let tx = null;
    try {
     tx = await program.methods.iniciarSubasta(
      random
    ).accountsStrict({
      subasta: subastaPda,
      user: provider.wallet.publicKey,
    }).signers([provider.wallet.payer])
        .rpc(); 

      console.log("Your transaction signature iniciar subasta", tx);
    } catch (error) {
      assert.ok(error);
    }
    finally {
      console.log("error tx", tx);
    }
  });


  it("finalizar subasta", async () => {
    const tx = await program.methods.finalizarSubasta(
      random
    ).accountsStrict({
      subasta: subastaPda,
      user: provider.wallet.publicKey,
    }).signers([provider.wallet.payer])
      .rpc();
    console.log("Your transaction signature finalizar subasta", tx);
    assert.ok(tx);
  });

  it("create puja", async () => {
    const tx = await program.methods.crearPuja(
      random,
      new anchor.BN(100),
      new anchor.BN(1717334400)
    ).accountsStrict({
      puja: pujaPda,
      subasta: subastaPda,
      user: provider.wallet.publicKey,
      systemProgram: anchor.web3.SystemProgram.programId,
      rent: anchor.web3.SYSVAR_RENT_PUBKEY,
    }).signers([provider.wallet.payer])
      .rpc();

    assert.ok(tx);

  })

  it("get subasta", async () => {

    console.log("Fetching all accounts of type 'subasta' using Anchor's discriminator...");
    // `program.account.auction.all()` automatically adds the Anchor discriminator filter.
    const allAuctions = await program.account.subasta.all(
    );

    console.log("All auctions:", allAuctions.map(auction => 
      {
        console.log("auction", auction.account.id);
        console.log("nombre", auction.account.nombre);
        console.log("descripcion", auction.account.descripcion);
        console.log("importe_minimo", auction.account.importeMinimo.toString());
        console.log("fecha_inicio", auction.account.fechaInicio.toString());
        console.log("fecha_fin", auction.account.fechaFin.toString());
        console.log("estado", auction.account.estado.toString());
        return auction;
      }));

    const discriminator = anchor.utils.sha256.hash(`puja`).slice(0, 9);
    console.log(discriminator, Buffer.from(discriminator, 'hex'))

    const discriminatorBytes = Buffer.from(discriminator, 'hex');
    const discriminatorBase64 = discriminatorBytes.toString('base64');
    console.log("Discriminator in base64:", discriminatorBase64, "sSS");


//62ADEE071DD1E6BA
//A0A4F725F71E6A2F
    const config1: GetProgramAccountsConfig = {
      commitment: 'confirmed',
      filters: [
        {
          memcmp: {
            offset: 0,
            bytes: "QTBBNEY3MjVGNzFFNkEyRg==",
            encoding: 'base64' 
          }
        },
        {
          memcmp: {
            offset: 8, // Skip the 8-byte discriminator
            bytes: random.toArrayLike(Buffer, 'le', 8).toString('base64'),
            encoding: 'base64'
          }
        },
        {
          dataSize: 92, // The exact size in bytes you're looking for
        },
      ],
      dataSlice: {
        offset: 0, // Start from the beginning
        length: 0, // Fetch up to and including the state byte
      },
    };


    const pujas = await provider.connection.getProgramAccounts(program.programId,
      config1
    );
    console.log(pujas)
  })

});




