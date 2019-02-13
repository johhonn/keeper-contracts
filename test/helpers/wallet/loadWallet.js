/* eslint-disable no-console */
/* globals web3 */
const fs = require('fs')
const contract = require('truffle-contract')
const walletPath = './wallets.json'

async function loadWallet(name) {
    console.log(`Loading wallet ${name}`)
    /* eslint-disable-next-line security/detect-non-literal-fs-filename */
    const wallets = JSON.parse(fs.readFileSync(walletPath))
    const walletAddress = wallets.find((wallet) => wallet.name === name).address
    const MultiSigWalletWithDailyLimit =
        contract(require('@oceanprotocol/multisigwallet/build/contracts/MultiSigWalletWithDailyLimit.json'))
    MultiSigWalletWithDailyLimit.setProvider(web3.currentProvider)
    const wallet = await MultiSigWalletWithDailyLimit.at(walletAddress)
    console.log(`Loaded wallet ${name} ${wallet.address}`)
    return wallet
}

module.exports = loadWallet
