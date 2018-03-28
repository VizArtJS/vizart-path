const apiColor = state => ({
  color(colorOptions) {
    const { parcoords, _options } = state;
    _options.color = colorOptions;
    state._color = state._composers.color(colorOptions);

    parcoords
      .color(d => state._color(d[_options.plots.colorDimension]))
      .render();
  },
});

export default apiColor;
