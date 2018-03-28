import partiteLayout from '../layout';
import transitionLayout from './transition-layout';

const deSelectSegment = (state, m, s) => {
  const { _data, _options, _svg } = state;

  for (let k of _data) {
    transitionLayout(
      state,
      partiteLayout(
        k.data,
        _options.chart.innerHeight,
        _options.plots.buffMargin,
        _options.plots.minHeight
      ),
      k.id
    );

    const selectedBar = _svg
      .select('#' + k.id)
      .select('.part' + m)
      .select('.mainbars')
      .selectAll('.mainbar')
      .filter((d, i) => i === s);

    selectedBar.select('.mainrect').style('stroke-opacity', 0);
    selectedBar.select('.barlabel').style('font-weight', 'normal');
    selectedBar.select('.barvalue').style('font-weight', 'normal');
    selectedBar.select('.barpercent').style('font-weight', 'normal');
  }
};

export default deSelectSegment;
