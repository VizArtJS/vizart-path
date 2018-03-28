const apiHideAxis = state => ({
  hideAxis(_axis) {
    state.parcoords.hideAxis(_axis);
  },
});

const apiAlpha = state => ({
  alpha(_alpha) {
    state._options.plots.alpha = _alpha;
    state.parcoords.alpha(_alpha);
  },
});

const apiGetComposites = state => ({
  getComposites() {
    return [
      'source-over',
      'source-in',
      'source-out',
      'source-atop',
      'destination-over',
      'destination-in',
      'destination-out',
      'destination-atop',
      'lighter',
      'darken',
      'xor',
      'copy',
    ];
  },
});

const apiEvenScale = state => ({
  evenScale(_evenScale) {
    state._options.plots.evenScale = _evenScale;
    state.parcoords.evenScale(_evenScale);
  },
});

const apiBundleDimension = state => ({
  /**
   * requires sylvester and lapack to run
   * try install them in your app: npm install --save sylvester, npm install --save lapack
   *
   * @param _dimension
   */
  bundleDimension(_dimension) {
    state._options.plots.bundleDimension = _dimension;
    state.parcoords.bundleDimension(_dimension);
  },
});

const apiBundleStrength = state => ({
  bundlingStrength(_strength) {
    state._options.plots.bundlingStrength = _strength;
    state.parcoords.bundlingStrength(_strength);
  },
});

const apiComposite = state => ({
  composite(_composite) {
    state._options.plots.composite = _composite;
    state.parcoords.composite(_composite);
  },
});

const apiCurveSmoothness = state => ({
  curveSmoothness(_smoothness) {
    state._options.plots.smoothness = _smoothness;
    state.parcoords.smoothness(_smoothness);
  },
});

const apiBrushMode = state => ({
  brushMode(_mode) {
    state._options.plots.brushMode = _mode;
    state.parcoords.brushMode(_mode);
  },
});

const apiMode = state => ({
  mode(_mode) {
    state._options.plots.mode = _mode;
    state.parcoords.mode(_mode);
  },
});

const apiBrushPredicate = state => ({
  brushPredicate(_predicate) {
    state._options.plots.brushPredicate = _predicate;
    state.parcoords.brushPredicate(_predicate);
  },
});

const apiGetDimensions = state => ({
  getDimensions() {
    return state.parcoords.dimensions();
  },
});

const apiGetBrushModes = state => ({
  getBrushModes() {
    return state.parcoords.brushModes();
  },
});

const apiResetBrushes = state => ({
  resetBrushes() {
    state.parcoords.brushReset();
  },
});

export {
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
};
