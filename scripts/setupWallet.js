/* eslint-env mocha */
/* eslint-disable no-console */
/* global artifacts, web3 */

// Run with npx truffle exec setUpWallet.js
const fs = require('fs')
const MultiSigWallet = artifacts.require('MultiSigWallet')

const accountAmount = 4
const threshold = 2

async function setUpWallet() {
    console.log('Setting up MultiSigWallet')
    let accounts
    // get accounts from web3
    await web3.eth.getAccounts()
        .then((i) => { accounts = i })

    // create account list for MultiSig
    const multiSigAccounts = accounts.slice(0, accountAmount)

    // deploy wallet to the blockchain
    const wallet = await MultiSigWallet
        .new(multiSigAccounts, threshold, { from: accounts[0] })

    let walletAddresses = {
        wallet: wallet.address,
        owners: multiSigAccounts
    }

    const walletString = JSON.stringify(walletAddresses, null, 4)
    console.log('Wallet addresses:', walletString)

    // write to file
    await fs.writeFileSync(
        './wallet.json',
        walletString,
        'utf8', (err) => {
            if (err) {
                console.error('Error writing file:', err)
                return
            }
            console.log('Wallet file has been created')
        })
}

module.exports = function(cb) {
    setUpWallet()
        .then(() => cb())
        .catch(err => cb(err))
}
