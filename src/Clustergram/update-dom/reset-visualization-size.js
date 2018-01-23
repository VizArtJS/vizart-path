import run_reset_visualization_size from './reset-size';

const reset_visualization_size = function(params) {
  let outer_margins =
    params.viz.expand == false
      ? params.viz.outer_margins
      : params.viz.outer_margins_expand;

  // get the size of the window
  let screen_width = window.innerWidth;
  let screen_height = window.innerHeight;

  // define width and height of clustergram container
  let cont_dim = {};
  cont_dim.width = screen_width - outer_margins.left - outer_margins.right;
  cont_dim.height = screen_height - outer_margins.top - outer_margins.bottom;

  run_reset_visualization_size(
    cont_dim.width,
    cont_dim.height,
    outer_margins.left,
    outer_margins.top,
    params
  );
};

export default reset_visualization_size;
