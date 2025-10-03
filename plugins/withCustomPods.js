const { mergeContents } = require('@expo/config-plugins/build/utils/generateCode')
const { withPodfile } = require('@expo/config-plugins')

const withCustomPods = (config, { pods }) => withPodfile(config, async (config) => {
    config.modResults.contents = mergeContents({
        tag: "custom-pods",
        src: config.modResults.contents,
        newSrc: pods.join("\n"),
        anchor: /use_native_modules/,
        offset: 0,
        comment: "#"
    }).contents

    return config
})

module.exports = withCustomPods