/* eslint-disable no-console */
/* globals web3, artifacts */
const { execSync } = require('child_process')
const fs = require('fs')
const glob = require('glob')
const createWallet = require('../wallet/createWallet')
const loadWallet = require('../wallet/loadWallet')
const pkg = require('../../../package.json')
const { encodeCall } = require('zos-lib')

const OceanToken = artifacts.require('OceanToken')

/*
 *-----------------------------------------------------------------------
 * Script configuration
 * -----------------------------------------------------------------------
 * Config variables for initializers
 */

const NETWORK = process.env.NETWORK || 'development'
// load current version from package
const VERSION = `v${pkg.version}`
const timeout = 36000
const verbose = false
const flags = verbose ? '-v' : '-s'

// List of contracts
const contractNames = [
    'ConditionStoreManager',
    'SignCondition',
    'HashLockCondition',
    'OceanToken',
    'Dispenser',
    'LockRewardCondition',
    'DIDRegistry'
//    'ServiceExecutionAgreement',
//    'LockRewardCondition'
//    'AccessConditions',
//    'FitchainConditions',
//    'ComputeConditions',
//    'PaymentConditions',
]

async function getAddressForImplementation(contractName) {
    let files = glob.sync('./zos.*.json')
    if (files === undefined || files.length === 0) {
        // array empty or does not exist
        throw Error(`zos config file not found`)
    }
    /* eslint-disable-next-line security/detect-non-literal-fs-filename */
    const networkInfo = JSON.parse(fs.readFileSync(files[0]))
    let imp = networkInfo.contracts && networkInfo.contracts[contractName]
    return imp.address
}

async function requestContractUpgrade(contractName, deployerRole, adminWallet, contractAddress) {
    console.log(`Upgrading contract: ${contractName}`)
    const p = contractName.split(':')
    const implementationAddress = await getAddressForImplementation(p[1])
    const upgradeCallData = encodeCall('upgradeTo', ['address'], [implementationAddress])
    const args = [
        contractAddress || require(`../artifacts/${p[1]}.${NETWORK.toLowerCase()}.json`).address,
        0,
        upgradeCallData
    ]
    console.log(args)
    const tx = await adminWallet.submitTransaction(...args, { from: deployerRole })
    console.log(`Upgraded contract ${contractName}`)
    return tx.logs[0].args.transactionId.toNumber()
}

async function deployContracts(operation = 'deploy', contracts, contractAddress) {
    contracts = !contracts || contracts.length === 0 ? contractNames : contracts

    /*
     * -----------------------------------------------------------------------
     * Script setup
     * -----------------------------------------------------------------------
     */
    // Clean ups
    execSync('rm -f ./zos.* ./.zos.*', { stdio: 'ignore' })

    const accounts = await web3.eth.getAccounts()

    await createWallet()

    // Get wallet address
    const adminWallet = await loadWallet('upgrader') // zos admin MultiSig
    const ownerWallet = await loadWallet('owner') // contract admin

    const roles = {
        deployer: accounts[0],
        initialMinter: accounts[1],
        owner: ownerWallet.address,
        admin: adminWallet.address
    }

    // Set zos session (network, admin, timeout)
    execSync(`npx zos session --network ${NETWORK} --from ${roles.deployer} --expires ${timeout}`)

    /*
     * -----------------------------------------------------------------------
     * Project setup using zOS
     * -----------------------------------------------------------------------
     */

    // Initialize project zOS project
    // NOTE: Creates a zos.json file that keeps track of the project's details
    execSync(`npx zos init ${pkg.name} ${VERSION} ${flags}`)

    // Register contracts in the project as an upgradeable contract.
    execSync(`npx zos add ${contracts.join(' ')} --skip-compile ${flags}`)

    if (operation === 'deploy') {
        execSync(`npx zos push --skip-compile ${flags}`)
        return deploy(contracts, roles)
    } else if (operation === 'upgrade') {
        execSync(`npx zos push --force --skip-compile ${flags}`)

        let transactionId
        for (const contractName of contracts) {
            transactionId = await requestContractUpgrade(contractName, roles.deployer, adminWallet, contractAddress)
        }
        return transactionId
    }
}

