/* eslint-disable no-console */
const { execSync } = require('child_process')
const fs = require('fs')
const glob = require('glob')
const { encodeCall } = require('zos-lib')

const stdio = 'inherit'
const verbose = false
const flags = verbose ? '-v' : '-s'

async function upgradeToNewContract(contractName,
    newContractName,
    proxyAddress,
    wallet,
    account) {
    execSync(`npx zos add ${newContractName}:${contractName} --skip-compile ${flags}`, { stdio })
    execSync(`npx zos push --skip-compile --force ${flags}`, { stdio })

    let files = glob.sync('./zos.*.json')
    /* eslint-disable-next-line security/detect-non-literal-fs-filename */
    const networkInfo = JSON.parse(fs.readFileSync(files[0]))
    let implementation = networkInfo.contracts && networkInfo.contracts[contractName]

    const upgradeCallData = encodeCall(
        'upgradeTo', ['address'], [implementation.address]
    )
    const tx = await wallet.submitTransaction(
        proxyAddress, 0, upgradeCallData,
        { from: account }
    )
    return tx.logs[0].args.transactionId.toNumber()
}

module.exports = upgradeToNewContract
