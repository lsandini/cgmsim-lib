"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
const perlinNoise = require('@nickxbs/perlinnoise2');
function default_1(params) {
    const todayString = new Date().toISOString().substring(0, 10);
    const today = new Date(todayString);
    const defaultParams = {
        amplitude: 0.3,
        octaveCount: 3,
        persistence: 0.3,
        maxAbsValue: 0.05,
        seed: 'cgmsim',
        mode: 'daily'
    };
    const noise = perlinNoise.generatePerlinNoise(288, 1, Object.assign(Object.assign({}, defaultParams), params));
    const maxAbsoluteValue = (params === null || params === void 0 ? void 0 : params.maxAbsValue) ? params.maxAbsValue : defaultParams.maxAbsValue;
    const ratioMaxAbsoluteValue = 0.05 / maxAbsoluteValue;
    const perlinResult = [];
    for (let i = 0; i < noise.length; i++) {
        perlinResult.push({
            noise: (noise[i] / 10 - 0.05) / ratioMaxAbsoluteValue,
            order: (i),
            time: today.getTime() + (i) * 1000 * 60 * 5
        });
    }
    utils_1.default.info('Perlin noise object result: %o', perlinResult);
    return perlinResult;
}
exports.default = default_1;
//# sourceMappingURL=perlin.js.map