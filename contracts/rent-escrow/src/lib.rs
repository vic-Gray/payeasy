#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env};

/// Storage key definitions for persistent contract state.
///
/// Each variant maps to a unique slot in the Soroban persistent storage trie.
/// Using a `#[contracttype]` enum guarantees type-safe, collision-free keys.
///
/// - `DataKey::Landlord` - stores the landlord's `Address`
/// - `DataKey::Amount`   - stores the escrowed amount as `i128`
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum DataKey {
    Landlord,
    Amount,
}

#[contract]
pub struct RentEscrowContract;

#[contractimpl]
impl RentEscrowContract {
    /// Initialize the escrow contract.
    ///
    /// Persists `landlord` and `amount` to ledger storage so that the values
    /// survive across invocations and ledger closes.
    ///
    /// # Arguments
    /// * `env`      - The Soroban environment handle.
    /// * `landlord` - The `Address` of the landlord who controls the escrow.
    /// * `amount`   - The escrowed amount in stroops (i128).
    pub fn initialize(env: Env, landlord: Address, amount: i128) {
        landlord.require_auth();

        // Persist landlord address to ledger storage.
        env.storage().persistent().set(&DataKey::Landlord, &landlord);

        // Persist escrow amount to ledger storage.
        env.storage().persistent().set(&DataKey::Amount, &amount);
    }

    /// Update the escrow amount.
    ///
    /// Reads the stored landlord from persistent storage and verifies that
    /// `caller` matches before allowing the write.
    ///
    /// # Arguments
    /// * `env`        - The Soroban environment handle.
    /// * `caller`     - The invoker's `Address`; must equal the stored landlord.
    /// * `new_amount` - Replacement escrow amount in stroops (i128).
    pub fn set_amount(env: Env, caller: Address, new_amount: i128) {
        caller.require_auth();
        let landlord: Address = env.storage()
            .persistent()
            .get(&DataKey::Landlord)
            .expect("landlord not set");
        assert_eq!(caller, landlord, "only the landlord can update the amount");
        env.storage().persistent().set(&DataKey::Amount, &new_amount);
    }

    /// Retrieve the landlord address from persistent storage.
    ///
    /// Panics with a descriptive message if `initialize` has not been called.
    ///
    /// # Returns
    /// The `Address` of the landlord stored during initialization.
    pub fn get_landlord(env: Env) -> Address {
        env.storage()
            .persistent()
            .get(&DataKey::Landlord)
            .expect("landlord not set; call initialize first")
    }

    /// Retrieve the current escrow amount from persistent storage.
    ///
    /// Returns `0` if `initialize` has not yet been called, which is a safe
    /// default for an unsigned integer-style amount field.
    ///
    /// # Returns
    /// The escrowed amount in stroops as `i128`.
    pub fn get_amount(env: Env) -> i128 {
        env.storage()
            .persistent()
            .get(&DataKey::Amount)
            .unwrap_or(0)
    }
}
