#!/bin/bash
# THIS SCRIPT USES SLITHER TO VALIDATE THAT THE CURRENT KEEPER CONTRACTS ARE UPGRADEABLE
# for more info about Slither contract upgradeability check, check out the link below
# https://github.com/crytic/slither/wiki/Upgradeability-Checks#proxy-contract

# Setup zos lib
git clone https://github.com/zeppelinos/zos
cd zos/packages/lib
npm install
rm contracts/mocks/WithConstructorImplementation.sol
cd ../../../

# run slither-check-upgradeability
contracts=$(pwd)/contracts
for entry in contracts/*/*/*
do
    echo $(basename "$entry") | cut -f 1 -d "." >> contracts
done
while IFS= read -r contract
do
  slither-check-upgradeability zos/packages/lib/ UpgradeabilityProxy . "$contract"
done < "$contracts"
rm "$contracts"
