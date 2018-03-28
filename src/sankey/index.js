import { svgLayer, factory } from 'vizart-core';

import apiRender from './api-render';
import apiUpdate from './api-update';
import apiColor from './api-color';

import opt from './options';

const composers = {
  opt,
};

export default factory(svgLayer, composers, [apiRender, apiUpdate, apiColor]);
