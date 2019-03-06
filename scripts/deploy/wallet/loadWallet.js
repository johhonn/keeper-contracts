/* eslint-disable no-console */
const fs = require('fs')
const loadMultiSigWallet = require('./loadMultiSigWallet')

const walletPath = `${__dirname}/../../../wallets.json`

let MultiSigWalletWithDailyLimit

async function loadWallet(
    web3,
    name,
    verbose = true
) {
    if (verbose) {
        console.log(`Loading '${name}' wallet`)
    }

    // read wallets from disk
    const wallets = JSON.parse(
        /* eslint-disable-next-line security/detect-non-literal-fs-filename */
        fs.readFileSync(walletPath, 'utf8')
    )

    // find the correct wallet
    const walletAddress = wallets.find((wallet) => wallet.name === name).address

    if (verbose) {
        console.log(`Loading '${name}' wallet at '${walletAddress}'`)
    }

    if (!MultiSigWalletWithDailyLimit) {
        // load wallet object
        MultiSigWalletWithDailyLimit = await loadMultiSigWallet(web3)
    }

    // load the wallet onchain
    const wallet = await MultiSigWalletWithDailyLimit.at(walletAddress)

    if (verbose) {
        console.log(`Loaded '${name}' wallet at '${wallet.address}'`)
    }

    return wallet
}

module.exports = loadWallet
