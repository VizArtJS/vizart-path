import { svgLayer, factory } from 'vizart-core';

import apiRender from './api-render';
import opt from './options';

const composers = {
  opt,
};

export default factory(svgLayer, composers, [apiRender]);
