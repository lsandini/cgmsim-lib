"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const perlinNoise = require('perlin-noise');
function default_1() {
    const time = Date.now();
    const noise = perlinNoise.generatePerlinNoise(288, 1, {
        amplitude: 0.3,
        octaveCount: 3,
        persistence: 0.3,
    });
    const myObject = [];
    for (let i = 0; i < noise.length; i++) {
        myObject.push({
            noise: noise[i] / 10 - 0.05,
            order: (i),
            time: time + (i) * 1000 * 60 * 5
        });
    }
    return myObject;
}
exports.default = default_1;
//# sourceMappingURL=perlin.js.map