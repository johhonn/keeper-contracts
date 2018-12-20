#!/bin/bash

# remove ready flag if we deploy contracts
[ "${DEPLOY_CONTRACTS}" = "true" ] && rm -f /keeper-contracts/artifacts/ready

# only start ganache of we are required to it
if [ "${KEEPER_RPC_HOST}" = "localhost" ]
then

    if [ "${REUSE_DATABASE}" = "true" -a "${DATABASE_PATH}" != "" ]
    then
        echo "running ganache with a database path: ${DATABASE_PATH}"
        ganache-cli -d -b ${BLOCK_TIME} --hostname "${LISTEN_ADDRESS}" --port "${LISTEN_PORT}" --db "${DATABASE_PATH}" &
    else
        ganache-cli -d -b ${BLOCK_TIME} --hostname "${LISTEN_ADDRESS}" --port "${LISTEN_PORT}" &
    fi

    sleep 2
fi

if [ "${DEPLOY_CONTRACTS}" = "true" ]
then
    echo "deploy contracts is ${DEPLOY_CONTRACTS}"
    npm run clean
    npm run migrate -- --network=${NETWORK_NAME}

    # set flag to indicate contracts are ready
    [ "${DEPLOY_CONTRACTS}" = "true" ] && touch /keeper-contracts/artifacts/ready
fi

tail -f /dev/null
