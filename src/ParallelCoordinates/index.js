import {
  DefaultCategoricalColor,
  categoricalColor,
  AbstractChart,
  mergeBase,
  check,
} from 'vizart-core';

import { default as crossfilter } from 'crossfilter';
import isNumber from 'lodash-es/isNumber';
import isDate from 'lodash-es/isDate';
import { extent } from 'd3-array';
import { keys } from 'd3-collection';
import { select } from 'd3-selection';

import './parallel-coordinates.css';
import ParCoords from './ParCoords';

const Composites = [
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

const DefaultOptions = {
  chart: {
    type: 'parallel_coordinates',
  },
  color: DefaultCategoricalColor,
  plots: {
    defaultColor: '#1f78b4',
    colorDimension: null,
    hideAxis: [],
    flipAxes: [],
    alpha: 0.7,
    bundlingStrength: 0.5,
    bundleDimension: null,
    composite: 'darken',
    smoothness: 0.0,
    showControlPoints: false,
    animationTime: 1100, // How long it takes to flip the axis when you double click
    brushMode: '1D-axes',
    brushPredicate: 'AND',
    mode: 'queue',
    nullValueSeparator: 'undefined', // set to "top" or "bottom"
    nullValueSeparatorPadding: { top: 8, right: 0, bottom: 8, left: 0 },
    dimensions: null,
    autoSortDimensions: 'asc',
    evenScale: null,
  },
};

class ParallelCoordinates extends AbstractChart {
  constructor(canvasId, _userOptions) {
    super(canvasId, _userOptions);
    this.parcoords;
  }

  render(_data) {
    this.data(_data);

    if (!select(this._containerId).classed('parcoords')) {
      select(this._containerId).classed('parcoords', true);
    }

    this.update();
  }

  update() {
    super.update();

    const config = Object.assign({}, this._options.plots);
    config.data = this._data;
    if (!config.margin) {
      config.margin = this._options.chart.margin;
    }

    this.parcoords = ParCoords(config)(this._containerId);

    this.parcoords.evenScale(this._options.plots.evenScale);

    this.parcoords.color(
      d =>
        this._options.plots.colorDimension
          ? this._color(d[this._options.plots.colorDimension])
          : this._options.plots.defaultColor
    );

    // dimensions
    if (check(this._options.plots.dimensions) === true) {
      this.parcoords.dimensions(this._options.plots.dimensions);
    } else {
      this.parcoords.dimensions(
        this.sortDimensions(this._data, this._options.plots.autoSortDimensions)
      );
    }

    if (
      this._options.plots.hideAxis !== null &&
      this._options.plots.hideAxis.length > 0
    ) {
      this.parcoords.hideAxis(this._options.plots.hideAxis);
    }

    if (this._options.plots.bundleDimension) {
      this.parcoords.bundleDimension(this._options.plots.bundleDimension);
    }

    this.parcoords.render();

    // Brush
    this.brushMode(this._options.plots.brushMode);
    this.brushPredicate(this._options.plots.brushPredicate);
  }

  hideAxis(_axis) {
    this.parcoords.hideAxis(_axis);
  }

  alpha(_alpha) {
    this._options.plots.alpha = _alpha;
    this.parcoords.alpha(_alpha);
  }

  /**
   * requires sylvester and lapack to run
   * try install them in your app: npm install --save sylvester, npm install --save lapack
   *
   * @param _dimension
   */
  bundleDimension(_dimension) {
    this._options.plots.bundleDimension = _dimension;
    this.parcoords.bundleDimension(_dimension);
  }

  bundlingStrength(_strength) {
    this._options.plots.bundlingStrength = _strength;
    this.parcoords.bundlingStrength(_strength);
  }

  composite(_composite) {
    this._options.plots.composite = _composite;
    this.parcoords.composite(_composite);
  }

  curveSmoothness(_smoothness) {
    this._options.plots.smoothness = _smoothness;
    this.parcoords.smoothness(_smoothness);
  }

  brushMode(_mode) {
    this._options.plots.brushMode = _mode;
    this.parcoords.brushMode(_mode);
  }

  mode(_mode) {
    this._options.plots.mode = _mode;
    this.parcoords.mode(_mode);
  }

  brushPredicate(_predicate) {
    this._options.plots.brushPredicate = _predicate;
    this.parcoords.brushPredicate(_predicate);
  }

  // getters
  getDimensions() {
    return this.parcoords.dimensions();
  }

  getBrushModes() {
    return this.parcoords.brushModes();
  }

  resetBrushes() {
    this.parcoords.brushReset();
  }

  getComposites() {
    return Composites;
  }

  colorDimension(_dimension) {
    this._options.plots.colorDimension = _dimension;

    if (check(_dimension) === false) {
      this.parcoords.color(d => this._options.plots.defaultColor).render();
      return;
    }

    let _dim = parcoords.dimensions()[_dimension];

    if (!_dim) {
      throw new Error(
        'invalid dimension, please use getDimensions() firstly. ' + _dimension
      );
    }

    switch (_dim.type) {
      case FiledType.STRING:
        this._options.color.scaleType = 'categorical';
        break;
      case FiledType.NUMBER:
      case FiledType.DATE:
        this._options.color.scaleType = 'gradient';
        break;

      default:
        this._options.color.scaleType = 'categorical';
        break;
    }

    this._color = categoricalColor(this._options.color.scheme);

    switch (_dim.type) {
      case FiledType.STRING:
        break;
      case FiledType.NUMBER:
      case FiledType.DATE:
        this._color.domain(
          extent(this._data, d => {
            return d[_dimension];
          })
        );
        break;

      default:
        break;
    }

    this.parcoords
      .color(d => {
        return this._color(d[_dimension]);
      })
      .render();
  }

  transitionColor(colorOptions) {
    super.transitionColor(colorOptions);

    this.parcoords
      .color(d => {
        return this._color(d[this._options.plots.colorDimension]);
      })
      .render();
  }

  sortDimensions(_data, _direction = 'asc') {
    if (this._options.plots.dimensions != null) {
      console.log(
        'dimensions have been already defined, no need to auto detect'
      );
      return {};
    }

    let _dimensionList = [];
    let ndx = crossfilter(_data);
    let sample = _data[0];

    for (let _k of keys(sample)) {
      let _value = sample[_k];

      if (isNumber(_value) || isDate(_value)) {
        // nothing to do
        _dimensionList.push(_k);
      } else {
        // only massive string discrete values will cause performance problems
        let _dim = ndx.dimension(d => {
          return d[_k];
        });
        let size = _dim.group().size();

        if (size > 3000) {
          // exclude this axis
        } else {
          _dimensionList.push(_k);
        }
      }
    }
    _dimensionList.sort((a, b) => {
      return _direction === 'asc' ? a.localeCompare(b) : b.localeCompare(a);
    });

    let retDim = {};

    for (let i = 0; i < _dimensionList.length; i++) {
      let name = _dimensionList[i];
      retDim[name] = {
        title: name,
        index: i,
      };
    }

    return retDim;
  }

  evenScale(_evenScale) {
    this._options.plots.evenScale = _evenScale;
    this.parcoords.evenScale(this._options.plots.evenScale);
  }

  createOptions(_userOpt) {
    return mergeBase(DefaultOptions, _userOpt);
  }
}

export default ParallelCoordinates;
