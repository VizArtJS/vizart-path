import { chord } from 'd3-chord';
import { ascending, descending } from 'd3-array';
import { apiRenderSVG } from 'vizart-core';
import Matrix from './Matrix';
import draw from './draw';

const apiRender = state => ({
  render(data) {
    apiRenderSVG(state).render(data);

    const { _options } = state;

    state._outerRadius =
      Math.min(_options.chart.innerWidth, _options.chart.innerHeight) / 2;

    state._s = d => d[_options.data.source.accessor];
    state._t = d => d[_options.data.target.accessor];
    state._l0 = d => d[_options.data.links[0].accessor];
    state._l1 = d => d[_options.data.links[1].accessor];

    const { _container, _svg, _s, _t, _l0, _l1 } = state;

    _container
      .attr('preserveAspectRatio', 'xMinYMin')
      .attr(
        'viewBox',
        '0 0 ' + _options.chart.width + ' ' + _options.chart.height
      );
    _svg.attr(
      'transform',
      'translate(' +
        _options.chart.width / 2 +
        ',' +
        _options.chart.height / 2 +
        ')'
    );

    const _chord = chord()
      .padAngle(0.05)
      .sortGroups(descending)
      .sortSubgroups(ascending);

    state._matrix = new Matrix()
      .layout(_chord)
      .filter(
        (item, r, c) =>
          (_s(item) === r.name && _t(item) === c.name) ||
          (_s(item) === c.name && _t(item) === r.name)
      )
      .reduce((items, r, c) => {
        let value;
        if (!items[0]) {
          value = 0;
        } else {
          value = items.reduce((m, n) => {
            const _val0 = _l0(n) ? _l0(n) : 0;
            const _val1 = _l1(n) ? _l1(n) : 0;

            if (r === c) {
              return m + (_val0 + _val1);
            } else {
              return m + (_s(n) === r.name ? _val0 : _val1);
            }
          }, 0);
        }
        return { value: value, data: items };
      });

    draw(state);
  },
});

export default apiRender;
