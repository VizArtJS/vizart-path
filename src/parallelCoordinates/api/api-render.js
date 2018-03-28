import { apiRenderSVG } from 'vizart-core';
import { select } from 'd3-selection';
import draw from './draw';

const apiRender = state => ({
  render(data) {
    apiRenderSVG(state).render(data);
    select('svg').remove();
    draw(state);
  },
});

export default apiRender;
