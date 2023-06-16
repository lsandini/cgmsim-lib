import { bolusTreatments, diffOptions, getPngSnapshot } from './inputTest';
import bolus from '../src/bolus';
import { Treatment } from '../src/Types';
const { toMatchImageSnapshot } = require('jest-image-snapshot');

const moment = require('moment');

const dia = 6;
const peak = 90;

describe('test bolus', () => {
    const date = new Date('2022-05-07T11:20:00Z');

    beforeEach(() => {
        jest.useFakeTimers('modern');
        jest.setSystemTime(date);
        expect.extend({ toMatchImageSnapshot });
    });

    afterAll(() => {
        jest.useRealTimers();
    });

    test('detection bolus', () => {
        let _date = moment('2022-05-06T16:30:00.000Z');
        jest.setSystemTime(_date.toDate());

        const result = bolus(
            bolusTreatments as unknown as Treatment[],
            dia,
            peak
        );

        expect(result).toMatchSnapshot();
    });
    test('non negative bolus after 60min', async () => {
        let _date = moment('2022-05-06T15:00:00.000Z');
        let insulinActive = 0;
        let insulinArr = [];

        for (let t = 0; t < 100; t++) {
            _date = _date.add(5, 'minutes');
            jest.setSystemTime(_date.toDate());
            const boluses = bolusTreatments as unknown as Treatment[];
            const _insulinActive = bolus(
                boluses.filter((b) => b.insulin > 0),
                dia,
                peak
            );
            expect(_insulinActive).toBeGreaterThanOrEqual(0);
            insulinActive += _insulinActive > 0 ? _insulinActive : 0;
            insulinArr.push(_insulinActive > 0 ? _insulinActive : 0);
        }
        expect(insulinActive).toMatchSnapshot();
        expect(insulinArr).toMatchSnapshot();
        const png = await getPngSnapshot(
            {
                type: 'single',
                values: insulinArr.map((sgv, index) => ({
                    key: index,
                    value: sgv,
                })),
            },
            { scaleY: true }
        );
        expect(png).toMatchImageSnapshot(diffOptions);
    });
});
