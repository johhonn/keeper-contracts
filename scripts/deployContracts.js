/* eslint-disable no-console */
/* globals web3, artifacts */
const { execSync } = require('child_process')
const fs = require('fs')
const pkg = require('../package.json')
const { exportArtifacts } = require('./exportArtifacts')
const { setupWallet } = require('./setupWallet')

const OceanToken = artifacts.require('OceanToken.sol')

process.chdir('../')

/*
 *-----------------------------------------------------------------------
 * Script configuration
 * -----------------------------------------------------------------------
 * Config variables for initializers
 */
const walletPath = './wallet.json'
// FitchainConditions config
const stake = '10'
const maxSlots = '1'
// load NETWORK from environment
const NETWORK = process.env.NETWORK || 'development'
// load current version from package
const VERSION = `v${pkg.version}`

// List of contracts
const contracts = [
    'DIDRegistry',
    'OceanToken',
    'Dispenser',
    'ServiceExecutionAgreement',
    'AccessConditions',
    'FitchainConditions',
    'ComputeConditions',
    'PaymentConditions'
]

// prepare multisig wallet
async function createWallet() {
    if (fs.existsSync(walletPath)) {
        console.log('wallet.json already exists')
    } else {
        await setupWallet(web3, artifacts)
    }
    return JSON.parse(fs.readFileSync(walletPath, 'utf-8').toString())
}

async function deployContracts() {
    /*
     * -----------------------------------------------------------------------
     * Script setup
     * -----------------------------------------------------------------------
     */
    // Clean ups
    execSync('rm -f ./zos.* ./.zos.*', { stdio: 'ignore' })

    const accounts = await web3.eth.getAccounts()

    const wallet = await createWallet()

    // Get wallet address
    const MULTISIG = wallet.wallet

    // Admin is the account used to deploy and manage upgrades.
    // After deployment the multisig wallet is set to Admin
    const ADMIN = accounts[0]
    const OWNER = accounts[1]

    // Set zos session (network, admin, timeout)
    execSync(`npx zos session --network ${NETWORK} --from ${ADMIN} --expires 36000`)

    /*
     * -----------------------------------------------------------------------
     * Project setup using zOS
     * -----------------------------------------------------------------------
     */

    // Initialize project zOS project
    // NOTE: Creates a zos.json file that keeps track of the project's details
    execSync(`npx zos init oceanprotocol ${VERSION} -v`)
    // Register contracts in the project as an upgradeable contract.
    for (const contract of contracts) {
        execSync(`npx zos add ${contract} --skip-compile -v`)
    }

    // Deploy all implementations in the specified network.
    // NOTE: Creates another zos.<network_name>.json file, specific to the network used,
    // which keeps track of deployed addresses, etc.
    execSync('npx zos push --skip-compile -v')

    // Request a proxy for the upgradeably contracts.
    // Here we run initialize which replace contract constructors
    // Since each contract initialize function could be different we can not use a loop
    // NOTE: A dapp could now use the address of the proxy specified in zos.<network_name>.json
    // instance=MyContract.at(proxyAddress)
    execSync(`npx zos create DIDRegistry --init initialize --args ${OWNER} -v`)
    const tokenAddress = execSync(`npx zos create OceanToken --init --args ${OWNER} -v`).toString().trim()
    const dispenserAddress = execSync(`npx zos create Dispenser --init initialize --args ${tokenAddress},${OWNER} -v`).toString().trim()
    const serviceExecutionAgreementAddress = execSync(`npx zos create ServiceExecutionAgreement -v`).toString().trim()
    execSync(`npx zos create AccessConditions --init initialize --args ${serviceExecutionAgreementAddress} -v`)
    execSync(`npx zos create PaymentConditions --init initialize --args ${serviceExecutionAgreementAddress},${tokenAddress} -v`)
    execSync(`npx zos create FitchainConditions --init initialize --args ${serviceExecutionAgreementAddress},${stake},${maxSlots} -v`)
    execSync(`npx zos create ComputeConditions --init initialize --args ${serviceExecutionAgreementAddress} -v`)

    /*
     * -----------------------------------------------------------------------
     * setup deployed contracts
     * -----------------------------------------------------------------------
     */
    const oceanToken = await OceanToken.at(tokenAddress)
    await oceanToken.addMinter(
        dispenserAddress,
        { from: OWNER })

    /*
     * -----------------------------------------------------------------------
     * Change admin priviliges to multisig
     * -----------------------------------------------------------------------
     */
    console.log('setting admin to mutli sig wallet')
    for (const contract of contracts) {
        execSync(`npx zos set-admin ${contract} ${MULTISIG} --yes`)
    }

    /*
     * -----------------------------------------------------------------------
     * export artifacts
     * -----------------------------------------------------------------------
     */
    exportArtifacts()
}

module.exports = (cb) => {
    deployContracts()
        .then(() => cb())
        .catch(err => cb(err))
}
