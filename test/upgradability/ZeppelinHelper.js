/* eslint-env mocha */
/* eslint-disable no-console */
/* global artifacts */
const { encodeCall } = require('zos-lib')
/* eslint-disable-next-line security/detect-child-process */
const { execSync } = require('child_process')
const glob = require('glob')
const fs = require('fs')

const MultiSigWallet = artifacts.require('MultiSigWallet')
const debug = ' -v'
const stdio = 'inherit'
module.exports = class ZeppelinHelper {
    constructor(contractName) {
        this.contractName = contractName
        this.dependencies = {
            DIDRegistry: [],
            OceanToken: [],
            OceanMarket: ['OceanToken'],
            OceanAuth: ['OceanMarket'],
            ServiceAgreement: [],
            AccessConditions: ['ServiceAgreement'],
            PaymentConditions: ['ServiceAgreement', 'OceanToken'],
            FitchainConditions: ['ServiceAgreement'],
            ComputeConditions: ['ServiceAgreement']
        }
    }

    addDependency(dep) {
        this.dependencies[this.contractName].push(dep)
    }

    async initialize(owner, upgrade) {
        this.owner = owner
        this.upgrade = upgrade
        this.addresses = {}
        // Wallet will be deployed only if upgrade test will be perform
        if (upgrade) {
            await this.loadWallet()
        }
        await this.createContract(this.contractName)
    }

    async createContract(contract) {
        if (this.addresses[contract] === undefined) {
            console.log('Initializing: ', contract)
            for (let dep of this.dependencies[contract]) {
                console.log('Adding dependencies ' + dep)
                await this.createContract(dep)
            }
            let cmd
            switch (contract) {
                case 'DIDRegistry':
                    cmd = 'DIDRegistry --init --args ' + this.owner
                    break
                case 'OceanToken':
                    cmd = 'OceanToken --init '
                    break
                case 'OceanMarket':
                    cmd = 'OceanMarket --init initialize --args ' + this.addresses['OceanToken'] + ',' + this.owner
                    break
                case 'OceanAuth':
                    cmd = 'OceanAuth --init initialize --args ' + this.addresses['OceanMarket']
                    break
                case 'ServiceAgreement':
                    cmd = 'ServiceAgreement'
                    break
                case 'PaymentConditions':
                    cmd = 'PaymentConditions --init initialize --args ' + this.addresses['ServiceAgreement'] + ',' + this.addresses['OceanToken']
                    break
                case 'AccessConditions':
                    cmd = 'AccessConditions --init initialize --args ' + this.addresses['ServiceAgreement']
                    break
                case 'ComputeConditions':
                    cmd = 'ComputeConditions --init initialize --args ' + this.addresses['ServiceAgreement']
                    break
                case 'FitchainConditions':
                    cmd = 'FitchainConditions --init initialize --args ' + this.addresses['ServiceAgreement'] + ',10,1'
                    break
                default:
                    throw Error(contract + ' Not implemented in create')
            }
            console.log('cmd:', cmd)
            let address = execSync('npx zos create ' + cmd + debug).toString().trim()
            // no need for wallet when upgrade is not to be tested
            if (this.upgrade) {
                execSync('npx zos set-admin ' + contract + ' ' + this.wallet.address + ' --yes' + debug)
            }
            this.addresses[contract] = address
        } else {
            console.log('skipping: ' + contract + ' already initialized')
        }
    }

    async restoreState(admin) {
        // remove config files
        try {
            execSync('rm zos.*', { stdio: 'ignore' })
        } catch (e) {
            console.log(e)
            console.log('Continuing anyways')
        }
        // set zos session parameters
        // we need to identify if the network is coverage or if its development
        let net = process.env.NETWORK
        console.log('Creating session with network:' + net + ' and admin:', admin)
        execSync('zos session --network ' + net + ' --from ' + admin)

        execSync('npx zos init oceanprotocol 0.1.poc --force')
        // add all contracts again
        for (let contract of ['DIDRegistry', 'OceanToken', 'OceanMarket',
            'OceanAuth', 'ServiceAgreement', 'AccessConditions', 'PaymentConditions',
            'FitchainConditions', 'ComputeConditions']
        ) {
            execSync('npx zos add ' + contract + ' --skip-compile' + debug)
        }
        // push contracts
        execSync('npx zos push --skip-compile' + debug)
    }

    async readImplementationFromJson() {
        let files = glob.sync('./zos.dev-*.json')
        /* eslint-disable-next-line security/detect-non-literal-fs-filename */
        const networkInfo = JSON.parse(fs.readFileSync(files[0]))
        let imp = networkInfo.contracts && networkInfo.contracts[this.contractName]
        this.implementationAddress = imp.address
        console.log('implementation:', this.implementationAddress)
    }

    async loadWallet() {
        let files = glob.sync('./wallet.json')
        if (files === undefined || files.length === 0) {
            // array empty or does not exist
            throw Error(`wallet config file not found`)
        }
        /* eslint-disable-next-line security/detect-non-literal-fs-filename */
        const wallet = JSON.parse(fs.readFileSync(files[0]))
        const walletAddress = wallet.wallet
        this.wallet = await MultiSigWallet.at(walletAddress)
        this.walletOwners = wallet.owners
    }

    getProxyAddress(contractName) {
        return this.addresses[contractName]
    }

    async upgradeToNewContract(newContractName) {
        console.log('adding')
        execSync('npx zos add ' + newContractName + ':' + this.contractName + ' --skip-compile -v', { stdio: stdio })
        console.log('pushing')
        execSync('npx zos push --skip-compile --force -v', { stdio: stdio })
        console.log('reading json')
        await this.readImplementationFromJson()
        console.log('Implementation', this.implementationAddress)
        const upgradeCallData = encodeCall('upgradeTo', ['address'], [this.implementationAddress])
        console.log('submit upgrade')
        let tx = await this.wallet.submitTransaction(this.addresses[this.contractName], 0, upgradeCallData, { from: this.walletOwners[0] })
        console.log('Storing tx')
        this.latestTransaction = tx.logs[0].args.transactionId.toNumber()
    }

    async approveLatestTransaction() {
        await this.wallet.confirmTransaction(this.latestTransaction, { from: this.walletOwners[1] })
    }
}
