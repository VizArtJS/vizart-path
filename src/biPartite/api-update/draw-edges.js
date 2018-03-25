import edgePolygon from './edge-polygon';
import { bb } from './bounding-box';

const drawEdges = (state, data, id) => {
  const { _svg, _color, _options } = state;

  _svg
    .select('#' + id)
    .append('g')
    .attr('class', 'edges')
    .attr('transform', 'translate(' + 190 + ',0)')
    .attr('x', 60);

  _svg
    .select('#' + id)
    .select('.edges')
    .selectAll('.edge')
    .data(data.edges)
    .enter()
    .append('polygon')
    .attr('class', 'edge')
    .attr('points', d => edgePolygon(bb(_options), d))
    .style('fill', d => _color(d.key1))
    .style('opacity', 0.5)
    .each(function(d) {
      this._current = d;
    });
};

export default drawEdges;
