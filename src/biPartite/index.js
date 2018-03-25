import { svgLayer, factory, mergeBase } from 'vizart-core';

import buildPartiteData from './data';
import DefaultOptions from './options';

import apiRender from './api-render';
import apiUpdate from './api-update';
import apiColor from './api-color';

const composers = {
  opt: opt => mergeBase(DefaultOptions, opt),
  data: buildPartiteData,
};

export default factory(svgLayer, composers, [apiRender, apiUpdate, apiColor]);
