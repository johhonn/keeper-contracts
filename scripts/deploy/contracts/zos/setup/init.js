/* eslint-disable no-console */
/* eslint-disable-next-line security/detect-child-process */
const { execSync } = require('child_process')

const setupWallets = require('../../../wallet/setupWallets')
const loadWallet = require('../../../wallet/loadWallet')

const TIMEOUT = 36000
const bypassMultisigWallets = process.env.KEEPER_BYPASS_MULTISIG_WALLETS || false

async function init(
    web3,
    projectName,
    network,
    version,
    forceWalletCreation = false,
    verbose = true
) {
    const flags = verbose ? '-v' : '-s'

    // get ethereum accounts
    const accounts = await web3.eth.getAccounts()

    let upgraderWalletAddress,
        ownerWalletAddress

    if (bypassMultisigWallets) {
        console.log(`========================================================================`)
        console.log(`WARNING: You are bypassing assigning multi sig wallets to the contracts!`)
        console.log(`Be aware that this is a security risk! i hope you know what you are doing.`)
        console.log(`========================================================================`)
    } else {
        await setupWallets(
            web3,
            forceWalletCreation,
            verbose
        )

        // Get wallet objects
        // zos admin MultiSig
        const upgraderWallet = await loadWallet(
            web3,
            'upgrader',
            verbose
        )
        upgraderWalletAddress = upgraderWallet.address

        // contract admin
        const ownerWallet = await loadWallet(
            web3,
            'owner',
            verbose
        )

        ownerWalletAddress = ownerWallet.address
    }

    // build roles
    const roles = {
        deployer: accounts[0],
        upgrader: accounts[1],
        ownerWallet: bypassMultisigWallets ? accounts[2] : ownerWalletAddress,
        upgraderWallet: bypassMultisigWallets ? accounts[3] : upgraderWalletAddress
    }

    // Set zos session (network, admin, timeout)
    execSync(`npx zos session --network ${network} --from ${roles.deployer} --expires ${TIMEOUT} ${flags}`)

    /*
     * -----------------------------------------------------------------------
     * Project setup using zOS
     * -----------------------------------------------------------------------
     */

    // Initialize project zOS project
    // NOTE: Creates a zos.json file that keeps track of the project's details
    execSync(`npx zos init ${projectName} ${version} ${flags}`)

    return roles
}

module.exports = init
