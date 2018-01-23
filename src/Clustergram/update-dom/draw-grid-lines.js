import { default as d3 } from 'd3';
// import { select, selectAll} from 'd3-selection';
import indexOf from 'lodash-es/indexOf';

const draw_grid_lines = function(params, row_nodes, col_nodes) {
  let row_nodes_names = params.network_data.row_nodes_names;
  let col_nodes_names = params.network_data.col_nodes_names;

  d3.selectAll('.horz_lines').remove();

  d3.selectAll('.vert_lines').remove();

  // append horizontal lines
  d3
    .select('#clust_group')
    .selectAll('.horz_lines')
    .data(row_nodes, function(d) {
      return d.name;
    })
    .enter()
    .append('g')
    .attr('class', 'horz_lines')
    .attr('transform', function(d) {
      let inst_index = indexOf(row_nodes_names, d.name);
      return 'translate(0,' + params.matrix.y_scale(inst_index) + ') rotate(0)';
    })
    .append('line')
    .attr('x1', 0)
    .attr('x2', params.viz.clust.dim.width)
    .style(
      'stroke-width',
      params.viz.border_width / params.viz.zoom_switch + 'px'
    )
    .style('stroke', 'white');

  // append vertical line groups
  d3
    .select('#clust_group')
    .selectAll('.vert_lines')
    .data(col_nodes)
    .enter()
    .append('g')
    .attr('class', 'vert_lines')
    .attr('transform', function(d) {
      let inst_index = indexOf(col_nodes_names, d.name);
      return 'translate(' + params.matrix.x_scale(inst_index) + ') rotate(-90)';
    })
    .append('line')
    .attr('x1', 0)
    .attr('x2', -params.viz.clust.dim.height)
    .style('stroke-width', params.viz.border_width + 'px')
    .style('stroke', 'white');
};

export default draw_grid_lines;
