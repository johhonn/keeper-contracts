/* eslint-env mocha */
/* eslint-disable no-console */
const pkg = require('../../package')
const { encodeCall } = require('zos-lib')
/* eslint-disable-next-line security/detect-child-process */
const { execSync } = require('child_process')
const glob = require('glob')
const fs = require('fs')
const loadWallet = require('./loadWallet')
const createWallet = require('./createWallet')

const verbose = process.env.VERBOSE || false
const stdio = 'inherit'
const network = process.env.NETWORK || 'development'

class ZeppelinHelperBase {
    async restoreState(admin) {
        if (!admin) {
            throw new Error('no account to restore state')
        }

        execSync('rm -f ./zos.* ./.zos.*', { stdio: 'ignore' })
        console.log('Cleaned zos session.')
        await createWallet()
        // Get wallet address
        const adminWallet = await loadWallet('upgrader') // zos admin MultiSig
        const ownerWallet = await loadWallet('owner') // contract admin

        // Set zos session (network, admin, timeout)
        // execSync(`npx zos session --network ${network} --from ${admin} --expires ${timeout}`)
        console.log(`Creating session with network: ${network} and admin: ${admin}`)
        execSync(`npx zos session --network ${network} --from ${admin} -v`)
        execSync(`npx zos init oceanprotocol v${pkg.version} --force -v`)
        // add all contracts again
        console.log('adding contracts')
        const contracts = ['DIDRegistry', 'OceanToken', 'Dispenser', 'EpochLibrary', 'StorageContract']
        execSync(`npx zos add ${contracts.join(' ')} --skip-compile -v`)
        // push contracts
        console.log('pushing contracts')
        execSync(`npx zos push --skip-compile -v`)
        return adminWallet
    }
}

module.exports = class ZeppelinHelper extends ZeppelinHelperBase {
    constructor(contractName) {
        super()
        this.contractName = contractName
        this.dependencies = {
            DIDRegistry: [],
            OceanToken: [],
            EpochLibrary: [],
            Dispenser: ['OceanToken']
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
            this.wallet = await loadWallet('upgrader')
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
                case 'StorageContract':
                    cmd = `StorageContract`
                    break
                case 'EpochLibrary':
                    cmd = `EpochLibrary --init`
                    break
                case 'DIDRegistry':
                    cmd = `DIDRegistry --init --args ${this.owner}`
                    break
                case 'OceanToken':
                    cmd = `OceanToken --init initialize --args ${this.owner}`
                    break
                case 'Dispenser':
                    cmd = `Dispenser --init initialize --args ${this.addresses['OceanToken']},${this.owner}`
                    break
                default:
                    throw Error(`${contract} Not implemented in create`)
            }
            if (verbose) {
                console.log('cmd:', cmd)
            }
            let address = execSync(`npx zos create ${cmd} -v`).toString().trim()
            // no need for wallet when upgrade is not to be tested
            if (this.upgrade) {
                execSync(`npx zos set-admin ${contract} ${this.wallet.address} --yes -v`)
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

    getProxyAddress(contractName) {
        return this.addresses[contractName]
    }

    async upgradeToNewContract(newContractName, account) {
        execSync(`npx zos add ${newContractName}:${this.contractName} --skip-compile -v`, { stdio: stdio })
        execSync(`npx zos push --skip-compile --force -v`, { stdio: stdio })
        await this.readImplementationFromJson()
        const upgradeCallData = encodeCall('upgradeTo', ['address'], [this.implementationAddress])
        let tx = await this.wallet.submitTransaction(
            this.addresses[this.contractName], 0, upgradeCallData,
            { from: account }
        )
        this.latestTransaction = tx.logs[0].args.transactionId.toNumber()
    }

    async approveLatestTransaction(account) {
        await this.wallet.confirmTransaction(
            this.latestTransaction, { from: account }
        )
    }
}
