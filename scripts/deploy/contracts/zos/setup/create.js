/* eslint-disable-next-line security/detect-child-process */
const { execSync } = require('child_process')
const TIMEOUT = 1 * 60 * 60 // 1 hour

function create(
    contract,
    args,
    verbose = true
) {
    const flags = verbose ? '-v' : '-s'

    const initializerConfiguration = args ? `--init initialize --args ${args.join(',')}` : ''

    return execSync(`npx zos create ${contract} ${initializerConfiguration} ${flags} --timeout ${TIMEOUT}`)
        .toString()
        .trim()
}

module.exports = create
