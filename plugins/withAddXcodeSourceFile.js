const { withXcodeProject } = require('@expo/config-plugins')
const fs = require('fs')
const path = require('path')

const withAddXcodeSourceFile = (config, { files }) => withXcodeProject(config, async (config) => {
    const iosProjectFolder = path.join(__dirname, "../ios")
    const podspecsFolder = path.join(__dirname, "../podspecs")

    files.forEach(file => {
        fs.copyFileSync(`${podspecsFolder}/${file}`, `${iosProjectFolder}/${file}`)
    })

    return config

})

module.exports = withAddXcodeSourceFile