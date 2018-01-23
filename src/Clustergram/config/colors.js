import {
  schemeCategory20,
  schemeCategory20b,
  schemeCategory20c,
  scaleOrdinal,
} from 'd3-scale';

const Colors = function() {
  // colors from http://graphicdesign.stackexchange.com/revisions/3815/8
  let rand_colors;

  // generate random colors
  let tmp0 = ['#000000', '#FF34FF', '#FFFF00', '#FF4A46'];
  let tmp1 = scaleOrdinal(schemeCategory20)
    .range()
    .reverse();
  let tmp2 = scaleOrdinal(schemeCategory20b).range();
  let tmp3 = scaleOrdinal(schemeCategory20c).range();
  rand_colors = tmp0
    .concat(tmp1)
    .concat(tmp2)
    .concat(tmp3);

  const get_default_color = function() {
    //return rand_colors[0];
    return '#EEE';
  };

  const get_random_color = function(i) {
    return rand_colors[i % get_num_colors()];
  };

  const get_num_colors = function() {
    return rand_colors.length;
  };

  return {
    get_default_color: get_default_color,
    get_random_color: get_random_color,
    get_num_colors: get_num_colors,
  };
};

export default Colors;
