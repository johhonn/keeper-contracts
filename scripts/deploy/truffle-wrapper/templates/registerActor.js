const sendTransaction = require('../sendTransaction.js')
const { loadWallet } = require('@oceanprotocol/dori')

async function registerActor({
    web3,
    artifacts,
    contractAddress,
    upgrader,
    actor='provider',
    contractName = 'TemplateStoreManager',
    verbose = true
}={}){
    const calldata = [
        'registerTemplateActorType',
        ['string'],
        [actor]
    ]
    const ownerWallet = await loadWallet(
        web3,
        'owner',
        verbose
    )
    const transactionId = await sendTransaction({
        web3,
        artifacts,
        upgrader,
        contractAddress,
        contractName,
        calldata,
        ownerWallet,
        verbose
    })

    if (verbose) {
        console.log(`Contract  ${addressBook[contractName]} has a transaction Id: ${transactionId}`)
    }

    return transactionId
}

module.exports = registerActor
