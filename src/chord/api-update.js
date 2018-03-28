import { apiUpdate as apiUpdateSVG } from 'vizart-core';
import draw from './draw';

const apiUpdate = state => ({
  update() {
    apiUpdateSVG(state).update();
    draw(state);
  },
});

export default apiUpdate;
