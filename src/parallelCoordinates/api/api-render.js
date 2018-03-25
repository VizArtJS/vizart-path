import { apiRenderSVG } from 'vizart-core';
import draw from './draw';

const apiRender = state => ({
  render(data) {
    apiRenderSVG(state).render(data);
    draw(state);
  },
});

export default apiRender;
