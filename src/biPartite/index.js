import { svgLayer, factory } from 'vizart-core';

import buildPartiteData from './data';
import opt from './options';

import apiRender from './api-render';
import apiUpdate from './api-update';
import apiColor from './api-color';

const composers = {
  opt,
  data: buildPartiteData,
};

export default factory(svgLayer, composers, [apiRender, apiUpdate, apiColor]);
