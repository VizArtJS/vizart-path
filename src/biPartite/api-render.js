import { apiRenderSVG } from 'vizart-core';

const apiRender = state => ({
  render(data) {
    apiRenderSVG(state).render(data);
    state.update();
  },
});

export default apiRender;
