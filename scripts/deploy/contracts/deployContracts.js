/* eslint-disable no-console */
const { execSync } = require('child_process')
const pkg = require('../../../package.json')

const exportArtifacts = require('./artifacts/exportArtifacts')
const updateArtifacts = require('./artifacts/updateArtifacts')
const setupWallets = require('../wallet/setupWallets')
const loadWallet = require('../wallet/loadWallet')
const initializeContracts = require('./initializeContracts')
const requestContractUpgrade = require('./requestContractUpgrades')

/*
 *-----------------------------------------------------------------------
 * Script configuration
 * -----------------------------------------------------------------------
 * Config variables for initializers
 */
// load NETWORK from environment
const NETWORK = process.env.NETWORK || 'development'
// load current version from package
const VERSION = `v${pkg.version}`
const TIMEOUT = 36000

// List of contracts
const contractNames = [
    'ConditionStoreManager',
    'TemplateStoreManager',
    'AgreementStoreManager',
    'SignCondition',
    'HashLockCondition',
    'LockRewardCondition',
    'AccessSecretStoreCondition',
    'EscrowReward',
    'EscrowAccessSecretStoreTemplate',
    'OceanToken',
    'Dispenser',
    'DIDRegistry'
]

async function deployContracts(
    web3,
    artifacts,
    operation = 'deploy',
    contracts
) {
    contracts = !contracts || contracts.length === 0 ? contractNames : contracts

    /*
     * -----------------------------------------------------------------------
     * Script setup
     * -----------------------------------------------------------------------
     */
    // Clean ups
    execSync('rm -f ./zos.* ./.zos.*', { stdio: 'ignore' })

    // get ethereum accounts
    const accounts = await web3.eth.getAccounts()

    await setupWallets(web3, false)

    // Get wallet objects
    const adminWallet = await loadWallet(web3, 'upgrader') // zos admin MultiSig
    const ownerWallet = await loadWallet(web3, 'owner') // contract admin

    // build roles
    const roles = {
        deployer: accounts[0],
        upgrader: accounts[1],
        initialMinter: accounts[2],
        owner: ownerWallet.address,
        admin: adminWallet.address
    }

    // Set zos session (network, admin, timeout)
    execSync(`npx zos session --network ${NETWORK} --from ${roles.deployer} --expires ${TIMEOUT}`)

    /*
     * -----------------------------------------------------------------------
     * Project setup using zOS
     * -----------------------------------------------------------------------
     */

    // Initialize project zOS project
    // NOTE: Creates a zos.json file that keeps track of the project's details
    execSync(`npx zos init ${pkg.name} ${VERSION} -v`)

    // Register contracts in the project as an upgradeable contract.
    execSync(`npx zos add ${contracts.join(' ')} --skip-compile -v`)

    if (operation === 'deploy') {
        // push them using zos
        execSync(`npx zos push --skip-compile -v`)

        const addressBook = await initializeContracts(artifacts, contracts, roles)

        exportArtifacts(NETWORK, VERSION)

        return addressBook
    } else if (operation === 'upgrade') {
        // push them using zos and force
        execSync(`npx zos push --force --skip-compile -v`)

        for (const contractName of contracts) {
            const { newContractName, oldContractName } = contractName.split(':')

            const { address } = require(`${__dirname}/../../../artifacts/${oldContractName}.${NETWORK.toLowerCase()}.json`)
            await requestContractUpgrade(
                oldContractName,
                newContractName,
                address,
                adminWallet,
                roles.upgrader
            )

            updateArtifacts(oldContractName, newContractName, VERSION)
        }
    }
}

module.exports = deployContracts
