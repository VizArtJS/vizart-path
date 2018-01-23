import { default as d3 } from 'd3';
// import { select, selectAll } from 'd3-selection';
import Zoom from '../components/zoom';
import Reorder from '../components/re-order';
import Search from '../components/search';
import Config from '../config/config';

import check_need_exit_enter from './check-need-exit-enter';
import enter_exit_update from './enter-exit-update';

const update_network = function(args) {

    let old_params = this.params;

    let config = Config(args);
    let params = VizParams(config);

    let delays = check_need_exit_enter(old_params, params);

    let network_data = params.network_data;

    // ordering - necessary for redefining the function called on button click
    let reorder = Reorder(params);
    this.reorder = reorder.all_reorder;

    enter_exit_update(params, network_data, reorder, delays);

    // update network data
    // this.params.network_data = network_data;
    this.params = params;

    // search functions
    let gene_search = Search(params, params.network_data.row_nodes, 'name');
    this.get_genes = gene_search.get_entities;
    this.find_gene = gene_search.find_entities;

    // initialize screen resizing - necesary for resizing with new params
    params.initialize_resizing(params);

    // necessary to have zoom behavior on updated clustergram
    // params.zoom corresponds to the zoomed function from the Zoom object
    d3.select('#main_svg').call(params.zoom);

    // d3.select('#main_svg').on('dblclick.zoom',null);

    // initialize the double click behavior - necessary for nomal zoom/double click
    // behavior
    let zoom = Zoom(params);
    zoom.ini_doubleclick();

}

export default update_network;