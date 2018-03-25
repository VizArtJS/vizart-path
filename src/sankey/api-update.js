import draw from './draw';

const apiUpdate = state => ({
  update() {
    draw(state);
  },
});

export default apiUpdate;
