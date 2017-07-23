/* Reordering Module
 */
import { default as d3 } from 'd3';
// import { select, selectAll } from 'd3-selection';
import { range } from 'd3-array';
import map from 'lodash-es/map';
import indexOf from 'lodash-es/indexOf';
import each from 'lodash-es/each';

const Reorder = function(params) {

    /* Reorder the clustergram using the toggle switch
     */
    function all_reorder(inst_order) {

        params.viz.run_trans = true;
        let row_nodes_obj = params.network_data.row_nodes;
        let row_nodes_names = map(row_nodes_obj, 'name');

        let col_nodes_obj = params.network_data.col_nodes;
        let col_nodes_names = map(col_nodes_obj, 'name');

        // load orders
        if (inst_order === 'ini') {
            params.matrix.x_scale.domain(params.matrix.orders.ini_row);
            params.matrix.y_scale.domain(params.matrix.orders.ini_col);
        } else if (inst_order === 'clust') {
            params.matrix.x_scale.domain(params.matrix.orders.clust_row);
            params.matrix.y_scale.domain(params.matrix.orders.clust_col);
        } else if (inst_order === 'rank') {
            params.matrix.x_scale.domain(params.matrix.orders.rank_row);
            params.matrix.y_scale.domain(params.matrix.orders.rank_col);
        } else if (inst_order === 'class') {
            params.matrix.x_scale.domain(params.matrix.orders.class_row);
            params.matrix.y_scale.domain(params.matrix.orders.class_col);
        }

        // only animate transition if there are a small number of tiles
        if (d3.selectAll('.tile')[0].length < params.matrix.def_large_matrix) {

            // define the t variable as the transition function
            let t = viz.get_clust_group()
                .transition().duration(2500);

            // reorder matrix
            t.selectAll('.tile')
                .attr('transform', function (d) {
                    return 'translate(' + params.matrix.x_scale(d.target) + ' , ' + params.matrix.y_scale(d.source) + ')';
                });

            // Move Row Labels
            d3.select('#row_label_zoom_container').selectAll('.row_label_text')
                .transition().duration(2500)
                .attr('transform', function (d) {
                    let inst_index = indexOf(row_nodes_names, d.name);
                    return 'translate(0,' + params.matrix.y_scale(inst_index) + ')';
                });

            // t.selectAll('.column')
            d3.select('#col_label_zoom_container').selectAll('.col_label_text')
                .transition().duration(2500)
                .attr('transform', function (d) {
                    let inst_index = indexOf(col_nodes_names, d.name);
                    return 'translate(' + params.matrix.x_scale(inst_index) + ') rotate(-90)';
                });

            // reorder row_label_triangle groups
            d3.selectAll('.row_viz_group')
                .transition().duration(2500)
                .attr('transform', function (d) {
                    let inst_index = indexOf(row_nodes_names, d.name);
                    return 'translate(0,' + params.matrix.y_scale(inst_index) + ')';
                });

            // reorder col_class groups
            d3.selectAll('.col_viz_group')
                .transition().duration(2500)
                .attr('transform', function (d) {
                    let inst_index = indexOf(col_nodes_names, d.name);
                    return 'translate(' + params.matrix.x_scale(inst_index) + ',0)';
                });

        } else {

            // define the t variable as the transition function
            let t = viz.get_clust_group();

            // reorder matrix
            t.selectAll('.row')
                .attr('transform', function (d, i) {
                    return 'translate(0,' + params.matrix.y_scale(i) + ')';
                })
                .selectAll('.tile')
                .attr('transform', function (d) {
                    return 'translate(' + params.matrix.x_scale(d.pos_x) + ' , 0)';
                });

            // Move Row Labels
            d3.select('#row_label_zoom_container').selectAll('.row_label_text')
                .attr('transform', function (d) {
                    let inst_index = indexOf(row_nodes_names, d.name);
                    return 'translate(0,' + params.matrix.y_scale(inst_index) + ')';
                });

            // t.selectAll('.column')
            d3.select('#col_label_zoom_container').selectAll('.col_label_text')
                .attr('transform', function (d) {
                    let inst_index = indexOf(col_nodes_names, d.name);
                    return 'translate(' + params.matrix.x_scale(inst_index) + ') rotate(-90)';
                });

            // reorder row_label_triangle groups
            d3.selectAll('.row_viz_group')
                .attr('transform', function (d) {
                    let inst_index = indexOf(row_nodes_names, d.name);
                    return 'translate(0,' + params.matrix.y_scale(inst_index) + ')';
                });

            // reorder col_class groups
            d3.selectAll('.col_viz_group')
                .attr('transform', function (d) {
                    let inst_index = indexOf(col_nodes_names, d.name);
                    return 'translate(' + params.matrix.x_scale(inst_index) + ',0)';
                });

        }

        // redefine x and y positions
        each(params.network_data.links, function (d) {
            d.x = params.matrix.x_scale(d.target);
            d.y = params.matrix.y_scale(d.source);
        });

        // rename crossfilter
        params.cf = {};
        params.cf.links = crossfilter(params.network_data.links);
        params.cf.dim_x = params.cf.links.dimension(function (d) {
            return d.x;
        });
        params.cf.dim_y = params.cf.links.dimension(function (d) {
            return d.y;
        });

        // backup allow programmatic zoom
        setTimeout(end_reorder, 2500);

    }

    function row_reorder() {

        // get inst row (gene)
        let inst_row = d3.select(this).select('text').text();

        // get row and col nodes
        params.viz.run_trans = true;

        let mat = params.matrix.matrix;
        let row_nodes = params.network_data.row_nodes;
        let col_nodes = params.network_data.col_nodes;

        let col_nodes_names = map(col_nodes, 'name');

        // find the index of the row
        let tmp_arr = [];
        each(row_nodes, function (node) {
            tmp_arr.push(node.name);
        });

        // find index
        let _inst_row = indexOf(tmp_arr, inst_row);

        // gather the values of the input genes
        tmp_arr = [];
        each(col_nodes, function (node, index) {
            tmp_arr.push(mat[_inst_row][index].value);
        });

        // sort the rows
        let tmp_sort = range(tmp_arr.length).sort(function (a, b) {
            return tmp_arr[b] - tmp_arr[a];
        });

        // resort cols
        params.matrix.x_scale.domain(tmp_sort);

        // reorder matrix
        ////////////////////

        // define the t variable as the transition function
        let t = viz.get_clust_group()
            .transition().duration(2500);

        if (d3.select('.row_tile').empty()) {
            // reorder matrix
            t.selectAll('.tile')
                .attr('transform', function (d) {
                    return 'translate(' + params.matrix.x_scale(d.target) + ',' + params.matrix.y_scale(d.source) + ')';
                });
        } else {
            // reorder matrix
            t.selectAll('.tile')
                .attr('transform', function (data) {
                    return 'translate(' + params.matrix.x_scale(data.pos_x) + ',0)';
                });
        }

        // Move Col Labels
        d3.select('#col_label_zoom_container').selectAll('.col_label_text')
            .transition().duration(2500)
            .attr('transform', function (d) {
                let inst_index = indexOf(col_nodes_names, d.name);
                return 'translate(' + params.matrix.x_scale(inst_index) + ')rotate(-90)';
            });

        // reorder col_class groups
        d3.selectAll('.col_viz_group')
            .transition().duration(2500)
            .attr('transform', function (d) {
                let inst_index = indexOf(col_nodes_names, d.name);
                return 'translate(' + params.matrix.x_scale(inst_index) + ',0)';
            })
            .each('end', function () {
                // set running transition to 0
                params.viz.run_trans = false;
            });

        // highlight selected column
        ///////////////////////////////
        // unhilight and unbold all columns (already unbolded earlier)
        d3.selectAll('.row_label_text')
            .select('rect')
            .style('opacity', 0);
        // highlight column name
        d3.select(this)
            .select('rect')
            .style('opacity', 1);

        reposition_tile_highlight();

        // redefine x and y positions
        each(params.network_data.links, function (d) {
            d.x = params.matrix.x_scale(d.target);
            d.y = params.matrix.y_scale(d.source);
        });

        // rename crossfilter
        params.cf = {};
        params.cf.links = crossfilter(params.network_data.links);
        params.cf.dim_x = params.cf.links.dimension(function (d) {
            return d.x;
        });
        params.cf.dim_y = params.cf.links.dimension(function (d) {
            return d.y;
        });


        // backup allow programmatic zoom
        setTimeout(end_reorder, 2500);
    }

    function col_reorder() {
        // set running transition value
        params.viz.run_trans = true;

        let mat = params.matrix.matrix;
        let row_nodes = params.network_data.row_nodes;
        let col_nodes = params.network_data.col_nodes;

        let row_nodes_names = map(row_nodes, 'name');

        // get inst col (term)
        let inst_term = d3.select(this).select('text').attr('full_name');

        // find the column number of this term from col_nodes
        // gather column node names
        let tmp_arr = [];
        each(col_nodes, function (node) {
            tmp_arr.push(node.name);
        });

        // find index
        let inst_col = indexOf(tmp_arr, inst_term);

        // gather the values of the input genes
        tmp_arr = [];
        each(row_nodes, function (node, index) {
            tmp_arr.push(mat[index][inst_col].value);
        });

        // sort the cols
        let tmp_sort = range(tmp_arr.length).sort(function (a, b) {
            return tmp_arr[b] - tmp_arr[a];
        });


        // resort cols
        ////////////////////////////
        params.matrix.y_scale.domain(tmp_sort);

        // reorder
        // define the t variable as the transition function
        let t = viz.get_clust_group()
            .transition().duration(2500);

        if (d3.select('.row_tile').empty()) {

            // reorder matrix
            t.selectAll('.tile')
                .attr('transform', function (d) {
                    return 'translate(' + params.matrix.x_scale(d.target) + ',' + params.matrix.y_scale(d.source) + ')';
                });
        } else {
            // reorder matrix
            t.selectAll('.row')
                .attr('transform', function (data, index) {
                    return 'translate(0,' + params.matrix.y_scale(index) + ')';
                });
        }

        // reorder row_label_triangle groups
        d3.selectAll('.row_viz_group')
            .transition().duration(2500)
            .attr('transform', function (d) {
                let inst_index = indexOf(row_nodes_names, d.name);
                return 'translate(0,' + params.matrix.y_scale(inst_index) + ')';
            });

        // Move Row Labels
        d3.select('#row_label_zoom_container').selectAll('.row_label_text')
            .transition().duration(2500)
            .attr('transform', function (d) {
                let inst_index = indexOf(row_nodes_names, d.name);
                return 'translate(0,' + params.matrix.y_scale(inst_index) + ')';
            });

        // highlight selected column
        ///////////////////////////////
        // unhilight and unbold all columns (already unbolded earlier)
        d3.selectAll('.col_label_text')
            .select('rect')
            .style('opacity', 0);
        // highlight column name
        d3.select(this)
            .select('rect')
            .style('opacity', 1);

        // redefine x and y positions
        each(params.network_data.links, function (d) {
            d.x = params.matrix.x_scale(d.target);
            d.y = params.matrix.y_scale(d.source);
        });

        // rename crossfilter
        params.cf = {};
        params.cf.links = crossfilter(params.network_data.links);
        params.cf.dim_x = params.cf.links.dimension(function (d) {
            return d.x;
        });
        params.cf.dim_y = params.cf.links.dimension(function (d) {
            return d.y;
        });

        reposition_tile_highlight();

        // backup allow programmatic zoom
        setTimeout(end_reorder, 2500);
    }

    // allow programmatic zoom after reordering
    function end_reorder() {
        params.viz.run_trans = false;
    }

    // reposition tile highlight
    function reposition_tile_highlight() {
        // resize click hlight
        let rel_width_hlight = 6;
        let opacity_hlight = 0.85;

        let hlight_width = rel_width_hlight * params.viz.border_width;
        let hlight_height = rel_width_hlight * params.viz.border_width / params.viz.zoom_switch;
        // reposition tile highlight
        ////////////////////////////////

        // top highlight
        d3.select('#top_hlight')
            .attr('width', params.matrix.x_scale.bandwidth())
            .attr('height', hlight_height)
            .transition().duration(2500)
            .attr('transform', function () {
                return 'translate(' + params.matrix.x_scale(params.matrix.click_hlight_x) + ',0)';
            });

        // left highlight
        d3.select('#left_hlight')
            .attr('width', hlight_width)
            .attr('height', params.matrix.y_scale.bandwidth() - hlight_height * 0.99)
            .transition().duration(2500)
            .attr('transform', function () {
                return 'translate(' + params.matrix.x_scale(params.matrix.click_hlight_x) + ',' +
                    hlight_height * 0.99 + ')';
            });

        // right highlight
        d3.select('#right_hlight')
            .attr('width', hlight_width)
            .attr('height', params.matrix.y_scale.bandwidth() - hlight_height * 0.99)
            .transition().duration(2500)
            .attr('transform', function () {
                let tmp_translate = params.matrix.x_scale(params.matrix.click_hlight_x) + params.matrix.x_scale.bandwidth() - hlight_width;
                return 'translate(' + tmp_translate + ',' +
                    hlight_height * 0.99 + ')';
            });

        // bottom highlight
        d3.select('#bottom_hlight')
            .attr('width', function () {
                return params.matrix.x_scale.bandwidth() - 1.98 * hlight_width
            })
            .attr('height', hlight_height)
            .transition().duration(2500)
            .attr('transform', function () {
                let tmp_translate_x = params.matrix.x_scale(params.matrix.click_hlight_x) + hlight_width * 0.99;
                let tmp_translate_y = params.matrix.y_scale.bandwidth() - hlight_height;
                return 'translate(' + tmp_translate_x + ',' +
                    tmp_translate_y + ')';
            });

    }

    return {
        row_reorder: row_reorder,
        col_reorder: col_reorder,
        all_reorder: all_reorder
    };

}

export default Reorder;
