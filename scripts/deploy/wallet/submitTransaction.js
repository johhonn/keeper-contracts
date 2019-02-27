/* eslint-disable no-console */
const { encodeCall } = require('zos-lib')

async function submitTransaction(
    wallet,
    address,
    calldata,
    requester,
    verbose = true
) {
    if (verbose) {
        console.log(`Submitting transaction against: '${address}' with account: '${requester}'`)
    }

    const CallData = encodeCall(...calldata)

    const args = [
        address,
        0, // value in ether
        CallData
    ]

    const tx = await wallet.submitTransaction(
        ...args,
        { from: requester }
    )

    const submissionEvent = tx.logs.find((event) => event.event === 'Submission')
    if (!submissionEvent) {
        throw new Error(`Submitting transaction failed!`)
    }

    const confirmationEvent = tx.logs.find((event) => event.event === 'Confirmation')
    if (!confirmationEvent) {
        throw new Error(`Confirming transaction failed for account '${requester}'!`)
    }

    const transactionId = submissionEvent.args.transactionId.toNumber()

    if (verbose) {
        console.log(`Submitted transaction: '${transactionId}' from account: '${requester}'`)
    }

    return transactionId
}

module.exports = submitTransaction
