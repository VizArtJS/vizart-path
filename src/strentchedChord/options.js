import { DefaultCategoricalColor } from 'vizart-core';

const DefaultOpt = {
  chart: {
    type: 'stretched-chord',
  },
  data: {
    source: {
      accessor: null,
      name: null,
      formatter: null,
    },
    target: {
      accessor: null,
      name: null,
      formatter: null,
    },

    link: {
      accessor: null,
      name: null,
      formatter: null,
    },
  },
  color: DefaultCategoricalColor,
  plots: {
    innerRadiusRatio: 0.95,
    opacityDefault: 0.7, //default opacity of chords
    opacityLow: 0.02, //hover opacity of those chords not hovered over
    pullOutSize: 150, //How many pixels should the two halves be pulled apart
    fontSize: '16px',
    emptyPercent: 0.01, //What % of the circle should become empty
    chordPadding: 0.02,
  },
};

export default DefaultOpt;
