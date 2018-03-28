import { categoricalColor } from 'vizart-core';
import { extent } from 'd3-array';

const apiColorDimension = state => ({
  colorDimension(_dimension) {
    const { _options, parcoords, _data } = state;

    _options.plots.colorDimension = _dimension;

    if (_dimension === undefined || _dimension === null) {
      parcoords.color(d => _options.plots.defaultColor).render();
      return;
    }

    const _dim = parcoords.dimensions()[_dimension];
    if (!_dim) {
      throw new Error(
        'invalid dimension, please use getDimensions() firstly. ' + _dimension
      );
    }

    switch (_dim.type) {
      case FiledType.STRING:
        _options.color.scaleType = 'categorical';
        break;
      case FiledType.NUMBER:
      case FiledType.DATE:
        _options.color.scaleType = 'gradient';
        break;

      default:
        _options.color.scaleType = 'categorical';
        break;
    }

    state._color = categoricalColor(_options.color.scheme);

    const { _color } = state;

    switch (_dim.type) {
      case FiledType.STRING:
        break;
      case FiledType.NUMBER:
      case FiledType.DATE:
        _color.domain(extent(_data, d => d[_dimension]));
        break;

      default:
        break;
    }

    parcoords.color(d => _color(d[_dimension])).render();
  },
});

export default apiColorDimension;
