/* eslint-env mocha */
/* eslint-disable no-console */
/* global artifacts, web3 */

// Run with npx truffle exec setUpWallet.js
const fs = require('fs')
const MultiSigWallet = artifacts.require('MultiSigWallet')

global.artifacts = artifacts
global.web3 = web3

async function setUpWallet() {
    console.log('Setting accounts')
    let accounts
    await web3.eth.getAccounts().then((i) => { accounts = i })
    let multisig
    await MultiSigWallet.new(accounts.slice(0, 4), 2, { from: accounts[0] }).then(i => {
        multisig = i
    })

    let addresses = {
        wallet: multisig.address,
        owners: accounts.slice(0, 4)
    }
    console.log('Wallet address:', addresses)

    await fs.writeFileSync('./wallet.json', JSON.stringify(addresses, null, 4), 'utf8', (err) => {
        if (err) {
            console.error('Erro writing file:', err)
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
