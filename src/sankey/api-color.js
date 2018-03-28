const apiColor = state => ({
  color(userColor) {
    state._options.color = userColor;
    state._color = state._composers.color(userColor);

    const { _options, _nodeGroup, _linkGroup, _data, _color } = state;

    _nodeGroup
      .selectAll('.sankey-node-rect')
      .transition()
      .duration(_options.animation.duration.color)
      .delay((d, i) => {
        return i / _data.nodes.length * _options.animation.duration.color;
      })
      .style('fill', d => _color(d.name));

    _linkGroup
      .selectAll('.sankey-link')
      .transition()
      .duration(_options.animation.duration.color)
      .delay((d, i) => {
        return i / _data.links.length * _options.animation.duration.color;
      })
      .style(
        'stroke',
        d =>
          _options.plots.colorfulLink
            ? _color(d.source.name)
            : _options.plots.linkColor
      );
  },
});

export default apiColor;
