/* eslint-disable @typescript-eslint/no-require-imports */
// @ts-check

/**
 * @type {import("helpertypes").PartialDeep<import("sandhog").SandhogConfig>}
 */
const config = {
	...require("@wessberg/ts-config/sandhog.config.json"),
	logo: {
		url: "https://raw.githubusercontent.com/wessberg/cjstoesm/master/documentation/asset/logo.png",
		height: 150
	},
	featureImage: {
		height: 500,
		url: "https://raw.githubusercontent.com/wessberg/cjstoesm/master/documentation/asset/feature.gif"
	}
};

module.exports = config;
