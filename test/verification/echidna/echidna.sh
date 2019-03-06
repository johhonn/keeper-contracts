#!/usr/bin/env sh
# OceanToken
docker run -t -v `pwd`:/src trailofbits/echidna echidna-test /src/test/verification/echidna/OceanToken.sol TEST --config /src/test/verification/echidna/OceanToken.yam
