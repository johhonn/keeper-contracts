/* eslint-disable no-console */
/* globals web3, artifacts */
const { execSync } = require('child_process')
const fs = require('fs')
const glob = require('glob')
const { exportArtifacts } = require('./exportArtifacts')
const { setupWallet } = require('./setupWallet')
const pkg = require('../package.json')
const { encodeCall } = require('zos-lib')
const contract = require('truffle-contract')

const OceanToken = artifacts.require('OceanToken')

process.chdir('../')

/*
 *-----------------------------------------------------------------------
 * Script configuration
 * -----------------------------------------------------------------------
 * Config variables for initializers
 */
const walletPath = './wallets.json'
// FitchainConditions config
// const stake = '10'
// const maxSlots = '1'
// load NETWORK from environment
const NETWORK = process.env.NETWORK || 'development'
// load current version from package
const VERSION = `v${pkg.version}`
const timeout = 36000

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

// prepare multisig wallet
async function createWallet() {
    if (fs.existsSync(walletPath)) {
        console.log('wallets.json already exists')
    } else {
        await setupWallet(web3, artifacts)
    }
    return JSON.parse(fs.readFileSync(walletPath, 'utf-8').toString())
}

async function getAddressForImplementation(contractName) {
    let files = glob.sync('./zos.dev-*.json')
    if (files === undefined || files.length === 0) {
        // array empty or does not exist
        throw Error(`zos config file not found`)
    }
    /* eslint-disable-next-line security/detect-non-literal-fs-filename */
    const networkInfo = JSON.parse(fs.readFileSync(files[0]))
    let imp = networkInfo.contracts && networkInfo.contracts[contractName]
    return imp.address
}

async function loadWallet(name) {
    console.log(`Loading ${name} wallet`)
    /* eslint-disable-next-line security/detect-non-literal-fs-filename */
    const wallets = JSON.parse(fs.readFileSync(walletPath))
    const walletAddress = wallets.find((wallet) => wallet.name === name).address
    const MultiSigWalletWithDailyLimit =
        contract(require('@oceanprotocol/multisigwallet/build/contracts/MultiSigWalletWithDailyLimit.json'))
    MultiSigWalletWithDailyLimit.setProvider(web3.currentProvider)
    const wallet = await MultiSigWalletWithDailyLimit.at(walletAddress)
    console.log(`Loaded ${name} wallet at ${wallet.address}`)
    return wallet
}

async function requestContractUpgrade(contractName, deployerRole, adminWallet) {
    const p = contractName.split(':')
    console.log(`Upgrading contract: ${p[1]} with ${p[0]}`)
    const implementationAddress = await getAddressForImplementation(p[1])
    const upgradeCallData = encodeCall('upgradeTo', ['address'], [implementationAddress])
    const args = [
        require(`../artifacts/${p[1]}.${NETWORK.toLowerCase()}.json`).address,
        0,
        upgradeCallData
    ]
    const tx = await adminWallet.submitTransaction(...args, { from: deployerRole })
    console.log(`Upgraded contract: ${p[1]}`)
    return tx.logs[0].args.transactionId.toNumber()
}

async function deployContracts(operation = 'deploy', contracts) {
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
    execSync(`npx zos init ${pkg.name} ${VERSION} -v`)

    // Register contracts in the project as an upgradeable contract.
    execSync(`npx zos add ${contracts.join(' ')} --skip-compile -v`)

    if (operation === 'deploy') {
        execSync(`npx zos push --skip-compile -v`)
        await deploy(contracts, roles)
    } else if (operation === 'upgrade') {
        execSync(`npx zos push --force --skip-compile -v`)

        for (const contractName of contracts) {
            // const transactionId =
            await requestContractUpgrade(contractName, roles.deployer, adminWallet)
        }
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
        dispenserAddress

    // v0.7
    if (contracts.indexOf('DIDRegistry') > -1) {
        execSync(`npx zos create DIDRegistry --init initialize --args ${roles.owner}`)
    }

    if (contracts.indexOf('OceanToken') > -1) {
        oceanTokenAddress = execSync(`npx zos create OceanToken --init --args ${roles.owner},${roles.initialMinter} -v`).toString().trim()
    }

    if (contracts.indexOf('Dispenser') > -1) {
        dispenserAddress = execSync(`npx zos create Dispenser --init initialize --args ${oceanTokenAddress},${roles.owner} -v`).toString().trim()
    }

    if (contracts.indexOf('ConditionStoreManager') > -1) {
        conditionStoreManagerAddress = execSync(`npx zos create ConditionStoreManager`).toString().trim()
    }

    if (conditionStoreManagerAddress && oceanTokenAddress) {
        if (contracts.indexOf('SignCondition') > -1) {
            execSync(`npx zos create SignCondition --init initialize --args ${conditionStoreManagerAddress} -v`)
        }
        if (contracts.indexOf('HashLockCondition') > -1) {
            execSync(`npx zos create HashLockCondition --init initialize --args ${conditionStoreManagerAddress} -v`)
        }
        if (contracts.indexOf('LockRewardCondition') > -1) {
            execSync(`npx zos create LockRewardCondition --init initialize --args ${conditionStoreManagerAddress},${oceanTokenAddress} -v`)
        }
    }

    // v0.6
    //    execSync(`npx zos create DIDRegistry --init initialize --args ${OWNER} -v`)
    //    const tokenAddress = execSync(`npx zos create OceanToken --init --args ${OWNER} -v`).toString().trim()
    //    const dispenserAddress = execSync(`npx zos create Dispenser --init initialize --args ${tokenAddress},${OWNER} -v`).toString().trim()
    //    const serviceExecutionAgreementAddress = execSync(`npx zos create ServiceExecutionAgreement -v`).toString().trim()
    //    execSync(`npx zos create AccessConditions --init initialize --args ${serviceExecutionAgreementAddress} -v`)
    //    execSync(`npx zos create PaymentConditions --init initialize --args ${serviceExecutionAgreementAddress},${tokenAddress} -v`)
    //    execSync(`npx zos create FitchainConditions --init initialize --args ${serviceExecutionAgreementAddress},${stake},${maxSlots} -v`)
    //    execSync(`npx zos create ComputeConditions --init initialize --args ${serviceExecutionAgreementAddress} -v`)

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
        execSync(`npx zos set-admin ${contract} ${roles.admin} --yes`)
    }

    /*
     * -----------------------------------------------------------------------
     * export artifacts
     * -----------------------------------------------------------------------
     */
    const { name } = require('../zos.json')
    exportArtifacts(name)
}

module.exports = (cb, a) => {
    const operation = process.argv[4]
    const contracts = process.argv.splice(5)
    deployContracts(operation, contracts)
        .then(() => cb())
        .catch(err => cb(err))
}
