import { svgLayer, factory, categoricalColor, mergeBase } from 'vizart-core';

import buildPartiteData from './data';
import DefaultOptions from './options';

import apiRender from './api-render';
import apiUpdate from './api-update';
import apiColor from './api-color';

const composers = {
  opt: opt => mergeBase(DefaultOptions, opt),
  data: buildPartiteData,
  color: (colorOpt, data, opt) => categoricalColor(colorOpt.scheme),
};

export default factory(svgLayer, composers, [apiRender, apiUpdate, apiColor]);
