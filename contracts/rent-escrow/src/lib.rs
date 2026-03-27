#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, contracterror, Address, Env, Map};

/// Minimum rent amount in stroops/token-units to prevent micro-escrow spam
pub const MIN_RENT: i128 = 100;

//RentEscrow defined already
/// Error types for the rent escrow contract.
#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq)]
pub enum Error {
    InvalidAmount = 1,
    InsufficientFunding = 2,
}

/// Storage key definitions for persistent contract state.
///
/// Using a `#[contracttype]` enum guarantees type-safe, collision-free keys.
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum DataKey {
    Escrow,
}

/// The rent escrow data structure.
#[contracttype]
#[derive(Clone)]
pub struct RentEscrow {
    pub landlord: Address,
    pub rent_amount: i128,
    pub roommates: Map<Address, i128>,
    pub contributions: Map<Address, i128>,
}

#[contract]
pub struct RentEscrowContract;

#[contractimpl]
impl RentEscrowContract {
    /// Initialize the escrow with landlord, rent amount, and roommates.
    ///
    /// Persists the escrow state to ledger storage so that the values
    /// survive across invocations and ledger closes.
    pub fn initialize(
        env: Env,
        landlord: Address,
        rent_amount: i128,
        roommates: Map<Address, i128>,
    ) -> Result<(), Error> {
        landlord.require_auth();

        if rent_amount <= 0 {
            return Err(Error::InvalidAmount);
        }

        env.storage().persistent().set(&DataKey::Escrow, &RentEscrow {
            landlord,
            rent_amount,
            roommates,
            contributions: Map::new(&env),
        });

        Ok(())
    }

    /// Roommates call this to contribute their share of the rent.
    pub fn contribute(env: Env, from: Address, amount: i128) -> Result<(), Error> {
        if amount <= 0 {
            return Err(Error::InvalidAmount);
        }

        from.require_auth();

        let mut escrow: RentEscrow = env.storage()
            .persistent()
            .get(&DataKey::Escrow)
            .expect("escrow not initialized");

        if !escrow.roommates.contains_key(from.clone()) {
            return Err(Error::InvalidAmount);
        }

        let current: i128 = escrow.contributions.get(from.clone()).unwrap_or(0);
        escrow.contributions.set(from.clone(), current + amount);

        env.storage().persistent().set(&DataKey::Escrow, &escrow);

        Ok(())
    }

    /// Release total rent to the landlord if fully funded.
    pub fn release(env: Env) -> Result<(), Error> {
        let escrow: RentEscrow = env.storage()
            .persistent()
            .get(&DataKey::Escrow)
            .expect("escrow not initialized");

        let mut total_contributed: i128 = 0;
        for (_, amount) in escrow.contributions.iter() {
            total_contributed += amount;
        }

        if total_contributed < escrow.rent_amount {
            return Err(Error::InsufficientFunding);
        }

        // TODO: Transfer total_contributed tokens to escrow.landlord

        Ok(())
    }

    /// Retrieve the landlord address from persistent storage.
    pub fn get_landlord(env: Env) -> Address {
        let escrow: RentEscrow = env.storage()
            .persistent()
            .get(&DataKey::Escrow)
            .expect("escrow not initialized; call initialize first");
        escrow.landlord
    }

    /// Retrieve the current rent amount from persistent storage.
    ///
    /// Returns 0 if the escrow has not been initialized.
    pub fn get_amount(env: Env) -> i128 {
        let result: Option<RentEscrow> = env.storage()
            .persistent()
            .get(&DataKey::Escrow);
        match result {
            Some(escrow) => escrow.rent_amount,
            None => 0,
        }
    }
}

#[cfg(test)]
mod test;
