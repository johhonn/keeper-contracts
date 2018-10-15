#!/bin/bash

## Generating web3j stubs

for file in build/contracts/*.json
do
    web3j truffle generate --javaTypes $file -o src/main/java -p com.oceanprotocol.keeper.contracts 
done

mvn clean package

