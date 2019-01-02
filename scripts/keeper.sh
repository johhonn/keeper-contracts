#!/bin/bash

echo "deploy contracts is ${DEPLOY_CONTRACTS}"

if [ "${DEPLOY_CONTRACTS}" = "true" ]
then
    echo "deploy contracts is ${DEPLOY_CONTRACTS}"

    # remove ready flag if we deploy contracts
    rm -f /keeper-contracts/artifacts/ready

    npm run clean
    npm run migrate -- --network=${NETWORK_NAME}

    # set flag to indicate contracts are ready
    touch /keeper-contracts/artifacts/ready
fi

tail -f /dev/null
