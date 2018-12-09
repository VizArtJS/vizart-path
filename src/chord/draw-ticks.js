const drawTicks = state => {
  const { _svg, _matrix, _outerRadius } = state;

  _svg.selectAll('.ticks').remove();

  const ticks = _svg
    .append('g')
    .attr('class', 'ticks')
    .attr('opacity', 0.1)
    .selectAll('g')
    .data(_matrix.groups())
    .enter()
    .append('g')
    .selectAll('g')
    .data(_groupTicks)
    .enter()
    .append('g')
    .attr(
      'transform',
      d =>
        'rotate(' +
        ((d.angle * 180) / Math.PI - 90) +
        ')' +
        'translate(' +
        _outerRadius +
        ',0)'
    );

  ticks
    .append('line')
    .attr('x1', 1)
    .attr('y1', 0)
    .attr('x2', 5)
    .attr('y2', 0)
    .style('stroke', '#000');

  ticks
    .append('text')
    .attr('x', 8)
    .attr('dy', '.35em')
    .attr('text-anchor', d => (d.angle > Math.PI ? 'end' : null))
    .attr('transform', d =>
      d.angle > Math.PI ? 'rotate(180)translate(-16)' : null
    )
    .text(d => d.label);

  _svg
    .selectAll('.ticks')
    .transition()
    .duration(340)
    .attr('opacity', 1);
};

export default drawTicks;
