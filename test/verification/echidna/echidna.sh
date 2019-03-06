#!/usr/bin/env sh
# OceanToken
docker run -t -v `pwd`:/src aabdulwahed/echidna:sloc-5.3 echidna-test /src/test/verification/echidna/OceanToken.sol TEST --config /src/test/verification/echidna/OceanToken.yaml
