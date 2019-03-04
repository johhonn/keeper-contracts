/* eslint-disable no-console */
const fs = require('fs')
const contract = require('truffle-contract')

const MultiSigWalletWithDailyLimit =
    contract(require('@oceanprotocol/multisigwallet/build/contracts/MultiSigWalletWithDailyLimit.json'))

const walletPath = `${__dirname}/../../../wallets.json`

async function loadWallet(
    web3,
    walletName,
    verbose = true
) {
    if (verbose) {
        console.log(`Loading '${walletName}' wallet`)
    }
    /* eslint-disable-next-line security/detect-non-literal-fs-filename */
    const wallets = JSON.parse(fs.readFileSync(walletPath, 'utf8'))
    const walletAddress = wallets.find((wallet) => wallet.name === walletName).address
    MultiSigWalletWithDailyLimit.setProvider(web3.currentProvider)
    const wallet = await MultiSigWalletWithDailyLimit.at(walletAddress)
    if (verbose) {
        console.log(`Loaded '${walletName}' wallet at '${wallet.address}'`)
    }
    return wallet
}

module.exports = loadWallet
