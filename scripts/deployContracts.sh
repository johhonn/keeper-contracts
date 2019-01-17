#! /usr/bin/env bash

# -----------------------------------------------------------------------
# Script configuration
# -----------------------------------------------------------------------
# Admin is the account used to deploy and manage upgrades.
# After deployment the multisig wallet is set to Admin
ADMIN='0xf6b77193dfb4c1d94cb23ac8beb454fc3df840c5'
# Config variables for initializers
stake='10'
maxSlots='1'
# load NETWORK from environment
NETWORK=${NETWORK:-development}
# load current version from package
VERSION=v$(jq -r '.version' package.json)

# -----------------------------------------------------------------------
# Script setup
# -----------------------------------------------------------------------
# Set zos session (network, admin, timeout)
npx zos session --network $NETWORK --from $ADMIN --expires 36000
# Setup multisig wallet
npx truffle exec scripts/setupWallet.js
# Get wallet address
MULTISIG=$(jq -r '.wallet' wallet.json)
# Clean up
rm -f zos.*

# -----------------------------------------------------------------------
# Project setup using zOS
# -----------------------------------------------------------------------
# List of contracts
declare -a contracts=("DIDRegistry" "OceanToken" "Dispenser" "ServiceExecutionAgreement" "AccessConditions" "PaymentConditions" "FitchainConditions" "ComputeConditions")
# Initialize project zOS project
# NOTE: Creates a zos.json file that keeps track of the project's details
npx zos init oceanprotocol $VERSION -v
# Register contracts in the project as an upgradeable contract.
for contract in "${contracts[@]}"
do
    npx zos add $contract -v --skip-compile
done

# Deploy all implementations in the specified network.
# NOTE: Creates another zos.<network_name>.json file, specific to the network used,
# which keeps track of deployed addresses, etc.
npx zos push --skip-compile  -v
# Request a proxy for the upgradeably contracts.
# Here we run initialize which replace contract constructors
# Since each contract initialize function could be different we can not use a loop
# NOTE: A dapp could now use the address of the proxy specified in zos.<network_name>.json
# instance=MyContract.at(proxyAddress)
npx zos create DIDRegistry --init initialize -v
tokenAddress=$(npx zos create OceanToken --init --args $ADMIN -v)
npx zos create Dispenser --init initialize --args $tokenAddress,$ADMIN -v
serviceExecutionAgreementAddress=$(npx zos create ServiceExecutionAgreement -v)
npx zos create AccessConditions --init initialize --args $serviceExecutionAgreementAddress -v
npx zos create PaymentConditions --init initialize --args $serviceExecutionAgreementAddress,$tokenAddress -v
npx zos create FitchainConditions --init initialize --args $serviceExecutionAgreementAddress,$stake,$maxSlots -v
npx zos create ComputeConditions --init initialize --args $serviceExecutionAgreementAddress -v

# -----------------------------------------------------------------------
# Change admin priviliges to multisig
# -----------------------------------------------------------------------
for contract in "${contracts[@]}"
do
    npx zos set-admin $contract $MULTISIG --yes
done
