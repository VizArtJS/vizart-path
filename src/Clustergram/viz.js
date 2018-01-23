/* Represents the entire visualization: labels, dendrogram (optional) and matrix.
 */
import { default as d3 } from 'd3';
// import { select, selectAll } from 'd3-selection';
import { scaleLinear, scaleLog } from 'd3-scale';
import Dendrogram from './components/dendrogram';

import run_reset_visualization_size from './update-dom/reset-size';
import update_network from './update-dom/update-network';

import Matrix from  './components/matrix';
import Reorder from './components/re-order';
import Labels from './components/labels';
import Search from './components/search';
import Spillover from './components/spil-over';
import SuperLabels from './components/super-labels';

const Viz = function(params) {

    // scope these variables to viz
    let matrix;
    let row_dendrogram;
    let col_dendrogram;
    let zoom_obj;
    let reorder;

    let _params = make(params);

    /* The main function; makes clustergram based on user arguments.
     */
    function make(params) {

        let network_data = params.network_data;

        // set local variables from network_data
        let col_nodes = network_data.col_nodes;
        let row_nodes = network_data.row_nodes;
        let svg_group;

        // Begin Making Visualization
        /////////////////////////////////

        // remove any previous visualizations
        d3.select('#main_svg').remove();

        zoom_obj = params.zoom_obj;

        // initialize svg
        if (d3.select('#' + params.viz.svg_div_id).select('svg').empty()) {
            svg_group = d3.select('#' + params.viz.svg_div_id)
                .append('svg')
                .attr('id', 'main_svg')
                .attr('width', params.viz.svg_dim.width)
                .attr('height', params.viz.svg_dim.height);
        } else {
            svg_group = d3.select('#' + params.viz.svg_div_id)
                .select('svg')
                .attr('width', params.viz.svg_dim.width)
                .attr('height', params.viz.svg_dim.height);
        }

        // make the matrix
        /////////////////////////
        matrix = Matrix(network_data, svg_group, params);

        // define reordering object - scoped to viz
        reorder = Reorder(params);

        // define labels object
        let labels = Labels(params);

        let row_triangle_ini_group = labels.make_rows(params, row_nodes, reorder, 0);
        let container_all_col = labels.make_cols(params, col_nodes, reorder, 0);


        // add group labels if necessary
        //////////////////////////////////
        if (params.viz.show_dendrogram) {

            // make row dendrogram
            row_dendrogram = Dendrogram('row', params, 0);

            // add class label under column label
            let col_class = container_all_col
                .append('g')
                .attr('id', 'col_viz_outer_container')
                .attr('transform', function () {
                    let inst_offset = params.norm_label.width.col + 2;
                    return 'translate(0,' + inst_offset + ')';
                })
                .append('g')
                .attr('id', 'col_viz_zoom_container');

            // make col dendrogram
            col_dendrogram = Dendrogram('col', params, 0);

            // optional column callback on click
            if (typeof params.click_group === 'function') {

                d3.select('#col_viz_outer_container')
                    .on('click', function (d) {
                        let inst_level = params.group_level.col;
                        let inst_group = d.group[inst_level];
                        // find all column names that are in the same group at the same group_level
                        // get col_nodes
                        col_nodes = params.network_data.col_nodes;
                        let group_nodes = [];

                        for (let node of col_nodes) {
                            // check that the node is in the group
                            if (node.group[inst_level] === inst_group) {
                                // make a list of genes that are in inst_group at this group_level
                                group_nodes.push(node.name);
                            }
                        }

                        // return the following information to the user
                        // row or col, distance cutoff level, nodes
                        let group_info = {};
                        group_info.type = 'col';
                        group_info.nodes = group_nodes;
                        group_info.info = {
                            'type': 'distance',
                            'cutoff': inst_level / 10
                        };

                        // pass information to group_click callback
                        params.click_group(group_info);

                    });
            }

        }


        // Spillover Divs
        let spillover = Spillover(params, container_all_col);

        // Super Labels
        if (params.labels.super_labels) {
            let super_labels = SuperLabels();
            super_labels.make(params);
        }

        // tmp add final svg border here
        // add border to svg in four separate lines - to not interfere with clicking anything
        ///////////////////////////////////////////////////////////////////////////////////////
        // left border
        d3.select('#main_svg')
            .append('rect')
            .attr('id', 'left_border')
            .attr('fill', params.viz.super_border_color) //!! prog_colors
            .attr('width', params.viz.grey_border_width)
            .attr('height', params.viz.svg_dim.height)
            .attr('transform', 'translate(0,0)');

        // right border
        d3.select('#main_svg')
            .append('rect')
            .attr('id', 'right_border')
            .attr('fill', params.viz.super_border_color) //!! prog_colors
            .attr('width', params.viz.grey_border_width)
            .attr('height', params.viz.svg_dim.height)
            .attr('transform', function () {
                let inst_offset = params.viz.svg_dim.width - params.viz.grey_border_width;
                return 'translate(' + inst_offset + ',0)';
            });

        // top border
        d3.select('#main_svg')
            .append('rect')
            .attr('id', 'top_border')
            .attr('fill', params.viz.super_border_color) //!! prog_colors
            .attr('width', params.viz.svg_dim.width)
            .attr('height', params.viz.grey_border_width)
            .attr('transform', function () {
                let inst_offset = 0;
                return 'translate(' + inst_offset + ',0)';
            });

        // bottom border
        d3.select('#main_svg')
            .append('rect')
            .attr('id', 'bottom_border')
            .attr('fill', params.viz.super_border_color) //!! prog_colors
            .attr('width', params.viz.svg_dim.width)
            .attr('height', params.viz.grey_border_width)
            .attr('transform', function () {
                let inst_offset = params.viz.svg_dim.height - params.viz.grey_border_width;
                return 'translate(0,' + inst_offset + ')';
            });

        ///////////////////////////////////
        // initialize translate vector to compensate for label margins
        params.zoom.translate([params.viz.clust.margin.left, params.viz.clust.margin.top]);

        // initialize screen resizing
        params.initialize_resizing(params);

        // initialize double click zoom for matrix
        ////////////////////////////////////////////
        zoom_obj.ini_doubleclick();

        if (params.viz.do_zoom) {
            svg_group.call(params.zoom);
        }

        d3.select('#main_svg').on('dblclick.zoom', null);

        return params;
    }


    // highlight resource types - set up type/color association
    let gene_search = Search(_params, _params.network_data.row_nodes, 'name');

    // change opacity
    let opacity_slider = function (inst_slider) {

        let max_link = _params.matrix.max_link;
        let slider_scale = scaleLinear()
            .domain([0, 1])
            .range([1, 0.1]);

        let slider_factor = slider_scale(inst_slider);

        if (_params.matrix.opacity_function === 'linear') {
            _params.matrix.opacity_scale = scaleLinear()
                .domain([0, slider_factor * Math.abs(_params.matrix.max_link)])
                .clamp(true)
                .range([0.0, 1.0]);
        } else if (_params.matrix.opacity_function === 'log') {
            _params.matrix.opacity_scale = scaleLog()
                .domain([0.0001, slider_factor * Math.abs(_params.matrix.max_link)])
                .clamp(true)
                .range([0.0, 1.0]);
        }

        d3.selectAll('.tile')
            .style('fill-opacity', function (d) {
                return _params.matrix.opacity_scale(Math.abs(d.value));
            });

    }

    return {
        change_group: function (inst_rc, inst_index) {
            if (inst_rc === 'row') {
                row_dendrogram.change_groups(inst_index);
            } else {
                col_dendrogram.change_groups(inst_index);
            }
        },
        get_clust_group: function () {
            return matrix.get_clust_group();
        },
        get_matrix: function () {
            return matrix.get_matrix();
        },
        get_nodes: function (type) {
            return matrix.get_nodes(type);
        },
        two_translate_zoom: zoom_obj.two_translate_zoom,
        // expose all_reorder function
        reorder: reorder.all_reorder,
        search: gene_search,
        opacity_slider: opacity_slider,
        run_reset_visualization_size: run_reset_visualization_size,
        update_network: update_network,
        params: _params,
        draw_gridlines: matrix.draw_gridlines
    }


}

export default Viz