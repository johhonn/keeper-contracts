/* eslint-disable no-console */
const pkg = require('../../../package.json')

const zosCleanup = require('./zos/setup/cleanup')
const zosInit = require('./zos/setup/init')
const zosGetDeployedContracts = require('./zos/contracts/getDeployedContracts')
const zosGetProject = require('./zos/handlers/getProject')
const zosGetImplementationAddress = require('./zos/contracts/addresses/getImplementationAddress')

const zosRegisterContracts = require('./zos/contracts/registerContracts')
const zosRequestContractUpgrade = require('./zos/contracts/requestContractUpgrades')

const loadArtifact = require('./artifacts/loadArtifact')
const updateContractArtifact = require('./artifacts/updateContractArtifact')
const exportLibraryArtifacts = require('./artifacts/exportLibraryArtifacts')

const loadWallet = require('../wallet/loadWallet')

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

const contractNames = require('./contracts.json')

async function upgradeContracts(
    web3,
    contracts = [],
    strict = false,
    verbose = true
) {
    contracts = !contracts || contracts.length === 0 ? contractNames : contracts

    if (verbose) {
        console.log(
            `Upgrading contracts: '${contracts.join(', ')}'`
        )
    }

    const networkId = await web3.eth.net.getId()

    await zosCleanup(
        networkId,
        false,
        false,
        verbose
    )

    // init zos
    const roles = await zosInit(
        web3,
        pkg.name,
        NETWORK,
        VERSION,
        false,
        verbose
    )

    const { name } = zosGetProject()

    // we can only upgrade if all of the contracts are already installed
    const deployedContracts = await zosGetDeployedContracts(
        name,
        contracts,
        networkId,
        verbose
    )

    if (deployedContracts.length !== contracts.length) {
        throw new Error(
            `Upgrade failed! Expected the contracts '${contracts.join(', ')}' to be deployed but only: '${deployedContracts.join(', ')}' was deployed.`
        )
    }

    // register contract upgrades in zos, force it
    await zosRegisterContracts(
        contracts,
        true,
        verbose
    )

    const upgraderWallet = await loadWallet(
        web3,
        'upgrader',
        verbose
    )

    const taskBook = {}

    for (const contractName of contracts) {
        const [newContractName, oldContractName] = contractName.indexOf(':') > -1 ? contractName.split(':') : [contractName, contractName]

        // get proxy address of current implementation
        const { address, implementation } = loadArtifact(
            oldContractName,
            NETWORK
        )

        const implementationAddress = zosGetImplementationAddress(
            oldContractName,
            networkId
        )

        if (implementation !== implementationAddress) {
            taskBook[oldContractName] = await zosRequestContractUpgrade(
                oldContractName,
                newContractName,
                address,
                upgraderWallet,
                roles,
                networkId,
                verbose
            )

            updateContractArtifact(
                oldContractName,
                newContractName,
                VERSION,
                networkId,
                NETWORK,
                verbose
            )
        } else {
            const msg = `Warning: no change in contract: ${oldContractName}!`
            console.warn(msg)
            if (strict) {
                throw new Error(msg)
            }
        }
    }

    if (Object.keys(taskBook).length > 0) {
        await exportLibraryArtifacts(
            networkId,
            NETWORK,
            VERSION,
            verbose
        )

        if (verbose) {
            console.log(
                `Tasks created: \n${JSON.stringify(taskBook, null, 2)}\nplease approve them in the wallet: '${upgraderWallet.address}'`
            )
        }
    }

    return taskBook
}

module.exports = upgradeContracts
