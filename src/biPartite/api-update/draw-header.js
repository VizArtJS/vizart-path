import { select } from 'd3-selection';
import { c1, c3, bb } from './bounding-box';

const drawHeader = (state, header, id) => {
  const { _options } = state;

  select('#' + id)
    .select('.part0')
    .append('g')
    .attr('class', 'header')
    .append('text')
    .text(header[2])
    .style('font-size', '18')
    .attr('x', c1[1] + bb(_options) / 2)
    .attr('y', -10)
    .style('text-anchor', 'middle')
    .style('font-weight', 'bold');

  [0, 1].forEach(d => {
    const h = select('#' + id)
      .select('.part' + d)
      .append('g')
      .attr('class', 'header');

    if (d < 1) {
      h
        .append('text')
        .text(header[d])
        .attr('x', c1[1] - 50)
        .attr('y', -10)
        .style('fill', 'grey')
        .attr('text-anchor', 'end');
    } else {
      h
        .append('text')
        .text(header[d])
        .attr('x', c1[d] + 30)
        .attr('y', -10)
        .style('fill', 'grey')
        .attr('text-anchor', 'start');
    }

    h
      .append('line')
      .attr('x1', c1[d])
      .attr('y1', -2)
      .attr('x2', c3[d])
      .attr('y2', -2)
      .style('stroke', 'black')
      .style('stroke-width', '1')
      .style('shape-rendering', 'crispEdges');
  });
};

export default drawHeader;
