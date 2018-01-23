import { set } from 'd3-collection';
import cloneDeep from 'lodash-es/cloneDeep';

const _buildPartite = (data, _p) => {
  let sData = {};

  sData.keys = [
    set(
      data.map(d => {
        return d[0];
      })
    )
      .values()
      .sort((a, b) => {
        return a < b ? -1 : a > b ? 1 : 0;
      }),
    set(
      data.map(d => {
        return d[1];
      })
    )
      .values()
      .sort((a, b) => {
        return a < b ? -1 : a > b ? 1 : 0;
      }),
  ];

  sData.data = [
    sData.keys[0].map(d => {
      return sData.keys[1].map(v => {
        return 0;
      });
    }),
    sData.keys[1].map(d => {
      return sData.keys[0].map(v => {
        return 0;
      });
    }),
  ];

  for (let d of data) {
    let key0 = sData.keys[0].indexOf(d[0]);
    let key1 = sData.keys[1].indexOf(d[1]);

    if (sData.data[0]) {
      sData.data[0][key0][key1] = d[_p];
    }
    if (sData.data[1]) {
      sData.data[1][key1][key0] = d[_p];
    }
  }

  return sData;
};

const buildPartiteData = (_data, _opt) => {
  let chartData = cloneDeep(_data);

  let temp = [];

  for (let item of chartData) {
    temp.push([
      item[_opt.data.source.accessor],
      item[_opt.data.target.accessor],
      +item[_opt.data.links[0].accessor],
      +item[_opt.data.links[1].accessor],
    ]);
  }

  return [
    {
      data: _buildPartite(temp, 2),
      id: 'part_01',
      header: [
        _opt.data.source.name,
        _opt.data.target.name,
        _opt.data.links[0].name,
      ],
    },
    {
      data: _buildPartite(temp, 3),
      id: 'part_02',
      header: [
        _opt.data.source.name,
        _opt.data.target.name,
        _opt.data.links[1].name,
      ],
    },
  ];
};

export default buildPartiteData;
