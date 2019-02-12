/* eslint-disable no-console */
/* globals web3, artifacts */
const fs = require('fs')
const setupWallet = require('./setupWallet')

const walletPath = './wallets.json'
async function createWallet() {
    if (fs.existsSync(walletPath)) {
        console.log('wallets.json already exists')
    } else {
        await setupWallet(web3, artifacts)
    }
    return JSON.parse(fs.readFileSync(walletPath, 'utf-8').toString())
}

module.exports = createWallet
