/* eslint-disable no-console */
const fs = require('fs')
const contract = require('truffle-contract')

// MultiSig Configuration
const accountAmount = 4
const threshold = 2
const dailiyLimitInEther = 5

async function setupWallet(web3) {
    console.log('Setting up MultiSigWallet')

    const MultiSigWalletWithDailyLimit =
        contract(require('@oceanprotocol/multisigwallet/build/contracts/MultiSigWalletWithDailyLimit.json'))

    await MultiSigWalletWithDailyLimit.setProvider(web3.currentProvider)

    // Workaround for a compatibility issue between web3@1.0.0-beta.29 and truffle-contract@3.0.3
    // https://github.com/trufflesuite/truffle-contract/issues/57#issuecomment-331300494
    if (typeof MultiSigWalletWithDailyLimit.currentProvider.sendAsync !== 'function') {
        MultiSigWalletWithDailyLimit.currentProvider.sendAsync = function() {
            return MultiSigWalletWithDailyLimit.currentProvider.send.apply(
                MultiSigWalletWithDailyLimit.currentProvider, arguments
            )
        }
    }

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
    const wallet = await MultiSigWalletWithDailyLimit.new(
        multiSigAccounts,
        threshold,
        web3.utils.toWei(dailiyLimitInEther.toString(10), 'Ether'), {
            gas: gasLimit,
            from: accounts[0]
        })

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

module.exports = {
    setupWallet
}
