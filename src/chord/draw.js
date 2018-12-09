import { ribbon } from 'd3-chord';
import { arc } from 'd3-shape';
import { event as d3Event } from 'd3-selection';

import { resetChords, dimChords, chordMouseover, hideTooltip } from './helpers';

const draw = state => {
  const { _matrix, _data, _options, _outerRadius, _svg, _color } = state;
  _matrix
    .data(_data)
    .resetKeys()
    .addKeys([_options.data.source.accessor, _options.data.target.accessor])
    .update();

  const innerRadius = _outerRadius / 1.1;
  const _arc = arc()
    .innerRadius(innerRadius)
    .outerRadius(innerRadius + 20);

  const _ribbon = ribbon().radius(innerRadius);

  const gChanged = _svg.selectAll('g.group').data(_matrix.groups(), d => d._id);

  const gEnter = gChanged
    .enter()
    .append('g')
    .attr('class', 'group');

  const gExit = gChanged.exit();

  gEnter
    .append('path')
    .style('pointer-events', 'none')
    .style('fill', d => _color(d._id))
    .attr('d', _arc);

  gEnter
    .append('text')
    .attr('dy', '.35em')
    // .on("click", (d)=> {this._groupClick(d)})
    .on('mouseover', (d, i) => {
      dimChords(_svg, d);
    })
    .on('mouseout', resetChords(_svg))
    .text(d => d._id);

  _svg
    .selectAll('g.group')
    .select('path')
    .transition()
    .duration(2000)
    .attrTween('d', _matrix.groupTween(_arc));

  _svg
    .selectAll('g.group')
    .select('text')
    .transition()
    .duration(2000)
    .attr('transform', d => {
      d.angle = (d.startAngle + d.endAngle) / 2;
      const r = 'rotate(' + ((d.angle * 180) / Math.PI - 90) + ')';
      const t = ' translate(' + (innerRadius + 26) + ')';
      return r + t + (d.angle > Math.PI ? ' rotate(180)' : ' rotate(0)');
    })
    .attr('text-anchor', d => (d.angle > Math.PI ? 'end' : 'begin'));

  gExit.select('text').attr('fill', 'orange');
  gExit.select('path').remove();

  gExit
    .transition()
    .duration(1000)
    .style('opacity', 0)
    .remove();

  const chords = _svg
    .selectAll('path.chord')
    .data(_matrix.chords(), d => d._id);

  chords
    .enter()
    .append('path')
    .attr('class', 'chord')
    .style('fill', d => _color(d.source._id))
    .attr('d', _ribbon)
    .on('mousemove', d => {
      chordMouseover(_svg, d);
    })
    .on('mouseout', d => {
      hideTooltip(_svg, d);
    });

  chords
    .transition()
    .duration(2000)
    .attrTween('d', _matrix.chordTween(_ribbon));

  chords.exit().remove();

  // if (_options.plots.drawTicks === true) {
  //     _drawTicks(state);
  // }
};

export default draw;
