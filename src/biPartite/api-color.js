import { transition } from 'd3-transition';

const apiColor = state => ({
  color(colorOpt) {
    state._options.color = colorOpt;
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
