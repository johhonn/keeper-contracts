#!/usr/bin/env sh
# OceanToken
docker run -t -v `pwd`:/src trailofbits/echidna echidna-test /src/test/verification/echidna/OceanTokenTest.sol OceanTokenTest --config /src/test/verification/echidna/OceanTokenTest.yaml
