/* eslint-disable no-console */
async function confirmTransaction(
    wallet,
    transactionId,
    approver,
    verbose = true
) {
    if (verbose) {
        console.log(`Confirming transactionId: '${transactionId}' with account: '${approver}'`)
    }

    const tx = await wallet.confirmTransaction(
        transactionId,
        { from: approver }
    )

    const executionFailureEvent = tx.logs.find((event) => event.event === 'ExecutionFailure')

    if (executionFailureEvent) {
        throw new Error(
            `Execution of transactionId '${transactionId}' failed: ${JSON.stringify(executionFailureEvent)}`
        )
    }

    const executionEvent = tx.logs.find((event) => event.event === 'Execution')
    const executedTransactionId = executionEvent.args.transactionId.toNumber()

    if (transactionId !== executedTransactionId) {
        throw new Error(
            `Executed transactionIds do not match expected '${transactionId}' got '${executedTransactionId}'`
        )
    }

    if (verbose) {
        console.log(
            `Confirmed transactionId '${executedTransactionId}' with account: '${approver}'`
        )
    }
}

module.exports = confirmTransaction
