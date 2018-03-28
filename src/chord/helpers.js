import { event as d3Event } from 'd3-selection';
import { range } from 'd3-array';

const resetChords = _svg => {
  if (d3Event) {
    d3Event.preventDefault();
    d3Event.stopPropagation();
  }

  _svg
    .selectAll('path.chord')
    .transition()
    .duration(250)
    .style('opacity', 0.9);
};

const dimChords = (_svg, d) => {
  if (d3Event) {
    d3Event.preventDefault();
    d3Event.stopPropagation();
  }

  _svg
    .selectAll('path.chord')
    .transition()
    .duration(250)
    .style(
      'opacity',
      p =>
        d.source
          ? p._id === d._id ? 0.9 : 0.1
          : p.source._id === d._id || p.target._id === d._id ? 0.9 : 0.1
    );
};

const chordMouseover = (_svg, d) => {
  if (d3Event) {
    d3Event.preventDefault();
    d3Event.stopPropagation();
  }

  dimChords(_svg, d);
};

const hideTooltip = _svg => {
  if (d3Event) {
    d3Event.preventDefault();
    d3Event.stopPropagation();
  }

  resetChords(_svg);
};

const groupTicks = d => {
  const k = (d.endAngle - d.startAngle) / d.value;

  return range(0, d.value, d.value / 25).map((v, i) => {
    return {
      angle: v * k + d.startAngle,
      label: i % 5 ? null : v + '%',
    };
  });
};

export { resetChords, dimChords, chordMouseover, hideTooltip, groupTicks };
