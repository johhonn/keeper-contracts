/* eslint-disable no-console */
const loadWallet = require('./loadWallet')

async function confirmUpgrade(
    web3,
    transactionId,
    approver,
    stfu = false
) {
    const upgraderWallet = await loadWallet(
        web3,
        'upgrader',
        stfu
    )

    if (!stfu) {
        console.log(`Confirming transactionId '${transactionId}' from '${approver}'`)
    }

    await upgraderWallet.confirmTransaction(
        transactionId,
        { from: approver }
    )
}

module.exports = confirmUpgrade
