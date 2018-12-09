import { default as d3 } from 'd3';

// import { select, selectAll } from 'd3-selection';
import { scaleLinear, scaleBand } from 'd3-scale';
import map from 'lodash-es/map';
import each from 'lodash-es/each';
import indexOf from 'lodash-es/indexOf';
import max from 'lodash-es/max';

import Zoom from '../components/zoom';
import Utils from '../config/utils';

const run_reset_visualization_size = function(
  set_clust_width,
  set_clust_height,
  set_margin_left,
  set_margin_top,
  parameters
) {
  let params = parameters || this.params;

  let row_nodes = params.network_data.row_nodes;
  let col_nodes = params.network_data.col_nodes;
  let row_nodes_names = map(row_nodes, 'name');
  let col_nodes_names = map(col_nodes, 'name');

  // reset zoom
  //////////////////////////////
  let zoom_y = 1;
  let zoom_x = 1;
  let pan_dx = 0;
  let pan_dy = 0;

  let half_height = params.viz.clust.dim.height / 2;
  let center_y = -(zoom_y - 1) * half_height;

  viz
    .get_clust_group()
    .attr(
      'transform',
      'translate(' +
        [0, 0 + center_y] +
        ')' +
        ' scale(' +
        1 +
        ',' +
        zoom_y +
        ')' +
        'translate(' +
        [pan_dx, pan_dy] +
        ')'
    );

  d3.select('#row_label_zoom_container').attr(
    'transform',
    'translate(' +
      [0, center_y] +
      ')' +
      ' scale(' +
      zoom_y +
      ',' +
      zoom_y +
      ')' +
      'translate(' +
      [0, pan_dy] +
      ')'
  );

  d3.select('#row_viz_zoom_container').attr(
    'transform',
    'translate(' +
      [0, center_y] +
      ')' +
      ' scale(' +
      1 +
      ',' +
      zoom_y +
      ')' +
      'translate(' +
      [0, pan_dy] +
      ')'
  );

  d3.select('#col_label_zoom_container').attr(
    'transform',
    ' scale(' + 1 + ',' + 1 + ')' + 'translate(' + [pan_dx, 0] + ')'
  );

  d3.select('#col_viz_zoom_container').attr(
    'transform',
    ' scale(' + 1 + ',' + 1 + ')' + 'translate(' + [pan_dx, 0] + ')'
  );

  // set y translate: center_y is positive, positive moves the visualization down
  // the translate vector has the initial margin, the first y centering, and pan_dy
  // times the scaling zoom_y
  let net_y_offset = params.viz.clust.margin.top + center_y + pan_dy * zoom_y;

  // reset the zoom translate and zoom
  params.zoom.translate([pan_dx, net_y_offset]);

  // size the svg container div - svg_div
  d3.select('#' + params.viz.svg_div_id)
    .style('margin-left', set_margin_left + 'px')
    .style('margin-top', set_margin_top + 'px')
    .style('width', set_clust_width + 'px')
    .style('height', set_clust_height + 'px');

  // Resetting some visualization parameters
  ///////////////////////////////////////////////

  // get height and width from parent div
  params.viz.svg_dim = {};
  params.viz.svg_dim.width = Number(
    d3
      .select('#' + params.viz.svg_div_id)
      .style('width')
      .replace('px', '')
  );
  params.viz.svg_dim.height = Number(
    d3
      .select('#' + params.viz.svg_div_id)
      .style('height')
      .replace('px', '')
  );

  // reduce width by row/col labels and by grey_border width (reduce width by less since this is less aparent with slanted col labels)
  let ini_clust_width =
    params.viz.svg_dim.width -
    (params.labels.super_label_width +
      params.norm_label.width.row +
      params.class_room.row) -
    params.viz.grey_border_width -
    params.viz.spillover_x_offset;

  // there is space between the clustergram and the border
  let ini_clust_height =
    params.viz.svg_dim.height -
    (params.labels.super_label_width +
      params.norm_label.width.col +
      params.class_room.col) -
    5 * params.viz.grey_border_width;

  // reduce clustergram width if triangles are taller than the normal width
  // of the columns
  let tmp_x_scale = scaleBand().range([0, ini_clust_width]);
  tmp_x_scale.domain(params.matrix.orders.ini_row);
  let triangle_height = tmp_x_scale.bandwidth() / 2;
  if (triangle_height > params.norm_label.width.col) {
    ini_clust_width =
      ini_clust_width * (params.norm_label.width.col / triangle_height);
  }
  params.viz.clust.dim.width = ini_clust_width;

  // clustergram height
  ////////////////////////
  // ensure that rects are never taller than they are wide
  // force square tiles
  if (
    ini_clust_width / params.viz.num_col_nodes <
    ini_clust_height / params.viz.num_row_nodes
  ) {
    // scale the height
    params.viz.clust.dim.height =
      ini_clust_width * (params.viz.num_row_nodes / params.viz.num_col_nodes);

    // keep track of whether or not a force square has occurred
    // so that I can adjust the font accordingly
    params.viz.force_square = 1;

    // make sure that force_square does not cause the entire visualization
    // to be taller than the svg, if it does, then undo
    if (params.viz.clust.dim.height > ini_clust_height) {
      // make the height equal to the width
      params.viz.clust.dim.height = ini_clust_height;
      // keep track of whether or not a force square has occurred
      params.viz.force_square = 0;
    }
  } else {
    // do not force square tiles
    // the height will be calculated normally - leading to wide tiles
    params.viz.clust.dim.height = ini_clust_height;
    // keep track of whether or not a force square has occurred
    params.viz.force_square = 0;
  }

  // zoom_switch from 1 to 2d zoom
  params.viz.zoom_switch =
    params.viz.clust.dim.width /
    params.viz.num_col_nodes /
    (params.viz.clust.dim.height / params.viz.num_row_nodes);

  // zoom_switch can not be less than 1
  if (params.viz.zoom_switch < 1) {
    params.viz.zoom_switch = 1;
  }

  // Begin resizing the visualization

  // resize the svg
  ///////////////////////
  let svg_group = d3
    .select('#' + params.viz.svg_div_id)
    .select('svg')
    .attr('id', 'main_svg')
    .attr('width', params.viz.svg_dim.width)
    .attr('height', params.viz.svg_dim.height);

  // redefine x_scale and y_scale rangeBands
  params.matrix.x_scale.rangeBands([0, params.viz.clust.dim.width]);
  params.matrix.y_scale.rangeBands([0, params.viz.clust.dim.height]);

  // redefine x and y positions
  each(params.network_data.links, function(d) {
    d.x = params.matrix.x_scale(d.target);
    d.y = params.matrix.y_scale(d.source);
  });

  // precalc rect_width and height
  // params.matrix.rect_width = params.matrix.x_scale.bandwidth() - params.viz.border_width;
  // params.matrix.rect_height = params.matrix.y_scale.bandwidth() - params.viz.border_width/params.viz.zoom_switch;
  params.matrix.rect_width = params.matrix.x_scale.bandwidth();
  params.matrix.rect_height = params.matrix.y_scale.bandwidth();

  // reset crossfilter
  params.cf = {};
  params.cf.links = crossfilter(params.network_data.links);
  params.cf.dim_x = params.cf.links.dimension(function(d) {
    return d.x;
  });
  params.cf.dim_y = params.cf.links.dimension(function(d) {
    return d.y;
  });

  // reset all crossfilter filters
  params.cf.dim_x.filterAll();
  params.cf.dim_y.filterAll();

  // redefine links - grab all links since filter is reset
  let inst_links = params.cf.dim_x.top(Infinity);

  // redefine zoom extent
  params.viz.real_zoom =
    params.norm_label.width.col / (params.matrix.rect_width / 2);

  // disable zoom while transitioning
  svg_group.on('.zoom', null);

  // redefine zoom
  params.zoom_obj = Zoom(params);
  params.zoom
    .scaleExtent([1, params.viz.real_zoom * params.viz.zoom_switch])
    .on('zoom', params.zoom_obj.zoomed);

  // reenable zoom after transition
  if (params.viz.do_zoom) {
    console.log('resizing ');
    svg_group.call(params.zoom);
  }

  // prevent normal double click zoom etc
  params.zoom_obj.ini_doubleclick();

  // redefine border width
  params.viz.border_width = params.matrix.rect_width / 55;

  // the default font sizes are set here
  params.labels.default_fs_row = params.matrix.rect_height * 1.01;
  params.labels.default_fs_col = params.matrix.rect_width * 0.85;

  svg_group
    .select('#grey_background')
    .attr('width', params.viz.clust.dim.width)
    .attr('height', params.viz.clust.dim.height);

  // resize tiles - either in rows or individually
  if (d3.select('.row_tile').empty()) {
    console.log('resizing individual tiles');
    // reset tiles
    svg_group
      .selectAll('.tile')
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
      });

    svg_group
      .selectAll('.tile_group')
      .attr('width', params.matrix.rect_width)
      .attr('height', params.matrix.rect_height);

    svg_group
      .selectAll('.highlighting_rect')
      .attr('width', params.matrix.rect_width * 0.8)
      .attr('height', params.matrix.rect_height * 0.8);

    svg_group.selectAll('.tile_split_up').attr('d', function() {
      let start_x = 0;
      let final_x = params.matrix.rect_width;
      let start_y = 0;
      let final_y = params.matrix.rect_height - params.matrix.rect_height / 60;
      let output_string =
        'M' +
        start_x +
        ',' +
        start_y +
        ', L' +
        start_x +
        ', ' +
        final_y +
        ', L' +
        final_x +
        ',0 Z';
      return output_string;
    });

    svg_group.selectAll('.tile_split_dn').attr('d', function() {
      let start_x = 0;
      let final_x = params.matrix.rect_width;
      let start_y = params.matrix.rect_height - params.matrix.rect_height / 60;
      let final_y = params.matrix.rect_height - params.matrix.rect_height;
      let output_string =
        'M' +
        start_x +
        ', ' +
        start_y +
        ' ,   L' +
        final_x +
        ', ' +
        final_y +
        ',  L' +
        final_x +
        ',0 Z';
      return output_string;
    });

    // enter new elements
    //////////////////////////
    d3.select('#clust_group')
      .selectAll('.tile')
      .data(inst_links, function(d) {
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
      .style('fill-opacity', function(d) {
        // calculate output opacity using the opacity scale
        let output_opacity = params.matrix.opacity_scale(Math.abs(d.value));
        return output_opacity;
      });

    d3.selectAll('.tile')
      .on('mouseover', null)
      .on('mouseout', null);

    // redefine mouseover events for tiles
    d3.select('#clust_group')
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
  } else {
    console.log('resizing row tiles');
    // resize tiles
    ///////////////////
    svg_group
      .selectAll('.tile')
      .attr('width', params.matrix.x_scale.bandwidth())
      .attr('height', params.matrix.y_scale.bandwidth())
      .attr('transform', function(d) {
        return 'translate(' + params.matrix.x_scale(d.pos_x) + ',0)';
      });

    svg_group
      .selectAll('.tile_group')
      .attr('width', params.matrix.x_scale.bandwidth())
      .attr('height', params.matrix.y_scale.bandwidth());

    svg_group.selectAll('.row').attr('transform', function(d, index) {
      return 'translate(0,' + params.matrix.y_scale(index) + ')';
    });

    svg_group
      .selectAll('.highlighting_rect')
      .attr('width', params.matrix.x_scale.bandwidth() * 0.8)
      .attr('height', params.matrix.y_scale.bandwidth() * 0.8);

    svg_group.selectAll('.tile_split_up').attr('d', function() {
      let start_x = 0;
      let final_x = params.matrix.x_scale.bandwidth();
      let start_y = 0;
      let final_y =
        params.matrix.y_scale.bandwidth() -
        params.matrix.y_scale.bandwidth() / 60;
      let output_string =
        'M' +
        start_x +
        ',' +
        start_y +
        ', L' +
        start_x +
        ', ' +
        final_y +
        ', L' +
        final_x +
        ',0 Z';
      return output_string;
    });

    svg_group.selectAll('.tile_split_dn').attr('d', function() {
      let start_x = 0;
      let final_x = params.matrix.x_scale.bandwidth();
      let start_y =
        params.matrix.y_scale.bandwidth() -
        params.matrix.y_scale.bandwidth() / 60;
      let final_y =
        params.matrix.y_scale.bandwidth() -
        params.matrix.y_scale.bandwidth() / 60;
      let output_string =
        'M' +
        start_x +
        ', ' +
        start_y +
        ' ,   L' +
        final_x +
        ', ' +
        final_y +
        ',  L' +
        final_x +
        ',0 Z';
      return output_string;
    });
  }

  // reposition tile highlight
  ////////////////////////////////

  let rel_width_hlight = 6;
  let opacity_hlight = 0.85;
  let hlight_width = rel_width_hlight * params.viz.border_width;
  let hlight_height =
    (rel_width_hlight * params.viz.border_width) / params.viz.zoom_switch;

  // top highlight
  d3.select('#top_hlight')
    .attr('width', params.matrix.rect_width)
    .attr('height', hlight_height)
    .attr('transform', function() {
      return (
        'translate(' +
        params.matrix.x_scale(params.matrix.click_hlight_x) +
        ',0)'
      );
    });

  // left highlight
  d3.select('#left_hlight')
    .attr('width', hlight_width)
    .attr('height', params.matrix.rect_width - hlight_height * 0.99)
    .attr('transform', function() {
      return (
        'translate(' +
        params.matrix.x_scale(params.matrix.click_hlight_x) +
        ',' +
        hlight_height * 0.99 +
        ')'
      );
    });

  // right highlight
  d3.select('#right_hlight')
    .attr('width', hlight_width)
    .attr('height', params.matrix.rect_height - hlight_height * 0.99)
    .attr('transform', function() {
      let tmp_translate =
        params.matrix.x_scale(params.matrix.click_hlight_x) +
        params.matrix.rect_width -
        hlight_width;
      return 'translate(' + tmp_translate + ',' + hlight_height * 0.99 + ')';
    });

  // bottom highlight
  d3.select('#bottom_hlight')
    .attr('width', function() {
      return params.matrix.rect_width - 1.98 * hlight_width;
    })
    .attr('height', hlight_height)
    .attr('transform', function() {
      let tmp_translate_x =
        params.matrix.x_scale(params.matrix.click_hlight_x) +
        hlight_width * 0.99;
      let tmp_translate_y = params.matrix.rect_height - hlight_height;
      return 'translate(' + tmp_translate_x + ',' + tmp_translate_y + ')';
    });

  // resize row highlight
  /////////////////////////
  d3.select('#row_top_hlight')
    .attr('width', params.viz.svg_dim.width)
    .attr('height', hlight_height);

  d3.select('#row_bottom_hlight')
    .attr('width', params.viz.svg_dim.width)
    .attr('height', hlight_height)
    .attr('transform', function() {
      let tmp_translate_y = params.matrix.rect_height - hlight_height;
      return 'translate(0,' + tmp_translate_y + ')';
    });

  // resize col highlight
  /////////////////////////
  d3.select('#col_top_hlight')
    .attr('width', params.viz.clust.dim.height)
    .attr('height', hlight_width)
    .attr('transform', function() {
      let tmp_translate_y = 0;
      let tmp_translate_x = -(
        params.viz.clust.dim.height +
        params.class_room.col +
        params.viz.uni_margin
      );
      return 'translate(' + tmp_translate_x + ',' + tmp_translate_y + ')';
    });

  d3.select('#col_bottom_hlight')
    .attr('width', params.viz.clust.dim.height)
    .attr('height', hlight_width)
    .attr('transform', function() {
      let tmp_translate_y = params.matrix.rect_width - hlight_width;
      let tmp_translate_x = -(
        params.viz.clust.dim.height +
        params.class_room.col +
        params.viz.uni_margin
      );
      return 'translate(' + tmp_translate_x + ',' + tmp_translate_y + ')';
    });

  // add text to row/col during resize
  function normal_name(d) {
    let inst_name = d.name.replace(/_/g, ' ').split('#')[0];
    if (inst_name.length > params.labels.max_label_char) {
      inst_name = inst_name.substring(0, params.labels.max_label_char) + '..';
    }
    return inst_name;
  }

  // resize row labels
  ///////////////////////////

  svg_group
    .select('#row_container')
    .attr(
      'transform',
      'translate(' +
        params.norm_label.margin.left +
        ',' +
        params.viz.clust.margin.top +
        ')'
    );

  svg_group
    .select('#row_container')
    .select('.white_bars')
    .attr('width', params.norm_label.background.row)
    .attr('height', 30 * params.viz.clust.dim.height + 'px');

  svg_group
    .select('#row_container')
    .select('#row_label_outer_container')
    .attr('transform', 'translate(' + params.norm_label.width.row + ',0)');

  svg_group.selectAll('.row_label_text').attr('transform', function(d) {
    let inst_index = indexOf(row_nodes_names, d.name);
    return 'translate(0,' + params.matrix.y_scale(inst_index) + ')';
  });

  svg_group
    .selectAll('.row_label_text')
    .select('text')
    .attr('y', params.matrix.rect_height * 0.75);

  svg_group
    .selectAll('.row_label_text')
    .select('text')
    .style('font-size', params.labels.default_fs_row + 'px')
    .text(function(d) {
      return normal_name(d);
    });

  // change the size of the highlighting rects
  svg_group.selectAll('.row_label_text').each(function() {
    let bbox = d3
      .select(this)
      .select('text')[0][0]
      .getBBox();
    d3.select(this)
      .select('rect')
      .attr('x', bbox.x)
      .attr('y', 0)
      .attr('width', bbox.width)
      .attr('height', params.matrix.rect_height)
      .style('fill', 'yellow')
      .style('opacity', function(d) {
        let inst_opacity = 0;
        // highlight target genes
        if (d.target === 1) {
          inst_opacity = 1;
        }
        return inst_opacity;
      });
  });

  // label the widest row and col labels
  params.bounding_width_max = {};
  params.bounding_width_max.row = 0;
  d3.selectAll('.row_label_text').each(function() {
    let tmp_width = d3
      .select(this)
      .select('text')
      .node()
      .getBBox().width;
    if (tmp_width > params.bounding_width_max.row) {
      params.bounding_width_max.row = tmp_width;
    }
  });

  svg_group
    .select('#row_viz_outer_container')
    .attr('transform', 'translate(' + params.norm_label.width.row + ',0)');

  svg_group
    .select('#row_viz_outer_container')
    .select('white_bars')
    .attr('width', params.class_room.row + 'px')
    .attr('height', function() {
      let inst_height = params.viz.clust.dim.height;
      return inst_height;
    });

  svg_group.selectAll('.row_viz_group').attr('transform', function(d) {
    let inst_index = indexOf(row_nodes_names, d.name);
    return 'translate(0, ' + params.matrix.y_scale(inst_index) + ')';
  });

  svg_group
    .selectAll('.row_viz_group')
    .select('path')
    .attr('d', function() {
      let origin_x = params.class_room.symbol_width - 1;
      let origin_y = 0;
      let mid_x = 1;
      let mid_y = params.matrix.rect_height / 2;
      let final_x = params.class_room.symbol_width - 1;
      let final_y = params.matrix.rect_height;
      let output_string =
        'M ' +
        origin_x +
        ',' +
        origin_y +
        ' L ' +
        mid_x +
        ',' +
        mid_y +
        ', L ' +
        final_x +
        ',' +
        final_y +
        ' Z';
      return output_string;
    });

  if (Utils.has(params.network_data.row_nodes[0], 'value')) {
    // set bar scale
    let enr_max = Math.abs(
      max(params.network_data.row_nodes, function(d) {
        return Math.abs(d.value);
      }).value
    );
    params.labels.bar_scale_row = scaleLinear()
      .domain([0, enr_max])
      .range([0, params.norm_label.width.row]);

    svg_group
      .selectAll('.row_bars')
      .attr('width', function(d) {
        let inst_value = 0;
        inst_value = params.labels.bar_scale_row(Math.abs(d.value));
        return inst_value;
      })
      .attr('x', function(d) {
        let inst_value = 0;
        inst_value = -params.labels.bar_scale_row(Math.abs(d.value));
        return inst_value;
      })
      .attr('height', params.matrix.rect_height);
  }

  // resize col labels
  ///////////////////////
  svg_group
    .select('#col_container')
    .attr(
      'transform',
      'translate(' +
        params.viz.clust.margin.left +
        ',' +
        params.norm_label.margin.top +
        ')'
    );

  svg_group
    .select('#col_container')
    .select('.white_bars')
    .attr('width', 30 * params.viz.clust.dim.width + 'px')
    .attr('height', params.norm_label.background.col);

  svg_group
    .select('#col_container')
    .select('.col_label_outer_container')
    .attr('transform', 'translate(0,' + params.norm_label.width.col + ')');

  // offset click group column label
  let x_offset_click = params.matrix.rect_width / 2 + params.viz.border_width;
  // reduce width of rotated rects
  let reduce_rect_width = params.matrix.rect_width * 0.36;

  svg_group.selectAll('.col_label_text').attr('transform', function(d) {
    let inst_index = indexOf(col_nodes_names, d.name);
    return 'translate(' + params.matrix.x_scale(inst_index) + ') rotate(-90)';
  });

  svg_group
    .selectAll('.col_label_click')
    .attr(
      'transform',
      'translate(' +
        params.matrix.rect_width / 2 +
        ',' +
        x_offset_click +
        ') rotate(45)'
    );

  svg_group
    .selectAll('.col_label_click')
    .select('text')
    .attr('y', params.matrix.rect_width * 0.6)
    .attr('dx', 2 * params.viz.border_width)
    .style('font-size', params.labels.default_fs_col + 'px')
    .text(function(d) {
      return normal_name(d);
    });

  params.bounding_width_max.col = 0;
  svg_group.selectAll('.col_label_click').each(function() {
    let tmp_width = d3
      .select(this)
      .select('text')
      .node()
      .getBBox().width;
    if (tmp_width > params.bounding_width_max.col) {
      params.bounding_width_max.col = tmp_width * 1.2;
    }
  });

  // check if widest row or col are wider than the allowed label width
  ////////////////////////////////////////////////////////////////////////
  params.ini_scale_font = {};
  params.ini_scale_font.row = 1;
  params.ini_scale_font.col = 1;

  if (params.bounding_width_max.row > params.norm_label.width.row) {
    // calc reduction in font size
    params.ini_scale_font.row =
      params.norm_label.width.row / params.bounding_width_max.row;
    // redefine bounding_width_max.row
    params.bounding_width_max.row =
      params.ini_scale_font.row * params.bounding_width_max.row;

    // redefine default fs
    params.labels.default_fs_row =
      params.labels.default_fs_row * params.ini_scale_font.row;
    // reduce font size
    d3.selectAll('.row_label_text').each(function() {
      d3.select(this)
        .select('text')
        .style('font-size', params.labels.default_fs_row + 'px');
    });
  }

  if (params.bounding_width_max.col > params.norm_label.width.col) {
    // calc reduction in font size
    params.ini_scale_font.col =
      params.norm_label.width.col / params.bounding_width_max.col;
    // redefine bounding_width_max.col
    params.bounding_width_max.col =
      params.ini_scale_font.col * params.bounding_width_max.col;
    // redefine default fs
    params.labels.default_fs_col =
      params.labels.default_fs_col * params.ini_scale_font.col;
    // reduce font size
    d3.selectAll('.col_label_click').each(function() {
      d3.select(this)
        .select('text')
        .style('font-size', params.labels.default_fs_col + 'px');
    });
  }

  svg_group.selectAll('.col_label_click').each(function() {
    let bbox = d3
      .select(this)
      .select('text')[0][0]
      .getBBox();
    d3.select(this)
      .select('rect')
      .attr('x', bbox.x * 1.25)
      .attr('y', 0)
      .attr('width', bbox.width * 1.25)
      .attr('height', params.matrix.rect_width * 0.6)
      .style('fill', 'yellow')
      .style('opacity', 0);
  });

  // resize column triangle
  svg_group
    .selectAll('.col_label_click')
    .select('path')
    .attr('d', function() {
      // x and y are flipped since its rotated
      let origin_y = -params.viz.border_width;
      let start_x = 0;
      let final_x = params.matrix.rect_width - reduce_rect_width;
      let start_y = -(
        params.matrix.rect_width -
        reduce_rect_width +
        params.viz.border_width
      );
      let final_y = -params.viz.border_width;
      let output_string =
        'M ' +
        origin_y +
        ',0 L ' +
        start_y +
        ',' +
        start_x +
        ', L ' +
        final_y +
        ',' +
        final_x +
        ' Z';
      return output_string;
    })
    .attr('fill', function(d) {
      let inst_color = '#eee';
      if (params.labels.show_categories) {
        inst_color = params.labels.class_colors.col[d.cl];
      }
      return inst_color;
    });

  // append column value bars
  if (Utils.has(params.network_data.col_nodes[0], 'value')) {
    svg_group
      .selectAll('.col_bars')
      .attr('width', function(d) {
        let inst_value = 0;
        if (d.value > 0) {
          inst_value = params.labels.bar_scale_col(d.value);
        }
        return inst_value;
      })
      // rotate labels - reduce width if rotating
      .attr('height', params.matrix.rect_width * 0.66);
  }

  // resize dendrogram
  ///////////////////
  svg_group
    .selectAll('.row_class_rect')
    .attr('width', function() {
      let inst_width = params.class_room.symbol_width - 1;
      return inst_width + 'px';
    })
    .attr('height', params.matrix.y_scale.bandwidth())
    .attr('x', function() {
      let inst_offset = params.class_room.symbol_width + 1;
      return inst_offset + 'px';
    });

  svg_group
    .selectAll('.col_class_rect')
    .attr('width', params.matrix.x_scale.bandwidth())
    .attr('height', function() {
      let inst_height = params.class_room.col - 1;
      return inst_height;
    });

  svg_group.selectAll('.col_viz_group').attr('transform', function(d) {
    let inst_index = indexOf(col_nodes_names, d.name);
    return 'translate(' + params.matrix.x_scale(inst_index) + ',0)';
  });

  // reposition grid lines
  ////////////////////////////
  svg_group.selectAll('.horz_lines').attr('transform', function(d) {
    let inst_index = indexOf(row_nodes_names, d.name);
    return 'translate(0,' + params.matrix.y_scale(inst_index) + ') rotate(0)';
  });

  svg_group
    .selectAll('.horz_lines')
    .select('line')
    .attr('x2', params.viz.clust.dim.width)
    .style(
      'stroke-width',
      params.viz.border_width / params.viz.zoom_switch + 'px'
    );

  svg_group.selectAll('.vert_lines').attr('transform', function(d) {
    let inst_index = indexOf(col_nodes_names, d.name);
    return 'translate(' + params.matrix.x_scale(inst_index) + ') rotate(-90)';
  });

  svg_group
    .selectAll('.vert_lines')
    .select('line')
    .attr('x2', -params.viz.clust.dim.height)
    .style('stroke-width', params.viz.border_width + 'px');

  // let row_nodes = params.network_data.row_nodes;
  // let col_nodes = params.network_data.col_nodes;

  // draw_grid_lines(row_nodes, col_nodes);

  // resize superlabels
  /////////////////////////////////////
  svg_group
    .select('#super_col_bkg')
    .attr('height', params.labels.super_label_width + 'px')
    .attr('transform', 'translate(0,' + params.viz.grey_border_width + ')');

  // super col title
  svg_group.select('#super_col').attr('transform', function() {
    let inst_x = params.viz.clust.dim.width / 2 + params.norm_label.width.row;
    let inst_y = params.labels.super_label_width - params.viz.uni_margin;
    return 'translate(' + inst_x + ',' + inst_y + ')';
  });

  // super row title
  svg_group
    .select('#super_row_bkg')
    .attr('width', params.labels.super_label_width + 'px')
    .attr('transform', 'translate(' + params.viz.grey_border_width + ',0)');

  // append super title row group
  svg_group.select('#super_row').attr('transform', function() {
    let inst_x = params.labels.super_label_width - params.viz.uni_margin;
    let inst_y = params.viz.clust.dim.height / 2 + params.norm_label.width.col;
    return 'translate(' + inst_x + ',' + inst_y + ')';
  });

  // resize spillover
  //////////////////////////
  // hide spillover from slanted column labels on right side
  svg_group
    .select('#right_slant_triangle')
    .attr(
      'transform',
      'translate(' +
        params.viz.clust.dim.width +
        ',' +
        params.norm_label.width.col +
        ')'
    );

  svg_group
    .select('#left_slant_triangle')
    .attr('transform', 'translate(-1,' + params.norm_label.width.col + ')');

  svg_group
    .select('#top_left_white')
    .attr('width', params.viz.clust.margin.left)
    .attr('height', params.viz.clust.margin.top);

  svg_group.select('#right_spillover').attr('transform', function() {
    let tmp_left = params.viz.clust.margin.left + params.viz.clust.dim.width;
    let tmp_top = params.norm_label.margin.top + params.norm_label.width.col;
    return 'translate(' + tmp_left + ',' + tmp_top + ')';
  });

  // white border bottom - prevent clustergram from hitting border
  svg_group
    .select('#bottom_spillover')
    .attr('width', params.viz.svg_dim.width)
    .attr('height', 2 * params.viz.grey_border_width)
    .attr('transform', function() {
      // shift up enough to show the entire border width
      let inst_offset =
        params.viz.svg_dim.height - 3 * params.viz.grey_border_width;
      return 'translate(0,' + inst_offset + ')';
    });

  // add border to svg in four separate lines - to not interfere with clicking anything
  ///////////////////////////////////////////////////////////////////////////////////////
  // left border
  svg_group
    .select('#left_border')
    .attr('width', params.viz.grey_border_width)
    .attr('height', params.viz.svg_dim.height)
    .attr('transform', 'translate(0,0)');

  // right border
  svg_group
    .select('#right_border')
    .attr('width', params.viz.grey_border_width)
    .attr('height', params.viz.svg_dim.height)
    .attr('transform', function() {
      let inst_offset = params.viz.svg_dim.width - params.viz.grey_border_width;
      return 'translate(' + inst_offset + ',0)';
    });

  // top border
  svg_group
    .select('#top_border')
    .attr('width', params.viz.svg_dim.width)
    .attr('height', params.viz.grey_border_width)
    .attr('transform', function() {
      let inst_offset = 0;
      return 'translate(' + inst_offset + ',0)';
    });

  // bottom border
  svg_group
    .select('#bottom_border')
    .attr('width', params.viz.svg_dim.width)
    .attr('height', params.viz.grey_border_width)
    .attr('transform', function() {
      let inst_offset =
        params.viz.svg_dim.height - params.viz.grey_border_width;
      return 'translate(0,' + inst_offset + ')';
    });

  // reset zoom and translate
  //////////////////////////////
  params.zoom
    .scale(1)
    .translate([params.viz.clust.margin.left, params.viz.clust.margin.top]);

  d3.select('#main_svg').style('opacity', 1);
};

export default run_reset_visualization_size;
