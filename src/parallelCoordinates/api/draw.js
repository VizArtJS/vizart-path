import { select } from 'd3-selection';
import ParCoords from 'parcoord-es';
import sortDim from './sort-dim';

const draw = state => {
  const { _containerId, _options, _data, _color } = state;

  if (!select(_containerId).classed('parcoords')) {
    select(_containerId).classed('parcoords', true);
  }

  const config = Object.assign({}, _options.plots);
  config.data = _data;

  if (!config.margin) {
    config.margin = _options.chart.margin;
  }

  state.parcoords = ParCoords(config)(_containerId);
  state.parcoords.evenScale(_options.plots.evenScale);
  state.parcoords.color(
    d =>
      _options.plots.colorDimension
        ? _color(d[_options.plots.colorDimension])
        : _options.plots.defaultColor
  );

  // dimensions
  if (
    _options.plots.dimensions !== undefined &&
    _options.plots.dimensions !== null
  ) {
    state.parcoords.dimensions(_options.plots.dimensions);
  } else {
    state.parcoords.dimensions(
      sortDim(state)(_data, _options.plots.autoSortDimensions)
    );
  }

  if (_options.plots.hideAxis !== null && _options.plots.hideAxis.length > 0) {
    state.parcoords.hideAxis(_options.plots.hideAxis);
  }

  if (_options.plots.bundleDimension) {
    state.parcoords.bundleDimension(_options.plots.bundleDimension);
  }

  state.parcoords.render();

  // Brush
  state.brushMode(_options.plots.brushMode);
  state.brushPredicate(_options.plots.brushPredicate);
};

export default draw;
