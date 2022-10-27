/* eslint-disable no-undef */
const Environment = require('jest-environment-node'); // or jest-environment-jsdom
const path = require('path');
// const { readFile } = require('fs').promises;
// const os = require('os');
const puppeteer = require('puppeteer');

// const DIR = path.join(os.tmpdir(), 'jest_puppeteer_global_setup');


let dirBase;

module.exports = class MyEnvironment extends Environment {
    constructor(config, context) {
        super(config, context);
        if (!dirBase) {
            dirBase = path.dirname(context.testPath.replace(__dirname, ''));
        }
        this.extBase = path.extname(context.testPath);
        this.fileBase = path.basename(context.testPath).replace(this.extBase, '');
        this.dirBase = dirBase;

    }

    async setup() {
        await super.setup();
        this.global.extBase = this.extBase;
        this.global.fileBase = this.fileBase;
        this.global.dirBase = this.dirBase;
		// const browser = await puppeteer.launch();
		// // store the browser instance so we can teardown it later
		// // this global is only available in the teardown but not in TestEnvironments
		// this.global.__BROWSER_GLOBAL__ = browser;
    }
    async teardown() {
        await super.teardown();
		// await this.global.__BROWSER_GLOBAL__.close();

    }

    getVmContext() {
        return super.getVmContext();
    }
};