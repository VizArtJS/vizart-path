import Config from './config/config';
import VizParams from './viz-params';
import Viz from './viz';

const Clustergram = args => {
  /* Main program
   * ----------------------------------------------------------------------- */

  // consume and validate user input
  // build giant config object
  // visualize based on config object
  // handle user events

  // consume and validate user arguments, produce configuration object
  let config = Config(args);

  // make visualization parameters using configuration object
  let params = VizParams(config);

  // make visualization using parameters
  let viz = Viz(params);

  /* API
   * ----------------------------------------------------------------------- */

  return {
    find_gene: viz.search.find_entities,
    get_genes: viz.search.get_entities,
    change_groups: viz.change_group,
    reorder: viz.reorder,
    opacity_slider: viz.opacity_slider,
    opacity_function: viz.opacity_function,
    resize: viz.run_reset_visualization_size,
    update_network: viz.update_network,
    params: viz.params,
  };
};

export default Clustergram;
