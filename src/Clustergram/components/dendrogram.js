import { default as d3 } from 'd3';
import { select, selectAll } from 'd3-selection';
import map from 'lodash-es/map';
import indexOf from 'lodash-es/indexOf';

import Colors from '../config/colors';

const Dendrogram = function(type, params, delay_dendro) {
  let group_colors = [],
    dom_class,
    i;

  build_color_groups();

  if (type === 'row') {
    dom_class = 'row_class_rect';
    build_row_dendro(delay_dendro);
  } else {
    dom_class = 'col_class_rect';
    build_col_dendro();
  }

  function build_color_groups() {
    let max_groups;
    if (
      params.network_data.row_nodes.length >
      params.network_data.col_nodes.length
    ) {
      max_groups = params.network_data.row_nodes;
    } else {
      max_groups = params.network_data.col_nodes;
    }
    for (i = 0; i < params.network_data.row_nodes.length; i++) {
      // grab colors from the list
      if (i === 1) {
        group_colors[i] = Colors().get_default_color();
      } else {
        group_colors[i] = Colors().get_random_color(i);
      }
    }
  }

  /* Changes the groupings (x- and y-axis color bars).
   */
  function change_groups(inst_index) {
    d3.selectAll('.' + dom_class).style('fill', function(d) {
      return group_colors[d.group[inst_index]];
    });
  }

  function color_group(j) {
    return group_colors[j];
  }

  function get_group_color(j) {
    return group_colors[j];
  }

  function build_row_dendro(delay_dendro) {
    // add dendrogram rectangles if necessary
    d3.selectAll('.row_viz_group').each(function(d) {
      if (
        d3
          .select(this)
          .select('rect')
          .empty()
      ) {
        d3.select(this)
          .append('rect')
          .attr('class', dom_class)
          .attr('width', function() {
            let inst_width = params.class_room.symbol_width - 1;
            return inst_width + 'px';
          })
          .attr('height', params.matrix.y_scale.bandwidth())
          .style('fill', function(d) {
            let inst_level = params.group_level.row;
            return get_group_color(d.group[inst_level]);
          })
          .attr('x', function() {
            let inst_offset = params.class_room.symbol_width + 1;
            return inst_offset + 'px';
          });
      } else {
        d3.select(this)
          .select('rect')
          .attr('width', function() {
            let inst_width = params.class_room.symbol_width - 1;
            return inst_width + 'px';
          })
          .attr('height', params.matrix.y_scale.bandwidth())
          .attr('x', function() {
            let inst_offset = params.class_room.symbol_width + 1;
            return inst_offset + 'px';
          })
          .attr('opacity', 0.25)
          .transition()
          .delay(1000)
          .duration(1000)
          .style('fill', function(d) {
            let inst_level = params.group_level.row;
            return get_group_color(d.group[inst_level]);
          })
          .attr('opacity', 1);
      }
    });
  }

  function build_col_dendro() {
    let col_nodes = params.network_data.col_nodes;
    let col_nodes_names = map(col_nodes, 'name');

    // append groups - each will hold a classification rect
    let col_class_ini_group = d3
      .select('#col_viz_zoom_container')
      .selectAll('g')
      .data(col_nodes, function(d) {
        return d.name;
      })
      .enter()
      .append('g')
      .attr('class', 'col_viz_group')
      .attr('transform', function(d) {
        let inst_index = indexOf(col_nodes_names, d.name);
        return 'translate(' + params.matrix.x_scale(inst_index) + ',0)';
      });

    d3.selectAll('.col_viz_group').each(function(d) {
      if (
        d3
          .select(this)
          .select('rect')
          .empty()
      ) {
        d3.select(this)
          .append('rect')
          .attr('class', dom_class)
          .attr('width', params.matrix.x_scale.bandwidth())
          .attr('height', function() {
            let inst_height = params.class_room.col - 1;
            return inst_height;
          })
          .style('fill', function(d) {
            let inst_level = params.group_level.col;
            return get_group_color(d.group[inst_level]);
          });
      } else {
        d3.select(this)
          .select('rect')
          .attr('width', params.matrix.x_scale.bandwidth())
          .attr('height', function() {
            let inst_height = params.class_room.col - 1;
            return inst_height;
          })
          .attr('opacity', 0.25)
          .transition()
          .delay(1000)
          .duration(1000)
          .style('fill', function(d) {
            let inst_level = params.group_level.col;
            return get_group_color(d.group[inst_level]);
          })
          .attr('opacity', 1);
      }
    });
  }

  // add callback functions
  /////////////////////////////

  // !! optional row callback on click
  if (typeof params.click_group === 'function') {
    // only add click functionality to row rect
    row_class_rect.on('click', function(d) {
      let inst_level = params.group_level.row;
      let inst_group = d.group[inst_level];
      // find all row names that are in the same group at the same group_level
      // get row_nodes
      row_nodes = params.network_data.row_nodes;
      let group_nodes = [];

      for (let node of row_nodes) {
        // check that the node is in the group
        if (node.group[inst_level] === inst_group) {
          // make a list of genes that are in inst_group at this group_level
          group_nodes.push(node.name);
        }
      }

      // return the following information to the user
      // row or col, distance cutoff level, nodes
      let group_info = {};
      group_info.type = 'row';
      group_info.nodes = group_nodes;
      group_info.info = {
        type: 'distance',
        cutoff: inst_level / 10,
      };

      // pass information to group_click callback
      params.click_group(group_info);
    });
  }

  return {
    color_group: color_group,
    get_group_color: get_group_color,
    change_groups: change_groups,
  };
};

export default Dendrogram;
