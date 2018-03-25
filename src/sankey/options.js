import { DefaultCategoricalColor } from 'vizart-core';

const Options = {
  chart: {
    type: 'sankey',
  },
  color: DefaultCategoricalColor,
  plots: {
    horizontal: true, // 'horizontal', 'vertical'
    layout: 32,
    nodeWidth: 15,
    nodePadding: 10,
    colorfulLink: true,
    linkColor: '#000',
    linkOpacity: 0.2,
    nodeOpacity: 1,
    nodeFontSize: 14,
    realTime: false,
    realTimeSpeed: 5000, // 5s
    realTimeInterval: 1, // 1s
  },
};

export default Options;
