#!/bin/bash

# default to true in case it is not set
DEPLOY_CONTRACTS="${DEPLOY_CONTRACTS:-false}"

echo "deploy contracts is ${DEPLOY_CONTRACTS}"

if [ "${DEPLOY_CONTRACTS}" = "true" ]
then
    # remove ready flag if we deploy contracts
    rm -f /keeper-contracts/artifacts/ready

    npm run clean
    npm run compile
    export NETWORK="${NETWORK_NAME:-development}"
    npm run deploy -- --network ${NETWORK}

    # set flag to indicate contracts are ready
    touch /keeper-contracts/artifacts/ready
fi

# Fix file permissions
EXECUTION_UID=$(id -u)
EXECUTION_GID=$(id -g)
USER_ID=${LOCAL_USER_ID:-$EXECUTION_UID}
GROUP_ID=${LOCAL_GROUP_ID:-$EXECUTION_GID}
chown -R $USER_ID:$GROUP_ID /keeper-contracts/artifacts

tail -f /dev/null
