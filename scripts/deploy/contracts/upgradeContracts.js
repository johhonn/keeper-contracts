/* eslint-disable no-console */
const pkg = require('../../../package.json')

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
    stfu = false
) {
    // init zos

    const roles = await zosInit(
        web3,
        pkg.name,
        NETWORK,
        VERSION,
        stfu
    )

    // register contract upgrades in zos, force it
    await zosRegisterContracts(
        contracts,
        true,
        stfu
    )

    const upgraderWallet = await loadWallet(
        web3,
        'upgrader',
        stfu
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
            stfu
        )

        await updateArtifact(
            oldContractName,
            newContractName,
            VERSION,
            stfu
        )
    }

    return taskBook
}

module.exports = upgradeContracts
