const c1 = [-80, 80];
const c3 = [60, 220];
const b = 20;

const bb = _options =>
  (_options.chart.innerWidth -
    2 * (c1[1] - c1[0]) -
    2 * (c3[1] - c3[0]) -
    4 * b) /
  2;

export { c1, c3, b, bb };
