/* eslint-disable no-console */
/* globals web3, artifacts */
const { execSync } = require('child_process')
const fs = require('fs')
const glob = require('glob')
const { argv } = require('yargs')
const { encodeCall } = require('zos-lib')
const contract = require('truffle-contract')

const { exportArtifacts, updateArtifacts } = require('./exportArtifacts')
const { setupWallet } = require('./setupWallet')
const pkg = require('../package.json')

const OceanToken = artifacts.require('OceanToken')
const ConditionStoreManager = artifacts.require('ConditionStoreManager')

process.chdir('../')

/*
 *-----------------------------------------------------------------------
 * Script configuration
 * -----------------------------------------------------------------------
 * Config variables for initializers
 */
const walletPath = './wallets.json'
// load NETWORK from environment
const NETWORK = process.env.NETWORK || 'development'
// load current version from package
const VERSION = `v${pkg.version}`
const timeout = 36000

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

// prepare multisig wallet
async function createWallet() {
    if (fs.existsSync(walletPath)) {
        console.log('wallets.json already exists')
    } else {
        await setupWallet(web3, artifacts)
    }
    return JSON.parse(fs.readFileSync(walletPath, 'utf-8').toString())
}

function getAddressForImplementation(contractName) {
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

async function requestContractUpgrade(contractName, upgraderRole, adminWallet) {
    const p = contractName.split(':')
    console.log(`Upgrading contract: ${p[1]} with ${p[0]}`)
    const implementationAddress = getAddressForImplementation(p[1])
    const upgradeCallData = encodeCall('upgradeTo', ['address'], [implementationAddress])
    const args = [
        require(`../artifacts/${p[1]}.${NETWORK.toLowerCase()}.json`).address,
        0, // value in ether
        upgradeCallData
    ]
    const tx = await adminWallet.submitTransaction(...args, { from: upgraderRole })
    console.log(`Upgraded contract: ${p[1]}`)
    updateArtifacts(p[1], p[0])
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
        upgrader: accounts[1],
        initialMinter: accounts[2],
        owner: process.env.OWNER_ROLE_ADDRESS || ownerWallet.address,
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
            await requestContractUpgrade(contractName, roles.upgrader, adminWallet)
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

    let didRegistryAddress,
        conditionStoreManagerAddress,
        oceanTokenAddress,
        dispenserAddress,
        templateStoreManagerAddress,
        agreementStoreManagerAddress,
        lockRewardConditionAddress,
        escrowRewardAddress,
        accessSecretStoreConditionAddress

    // v0.7
    if (contracts.indexOf('DIDRegistry') > -1) {
        didRegistryAddress = execSync(`npx zos create DIDRegistry --init initialize --args ${roles.owner} -v`).toString().trim()
    }

    if (contracts.indexOf('OceanToken') > -1) {
        oceanTokenAddress = execSync(`npx zos create OceanToken --init --args ${roles.owner},${roles.initialMinter} -v`).toString().trim()
    }

    if (oceanTokenAddress) {
        if (contracts.indexOf('Dispenser') > -1) {
            dispenserAddress = execSync(`npx zos create Dispenser --init initialize --args ${oceanTokenAddress},${roles.owner} -v`).toString().trim()
        }
    }

    if (contracts.indexOf('ConditionStoreManager') > -1) {
        conditionStoreManagerAddress = execSync(`npx zos create ConditionStoreManager`).toString().trim()
    }

    if (contracts.indexOf('TemplateStoreManager') > -1) {
        templateStoreManagerAddress = execSync(`npx zos create TemplateStoreManager --init initialize --args ${roles.owner} -v`).toString().trim()
    }

    if (conditionStoreManagerAddress) {
        if (contracts.indexOf('SignCondition') > -1) {
            execSync(`npx zos create SignCondition --init initialize --args ${roles.owner},${conditionStoreManagerAddress} -v`)
        }
        if (contracts.indexOf('HashLockCondition') > -1) {
            execSync(`npx zos create HashLockCondition --init initialize --args ${roles.owner},${conditionStoreManagerAddress} -v`)
        }
    }

    if (conditionStoreManagerAddress &&
        templateStoreManagerAddress &&
        didRegistryAddress) {
        if (contracts.indexOf('AgreementStoreManager') > -1) {
            agreementStoreManagerAddress = execSync(`npx zos create AgreementStoreManager --init initialize --args ${roles.owner},${conditionStoreManagerAddress},${templateStoreManagerAddress},${didRegistryAddress} -v`).toString().trim()
        }
    }

    if (conditionStoreManagerAddress &&
        oceanTokenAddress) {
        if (contracts.indexOf('LockRewardCondition') > -1) {
            lockRewardConditionAddress = execSync(`npx zos create LockRewardCondition --init initialize --args ${roles.owner},${conditionStoreManagerAddress},${oceanTokenAddress} -v`).toString().trim()
        }
        if (contracts.indexOf('EscrowReward') > -1) {
            escrowRewardAddress = execSync(`npx zos create EscrowReward --init initialize --args ${roles.owner},${conditionStoreManagerAddress},${oceanTokenAddress} -v`).toString().trim()
        }
    }

    if (conditionStoreManagerAddress &&
        agreementStoreManagerAddress) {
        if (contracts.indexOf('AccessSecretStoreCondition') > -1) {
            accessSecretStoreConditionAddress = execSync(`npx zos create AccessSecretStoreCondition --init initialize --args ${roles.owner},${conditionStoreManagerAddress},${agreementStoreManagerAddress} -v`).toString().trim()
        }
    }

    if (agreementStoreManagerAddress &&
        didRegistryAddress &&
        accessSecretStoreConditionAddress &&
        lockRewardConditionAddress &&
        escrowRewardAddress) {
        if (contracts.indexOf('EscrowAccessSecretStoreTemplate') > -1) {
            execSync(`npx zos create EscrowAccessSecretStoreTemplate --init initialize --args ${roles.owner},${agreementStoreManagerAddress},${didRegistryAddress},${accessSecretStoreConditionAddress},${lockRewardConditionAddress},${escrowRewardAddress} -v`)
        }
    }

    /*
     * -----------------------------------------------------------------------
     * setup deployed contracts
     * -----------------------------------------------------------------------
     */

    // TODO: @sebastian - please check
    if (agreementStoreManagerAddress) {
        const conditionStoreManager = await ConditionStoreManager.at(conditionStoreManagerAddress)
        await conditionStoreManager.initialize(
            roles.owner,
            agreementStoreManagerAddress,
            { from: roles.upgrader })
    }

    if (oceanTokenAddress) {
        const oceanToken = await OceanToken.at(oceanTokenAddress)

        if (dispenserAddress) {
            console.log(`adding dispenser as a minter ${dispenserAddress} from ${roles.initialMinter}`)
            await oceanToken.addMinter(
                dispenserAddress,
                { from: roles.initialMinter })
        }

        console.log(`Renouncing initialMinter as a minter from ${roles.initialMinter}`)
        await oceanToken.renounceMinter({ from: roles.initialMinter })
    }

    /*
     * -----------------------------------------------------------------------
     * Change admin privileges to multisig
     * -----------------------------------------------------------------------
     */
    console.log(`Setting zos-admin to MultiSigWallet ${roles.admin}`)
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
    const parameters = argv._
    const operation = parameters[2]
    const contracts = parameters.splice(3)
    deployContracts(operation, contracts)
        .then(() => cb())
        .catch(err => cb(err))
}
