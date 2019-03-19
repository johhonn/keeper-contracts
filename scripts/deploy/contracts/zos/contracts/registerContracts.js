/* eslint-disable no-console */
/* eslint-disable-next-line security/detect-child-process */
const { execSync } = require('child_process')
const zosCheck = require('../setup/check')

async function registerContracts(
    projectName,
    contracts,
    networkId,
    force,
    verbose = true
) {
    const flags = verbose ? '-v' : '-s'

    execSync(`npx zos add ${contracts.join(' ')} --skip-compile ${flags}`)

    const canDeploy = await zosCheck(
        projectName,
        contracts,
        networkId
    )

    if (!canDeploy) {
        throw new Error('aa')
    }

    // push them using zos
    execSync(`npx zos push ${force ? ' --force' : ''} --skip-compile ${flags}`)
}

module.exports = registerContracts
