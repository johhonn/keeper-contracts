const { submitTransaction, confirmTransaction } = require('@oceanprotocol/dori')

async function sendTransaction({
        web3,
        artifacts,
        roles,
        contractAddress,
        contractName,
        calldata,
        ownerWallet,
        verbose = true
} = {}) {
        console.log(roles)
        const transactionId = await submitTransaction(
            ownerWallet,
            contractAddress,
            calldata,
            roles.upgrader,
            verbose
        )
        return transactionId
}


module.exports = sendTransaction
