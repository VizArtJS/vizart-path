import { DefaultCategoricalColor } from 'vizart-core';

const DefaultOptions = {
  chart: {
    type: 'chord',
  },
  color: DefaultCategoricalColor,
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

    links: [
      {
        accessor: null,
        name: null,
        formatter: null,
      },
      {
        accessor: null,
        name: null,
        formatter: null,
      },
    ],
  },
  plots: {
    drawTicks: true,
  },
  ordering: {
    name: 'row', //row, column or volume
    direction: 'asc',
  },
};

export default DefaultOptions;
