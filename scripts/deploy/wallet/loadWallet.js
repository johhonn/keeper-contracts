/* eslint-disable no-console */
const contract = require('truffle-contract')
const MultiSigWalletWithDailyLimit =
    contract(require('@oceanprotocol/multisigwallet/build/contracts/MultiSigWalletWithDailyLimit.json'))

const walletPath = `${__dirname}/../../../wallets.json`

async function loadWallet(
    web3,
    walletName,
    stfu = false
) {
    if (!stfu) {
        console.log(`Loading '${walletName}' wallet`)
    }
    /* eslint-disable-next-line security/detect-non-literal-require */
    const wallets = require(walletPath)
    const walletAddress = wallets.find((wallet) => wallet.name === walletName).address
    MultiSigWalletWithDailyLimit.setProvider(web3.currentProvider)
    const wallet = await MultiSigWalletWithDailyLimit.at(walletAddress)
    if (!stfu) {
        console.log(`Loaded '${walletName}' wallet at '${wallet.address}'`)
    }
    return wallet
}

module.exports = loadWallet
