import liver from '../src/liver';
describe('Liver test', () => {
  beforeAll(() => {
    jest.useFakeTimers('modern');
    jest.setSystemTime(new Date('2001-01-01'));
  });

  afterAll(() => {
    jest.useRealTimers();
  });
  it.each([[[30, 10]], [[20, 8]], [[40, 14]]])('test liver %p', ([isf, cr]) => {
    const r = liver(
      isf,
      cr,
      { physical: 1, alcohol: 1 },
      250 / 3,
      'Europe/Helsinki', //2001-01-01 UTC+2
    );
    expect(r).toMatchSnapshot();
  });
});
