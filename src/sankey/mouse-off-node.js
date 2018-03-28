const mouseOffNode = state => (d, i) => {
  const { _nodeGroup, _linkGroup, _options } = state;

  _linkGroup
    .selectAll('.sankey-link')
    .transition()
    .duration(_options.animation.duration.quickUpdate)
    .style('stroke', d => {
      return _options.plots.colorfulLink
        ? this._color(d.source.name)
        : _options.plots.linkColor;
    })
    .style('stroke-opacity', _options.plots.linkOpacity);

  _nodeGroup
    .selectAll('.sankey-node-rect')
    .transition('transition-sankey-node')
    .duration(_options.animation.duration.quickUpdate)
    .style('fill-opacity', 1);
};

export default mouseOffNode;
