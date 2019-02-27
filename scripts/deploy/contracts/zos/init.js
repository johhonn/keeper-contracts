/* eslint-disable no-console */
/* eslint-disable-next-line security/detect-child-process */
const { execSync } = require('child_process')

const setupWallets = require('../../wallet/setupWallets')
const loadWallet = require('../../wallet/loadWallet')

const TIMEOUT = 36000

async function init(
    web3,
    projectName,
    network,
    version,
    verbose = true
) {
    const flags = verbose ? '-v' : '-s'

    /*
     * -----------------------------------------------------------------------
     * Script setup
     * -----------------------------------------------------------------------
     */
    // Clean ups
    execSync('rm -f ./zos.* ./.zos.*', { stdio: 'ignore' })

    // get ethereum accounts
    const accounts = await web3.eth.getAccounts()

    await setupWallets(
        web3,
        false,
        verbose
    )

    // Get wallet objects
    // zos admin MultiSig
    const upgraderWallet = await loadWallet(
        web3,
        'upgrader',
        verbose
    )
    // contract admin
    const ownerWallet = await loadWallet(
        web3,
        'owner',
        verbose
    )

    // build roles
    const roles = {
        deployer: accounts[0],
        upgrader: accounts[1],
        initialMinter: accounts[2],
        ownerWallet: ownerWallet.address,
        upgraderWallet: upgraderWallet.address
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
