const apiColor = state => ({
  color(userColor) {
    if (!userColor) {
      console.warn('color opt is null, either scheme or type is required');
      return;
    } else if (!userColor.type && !userColor.scheme) {
      console.warn('invalid color opt, either scheme or type is required');
      return;
    }

    if (userColor.type) {
      state._options.color.type = userColor.type;
    }

    if (userColor.scheme) {
      state._options.color.scheme = userColor.scheme;
    }

    state._color = state._composers.color(state._options.color);

    const { _options, _nodeGroup, _linkGroup, _data, _color } = state;

    _nodeGroup
      .selectAll('.sankey-node-rect')
      .transition()
      .duration(_options.animation.duration.color)
      .delay((d, i) => {
        return (i / _data.nodes.length) * _options.animation.duration.color;
      })
      .style('fill', d => _color(d.name));

    _linkGroup
      .selectAll('.sankey-link')
      .transition()
      .duration(_options.animation.duration.color)
      .delay((d, i) => {
        return (i / _data.links.length) * _options.animation.duration.color;
      })
      .style('stroke', d =>
        _options.plots.colorfulLink
          ? _color(d.source.name)
          : _options.plots.linkColor
      );
  },
});

export default apiColor;
