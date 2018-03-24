import partiteLayout from './layout';
import transitionLayout from './transition-layout';

const selectSegment = (state, m, s) => {
  const { _svg, _data, _options } = state;

  for (const k of _data) {
    const newData = { keys: [], data: [] };

    newData.keys = k.data.keys.slice();
    newData.data[m] = k.data.data[m].slice();

    newData.data[1 - m] = k.data.data[1 - m].map(v => {
      return v.map((d, i) => (s == i ? d : 0));
    });

    transitionLayout(
      state,
      partiteLayout(
        newData,
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

    selectedBar.select('.mainrect').style('stroke-opacity', 1);
    selectedBar.select('.barlabel').style('font-weight', 'bold');
    selectedBar.select('.barvalue').style('font-weight', 'bold');
    selectedBar.select('.barpercent').style('font-weight', 'bold');
  }
};

export default selectSegment;
