/* eslint-disable no-console */
const pkg = require('../../../package.json')

const zosCleanup = require('./zos/cleanup')
const zosInit = require('./zos/init')
const zosRegisterContracts = require('./zos/registerContracts')
const initializeContracts = require('./initializeContracts')
const setupContracts = require('./setupContracts')
const zosSetAdmin = require('./zos/setAdmin')
const exportArtifacts = require('./artifacts/exportArtifacts')

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
    contracts,
    forceWalletCreation = false,
    verbose = true
) {
    contracts = !contracts || contracts.length === 0 ? contractNames : contracts

    if (contracts.find((contract) => contract.indexOf(':') > -1)) {
        throw new Error(`Bad input please use 'ContractName'`)
    }

    await zosCleanup(
        web3,
        true,
        verbose
    )

    if (verbose) {
        console.log(`Deploying contracts: '${contracts.join(', ')}'`)
    }

    const roles = await zosInit(
        web3,
        pkg.name,
        NETWORK,
        VERSION,
        forceWalletCreation,
        verbose
    )

    await zosRegisterContracts(
        contracts,
        false,
        verbose
    )

    const addressBook = await initializeContracts(
        contracts,
        roles,
        verbose
    )

    if (verbose) {
        console.log(
            `Contracts deployed to the proxies: \n${JSON.stringify(addressBook, null, 2)}`
        )
    }

    await setupContracts(
        artifacts,
        addressBook,
        roles,
        verbose
    )

    await zosSetAdmin(
        contracts,
        roles,
        verbose
    )

    const networkId = await web3.eth.net.getId()

    await exportArtifacts(
        NETWORK,
        networkId,
        VERSION,
        verbose
    )

    return addressBook
}

module.exports = deployContracts
