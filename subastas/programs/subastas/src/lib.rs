use anchor_lang::prelude::*;

declare_id!("AeGHgXBqDZjRftpfckDtVs1oE2hkbvYNNv5H6hFkP68d");

#[program]
pub mod subastas {
    use super::*;

   pub fn crear_subasta(ctx: Context<CrearSubastaContext>, 
    id: u64, // Changed from String to u64
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
    // Removed #[max_len(8)] as it's not applicable to u64
    pub id: u64, // Changed from String to u64
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
#[instruction(id: u64)] // Changed from String to u64
pub struct CrearSubastaContext<'info> {
  #[account(
    init,  // pda
    payer = user, 
    // We need to calculate space manually for String fields + fixed-size fields
    // For `InitSpace` to work correctly with `u64` instead of `String` in seeds,
    // we need to ensure the space calculation is correct.
    // InitSpace can automatically calculate for fixed types and `#[max_len]` Strings.
    // If you remove #[max_len] from `id` (as it's now u64), InitSpace is fine.
    // The `space = Subasta::INIT_SPACE` line remains correct for the updated `Subasta` struct.
    space = Subasta::INIT_SPACE, 
    // The seed now converts the u64 ID to bytes.
    seeds = [b"subasta", id.to_le_bytes().as_ref()], 
    bump)]
  pub subasta: Account<'info, Subasta>,

  #[account(mut)]
  pub user: Signer<'info>,
  pub system_program: Program<'info, System>,
  pub rent: Sysvar<'info, Rent>,
}