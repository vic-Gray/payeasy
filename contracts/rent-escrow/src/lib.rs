#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, contracterror, Address, Env, Map};

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    /// Contract has already been initialized
    AlreadyInitialized = 1,
    /// Contract has not been initialized yet
    NotInitialized = 2,
}

//RentEscrow defined already
#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Landlord,
    TotalAmount,
    Roommates,
    Contributions,
    Deadline,
    IsReleased,
}

#[contract]
pub struct RentEscrow;

#[contractimpl]
impl RentEscrow {
    /// Initialize the rent escrow agreement
    pub fn initialize(
        env: Env,
        landlord: Address,
        total_amount: i128,
        roommate_shares: Map<Address, i128>,
        deadline: u64,
    ) {
        
    }

    /// Roommates call this to contribute their share of the rent
    pub fn contribute(env: Env, from: Address, amount: i128) {
        // TODO: Implement contribution logic
        // 1. Verify 'from' is a valid roommate
        // 2. Transfer tokens from 'from' to the contract
        // 3. Update contributions map
    }

    /// Release the total rent to the landlord if fully funded
    pub fn release(env: Env) {
        // TODO: Implement release logic
        // 1. Verify total_amount is reached
        // 2. Transfer everything to the landlord
        // 3. Mark as released
    }

    /// Refund roommates if the deadline has passed and rent is not fully funded
    pub fn refund(env: Env, to: Address) {

    }
}

mod test;
