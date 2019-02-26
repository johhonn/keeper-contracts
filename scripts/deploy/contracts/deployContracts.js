/* eslint-disable no-console */
const pkg = require('../../../package.json')

const zosInit = require('./zos/init')
const zosRegisterContracts = require('./zos/registerContracts')
const initializeContracts = require('./initializeContracts')
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
    stfu = false
) {
    contracts = !contracts || contracts.length === 0 ? contractNames : contracts

    const roles = await zosInit(
        web3,
        pkg.name,
        NETWORK,
        VERSION,
        stfu
    )

    await zosRegisterContracts(
        contracts,
        false,
        stfu
    )

    const addressBook = await initializeContracts(
        artifacts,
        contracts,
        roles,
        stfu
    )

    await zosSetAdmin(
        contracts,
        roles,
        stfu
    )

    await exportArtifacts(
        NETWORK,
        VERSION,
        stfu
    )

    return addressBook
}

module.exports = deployContracts
