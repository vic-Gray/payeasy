#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, Env};

#[test]
fn test_initialize() {
    let env = Env::default();
    let contract_id = env.register(RentEscrow, ());
    let client = RentEscrowClient::new(&env, &contract_id);
    
    let landlord = Address::generate(&env);
    let total_amount = 1000;
    let mut roommate_shares = Map::new(&env);
    roommate_shares.set(Address::generate(&env), 500);
    roommate_shares.set(Address::generate(&env), 500);
    let deadline = 1000;

    client.initialize(&landlord, &total_amount, &roommate_shares, &deadline);
}
