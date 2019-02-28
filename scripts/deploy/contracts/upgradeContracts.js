/* eslint-disable no-console */

const pkg = require('../../../package.json')

const zosCleanup = require('./zos/cleanup')
const zosInit = require('./zos/init')
const zosRegisterContracts = require('./zos/registerContracts')
const zosRequestContractUpgrade = require('./zos/requestContractUpgrades')
const updateArtifact = require('./artifacts/updateArtifact')
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

const artifactsDir = `${__dirname}/../../../artifacts/`

async function upgradeContracts(
    web3,
    contracts,
    verbose = true
) {
    if (contracts.find((contract) => contract.indexOf(':') === -1)) {
        throw new Error(`Bad input please use 'NewContract:OldContract'`)
    }

    if (verbose) {
        console.log(`Upgrading contracts: '${contracts.join(', ')}'`)
    }

    await zosCleanup(
        web3,
        false,
        verbose
    )

    // init zos
    const roles = await zosInit(
        web3,
        pkg.name,
        NETWORK,
        VERSION,
        verbose
    )

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
        const [newContractName, oldContractName] = contractName.split(':')

        /* eslint-disable-next-line security/detect-non-literal-require */
        const artifact = require(`${artifactsDir}${oldContractName}.${NETWORK.toLowerCase()}.json`)

        // get proxy address of current implementation
        const { address } = artifact

        taskBook[oldContractName] = await zosRequestContractUpgrade(
            oldContractName,
            newContractName,
            address,
            upgraderWallet,
            roles,
            verbose
        )

        await updateArtifact(
            oldContractName,
            newContractName,
            VERSION,
            verbose
        )
    }

    if (verbose) {
        console.log(
            `Tasks created: \n${JSON.stringify(taskBook, null, 2)}\nplease approve them in the wallet: '${upgraderWallet.address}'`
        )
    }

    return taskBook
}

module.exports = upgradeContracts
