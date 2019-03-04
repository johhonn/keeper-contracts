const contract = require('truffle-contract')

const MultiSigWalletWithDailyLimit =
    contract(require('@oceanprotocol/multisigwallet/build/contracts/MultiSigWalletWithDailyLimit.json'))

async function loadMultiSigWallet(
    web3
) {
    await MultiSigWalletWithDailyLimit.setProvider(web3.currentProvider)

    return MultiSigWalletWithDailyLimit
}

module.exports = loadMultiSigWallet
