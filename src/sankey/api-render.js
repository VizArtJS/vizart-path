import { apiRenderSVG } from 'vizart-core';
import draw from './draw';

const apiRender = state => ({
  render(data) {
    apiRenderSVG(state).render(data);

    const { _svg } = state;

    const _nodeGroup = _svg.append('g').attr('class', 'node-group');
    const _linkGroup = _svg.append('g').attr('class', 'link-group');

    state._nodeGroup = _nodeGroup;
    state._linkGroup = _linkGroup;

    draw(state);
  },
});

export default apiRender;
