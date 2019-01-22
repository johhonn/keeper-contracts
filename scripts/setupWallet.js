/* eslint-disable no-console */
/* global artifacts, web3 */

// Run with npx truffle exec setUpWallet.js
const fs = require('fs')
const MultiSigWallet = artifacts.require('MultiSigWallet')

const accountAmount = 4
const threshold = 2

async function setUpWallet() {
    console.log('Setting up MultiSigWallet')
    // get accounts from web3
    const accounts = await web3.eth.getAccounts()

    if (accounts.length < accountAmount) {
        throw new Error('Unable to create wallet, too few accounts on this node.')
    }

    // create account list for MultiSig
    const multiSigAccounts = accounts.slice(0, accountAmount)

    const block = await web3.eth.getBlock('latest')
    const { gasLimit } = block

    console.log(
        'gasLimit', gasLimit,
        'multiSigAccounts', JSON.stringify(multiSigAccounts, null, 2),
        'threshold', threshold)

    // deploy wallet to the blockchain
    const wallet = await MultiSigWallet.new(
        multiSigAccounts,
        threshold,
        { from: accounts[0] })

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

module.exports = (cb) => {
    setUpWallet()
        .then(() => cb())
        .catch(err => cb(err))
}
