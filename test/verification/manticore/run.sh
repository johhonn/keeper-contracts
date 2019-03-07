#!/usr/bin/env bash

truffle build \
&& docker run -t -v $(pwd):/src oceanprotocol/manticore:sloc-0.5.3 ./src/test/verification/manticore/mcore.sh
