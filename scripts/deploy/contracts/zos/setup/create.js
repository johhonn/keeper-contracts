/* eslint-disable-next-line security/detect-child-process */
const { execSync } = require('child_process')

function create(
    contract,
    args,
    verbose = true
) {
    const flags = verbose ? '-v' : '-s'

    const initializerConfiguration = args ? `--init initialize --args ${args.join(',')}` : ''

    return execSync(`npx zos create ${contract} ${initializerConfiguration} ${flags}`)
        .toString()
        .trim()
}

module.exports = create
