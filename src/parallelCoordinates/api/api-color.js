const apiColor = state => ({
  color(colorOptions) {
    if (!colorOptions) {
      console.warn('color opt is null, either scheme or type is required');
      return;
    } else if (!colorOptions.type && !colorOptions.scheme) {
      console.warn('invalid color opt, either scheme or type is required');
      return;
    }

    if (colorOptions.type) {
      state._options.color.type = colorOptions.type;
    }

    if (colorOptions.scheme) {
      state._options.color.scheme = colorOptions.scheme;
    }

    state._color = state._composers.color(state._options.color);

    const { parcoords, _options } = state;
    parcoords
      .color(d => state._color(d[_options.plots.colorDimension]))
      .render();
  },
});

export default apiColor;
