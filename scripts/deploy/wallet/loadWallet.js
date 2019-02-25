/* eslint-disable no-console */
const contract = require('truffle-contract')

const walletPath = `${__dirname}/../../../wallets.json`

async function loadWallet(web3, walletName) {
    console.log(`Loading ${walletName} wallet`)
    /* eslint-disable-next-line security/detect-non-literal-fs-filename */
    const wallets = require(walletPath)
    const walletAddress = wallets.find((wallet) => wallet.name === walletName).address
    const MultiSigWalletWithDailyLimit =
        contract(require('@oceanprotocol/multisigwallet/build/contracts/MultiSigWalletWithDailyLimit.json'))
    MultiSigWalletWithDailyLimit.setProvider(web3.currentProvider)
    const wallet = await MultiSigWalletWithDailyLimit.at(walletAddress)
    console.log(`Loaded ${walletName} wallet at ${wallet.address}`)
    return wallet
}

module.exports = loadWallet
