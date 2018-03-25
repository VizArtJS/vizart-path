import { keys } from 'd3-collection';

// this descriptive text should live with other introspective methods
const toString = config => () => {
  return (
    'Parallel Coordinates: ' +
    keys(config.dimensions).length +
    ' dimensions (' +
    keys(config.data[0]).length +
    ' total) , ' +
    config.data.length +
    ' rows'
  );
};

export default toString;
