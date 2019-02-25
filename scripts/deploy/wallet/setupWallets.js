/* eslint-disable no-console */
const fs = require('fs')
const contract = require('truffle-contract')

// MultiSig Configuration
const accountAmount = 4
const threshold = 2
const dailiyLimitInEther = 5

const walletPath = `${__dirname}/../../../wallets.json`

async function setupWallets(
    web3,
    force
) {
    if (!force && fs.existsSync(walletPath)) {
        console.log('wallets.json already exists')
        return JSON.parse(fs.readFileSync(walletPath, 'utf-8').toString())
    }

    console.log('Setting up MultiSigWallets')

    const MultiSigWalletWithDailyLimit =
        contract(require('@oceanprotocol/multisigwallet/build/contracts/MultiSigWalletWithDailyLimit.json'))

    await MultiSigWalletWithDailyLimit.setProvider(web3.currentProvider)

    // get accounts from web3
    const accounts = await web3.eth.getAccounts()

    if (accounts.length < accountAmount) {
        throw new Error('Unable to create wallet, too few accounts on this node.')
    }

    const deployerRole = accounts[0]

    // create account list for MultiSig
    const multiSigAccounts = accounts.slice(1, accountAmount)
    const multiSigAccountsString = JSON.stringify(multiSigAccounts, null, 2)

    console.log(`Using multisig owners:\n ${multiSigAccountsString}`)

    const walletParameters = [
        multiSigAccounts,
        threshold,
        web3.utils.toWei(dailiyLimitInEther.toString(10), 'Ether')
    ]

    const txParameters = {
        from: deployerRole
    }

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
    console.log(`Wallets created:\n ${walletsString}`)

    // write to file
    fs.writeFileSync(
        walletPath,
        walletsString,
        'utf8', (err) => {
            if (err) {
                console.error('Error writing file:', err)
                return null
            }
            console.log('Wallets file has been created')
        })

    return wallets
}

module.exports = setupWallets
