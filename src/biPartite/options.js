import { DefaultCategoricalColor, Globals } from 'vizart-core';

const DefaultOptions = {
  chart: { type: 'biPartite' },
  animation: {
    duration: {
      partite: 500,
    },
  },
  data: {
    source: {
      name: null,
      type: Globals.DataType.STRING,
      accessor: null,
    },

    target: {
      name: null,
      type: Globals.DataType.STRING,
      accessor: null,
    },

    links: [
      {
        name: null,
        type: Globals.DataType.NUMBER,
        accessor: null,
      },
      {
        name: null,
        type: Globals.DataType.NUMBER,
        accessor: null,
      },
    ],
  },
  color: DefaultCategoricalColor,
  plots: {
    buffMargin: 1,
    minHeight: 14,
    gap: 110,
  },
};

export default DefaultOptions;
