const mouseOffPath = state => (d, i) => {
  const { _linkGroup, _options, _color } = state;
  this._tooltip
    .transition()
    .duration(_options.animation.duration.quickUpdate)
    .style('opacity', 0);

  _linkGroup
    .selectAll('.sankey-link')
    .transition()
    .duration(_options.animation.duration.quickUpdate)
    .style(
      'stroke',
      d =>
        _options.plots.colorfulLink
          ? _color(d.source.name)
          : _options.plots.linkColor
    )
    .style('stroke-opacity', _options.plots.linkOpacity);
};

export default mouseOffPath;
