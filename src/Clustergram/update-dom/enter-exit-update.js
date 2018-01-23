import { default as d3 } from 'd3';

import Dendrogram from '../components/dendrogram';
import Labels from '../components/labels';
import resize_after_update from './resize-after-update';

// import { select, selectAll } from 'd3-selection';
import indexOf from 'lodash-es/indexOf';

const enter_exit_update = function(params, network_data, reorder, delays) {
  let duration = 1000;

  // make global so that names can be accessed
  let row_nodes = network_data.row_nodes;
  let col_nodes = network_data.col_nodes;
  let links = network_data.links;

  //
  let tile_data = links;

  // add name to links for object constancy
  for (let i = 0; i < tile_data.length; i++) {
    let d = tile_data[i];
    tile_data[i].name =
      row_nodes[d.source].name + '_' + col_nodes[d.target].name;
  }

  function get_key(d) {
    return d.name;
  }

  // remove tiles
  d3
    .selectAll('.tile')
    .data(links, function(d) {
      return d.name;
    })
    .exit()
    .transition()
    .duration(duration)
    .style('opacity', 0)
    .remove();

  // remove row labels
  d3
    .selectAll('.row_label_text')
    .data(row_nodes, function(d) {
      return d.name;
    })
    .exit()
    .transition()
    .duration(duration)
    .style('opacity', 0)
    .remove();

  // remove column labels
  d3
    .selectAll('.col_label_click')
    .data(col_nodes, function(d) {
      return d.name;
    })
    .exit()
    .transition()
    .duration(duration)
    .style('opacity', 0)
    .remove();

  // remove row triangles and colorbars
  d3
    .selectAll('.row_viz_group')
    .data(row_nodes, function(d) {
      return d.name;
    })
    .exit()
    .transition()
    .duration(duration)
    .style('opacity', 0)
    .remove();

  // remove row triangles
  d3
    .selectAll('.col_label_text')
    .data(col_nodes, function(d) {
      return d.name;
    })
    .exit()
    .transition()
    .duration(duration)
    .style('opacity', 0)
    .remove();

  d3
    .selectAll('.horz_lines')
    .data(row_nodes, function(d) {
      return d.name;
    })
    .exit()
    .transition()
    .duration(duration)
    .style('opacity', 0)
    .remove();

  d3
    .selectAll('.vert_lines')
    .data(col_nodes, function(d) {
      return d.name;
    })
    .exit()
    .transition()
    .duration(duration)
    .style('opacity', 0)
    .remove();

  // remove dendrogram
  d3
    .selectAll('.col_viz_group')
    .data(col_nodes, function(d) {
      return d.name;
    })
    .exit()
    .transition()
    .duration(duration)
    .style('opacity', 0)
    .remove();

  // resize clust components using appropriate delays
  resize_after_update(params, row_nodes, col_nodes, links, duration, delays);

  // enter new elements
  //////////////////////////

  d3
    .select('#clust_group')
    .selectAll('.tile')
    .data(links, function(d) {
      return d.name;
    })
    .enter()
    .append('rect')
    .style('fill-opacity', 0)
    .attr('class', 'tile new_tile')
    .attr('width', params.matrix.x_scale.bandwidth())
    .attr('height', params.matrix.y_scale.bandwidth())
    .attr('transform', function(d) {
      return (
        'translate(' +
        params.matrix.x_scale(d.target) +
        ',' +
        params.matrix.y_scale(d.source) +
        ')'
      );
    })
    .style('fill', function(d) {
      return d.value > 0
        ? params.matrix.tile_colors[0]
        : params.matrix.tile_colors[1];
    })
    .transition()
    .delay(delays.enter)
    .duration(duration)
    .style('fill-opacity', function(d) {
      // calculate output opacity using the opacity scale
      let output_opacity = params.matrix.opacity_scale(Math.abs(d.value));
      return output_opacity;
    });

  d3
    .selectAll('.tile')
    .on('mouseover', null)
    .on('mouseout', null);

  // redefine mouseover events for tiles
  d3
    .select('#clust_group')
    .selectAll('.tile')
    .on('mouseover', function(p) {
      let row_name = p.name.split('_')[0];
      let col_name = p.name.split('_')[1];
      // highlight row - set text to active if
      d3.selectAll('.row_label_text text').classed('active', function(d) {
        return row_name === d.name;
      });

      d3.selectAll('.col_label_text text').classed('active', function(d) {
        return col_name === d.name;
      });
    })
    .on('mouseout', function mouseout() {
      d3.selectAll('text').classed('active', false);
    })
    .attr('title', function(d) {
      return d.value;
    });

  let labels = Labels(params);

  let row_triangle_ini_group = labels.make_rows(
    params,
    row_nodes,
    reorder,
    duration
  );
  let container_all_col = labels.make_cols(
    params,
    col_nodes,
    reorder,
    duration
  );

  Dendrogram('row', params, row_triangle_ini_group, duration);
  Dendrogram('col', params, row_triangle_ini_group, duration);

  // Fade in new gridlines
  ///////////////////////////
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
    .style('stroke', 'white')
    .attr('opacity', 0)
    .transition()
    .delay(delays.enter)
    .duration(duration)
    .attr('opacity', 1);

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
    .style('stroke', 'white')
    .attr('opacity', 0)
    .transition()
    .delay(delays.enter)
    .duration(duration)
    .attr('opacity', 1);

  // // reset resize on expand button click and screen resize
  // params.initialize_resizing(params);

  // // instantiate zoom object
  // let zoom = Zoom(params);

  // // initialize double click zoom for matrix
  // ////////////////////////////////////////////
  // zoom.ini_doubleclick();

  // if (params.viz.do_zoom) {
  //   d3.select('#main_svg').call(params.zoom);
  // }
};

export default enter_exit_update;
