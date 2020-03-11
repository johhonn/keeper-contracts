/* global artifacts, web3 */

const { name, version } = require(`${process.env.PWD}/package.json`)
const { argv } = require('yargs')
const { loadWallet, getAddresses, submitTransaction, confirmTransaction } = require('@oceanprotocol/dori')
const initializeContracts = require('./deploy/initializeContracts.js')
const evaluateContracts = require('./evaluateContracts.js')
const zosInit = require('../../../node_modules/@oceanprotocol/dori/src/contracts/zos/setup/init.js')
const zosCleanup = require('../../../node_modules/@oceanprotocol/dori/src/contracts/zos/setup/cleanup.js')
const zosGetProject = require('../../../node_modules/@oceanprotocol/dori/src/contracts/zos/handlers/getProject')
const zosGetDeployedContracts = require('../../../node_modules/@oceanprotocol/dori/src/contracts/zos/contracts/getDeployedContracts')
const zosGetProxyAddress = require('../../../node_modules/@oceanprotocol/dori/src/contracts/zos/contracts/addresses/getProxyAddress')
const submitTransactions = require('./templates/submitTransactions.js')

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
        const forceWalletCreation = false
        const VERSION = `v${version}`

        contracts = evaluateContracts({
                contracts,
                testnet,
                verbose
        })

        const zosProject = zosGetProject()
        // get deployed contracts
        const deployedContracts = await zosGetDeployedContracts(
            zosProject.name,
            contracts,
            networkId,
            verbose
        )

        // prepare addressBook
//        const addressBook = {}
//        for( const contractName of deployedContracts ){
//            proxyAddress = await zosGetProxyAddress(
//                zosProject.name,
//                contractName,
//                networkId
//            )
//            addressBook[contractName] = proxyAddress
//        }

        // nile addressBook
//        const addressBook = {
//            'AccessSecretStoreCondition': '0x45DE141F8Efc355F1451a102FB6225F1EDd2921d',
//            'ComputeExecutionCondition': '0xc63c6DA8Cfa99927E48B5d7784758fef4e5e1D6d',
//            'ConditionStoreManager': '0x39b0AA775496C5ebf26f3B81C9ed1843f09eE466',
//            'TemplateStoreManager': '0x9768c8ae44f1dc81cAA98F48792aA5730cAd2F73',
//            'EscrowReward': '0xeD4Ef53376C6f103d2d7029D7E702e082767C6ff',
//            'LockRewardCondition': '0xE30FC30c678437e0e8F78C52dE9db8E2752781a0'
//        }

        // pacific
        const addressBook = {
            'AccessSecretStoreCondition': '0x7FC6520Af3F0800d76A3e2FfE7b838c945ADBFE4',
            'ComputeExecutionCondition': '0xBbaCeaA102e62fEeE89eAF935aD757CD5aac844a',
            'ConditionStoreManager': '0xbD1dEd7ef05c31F81C54e913a23Da69E77d3e0EE',
            'TemplateStoreManager': '0xF2Cf3761c166c6D85d07299427821D18A4329cd1',
            'EscrowReward': '0x656Aa3D9b37A6eA770701ae2c612f760d9254A66',
            'LockRewardCondition': '0x7bf64DaCc7929A1e5466f7d9E575128abf1875f8'
        }


        // pacific addressBook
        // get roles
        const roles = await zosInit(
            web3,
            zosProject.name,
            NETWORK,
            VERSION,
            forceWalletCreation,
            verbose,
            true
        )
        await submitTransactions({
            web3,
            artifacts,
            addressBook,
            roles,
            verbose
        })
    }
    setup()
    .then(() => cb())
    .catch(err => cb(err))
}
