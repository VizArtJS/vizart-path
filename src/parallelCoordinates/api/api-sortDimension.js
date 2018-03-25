import sortDim from './sort-dim';

const apiSortDimensions = state => ({
  sortDimensions: sortDim(state),
});

export default apiSortDimensions;
