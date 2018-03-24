import {
  svgLayer,
  factory,
  categoricalColor,
  mergeBase,
  apiRenderSVG,
} from 'vizart-core';

import { transition } from 'd3-transition';

import selectSegment from './select-segment';
import deSelectSegment from './deSelect-segment';
import drawPart from './draw-part';
import drawEdges from './draw-edges';
import drawHeader from './draw-header';

import buildPartiteData from './data';
import partiteLayout from './layout';
import DefaultOptions from './options';

const composers = {
  opt: opt => mergeBase(DefaultOptions, opt),
  data: buildPartiteData,
  color: (colorOpt, data, opt) => categoricalColor(colorOpt.scheme),
};

const apiRender = state => ({
  render(data) {
    apiRenderSVG(state).render(data);
    state.update();
  },
});

const apiUpdate = state => ({
  update() {
    const { _svg, _data, _options } = state;

    state._color = state._composers.color(_options.color, _data, _options);

    _data.forEach((biP, s) => {
      _svg
        .append('g')
        .attr('id', biP.id)
        .attr('transform', 'translate(' + _options.chart.width / 2 * s + ',0)');

      const partite = partiteLayout(
        biP.data,
        _options.chart.innerHeight,
        _options.plots.buffMargin,
        _options.plots.minHeight
      );

      drawPart(state, partite, biP.id, 0);
      drawPart(state, partite, biP.id, 1);
      drawEdges(state, partite, biP.id);
      drawHeader(state, biP.header, biP.id);

      [0, 1].forEach(p => {
        _svg
          .select('#' + biP.id)
          .select('.part' + p)
          .select('.mainbars')
          .selectAll('.mainbar')
          .on('mouseover', (d, i) => selectSegment(state, p, i))
          .on('mouseout', (d, i) => deSelectSegment(state, p, i));
      });
    });
  },
});

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

export default factory(svgLayer, composers, [apiRender, apiUpdate, apiColor]);
