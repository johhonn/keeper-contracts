/* global artifacts, web3 */
const { argv } = require('yargs')
const deployContracts = require('../contracts/deployContracts')

module.exports = (cb) => {
    const parameters = argv._
    const operation = parameters[2]
    const contracts = parameters.splice(3)
    deployContracts(web3, artifacts, operation, contracts)
        .then(() => cb())
        .catch(err => cb(err))
}
