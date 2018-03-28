import { mouse, select } from 'd3-selection';

const mouseOnPath = state =>
  function(d, i) {
    const { _options, _color } = state;

    const coordinates = mouse(this);
    const x = coordinates[0];
    const y = coordinates[1];

    const html = Tooltip.noHandle(
      _options.label.sourceLabel + ' ' + d.source.name,
      _options.label.targetLabel,
      d.target.name,
      _options.plots.colorfulLink
        ? _color(d.source.name)
        : _options.plots.linkColor
    );

    tooltip
      .style('left', x + 22 + 'px')
      .style('top', y + 84 + 'px')
      .html(html);

    _linkGroup
      .selectAll('.sankey-link')
      .transition()
      .duration(_options.animation.duration.quickUpdate)
      .style('stroke', d => _options.plots.linkColor)
      .style('stroke-opacity', 0.1);

    select(this)
      .transition()
      .duration(_options.animation.duration.quickUpdate)
      .style(
        'stroke',
        d =>
          _options.plots.colorfulLink
            ? _color(d.source.name)
            : _options.plots.linkColor
      )
      .style('stroke-opacity', 0.5);
  };

export default mouseOnPath;
