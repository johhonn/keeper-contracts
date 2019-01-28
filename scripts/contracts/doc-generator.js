const { Report } = require('./report')
const fs = require('fs')

const contracts = [
    'DIDRegistry',
    'OceanToken',
    'Dispenser',
    'ServiceExecutionAgreement',
    'AccessConditions',
    'FitchainConditions',
    'ComputeConditions',
    'PaymentConditions'
]

contracts.forEach((contractName) => {
    const doc = new Report(contractName).generate()
    fs.writeFileSync(`./doc/contracts/${contractName}.md`, doc)
})
