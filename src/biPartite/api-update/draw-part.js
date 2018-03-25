import { c1, b, bb } from './bounding-box';

const drawPart = (state, data, id, p) => {
  const { _svg, _options, _color } = state;

  _svg
    .select('#' + id)
    .append('g')
    .attr('class', 'part' + p)
    .attr(
      'transform',
      'translate(' + (p * (bb(_options) + b) + _options.plots.gap) + ',0)'
    );
  _svg
    .select('#' + id)
    .select('.part' + p)
    .append('g')
    .attr('class', 'subbars')
    .attr('x', 50);
  _svg
    .select('#' + id)
    .select('.part' + p)
    .append('g')
    .attr('class', 'mainbars');

  const mainbar = _svg
    .select('#' + id)
    .select('.part' + p)
    .select('.mainbars')
    .selectAll('.mainbar')
    .data(data.mainBars[p])
    .enter()
    .append('g')
    .attr('class', 'mainbar');

  mainbar
    .append('rect')
    .attr('class', 'mainrect')
    .attr('x', 60)
    .attr('y', d => d.middle - d.height / 2)
    .attr('width', b)
    .attr('height', d => d.height)
    .style('shape-rendering', 'auto')
    .style('fill-opacity', 0)
    .style('stroke-width', '0.5')
    .style('stroke', 'black')
    .style('stroke-opacity', 0);

  if (p < 1) {
    mainbar
      .append('text')
      .attr('class', 'barlabel')
      .attr('x', c1[1] - 30)
      .attr('y', d => d.middle + 5)
      .text(
        (d, i) =>
          '(' + Math.round(100 * d.percent) + '%) ' + data.keys[p][i] + ' '
      )
      .attr('text-anchor', 'end');
  } else {
    mainbar
      .append('text')
      .attr('class', 'barlabel')
      .attr('x', c1[1] + 10)
      .attr('y', d => d.middle + 5)
      .text(
        (d, i) =>
          ' ' + data.keys[p][i] + ' (' + Math.round(100 * d.percent) + '%)'
      )
      .attr('text-anchor', 'start');
  }
  /*
   mainbar.append("text").attr("class","barlabel")
   .attr("x", c1[p]).attr("y",function(d){ return d.middle+5;})
   .text(function(d,i){ return " " + data.keys[p][i] + " ("+Math.round(100*d.percent)+"%)";})
   .attr("text-anchor","start" );

   mainbar.append("text").attr("class","barvalue")
   .attr("x", c2[p]).attr("y",function(d){ return d.middle+5;})
   .text(function(d,i){ return commaFormat(round(d.value)) ;})
   .attr("text-anchor","end");

   mainbar.append("text").attr("class","barpercent")
   .attr("x", c3[p]).attr("y",function(d){ return d.middle+5;})
   .text(function(d,i){ return "( "+Math.round(100*d.percent)+"%)" ;})
   .attr("text-anchor","end").style("fill","grey");
   */
  _svg
    .select('#' + id)
    .select('.part' + p)
    .select('.subbars')
    .selectAll('.subbar')
    .data(data.subBars[p])
    .enter()
    .append('rect')
    .attr('class', 'subbar')
    .attr('x', 60)
    .attr('y', d => d.y)
    .attr('width', b)
    .attr('height', d => d.h)
    .style('fill', d => _color(d.key1));
};

export default drawPart;
