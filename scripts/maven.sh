#!/bin/bash

## Generating web3j stubs

shopt -s nullglob # Avoid literal evaluation if not files
for file in build/contracts/*.json
do
    web3j truffle generate --javaTypes $file -o src/main/java -p com.oceanprotocol.keeper.contracts
done

mvn clean install
