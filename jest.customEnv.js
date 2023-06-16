/* eslint-disable no-undef */
const Environment = require('jest-environment-node'); // or jest-environment-jsdom
const path = require('path');

let dirBase;

module.exports = class MyEnvironment extends Environment {
    constructor(config, context) {
        super(config, context);
        if (!dirBase) {
            dirBase = path.dirname(context.testPath.replace(__dirname, ''));
        }
        this.extBase = path.extname(context.testPath);
        this.fileBase = path
            .basename(context.testPath)
            .replace(this.extBase, '');
        this.dirBase = dirBase;
    }

    async setup() {
        await super.setup();
        this.global.extBase = this.extBase;
        this.global.fileBase = this.fileBase;
        this.global.dirBase = this.dirBase;
    }
    async teardown() {
        await super.teardown();
    }

    getVmContext() {
        return super.getVmContext();
    }
};
