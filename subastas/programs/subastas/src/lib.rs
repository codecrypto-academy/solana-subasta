use anchor_lang::prelude::*;

declare_id!("FrKUMpMJU7znzhxYRwVqHcNr23eb12RP895yS39iFCba");

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
    subasta.creador = *ctx.accounts.user.key;
    subasta.ganador = Pubkey::default();
    subasta.importe_ganador = 0;
    Ok(())
   }

   pub fn iniciar_subasta(ctx: Context<IniciarSubastaContext>, id: u64) -> Result<()> {
    let subasta = &mut ctx.accounts.subasta;
    require!(subasta.estado == 0, SubastasError::SubastaNoIniciada);
    subasta.estado = 1;
    

    Ok(())
   }
   
   pub fn crear_puja(ctx: Context<CrearPujaContext>, 
    id: u64, // Changed from String to u64
    importe_puja: u64,
    ts: u64
  ) -> Result<()> {



    let puja = &mut ctx.accounts.puja;
    let subasta = &mut ctx.accounts.subasta;
    if importe_puja > subasta.importe_ganador {
        subasta.ganador = *ctx.accounts.user.key;
        subasta.importe_ganador = importe_puja;
    }
    require!(ts < subasta.fecha_fin, SubastasError::SubastaYaFinalizada);
    puja.id = id;
    puja.importe_puja =  importe_puja;
    puja.ts = ts;
    puja.pk = *ctx.accounts.user.key;
    Ok(())
   }

   pub fn finalizar_subasta(ctx: Context<IniciarSubastaContext>, id: u64) -> Result<()> {
    let subasta = &mut ctx.accounts.subasta;
    subasta.estado = 2;
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
    pub creador: Pubkey,
    pub ganador: Pubkey,
    pub importe_ganador: u64,
}

#[derive(Accounts)]
#[instruction(id: u64)]
pub struct IniciarSubastaContext<'info> {
  #[account(mut, 
    seeds = [b"subasta33", id.to_le_bytes().as_ref()],
    bump)]
  pub subasta: Account<'info, Subasta>,
  #[account(mut)]
  pub user: Signer<'info>,
}




#[derive(Accounts)]
#[instruction(id: u64)] // Changed from String to u64
pub struct CrearSubastaContext<'info> {
  #[account(
    init,  // pda
    payer = user,
    space =  8 + Subasta::INIT_SPACE, 
    // The seed now converts the u64 ID to bytes.
    seeds = [b"subasta33", id.to_le_bytes().as_ref()], 
    bump)]
  pub subasta: Account<'info, Subasta>,

  #[account(mut)]
  pub user: Signer<'info>,
  pub system_program: Program<'info, System>,
  pub rent: Sysvar<'info, Rent>,
}

#[account]
#[derive(InitSpace)]
pub struct Puja {
  pub id: u64,
  #[max_len(32)]
  pub nombre: String,
  pub importe_puja: u64,
  pub ts: u64,
  pub pk: Pubkey
}

#[derive(Accounts)]
#[instruction(id: u64)] 
pub struct CrearPujaContext<'info> {
  #[account(
    mut,  // pda
    // The seed now converts the u64 ID to bytes.
    seeds = [b"subasta33", id.to_le_bytes().as_ref()], 
    bump)]
  pub subasta: Account<'info, Subasta>,

  #[account(
    init,  // pda
    payer = user, 
    space = Puja::INIT_SPACE,
    seeds = [b"puja2222", id.to_le_bytes().as_ref(), user.key().as_ref()],
    bump)]
  pub puja: Account<'info, Puja>,

  #[account(mut)]
  pub user: Signer<'info>,

  pub system_program: Program<'info, System>,
  pub rent: Sysvar<'info, Rent>,
}

#[error_code]
pub enum SubastasError {
    #[msg("La subasta ya ha sido iniciada")]
    SubastaYaIniciada,
    #[msg("La subasta no ha sido iniciada")]
    SubastaNoIniciada,
    #[msg("La subasta ya ha sido finalizada")]
    SubastaYaFinalizada,
    #[msg("La subasta no ha sido finalizada")]
    SubastaNoFinalizada,
    #[msg("El importe de la puja debe ser mayor al actual")]
    PujaInsuficiente,
    #[msg("La subasta no está activa")]
    SubastaNoActiva,
    #[msg("Solo el creador puede iniciar la subasta")]
    SoloCreadorPuedeIniciar,
    #[msg("Solo el creador puede finalizar la subasta")]
    SoloCreadorPuedeFinalizar,
    #[msg("No se puede pujar en una subasta finalizada")]
    NoPujarEnSubastaFinalizada,
}
