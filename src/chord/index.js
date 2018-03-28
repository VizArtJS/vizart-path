import { svgLayer, factory } from 'vizart-core';

import opt from './options';

import apiRender from './api-render';
import apiUpdate from './api-update';
import apiColor from './api-color';

import './chord.css';

const composers = {
  opt,
};

export default factory(svgLayer, composers, [apiRender, apiUpdate, apiColor]);
