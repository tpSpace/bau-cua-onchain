module bau_cua::bau_cua;

use sui::coin::{Self as coin, Coin};
use sui::event;
use sui::random::{Self as random, Random};
use sui::sui::SUI;

const NUM_SYMBOLS: u8 = 6;

public struct Bank has key {
    id: UID,
    treasury: Coin<SUI>,
    admin: address,
}

public struct PlayEvent has copy, drop {
    player: address,
    dice: vector<u8>, // 3 numbers in [0,5]
    total_bet: u64,
    winnings: u64,
}

/// Create a new bank funded by `initial`. Caller becomes admin.
public entry fun create_bank(initial: Coin<SUI>, ctx: &mut TxContext) {
    let bank = Bank {
        id: object::new(ctx),
        treasury: initial,
        admin: tx_context::sender(ctx),
    };
    transfer::share_object(bank);
}

/// Admin can withdraw from the bank.
public entry fun admin_withdraw(
    bank: &mut Bank,
    amount: u64,
    recipient: address,
    ctx: &mut TxContext,
) {
    assert!(tx_context::sender(ctx) == bank.admin, 1);
    let payout = coin::split(&mut bank.treasury, amount, ctx);
    transfer::public_transfer(payout, recipient);
}

/// Anyone can donate SUI to the bank.
public entry fun donate(bank: &mut Bank, gift: Coin<SUI>) {
    coin::join(&mut bank.treasury, gift);
}

/// Play one round using secure randomness from `sui::random::Random`.
/// - `bank`: shared game bank
/// - `rnd`: the global Random object (shared)
/// - `symbols`: vector of indices in [0,5]
/// - `amounts`: amounts in MIST matching `symbols`
/// - `stake`: coin whose value == sum(amounts)
public(package) entry fun play(
    bank: &mut Bank,
    rnd: &Random,
    symbols: vector<u8>,
    amounts: vector<u64>,
    stake: Coin<SUI>,
    ctx: &mut TxContext,
) {
    let sender = tx_context::sender(ctx);
    let n = vector::length(&symbols);
    assert!(n == vector::length(&amounts), 2);

    // Validate symbols and compute total_bet
    let mut i = 0;
    let mut total_bet = 0u64;
    while (i < n) {
        let s = *vector::borrow(&symbols, i);
        assert!(s < NUM_SYMBOLS, 3);
        total_bet = total_bet + *vector::borrow(&amounts, i);
        i = i + 1;
    };
    assert!(total_bet == coin::value(&stake), 4);

    // Derive a generator from global randomness (domain-separated)
    let mut g = random::new_generator(rnd, ctx);

    let d0 = random::generate_u8_in_range(&mut g, 0, 5);
    let d1 = random::generate_u8_in_range(&mut g, 0, 5);
    let d2 = random::generate_u8_in_range(&mut g, 0, 5);
    let mut dice = vector::empty<u8>();
    vector::push_back(&mut dice, d0);
    vector::push_back(&mut dice, d1);
    vector::push_back(&mut dice, d2);

    // Compute winnings: 2x per match, per your UI rules
    let mut winnings = 0u64;
    i = 0;
    while (i < n) {
        let sym = *vector::borrow(&symbols, i);
        let amt = *vector::borrow(&amounts, i);
        let mut matches = 0u64;
        if (sym == d0) { matches = matches + 1; };
        if (sym == d1) { matches = matches + 1; };
        if (sym == d2) { matches = matches + 1; };
        if (matches > 0) {
            winnings = winnings + (amt * 2 * matches);
        };
        i = i + 1;
    };

    assert!(coin::value(&bank.treasury) >= winnings, 5);

    // House keeps stake; pay winnings
    coin::join(&mut bank.treasury, stake);
    if (winnings > 0) {
        let payout = coin::split(&mut bank.treasury, winnings, ctx);
        transfer::public_transfer(payout, sender);
    };

    event::emit(PlayEvent {
        player: sender,
        dice,
        total_bet,
        winnings,
    });
}
