import partiteLayout from '../layout';
import drawPart from './draw-part';
import drawEdges from './draw-edges';
import deSelectSegment from './deSelect-segment';
import drawHeader from './draw-header';
import selectSegment from './select-segment';

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

export default apiUpdate;
