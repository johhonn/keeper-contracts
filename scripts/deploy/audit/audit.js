const loadWallet = require('../wallet/loadWallet')
const loadArtifacts = require('../contracts/artifacts/loadArtifacts')
const evaluateContracts = require('../contracts/evaluateContracts')
const createFunctionSignature = require('../contracts/artifacts/createFunctionSignature')

const NETWORK = process.env.NETWORK || 'development'

async function audit({
    web3,
    strict = false,
    entries = 20,
    testnet = true,
    verbose = true
} = {}) {
    const upgraderWallet = await loadWallet(
        web3,
        'upgrader',
        verbose
    )

    const max = entries
    const txCount = await upgraderWallet.transactionCount()
    const from = txCount - max > 0 ? txCount - max : 0
    const to = txCount.toNumber()

    const txIds = await upgraderWallet.getTransactionIds(
        from,
        to,
        true,
        true
    )

    const sortedTxIds = txIds.sort((a, b) => b.toNumber() - a.toNumber())

    const evaluatedContracts = await evaluateContracts({
        testnet,
        verbose
    })

    const artifacts = await loadArtifacts({
        contractNames: evaluatedContracts,
        networkName: NETWORK
    })

    /* eslint-disable-next-line no-console */
    console.log(
        '\n',
        'Wallet:', upgraderWallet.address
    )

    for (const txId of sortedTxIds) {
        const transaction = await upgraderWallet.transactions(
            txId
        )

        const sig = createFunctionSignature({
            functionName: 'upgradeTo',
            parameters: ['address']
        })

        const artifact = artifacts.find((a) => a.address === transaction.destination)
        const artifactName = artifact ? artifact.name : 'Unknown'

        const confirmations = await upgraderWallet.getConfirmations(
            txId
        )

        /* eslint-disable-next-line no-console */
        console.log(
            '\n',
            'Transaction ID:', txId.toString(),
            '\n',
            'Destination:', transaction.destination,
            '\n',
            'Contract:', `${artifactName}`,
            '\n',
            'Data is `upgradeTo` call:', transaction.data.startsWith(sig),
            '\n',
            'Confirmed from:', confirmations.join(', '),
            '\n',
            'Executed:', transaction.executed
        )
    }
}

module.exports = audit
