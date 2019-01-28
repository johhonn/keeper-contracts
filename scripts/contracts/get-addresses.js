const fs = require('fs')

const root = `${__dirname}/../..`
const pkg = require(`${root}/package.json`)
const { version } = pkg
const network = process.argv[2]

// The location of the artifact files.
const buildDirectory = `${root}/artifacts/`

// Loop through all of the files.
fs.readdir(buildDirectory, (err, files) => {
    if (err) {
        throw err
    }

    files.forEach((filename) => {
        if (!filename.includes(`.${network}.`)) {
            return
        }

        const artifactString = fs.readFileSync(`${buildDirectory}${filename}`, 'utf8')
        const artifact = JSON.parse(artifactString)

        const contractName = filename.split('.')[0]

        // eslint-disable-next-line no-console
        console.log(`| ${contractName} | v${version} | ${artifact.address} |`)
    })
})
