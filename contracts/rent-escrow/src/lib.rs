#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, contracterror, Address, Env, Map};

/// Minimum rent amount in stroops/token-units to prevent micro-escrow spam
pub const MIN_RENT: i128 = 100;

/// Number of ledgers in a day, assuming ~5-second ledger close times
/// (24 * 60 * 60) / 5 = 17280
pub const DAY_IN_LEDGERS: u32 = 17280;

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

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct RoommateState {
    pub expected: i128,
    pub paid: i128,
}

/// The rent escrow data structure.
#[contracttype]
#[derive(Clone)]
pub struct RentEscrow {
    pub landlord: Address,
    pub rent_amount: i128,
    pub roommates: Map<Address, RoommateState>,
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

        let mut roommate_states = Map::new(&env);
        for (address, expected) in roommates.iter() {
            roommate_states.set(address, RoommateState {
                expected,
                paid: 0,
            });
        }

        env.storage().persistent().set(&DataKey::Escrow, &RentEscrow {
            landlord,
            rent_amount,
            roommates: roommate_states,
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

        let mut state = escrow.roommates.get(from.clone()).ok_or(Error::InvalidAmount)?;
        state.paid += amount;
        escrow.roommates.set(from.clone(), state);

        env.storage().persistent().set(&DataKey::Escrow, &escrow);

        Ok(())
    }

    /// Calculate the total amount funded by all roommates.
    pub fn get_total_funded(env: Env) -> i128 {
        let escrow: RentEscrow = env.storage()
            .persistent()
            .get(&DataKey::Escrow)
            .expect("escrow not initialized");

        let mut total: i128 = 0;
        for (_, state) in escrow.roommates.iter() {
            total += state.paid;
        }
        total
    }

    /// Check whether the total contributions meet or exceed the rent goal.
    pub fn is_fully_funded(env: Env) -> bool {
        let total_funded = Self::get_total_funded(env.clone());
        let escrow: RentEscrow = env.storage()
            .persistent()
            .get(&DataKey::Escrow)
            .expect("escrow not initialized");

        total_funded >= escrow.rent_amount
    }

    /// Release total rent to the landlord if fully funded.
    pub fn release(env: Env) -> Result<(), Error> {
        let total_contributed = Self::get_total_funded(env.clone());

        let escrow: RentEscrow = env.storage()
            .persistent()
            .get(&DataKey::Escrow)
            .expect("escrow not initialized");

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

    /// Retrieve the paid balance for a specific roommate.
    pub fn get_balance(env: Env, from: Address) -> i128 {
        let escrow: RentEscrow = env.storage()
            .persistent()
            .get(&DataKey::Escrow)
            .expect("escrow not initialized");

        match escrow.roommates.get(from) {
            Some(state) => state.paid,
            None => 0,
        }
    }
}

#[cfg(test)]
mod test;
