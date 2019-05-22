#!/bin/bash
# THIS SCRIPT USES SLITHER TO VALIDATE THAT THE CURRENT KEEPER CONTRACTS ARE UPGRADEABLE
# for more info about Slither contract upgradeability checks, check out the link below
# https://github.com/crytic/slither/wiki/Upgradeability-Checks#proxy-contract
# Setup zos lib
git clone https://github.com/zeppelinos/zos
cd zos/packages/lib
npm install
rm contracts/mocks/WithConstructorImplementation.sol
cd ../../../
# run slither-check-upgradeability
files=$(pwd)/files
for entry in contracts/*/*/*
do
    echo $(basename "$entry") | cut -f 1 -d "." >> files
done
while IFS= read -r line
do
  slither-check-upgradeability zos/packages/lib/ UpgradeabilityProxy . "$line"
done < "$files"
rm "$files"
