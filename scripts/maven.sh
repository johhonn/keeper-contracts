#!/bin/bash

## Generating web3j stubs

shopt -s nullglob # Avoid literal evaluation if not files
mkdir ./tmp/

for file in artifacts/*.development.json
do
    tmpFile=$(basename $file)
    tmpFile=$(echo "$tmpFile" | sed "s/.development//")

    cp $file ./tmp/${tmpFile}

    web3j truffle generate --javaTypes ./tmp/${tmpFile} -o src/main/java -p com.oceanprotocol.keeper.contracts
done

rm -rf ./tmp/

mvn clean install
