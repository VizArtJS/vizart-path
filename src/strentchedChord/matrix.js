import groupBy from 'lodash-es/groupBy';
import keys from 'lodash-es/keys';

const transformMatrix = (_data, _opt) => {
  const _sourceAccessor = _opt.data.source.accessor;
  const _targetAccessor = _opt.data.target.accessor;
  const _linkAccessor = _opt.data.link.accessor;
  const emptyPerc = _opt.plots.emptyPercent;
  const chartData = _data.slice();

  let sourceGroup = groupBy(chartData, _sourceAccessor);
  let targetGroup = groupBy(chartData, _targetAccessor);

  let sourceLabels = keys(sourceGroup);
  let targetLabels = keys(targetGroup);

  let rowLabels = sourceLabels.concat(targetLabels);
  let sourceDivide = sourceLabels.length;

  let rowLength = rowLabels.length;

  let matrix = [];
  let respondents = 0;

  for (let i = 0; i <= rowLength + 1; i++) {
    matrix[i] = [];
    for (let j = 0; j <= rowLength + 1; j++) {
      matrix[i][j] = 0;
    }
  }

  for (let sourceLabel of sourceLabels) {
    let group = sourceGroup[sourceLabel];

    for (let gItem of group) {
      let sourceIndex = sourceLabels.indexOf('' + gItem[_sourceAccessor]);
      let targetIndex = targetLabels.indexOf('' + gItem[_targetAccessor]);

      matrix[sourceIndex][targetIndex + 1 + sourceDivide] = +gItem[
        _linkAccessor
      ];
      respondents = respondents + +gItem[_linkAccessor];
    }
  }

  for (let targetLabel of targetLabels) {
    let group = targetGroup[targetLabel];

    for (let gItem of group) {
      let sourceIndex = sourceLabels.indexOf('' + gItem[_sourceAccessor]);
      let targetIndex = targetLabels.indexOf('' + gItem[_targetAccessor]);

      matrix[targetIndex + 1 + sourceDivide][sourceIndex] = +gItem[
        _linkAccessor
      ];

      respondents = respondents + +gItem[_linkAccessor];
    }
  }

  for (let i = 0; i < sourceDivide; i++) {
    for (let j = sourceDivide + 1; j < rowLabels.length + 1; j++) {
      if (matrix[i][j] === 0) {
        matrix[i][j] = 1;

        respondents = respondents + 1;
      }
    }
  }

  for (let i = sourceDivide + 1; i < rowLabels.length + 1; i++) {
    for (let j = 0; j < sourceDivide; j++) {
      if (matrix[i][j] === 0) {
        matrix[i][j] = 1;

        respondents = respondents + 1;
      }
    }
  }

  let emptyStroke = Math.round(respondents * emptyPerc);

  matrix[sourceDivide][rowLength + 1] = emptyStroke;
  matrix[rowLength + 1][sourceDivide] = emptyStroke;

  let offset = (2 * Math.PI * (emptyStroke / (respondents + emptyStroke))) / 4;

  return {
    rowLabel: sourceLabels
      .concat('')
      .concat(targetLabels)
      .concat(''),
    matrix: matrix,
    offset: offset,
  };
};

export default transformMatrix;
