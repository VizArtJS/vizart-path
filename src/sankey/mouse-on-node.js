import { select } from 'd3-selection';

const mouseOnNode = state =>
  function(d, i) {
    const { _nodeGroup, _linkGroup, _options, _color } = state;

    _nodeGroup
      .selectAll('.sankey-node-rect')
      .transition('transition-sankey-node')
      .duration(_options.animation.duration.quickUpdate)
      .style('fill-opacity', 0.2);

    select(this)
      .transition('transition-sankey-node')
      .duration(_options.animation.duration.quickUpdate)
      .style('fill-opacity', 1);

    _linkGroup
      .selectAll('.sankey-link')
      .transition()
      .duration(_options.animation.duration.quickUpdate)
      .style('stroke', d => _options.plots.linkColor)
      .style('stroke-opacity', 0.1);

    _linkGroup
      .select('.sankey-link[data-link-source="' + d.name + '"]')
      .transition('highlight-link-transition')
      .duration(_options.animation.duration.quickUpdate)
      .style('stroke', d =>
        _options.plots.colorfulLink
          ? _color(d.source.name)
          : _options.plots.linkColor
      )
      .style('stroke-opacity', 0.5);
    _linkGroup
      .select('.sankey-link[data-link-target="' + d.name + '"]')
      .transition('highlight-link-transition')
      .duration(_options.animation.duration.quickUpdate)
      .style('stroke', d =>
        _options.plots.colorfulLink
          ? colorScale(d.source.name)
          : _options.plots.linkColor
      )
      .style('stroke-opacity', 0.5);
  };

export default mouseOnNode;
