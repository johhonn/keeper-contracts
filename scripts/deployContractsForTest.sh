#! /usr/bin/env bash
# -----------------------------------------------------------------------
# Script configuration parameters for truffle test
# -----------------------------------------------------------------------
# Since we are running deterministic flag accounts[0] should be here
OWNER='0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1'
# Set zos session (network, admin, timeout)
zos session --network development --from 0x1df62f291b2e969fb0849d99d9ce41e2f137006e --expires 3600
# Setup multisig wallet
npx truffle exec scripts/setupWallet.js
# Get wallet address
MULTISIG=$(jq -r '.wallet' wallet.json)
# Deploy contracts
. ./scripts/deployContracts.sh