async function deploy(contracts, roles) {
    // Deploy all implementations in the specified network.
    // NOTE: Creates another zos.<network_name>.json file, specific to the network used,
    // which keeps track of deployed addresses, etc.
    //    execSync('npx zos push  -v')

    // Request a proxy for the upgradeably contracts.
    // Here we run initialize which replace contract constructors
    // Since each contract initialize function could be different we can not use a loop
    // NOTE: A dapp could now use the address of the proxy specified in zos.<network_name>.json
    // instance=MyContract.at(proxyAddress)

    let conditionStoreManagerAddress,
        oceanTokenAddress,
        dispenserAddress,
        contractAddress

    // v0.7
    if (contracts.indexOf('StorageContract') > -1) {
        contractAddress = execSync(`npx zos create StorageContract ${flags}`).toString().trim()
    }

    if (contracts.indexOf('DIDRegistry') > -1) {
        contractAddress = execSync(`npx zos create DIDRegistry --init initialize --args ${roles.owner} ${flags}`).toString().trim()
    }

    if (contracts.indexOf('OceanToken') > -1) {
        contractAddress = oceanTokenAddress = execSync(`npx zos create OceanToken --init --args ${roles.owner},${roles.initialMinter} ${flags}`).toString().trim()
    }

    if (contracts.indexOf('Dispenser') > -1) {
        contractAddress = dispenserAddress = execSync(`npx zos create Dispenser --init initialize --args ${oceanTokenAddress},${roles.owner} ${flags}`).toString().trim()
    }

    if (contracts.indexOf('ConditionStoreManager') > -1) {
        contractAddress = conditionStoreManagerAddress = execSync(`npx zos create ConditionStoreManager ${flags}`).toString().trim()
    }

    if (conditionStoreManagerAddress && oceanTokenAddress) {
        if (contracts.indexOf('SignCondition') > -1) {
            contractAddress = execSync(`npx zos create SignCondition --init initialize --args ${conditionStoreManagerAddress} ${flags}`).toString().trim()
        }
        if (contracts.indexOf('HashLockCondition') > -1) {
            contractAddress = execSync(`npx zos create HashLockCondition --init initialize --args ${conditionStoreManagerAddress} ${flags}`).toString().trim()
        }
        if (contracts.indexOf('LockRewardCondition') > -1) {
            contractAddress = execSync(`npx zos create LockRewardCondition --init initialize --args ${conditionStoreManagerAddress},${oceanTokenAddress} ${flags}`).toString().trim()
        }
    }
    /*
     * -----------------------------------------------------------------------
     * setup deployed contracts
     * -----------------------------------------------------------------------
     */
    if (oceanTokenAddress) {
        const oceanToken = await OceanToken.at(oceanTokenAddress)

        if (oceanTokenAddress && dispenserAddress) {
            console.log(`adding dispenser as a minter ${dispenserAddress} from ${roles.initialMinter}`)
            await oceanToken.addMinter(
                dispenserAddress,
                { from: roles.initialMinter })
        }

        console.log(`Renouning initialMinter as a minter from ${roles.initialMinter}`)
        await oceanToken.renounceMinter({ from: roles.initialMinter })
    }

    /*
     * -----------------------------------------------------------------------
     * Change admin priviliges to multisig
     * -----------------------------------------------------------------------
     */
    console.log(`Setting zos-admin to MultiSigWsllet ${roles.admin}`)
    for (const contract of contracts) {
        execSync(`npx zos set-admin ${contract} ${roles.admin} --yes ${flags}`)
    }

    /*
     * -----------------------------------------------------------------------
     * export artifacts
     * -----------------------------------------------------------------------
     */
    // const { name } = require('../zos.json')
    // exportArtifacts(name, 'Library')

    console.log(contractAddress)
    return { contractAddress, oceanTokenAddress, dispenserAddress, conditionStoreManagerAddress }
}

module.exports = deployContracts
