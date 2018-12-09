import { transition } from 'd3-transition';

const apiColor = state => ({
  color(colorOptions) {
    if (!colorOptions) {
      console.warn('color opt is null, either scheme or type is required');
      return;
    } else if (!colorOptions.type && !colorOptions.scheme) {
      console.warn('invalid color opt, either scheme or type is required');
      return;
    }

    if (colorOptions.type) {
      state._options.color.type = colorOptions.type;
    }

    if (colorOptions.scheme) {
      state._options.color.scheme = colorOptions.scheme;
    }

    state._color = state._composers.color(state._options.color);

    const { _svg, _color } = state;

    const _trans = transition()
      .duration(1250)
      .delay((d, i) => i * 50);

    _svg
      .selectAll('g.group')
      .select('path')
      .transition(_trans)
      .style('fill', d => _color(d._id));

    _svg
      .selectAll('path.chord')
      .transition(_trans)
      .style('fill', d => _color(d.source._id));
  },
});

export default apiColor;
