import { interpolate } from 'd3-interpolate';
import edgePolygon from './edge-polygon';
import { bb } from './bounding-box';

const transitionEdges = (state, data, id) => {
  const { _svg, _options } = state;

  _svg
    .select('#' + id)
    .append('g')
    .attr('class', 'edges')
    .attr('transform', 'translate(' + 190 + ',0)');

  _svg
    .select('#' + id)
    .select('.edges')
    .selectAll('.edge')
    .data(data.edges)
    .transition()
    .duration(_options.animation.duration.partite)
    .attrTween('points', function(a) {
      const i = interpolate(this._current, a);
      this._current = i(0);

      return t => {
        return edgePolygon(bb(_options), i(t));
      };
    })
    .style('opacity', d => (d.h1 == 0 || d.h2 == 0 ? 0 : 0.5));
};

export default transitionEdges;
