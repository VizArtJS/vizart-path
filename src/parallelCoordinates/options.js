import { DefaultCategoricalColor } from 'vizart-core';

const DefaultOptions = {
  chart: {
    type: 'parallel_coordinates',
  },
  color: DefaultCategoricalColor,
  plots: {
    defaultColor: '#1f78b4',
    colorDimension: null,
    hideAxis: [],
    flipAxes: [],
    alpha: 0.7,
    bundlingStrength: 0.5,
    bundleDimension: null,
    composite: 'darken',
    smoothness: 0.0,
    showControlPoints: false,
    animationTime: 1100, // How long it takes to flip the axis when you double click
    brushMode: '1D-axes',
    brushPredicate: 'AND',
    mode: 'queue',
    nullValueSeparator: 'undefined', // set to "top" or "bottom"
    nullValueSeparatorPadding: { top: 8, right: 0, bottom: 8, left: 0 },
    dimensions: {},
    autoSortDimensions: 'asc',
    evenScale: null,
  },
};

export default DefaultOptions;
