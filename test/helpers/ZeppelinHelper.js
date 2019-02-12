/* eslint-env mocha */
/* eslint-disable no-console */
const pkg = require('../../package')
const { encodeCall } = require('zos-lib')
/* eslint-disable-next-line security/detect-child-process */
const { execSync } = require('child_process')
const glob = require('glob')
const fs = require('fs')
const contract = require('truffle-contract')

const verbose = process.env.VERBOSE || false
const MultiSigWallet = contract(require('@oceanprotocol/multisigwallet/build/contracts/MultiSigWalletWithDailyLimit'))
const flags = verbose ? ' -v' : ' -s'
const stdio = 'inherit'

class ZeppelinHelperBase {
    async restoreState(admin) {
        if (!admin) {
            throw new Error('no account to restore state')
        }
        // remove config files
        try {
            execSync('rm -f zos.* .zos.*', { stdio: 'ignore' })
            if (verbose) {
                console.log('Cleaned zos session.')
            }
        } catch (e) {
            console.log(e)
            console.log('Continuing anyways')
        }
        // set zos session parameters
        // we need to identify if the network is coverage or if its development
        let network = process.env.NETWORK
        if (verbose) {
            console.log(`Creating session with network: ${network} and admin: ${admin}`)
        }
        execSync(`npx zos session --network ${network} --from ${admin} ${flags}`)

        execSync(`npx zos init oceanprotocol v${pkg.version} --force ${flags}`)
        // add all contracts again
        for (let contract of ['DIDRegistry', 'OceanToken', 'Dispenser',
            'ServiceExecutionAgreement', 'AccessConditions', 'PaymentConditions',
            'FitchainConditions', 'ComputeConditions']) {
            execSync(`npx zos add ${contract} --skip-compile ${flags}`)
        }
        // push contracts
        execSync(`npx zos push --skip-compile ${flags}`)
    }
}

module.exports = class ZeppelinHelper extends ZeppelinHelperBase {
    constructor(contractName) {
        super()
        this.contractName = contractName
        this.dependencies = {
            DIDRegistry: [],
            OceanToken: [],
            Dispenser: ['OceanToken'],
            ServiceExecutionAgreement: [],
            AccessConditions: ['ServiceExecutionAgreement'],
            PaymentConditions: ['ServiceExecutionAgreement', 'OceanToken'],
            FitchainConditions: ['ServiceExecutionAgreement'],
            ComputeConditions: ['ServiceExecutionAgreement']
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
            if (verbose) {
                console.log('Initializing: ', contract)
            }
            if (this.dependencies[contract]) {
                for (let dep of this.dependencies[contract]) {
                    if (verbose) {
                        console.log(`Adding dependencies ${dep}`)
                    }
                    await this.createContract(dep)
                }
            }
            let cmd
            switch (contract) {
                case 'DIDRegistry':
                    cmd = `DIDRegistry --init --args ${this.owner}`
                    break
                case 'OceanToken':
                    cmd = `OceanToken --init initialize --args ${this.owner}`
                    break
                case 'Dispenser':
                    cmd = `Dispenser --init initialize --args ${this.addresses['OceanToken']},${this.owner}`
                    break
                case 'ServiceExecutionAgreement':
                    cmd = `ServiceExecutionAgreement`
                    break
                case 'PaymentConditions':
                    cmd = `PaymentConditions --init initialize --args ${this.addresses['ServiceExecutionAgreement']},${this.addresses['OceanToken']}`
                    break
                case 'AccessConditions':
                    cmd = `AccessConditions --init initialize --args ${this.addresses['ServiceExecutionAgreement']}`
                    break
                case 'ComputeConditions':
                    cmd = `ComputeConditions --init initialize --args ${this.addresses['ServiceExecutionAgreement']}`
                    break
                case 'FitchainConditions':
                    cmd = `FitchainConditions --init initialize --args ${this.addresses['ServiceExecutionAgreement']},10,1`
                    break
                default:
                    throw Error(`${contract} Not implemented in create`)
            }
            if (verbose) {
                console.log('cmd:', cmd)
            }
            let address = execSync(`npx zos create ${cmd} ${flags}`).toString().trim()
            // no need for wallet when upgrade is not to be tested
            if (this.upgrade) {
                execSync(`npx zos set-admin ${contract} ${this.wallet.address} --yes ${flags}`)
            }
            this.addresses[contract] = address
        } else {
            if (verbose) {
                console.log(`Skipping: ${contract} already initialized`)
            }
        }
    }

    async readImplementationFromJson() {
        let files = glob.sync('./zos.dev-*.json')
        /* eslint-disable-next-line security/detect-non-literal-fs-filename */
        const networkInfo = JSON.parse(fs.readFileSync(files[0]))
        let imp = networkInfo.contracts && networkInfo.contracts[this.contractName]
        this.implementationAddress = imp.address
        if (verbose) {
            console.log('implementation:', this.implementationAddress)
        }
    }

    async loadWallet() {
        let files = glob.sync('./wallets.json')
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
        execSync(`npx zos add ${newContractName}:${this.contractName} --skip-compile ${flags}`, { stdio: stdio })
        execSync(`npx zos push --skip-compile --force ${flags}`, { stdio: stdio })
        await this.readImplementationFromJson()
        const upgradeCallData = encodeCall('upgradeTo', ['address'], [this.implementationAddress])
        let tx = await this.wallet
            .submitTransaction(
                this.addresses[this.contractName],
                0,
                upgradeCallData,
                { from: this.walletOwners[0] })
        this.latestTransaction = tx.logs[0].args.transactionId.toNumber()
    }

    async approveLatestTransaction() {
        await this.wallet.confirmTransaction(this.latestTransaction, { from: this.walletOwners[1] })
    }
}
