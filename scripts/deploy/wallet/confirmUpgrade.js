/* eslint-disable no-console */
const loadWallet = require('./loadWallet')
const confirmTransaction = require('./confirmTransaction')

async function confirmUpgrade(
    web3,
    transactionId,
    approver,
    verbose = true
) {
    const upgraderWallet = await loadWallet(
        web3,
        'upgrader',
        verbose
    )

    await confirmTransaction(
        upgraderWallet,
        transactionId,
        approver,
        verbose
    )
}

module.exports = confirmUpgrade
