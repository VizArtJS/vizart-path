import { transition } from 'd3-transition';

const apiColor = state => ({
  color(colorOpt) {
    if (!colorOpt) {
      console.warn('color opt is null, either scheme or type is required');
      return;
    } else if (!colorOpt.type && !colorOpt.scheme) {
      console.warn('invalid color opt, either scheme or type is required');
      return;
    }

    if (colorOpt.type) {
      state._options.color.type = colorOpt.type;
    }

    if (colorOpt.scheme) {
      state._options.color.scheme = colorOpt.scheme;
    }

    state.update();
    const { _options, _color } = state;

    const _transition = transition().duration(
      _options.animation.duration.change
    );

    _transition.selectAll('.subbar').style('fill', d => _color(d.key1));
    _transition.selectAll('.edge').style('fill', d => _color(d.key1));
  },
});

export default apiColor;
