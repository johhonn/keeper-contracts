/* eslint-disable no-console */
const fs = require('fs')
const loadMultiSigWallet = require('./loadMultiSigWallet')

// MultiSig Configuration
const accountAmount = 4
const threshold = 2
const dailiyLimitInEther = 5

const walletPath = `${__dirname}/../../../wallets.json`

async function setupWallets(
    web3,
    force,
    verbose = true
) {
    /* eslint-disable-next-line security/detect-non-literal-fs-filename */
    if (!force && fs.existsSync(walletPath)) {
        if (verbose) {
            console.log('wallets.json already exists')
        }

        /* eslint-disable-next-line security/detect-non-literal-fs-filename */
        const walletsString = fs.readFileSync(walletPath, 'utf8').toString()

        return JSON.parse(walletsString)
    }

    if (verbose) {
        console.log('Setting up MultiSigWallets')
    }

    // get accounts from web3
    const accounts = await web3.eth.getAccounts()

    if (accounts.length < accountAmount) {
        throw new Error('Unable to create wallet, too few accounts on this node.')
    }

    const deployer = accounts[0]

    // create account list for MultiSig
    const multiSigAccounts = accounts.slice(1, accountAmount)
    const multiSigAccountsString = JSON.stringify(multiSigAccounts, null, 2)

    if (verbose) {
        console.log(`Using multisig owners:\n ${multiSigAccountsString}`)
    }

    const walletParameters = [
        multiSigAccounts,
        threshold,
        web3.utils.toWei(dailiyLimitInEther.toString(10), 'Ether')
    ]

    const txParameters = {
        from: deployer
    }

    const MultiSigWalletWithDailyLimit = await loadMultiSigWallet(web3)

    // deploy wallets to the blockchain
    const upgraderWallet = await MultiSigWalletWithDailyLimit.new(
        ...walletParameters,
        txParameters
    )

    const ownerWallet = await MultiSigWalletWithDailyLimit.new(
        ...walletParameters,
        txParameters
    )

    const wallets = [{
        name: 'upgrader',
        address: upgraderWallet.address
    }, {
        name: 'owner',
        address: ownerWallet.address
    }]

    const walletsString = JSON.stringify(wallets, null, 4)

    if (verbose) {
        console.log(`Wallets created:\n ${walletsString}`)
    }

    // write to file
    /* eslint-disable-next-line security/detect-non-literal-fs-filename */
    fs.writeFileSync(walletPath, walletsString, 'utf8')

    return wallets
}

module.exports = setupWallets
