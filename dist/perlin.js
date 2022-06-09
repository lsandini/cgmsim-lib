"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
const perlinNoise = require('@nickxbs/perlinnoise2');
function default_1(params) {
    const todayString = new Date().toISOString().substring(0, 10);
    const today = new Date(todayString);
    if (!params) {
        const result = [];
        for (let i = 0; i < 288; i++) {
            result.push({
                noise: 0,
                order: i,
                time: today.getTime() + (i) * 1000 * 60 * 5
            });
        }
        return result;
    }
    const noise = perlinNoise.generatePerlinNoise(288, 1, Object.assign({}, params));
    const maxAbsValue = (params === null || params === void 0 ? void 0 : params.maxAbsValue) ? params.maxAbsValue : 0.05;
    const ratioMaxAbsoluteValue = (1 / maxAbsValue) / 2;
    const perlinResult = [];
    for (let i = 0; i < noise.length; i++) {
        perlinResult.push({
            noise: (noise[i] / ratioMaxAbsoluteValue - maxAbsValue),
            order: (i),
            time: today.getTime() + (i) * 1000 * 60 * 5
        });
    }
    utils_1.default.info('Perlin noise object result: %o', perlinResult);
    return perlinResult;
}
exports.default = default_1;
//# sourceMappingURL=perlin.js.map