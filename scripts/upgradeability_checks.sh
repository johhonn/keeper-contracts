#!/bin/bash

# for more info about the upgradeability checks using slither
# https://github.com/crytic/slither/wiki/Upgradeability-Checks#proxy-contract
git clone https://github.com/zeppelinos/zos
cd zos/packages/lib
npm install
rm contracts/mocks/WithConstructorImplementation.sol
cd ../../../

files=$(pwd)/files
for entry in contracts/*/*/*
do
    echo `basename "$entry"` | cut -f 1 -d "." >> files
done
while IFS= read -r line
do
  slither-check-upgradeability zos/packages/lib/ UpgradeabilityProxy . "$line"
done < "$files"
rm "$files"
