import { drag } from 'd3-drag';
import { event, select } from 'd3-selection';
import CircularSankey from './layout/CircularSankey';
import VerticalSankey from './layout/VerticalSankey';

const draw = state => {
  const {
    _data,
    _options,
    _color,
    _containerId,
    _nodeGroup,
    _linkGroup,
  } = state;

  const _layout =
    _options.plots.horizontal === true
      ? CircularSankey()
          .nodeWidth(_options.plots.nodeWidth)
          .nodePadding(_options.plots.nodePadding)
          .size([_options.chart.innerWidth, _options.chart.innerHeight])
          .nodes(_data.nodes)
          .links(_data.links)
          .layout(_options.plots.layout)
      : VerticalSankey()
          .nodeWidth(_options.plots.nodeWidth)
          .nodePadding(_options.plots.nodePadding)
          .size([_options.chart.innerWidth, _options.chart.innerHeight])
          .nodes(_data.nodes)
          .links(_data.links)
          .layout(_options.plots.layout);

  const path = _layout.link();

  // nodes
  const links = _linkGroup.selectAll('.sankey-link').data(_data.links);

  links
    .exit()
    .transition()
    .delay(_options.animation.duration.remove)
    .style('stroke-opacity', 0)
    .remove();

  links
    .attr('data-link-source', (d, i) => d.source.name)
    .attr('data-link-target', (d, i) => d.target.name)
    .transition()
    .duration(_options.animation.duration.update)
    .delay(
      (d, i) => i / _data.links.length * _options.animation.duration.update
    )
    .attr('d', path)
    .style('stroke-width', d => Math.max(1, d.dy))
    .style(
      'stroke',
      d =>
        _options.plots.colorfulLink
          ? _color(d.source.name)
          : _options.plots.linkColor
    )
    .style('stroke-opacity', _options.plots.linkOpacity);

  links
    .enter()
    .append('path')
    .attr('class', 'sankey-link')
    .attr('d', path)
    .attr('data-link-source', (d, i) => d.source.name)
    .attr('data-link-target', (d, i) => d.target.name)
    .style('fill', 'none')
    .style('stroke-width', d => Math.max(1, d.dy))
    .style(
      'stroke',
      d =>
        _options.plots.colorfulLink
          ? _color(d.source.name)
          : _options.plots.linkColor
    )
    .style('stroke-opacity', _options.plots.linkOpacity);

  _linkGroup
    .selectAll('.sankey-link')
    .classed('backwards', d => d.target.x < d.source.x);

  const nodes = _nodeGroup.selectAll('.sankey-node').data(_data.nodes);

  nodes
    .exit()
    .transition()
    .duration(_options.animation.duration.remove)
    .remove();

  nodes
    .transition()
    .delay(_options.animation.duration.remove)
    .attr('transform', d => 'translate(' + d.x + ',' + d.y + ')');

  const _drag = drag()
    .subject(d => d)
    .on('start', function() {
      this.parentNode.appendChild(this);
    })
    .on('end', function() {
      if (_options.plots.horizontal) {
        select(this).attr(
          'transform',
          'translate(' +
            d.x +
            ',' +
            (d.y = Math.max(
              0,
              Math.min(_options.chart.innerHeight - d.dy, event.y)
            )) +
            ')'
        );
      } else {
        select(this).attr(
          'transform',
          'translate(' +
            (d.x = Math.max(
              0,
              Math.min(_options.chart.innerWidth - d.dy, event.x)
            )) +
            ',' +
            d.y +
            ')'
        );
      }

      _layout.relayout();
      links.attr('d', path);
    });

  nodes.call(_drag);

  nodes
    .select('.sankey-node-rect')
    .transition()
    .duration(_options.animation.duration.update)
    .delay(
      (d, i) => i / _data.nodes.length * _options.animation.duration.update
    )
    .attr(
      'height',
      _options.plots.horizontal
        ? d => (d.dy > 0 ? d.dy : 0.5)
        : _layout.nodeWidth() > 0
          ? _layout.nodeWidth()
          : 0.5
    )
    .attr('width', _options.plots.horizontal ? _layout.nodeWidth() : d => d.dy)
    .style('fill', d => (d.color = _color(d.name)))
    .style('fill-opacity', _options.plots.nodeOpacity);

  nodes.select('title').text(d => d.name + '\n' + d.value);

  if (_options.plots.horizontal === true) {
    nodes
      .select('.sankey-node-title')
      .transition()
      .duration(_options.animation.duration.update)
      .delay(
        (d, i) => i / _data.nodes.length * _options.animation.duration.update
      )
      .attr('x', -6)
      .attr('y', d => d.dy / 2)
      .attr('dy', '.35em')
      .attr('text-anchor', 'end')
      .attr('transform', null)
      .text(d => d.name)
      .filter(d => d.x < width / 2)
      .attr('x', _options.plots.horizontal ? 6 + _layout.nodeWidth() : 0)
      .attr('text-anchor', 'start')
      .style('font-size', _options.plots.nodeFontSize + 'px');
  } else {
    nodes
      .select('.sankey-node-title')
      .transition()
      .duration(_options.animation.duration.update)
      .delay((d, i) => {
        return i / _data.nodes.length * _options.animation.duration.update;
      })
      .attr('text-anchor', 'middle')
      //.attr("transform", "rotate(-20)")
      .attr('x', d => d.dy / 2)
      .attr('y', _layout.nodeWidth() / 2)
      .attr('dy', '.35em')
      .text(d => d.name)
      .filter(d => d.x < _options.chart.innerWidth / 2)
      .style('font-size', _options.plots.nodeFontSize + 'px');
  }

  const appendedNodes = nodes
    .enter()
    .append('g')
    .attr('class', 'sankey-node')
    .attr('transform', d => 'translate(' + d.x + ',' + d.y + ')')
    .call(_drag);

  appendedNodes
    .append('rect')
    .attr('class', 'sankey-node-rect')
    .attr(
      'height',
      _options.plots.horizontal
        ? d => (d.dy > 0 ? d.dy : 0.5)
        : _layout.nodeWidth() > 0
          ? _layout.nodeWidth()
          : 0.5
    )
    .attr('width', _options.plots.horizontal ? _layout.nodeWidth() : d => d.dy)
    .style('fill', d => {
      return (d.color = _color(d.name));
    })
    .style('fill-opacity', _options.plots.nodeOpacity)
    .style('shape-rendering', 'crispEdges')
    .append('title')
    .text(d => d.name + '\n' + d.value);

  if (_options.plots.horizontal === true) {
    appendedNodes
      .append('text')
      .attr('class', 'sankey-node-title')
      .attr('x', -6)
      .attr('y', d => d.dy / 2)
      .attr('dy', '.35em')
      .attr('text-anchor', 'end')
      .attr('transform', null)
      .text(d => d.name)
      .filter(d => d.x < _options.chart.innerWidth / 2)
      .attr('x', 6 + _layout.nodeWidth())
      .attr('text-anchor', 'start')
      .style('font-size', _options.plots.nodeFontSize + 'px');
  } else {
    appendedNodes
      .append('text')
      .attr('text-anchor', 'middle')
      //.attr("transform", "rotate(-20)")
      .attr('x', d => d.dy / 2)
      .attr('y', _layout.nodeWidth() / 2)
      .attr('dy', '.35em')
      .text(d => d.name)
      .filter(d => d.x < _options.chart.innerWidth / 2)
      .style('font-size', _options.plots.nodeFontSize + 'px');
  }

  // this._linkGroup.selectAll('.sankey-link')
  //     .on('mousemove', mouseOnPath)
  //     .on('mouseout', this._mouseOffPath);

  // nodeGroup.selectAll('.sankey-node-rect')
  //     .on('mousemove', mouseOnNode)
  //     .on('mouseout', mouseOffNode);

  select(_containerId)
    .select('canvas')
    .empty();
};

export default draw;
