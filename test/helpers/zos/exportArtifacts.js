const fs = require('fs')
const glob = require('glob')
const pkg = require('../../../package.json')
const { generateFunctionSignaturesInABI } = require('./generateFunctionSignaturesInABI')
const buildDir = './build/contracts/'
const outDir = './artifacts/'

const network = process.env.NETWORK || 'development'
const version = `v${pkg.version}`

function exportArtifacts(name, substrFilter) {
    const zosFile = glob.sync('./zos.*.json', 'utf-8')[0]
    /* eslint-disable-next-line security/detect-non-literal-fs-filename */
    const migration = JSON.parse(fs.readFileSync(zosFile, 'utf-8').toString())
    const { contracts, proxies } = migration

    const contractNames = Object.keys(contracts)

    /* eslint-disable-next-line no-console */
    console.log(name, version, network)

    contractNames.forEach((contractName) => {
        if (contractName.indexOf(substrFilter) > -1) {
            /* eslint-disable-next-line no-console */
            console.log('Skipping library file: ', contractName)
        } else {
            /* eslint-disable-next-line security/detect-non-literal-fs-filename */
            const contract = JSON.parse(fs.readFileSync(`${buildDir}${contractName}.json`, 'utf-8').toString())

            generateFunctionSignaturesInABI(contract.abi)

            const artifact = {
                abi: contract.abi,
                bytecode: contract.bytecode,
                address: proxies[`${name}/${contractName}`][0].address,
                version
            }

            const filename = `${contractName}.${network.toLowerCase()}.json`

            /* eslint-disable-next-line security/detect-non-literal-fs-filename */
            fs.writeFileSync(`${outDir}${filename}`, JSON.stringify(artifact, null, 2))
        }
    })
}

module.exports = {
    exportArtifacts
}
