/* eslint-env mocha */
/* eslint-disable no-console */
/* global artifacts */
const { encodeCall } = require('zos-lib')
/* eslint-disable-next-line security/detect-child-process */
const { execSync } = require('child_process')
const glob = require('glob')
const fs = require('fs')

const MultiSigWallet = artifacts.require('MultiSigWallet')

const stdio = 'inherit'// 'inherit'// 'ignore'

module.exports = class ZeppelinHelper {
    constructor(contractName) {
        this.contractName = contractName
    }

    async initialize(accounts) {
        let files = glob.sync('./zos.dev-*.json')
        let [owner, ...users] = accounts
        this.owner = owner
        this.users = users
        if (files === undefined || files.length === 0) {
            console.log('zos config file not found will initialize')
            execSync('./scripts/deployContractsForTest.sh ', { stdio: stdio })
        } else {
            console.log('zos config file found skipping initialization')
        }
        await this.loadWallet()
        await this.setInstances(true)
        this.initialImplementation = this.implementationAddress
    }

    async setInstances(proxy) {
        let files = glob.sync('./zos.dev-*.json')
        if (files === undefined || files.length === 0) {
            // array empty or does not exist
            throw Error('zos config file not found (zos.dev-*.json)')
        }
        /* eslint-disable-next-line security/detect-non-literal-fs-filename */
        const networkInfo = JSON.parse(fs.readFileSync(files[0]))
        const proxiesOfContract = networkInfo.proxies['oceanprotocol/' + this.contractName]
        if (!proxiesOfContract || proxiesOfContract.length === 0) {
            throw Error(`No deployed proxies of contract ${this.contractName} found`)
        } else if (proxiesOfContract.length > 1) {
            throw Error(`Multiple proxies of contract ${this.contractName} found`)
        }
        const implementationOfContract = networkInfo.contracts && networkInfo.contracts[this.contractName]
        if (!implementationOfContract) {
            throw Error(`No deployed logic contract for ${this.contractName}, make sure to call 'zos push'`)
        }
        if (proxy) this.proxyAddress = proxiesOfContract[0].address
        this.implementationAddress = implementationOfContract.address
    }

    async getInstance(contractName) {
        let files = glob.sync('./zos.dev-*.json')
        if (files === undefined || files.length === 0) {
            // array empty or does not exist
            throw Error('zos config file not found (zos.dev-*.json)')
        }
        /* eslint-disable-next-line security/detect-non-literal-fs-filename */
        const networkInfo = JSON.parse(fs.readFileSync(files[0]))
        const proxiesOfContract = networkInfo.proxies['oceanprotocol/' + contractName]
        if (!proxiesOfContract || proxiesOfContract.length === 0) {
            throw Error(`No deployed proxies of contract ${contractName} found`)
        } else if (proxiesOfContract.length > 1) {
            throw Error(`Multiple proxies of contract ${contractName} found`)
        }
        const implementationOfContract = networkInfo.contracts && networkInfo.contracts[contractName]
        if (!implementationOfContract) {
            throw Error(`No deployed logic contract for ${contractName}, make sure to call 'zos push'`)
        }
        return proxiesOfContract[0].address
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
        // const users = wallet.owners
        this.wallet = await MultiSigWallet.at(walletAddress)
        // this.owner = users[0]
        // this.users = users.slice(1, 3)
        // [this.owner, this.users] = wallet.owners
        let [owner, ...users] = wallet.owners
        this.owner = owner
        this.users = users
    }

    async downgradeToInitialImplementation() {
        const upgradeCallData = encodeCall('upgradeTo', ['address'], [this.initialImplementation])
        let tx = await this.wallet.submitTransaction(this.proxyAddress, 0, upgradeCallData, { from: this.owner })
        await this.wallet.confirmTransaction(tx.logs[0].args.transactionId.toNumber(), { from: this.users[0] })
    }

    async upgradeToNewContract(newContractName) {
        execSync('npx zos add ' + newContractName + ':' + this.contractName + ' --skip-compile -v', { stdio: stdio })
        execSync('npx zos push --network development --skip-compile --force -v', { stdio: stdio })
        await this.setInstances(false)
        const upgradeCallData = encodeCall('upgradeTo', ['address'], [this.implementationAddress])
        let tx = await this.wallet.submitTransaction(this.proxyAddress, 0, upgradeCallData, { from: this.owner })
        this.latestTransaction = tx.logs[0].args.transactionId.toNumber()
    }

    async approveLatestTransaction() {
        await this.wallet.confirmTransaction(this.latestTransaction, { from: this.users[0] })
    }
}
