import { format } from 'd3-format';

const commaFormat = format(',');

const transitionPart = (state, data, id, p) => {
  const { _svg, _options } = state;

  const mainbar = _svg
    .select('#' + id)
    .select('.part' + p)
    .select('.mainbars')
    .selectAll('.mainbar')
    .data(data.mainBars[p]);

  mainbar
    .select('.mainrect')
    .transition()
    .duration(_options.animation.duration.partite)
    .attr('y', d => d.middle - d.height / 2)
    .attr('height', d => d.height);

  mainbar
    .select('.barlabel')
    .transition()
    .duration(_options.animation.duration.partite)
    .attr('y', d => d.middle + 5);

  mainbar
    .select('.barvalue')
    .transition()
    .duration(_options.animation.duration.partite)
    .attr('y', d => d.middle + 5)
    .text(d => commaFormat(Math.round(d.value)));

  mainbar
    .select('.barpercent')
    .transition()
    .duration(_options.animation.duration.partite)
    .attr('y', d => d.middle + 5)
    .text(d => '( ' + Math.round(100 * d.percent) + '%)');

  _svg
    .select('#' + id)
    .select('.part' + p)
    .select('.subbars')
    .selectAll('.subbar')
    .data(data.subBars[p])
    .transition()
    .duration(_options.animation.duration.partite)
    .attr('y', d => d.y)
    .attr('height', d => d.h);
};

export default transitionPart;
