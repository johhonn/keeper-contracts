const fs = require('fs')
const network = process.argv[2]

// The location of the artifact files.
const buildDirectory = `${process.env.PWD}/artifacts/`

// Loop through all of the files.
// eslint-disable-next-line security/detect-non-literal-fs-filename
fs.readdir(buildDirectory, (err, files) => {
    if (err) {
        throw err
    }

    const artifacts = files.filter((f) => f.includes(`.${network}.`))

    if (artifacts.length < 1) {
        return
    }

    // eslint-disable-next-line no-console
    console.log(`| ${'Contract'.padEnd(33)} | Version | ${'Address'.padEnd(44)} |`)

    // eslint-disable-next-line no-console
    console.log(`|-----------------------------------|---------|----------------------------------------------|`)

    artifacts.forEach((filename) => {
        const artifactString = fs.readFileSync(
            `${buildDirectory}${filename}`,
            'utf8'
        )
        const artifact = JSON.parse(artifactString)

        const contractName = filename.split('.')[0]

        // eslint-disable-next-line no-console
        console.log(`| ${contractName.padEnd(33)} | ${artifact.version} | \`${artifact.address}\` |`)
    })
})
