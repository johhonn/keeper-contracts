/* eslint-disable no-console */

async function approveTransaction(txId, wallet, account) {
    await wallet.confirmTransaction(txId, { from: account })
}

module.exports = approveTransaction
