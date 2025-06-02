use anchor_lang::prelude::*;

declare_id!("AeGHgXBqDZjRftpfckDtVs1oE2hkbvYNNv5H6hFkP68d");

#[program]
pub mod subastas {
    use super::*;

   pub fn crear_subasta(ctx: Context<CrearSubastaContext>, 
    id: String,
    nombre: String, 
    descripcion: String, 
    importe_minimo: u64, 
    fecha_inicio: u64, 
    fecha_fin: u64) -> Result<()> {

    let subasta = &mut ctx.accounts.subasta;
    subasta.id = id;
    subasta.nombre = nombre;
    subasta.descripcion = descripcion;
    subasta.importe_minimo = importe_minimo;
    subasta.fecha_inicio = fecha_inicio;
    subasta.fecha_fin = fecha_fin;
    subasta.estado = 0;
    Ok(())
   }
}

#[account]
#[derive(InitSpace)]
pub struct Subasta {
    #[max_len(8)]
    pub id: String,
    #[max_len(32)]
    pub nombre: String,
    #[max_len(280)]
    pub descripcion: String,
    pub importe_minimo: u64,
    pub fecha_inicio: u64,
    pub fecha_fin: u64,
    pub estado: u64,
}

#[derive(Accounts)]
#[instruction(id: String)]
pub struct CrearSubastaContext<'info> {
  #[account(
    init,  // pda
    payer = user, 
    space = Subasta::INIT_SPACE,
    seeds = [b"subasta", id.as_bytes()], // pda
    bump)]
  pub subasta: Account<'info, Subasta>,

  #[account(mut)]
  pub user: Signer<'info>,
  pub system_program: Program<'info, System>,
  pub rent: Sysvar<'info, Rent>,
}
