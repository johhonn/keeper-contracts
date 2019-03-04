/* eslint-disable no-console */
const fs = require('fs')
const loadMultiSigWallet = require('./loadMultiSigWallet')

const walletPath = `${__dirname}/../../../wallets.json`

const loadedWallets = {}

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

    if (!loadedWallets[name]) {
        // load wallet object
        const MultiSigWalletWithDailyLimit = await loadMultiSigWallet(web3)

        // load the wallet onchain
        loadedWallets[name] = await MultiSigWalletWithDailyLimit.at(walletAddress)
    }

    const wallet = loadedWallets[name]

    if (verbose) {
        console.log(`Loaded '${name}' wallet at '${wallet}'`)
    }

    return wallet
}

module.exports = loadWallet
