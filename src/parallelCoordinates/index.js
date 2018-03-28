import { svgLayer, factory } from 'vizart-core';

import apiRender from './api/api-render';
import apiUpdate from './api/api-update';
import apiColor from './api/api-color';
import apiColorDimension from './api/api-colorDimension';
import apiSortDimensions from './api/api-sortDimension';

import {
  apiHideAxis,
  apiAlpha,
  apiGetComposites,
  apiEvenScale,
  apiBundleDimension,
  apiBundleStrength,
  apiComposite,
  apiCurveSmoothness,
  apiBrushMode,
  apiMode,
  apiBrushPredicate,
  apiGetDimensions,
  apiGetBrushModes,
  apiResetBrushes,
} from './api/api-delegates';

import 'parcoord-es/dist/parcoords.css';
import opt from './options';

const composers = {
  opt,
};

export default factory(svgLayer, composers, [
  apiRender,
  apiUpdate,
  apiColor,
  apiColorDimension,
  apiSortDimensions,
  apiHideAxis,
  apiAlpha,
  apiGetComposites,
  apiEvenScale,
  apiBundleDimension,
  apiBundleStrength,
  apiComposite,
  apiCurveSmoothness,
  apiBrushMode,
  apiMode,
  apiBrushPredicate,
  apiGetDimensions,
  apiGetBrushModes,
  apiResetBrushes,
]);
