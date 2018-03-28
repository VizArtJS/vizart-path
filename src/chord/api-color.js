import { transition } from 'd3-transition';

const apiColor = state => ({
  color(colorOptions) {
    state._options.color = colorOptions;
    state._color = state._composers.color(colorOptions);

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
