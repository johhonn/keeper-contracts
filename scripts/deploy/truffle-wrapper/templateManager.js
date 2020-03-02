/* global artifacts, web3 */

const { name, version } = require(`${process.env.PWD}/package.json`)
const { argv } = require('yargs')
const { loadWallet } = require('@oceanprotocol/dori')
const { getAddresses } = require('@oceanprotocol/dori')
const initializeContracts = require('./deploy/initializeContracts.js')
const evaluateContracts = require('./evaluateContracts.js')
const zosInit = require('../../../node_modules/@oceanprotocol/dori/src/contracts/zos/setup/init.js')
const zosCleanup = require('../../../node_modules/@oceanprotocol/dori/src/contracts/zos/setup/cleanup.js')
const zosGetProject = require('../../../node_modules/@oceanprotocol/dori/src/contracts/zos/handlers/getProject')
const zosGetDeployedContracts = require('../../../node_modules/@oceanprotocol/dori/src/contracts/zos/contracts/getDeployedContracts')
const zosGetProxyAddress = require('../../../node_modules/@oceanprotocol/dori/src/contracts/zos/contracts/addresses/getProxyAddress')

const setupContracts = require('./deploy/setupContracts.js')

// load NETWORK from environment
const NETWORK = process.env.NETWORK || 'development'


module.exports = (cb) => {
    const parameters = argv._
    let contracts = []
    // setup
    async function setup () {
        const networkId = await web3.eth.net.getId()
        const testnet = false
        const verbose = true
        const deeperClean = true
        const forceWalletCreation = true
        const VERSION = `v${version}`

        contracts = evaluateContracts({
                contracts,
                testnet,
                verbose
        })
        const zosProject = zosGetProject()
        // we can only upgrade if all of the contracts are already installed
        const deployedContracts = await zosGetDeployedContracts(
            zosProject.name,
            contracts,
            networkId,
            verbose
        )
        const addressBook = {}
        for( const contractName of deployedContracts ){
            proxyAddress = await zosGetProxyAddress(
                zosProject.name,
                contractName,
                networkId
            )
            addressBook[contractName] = proxyAddress
        }
        const roles = await zosInit(
            web3,
            zosProject.name,
            NETWORK,
            VERSION,
            true,
            verbose,
            true
        )

        console.log(roles)

        await setupContracts({
            web3,
            artifacts,
            addressBook,
            roles,
            true
        })
    }

    setup()
    .then(() => cb())
    .catch(err => cb(err))
}
