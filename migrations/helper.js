const fs = require('fs')
const pkg = require('./../package.json')

module.exports = {
    saveDefinition(network, artifact) {
        const targetDir = 'artifacts'

        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir)
        }

        fs.writeFileSync(
            `${targetDir}/${artifact.contractName}.${network}.json`,
            JSON.stringify({
                abi: artifact.abi,
                bytecode: artifact.bytecode,
                address: artifact.address,
                version: `v${pkg.version}`
            }, null, 2)
        )
    }
}
