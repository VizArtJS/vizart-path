import { sum } from 'd3-array';
import calculatePosition from './calculatePosition';

const partitelLayout = (data, height, buffMargin, minHeight) => {
  const layoutApi = {
    mainBars: null,
    subBars: [[], []],
    edges: [],
    keys: data.keys,
  };

  layoutApi.mainBars = [
    calculatePosition(
      data.data[0].map(d => sum(d)),
      0,
      height,
      buffMargin,
      minHeight
    ),
    calculatePosition(
      data.data[1].map(d => sum(d)),
      0,
      height,
      buffMargin,
      minHeight
    ),
  ];

  layoutApi.mainBars.forEach((pos, p) => {
    pos.forEach((bar, i) => {
      calculatePosition(data.data[p][i], bar.y, bar.y + bar.h, 0, 0).forEach(
        (sBar, j) => {
          sBar.key1 = p === 0 ? i : j;
          sBar.key2 = p === 0 ? j : i;
            layoutApi.subBars[p].push(sBar);
        }
      );
    });
  });
  layoutApi.subBars.forEach(sBar => {
    sBar.sort(
      (a, b) =>
        a.key1 < b.key1
          ? -1
          : a.key1 > b.key1 ? 1 : a.key2 < b.key2 ? -1 : a.key2 > b.key2 ? 1 : 0
    );
  });

  layoutApi.edges = layoutApi.subBars[0].map((p, i) => {
    return {
      key1: p.key1,
      key2: p.key2,
      y1: p.y,
      y2: layoutApi.subBars[1][i].y,
      h1: p.h,
      h2: layoutApi.subBars[1][i].h,
    };
  });

  return layoutApi;
};

export default partitelLayout;
