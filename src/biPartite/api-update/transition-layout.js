import transitionPart from './transition-part';
import transitionEdges from './transition-edges';

const transitionLayout = (state, data, id) => {
  transitionPart(state, data, id, 0);
  transitionPart(state, data, id, 1);
  transitionEdges(state, data, id);
};

export default transitionLayout;
