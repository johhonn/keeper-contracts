const contract = require('truffle-contract')

const MultiSigWalletWithDailyLimitArtifact =
    require('@oceanprotocol/multisigwallet/build/contracts/MultiSigWalletWithDailyLimit.json')

const MultiSigWalletWithDailyLimit =
    contract(MultiSigWalletWithDailyLimitArtifact)

async function loadMultiSigWallet(
    web3
) {
    await MultiSigWalletWithDailyLimit.setProvider(web3.currentProvider)

    return MultiSigWalletWithDailyLimit
}

module.exports = loadMultiSigWallet
