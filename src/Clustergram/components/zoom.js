import { default as d3 } from 'd3';
// import { select, event, selectAll } from 'd3-selection';
import { scaleLinear, scaleBand } from 'd3-scale';

import Utils from '../config/utils';
import range from 'lodash-es/range';
import map from 'lodash-es/map';

const Zoom = function(params) {
  /* Functions for zooming. Should be turned into a module.
     * ----------------------------------------------------------------------- */
  function zoomed() {
    // // reset the zoom translate and zoom
    // params.zoom.scale(zoom_y);
    // params.zoom.translate([pan_dx, net_y_offset]);

    let zoom_x = d3.event.scale,
      zoom_y = d3.event.scale,
      trans_x = d3.event.translate[0] - params.viz.clust.margin.left,
      trans_y = d3.event.translate[1] - params.viz.clust.margin.top;

    // apply transformation
    apply_transformation(params, trans_x, trans_y, zoom_x, zoom_y);
  }

  function apply_transformation(params, trans_x, trans_y, zoom_x, zoom_y) {
    let d3_scale = zoom_x;

    // y - rules
    ///////////////////////////////////////////////////
    // available panning room in the y direction
    // multiple extra room (zoom - 1) by the width
    // always defined in the same way
    let pan_room_y = (d3_scale - 1) * params.viz.clust.dim.height;

    // do not translate if translate in y direction is positive
    if (trans_y >= 0) {
      // restrict transformation parameters
      // no panning in either direction
      trans_y = 0;
    } else if (trans_y <= -pan_room_y) {
      // restrict y pan to pan_room_y if necessary
      trans_y = -pan_room_y;
    }

    // x - rules
    ///////////////////////////////////////////////////
    // zoom in y direction only - translate in y only
    if (d3_scale < params.viz.zoom_switch) {
      // no x translate or zoom
      trans_x = 0;
      zoom_x = 1;
    } else {
      // zoom in both directions
      // scale is greater than params.viz.zoom_switch
      // available panning room in the x direction
      // multiple extra room (zoom - 1) by the width
      let pan_room_x =
        (d3_scale / params.viz.zoom_switch - 1) * params.viz.clust.dim.width;

      // no panning in the positive direction
      if (trans_x > 0) {
        // restrict transformation parameters
        // no panning in the x direction
        trans_x = 0;
        // set zoom_x
        zoom_x = d3_scale / params.viz.zoom_switch;
      } else if (trans_x <= -pan_room_x) {
        // restrict panning to pan_room_x
        // restrict transformation parameters
        // no panning in the x direction
        trans_x = -pan_room_x;
        // set zoom_x
        zoom_x = d3_scale / params.viz.zoom_switch;
      } else {
        // allow two dimensional panning
        // restrict transformation parameters
        // set zoom_x
        zoom_x = d3_scale / params.viz.zoom_switch;
      }
    }

    // update visible links
    let min_rect_height = 3;

    // if (d3.select('.row_tile').empty()){
    //   let links_in_view = update_viz_links(params, trans_x, trans_y, zoom_x, zoom_y, false);
    //   draw_viz_links(params, links_in_view);

    //   // // draw the new links using links_in_view
    //   // if (params.matrix.rect_height*zoom_y > min_rect_height){
    //   //   draw_viz_links(params, links_in_view);
    //   // } else if (d3.select('.ds_tile').empty()) {
    //   //   downsample(params, min_rect_height);
    //   // }
    // }

    // apply transformation and reset translate vector
    // the zoom vector (zoom.scale) never gets reset
    ///////////////////////////////////////////////////
    // translate clustergram
    // viz.get_clust_group()
    d3
      .select('#clust_group')
      .attr(
        'transform',
        'translate(' +
          [trans_x, trans_y] +
          ') scale(' +
          zoom_x +
          ',' +
          zoom_y +
          ')'
      );

    // transform row labels
    d3
      .select('#row_label_zoom_container')
      .attr(
        'transform',
        'translate(' + [0, trans_y] + ') scale(' + zoom_y + ')'
      );

    // transform row_viz_zoom_container
    // use the offset saved in params, only zoom in the y direction
    d3
      .select('#row_viz_zoom_container')
      .attr(
        'transform',
        'translate(' + [0, trans_y] + ') scale( 1,' + zoom_y + ')'
      );

    // transform col labels
    // move down col labels as zooming occurs, subtract trans_x - 20 almost works
    d3
      .select('#col_label_zoom_container')
      .attr(
        'transform',
        'translate(' + [trans_x, 0] + ') scale(' + zoom_x + ')'
      );

    // transform col_class
    d3
      .select('#col_viz_zoom_container')
      .attr(
        'transform',
        'translate(' + [trans_x, 0] + ') scale(' + zoom_x + ',1)'
      );

    // reset translate vector - add back margins to trans_x and trans_y
    params.zoom.translate([
      trans_x + params.viz.clust.margin.left,
      trans_y + params.viz.clust.margin.top,
    ]);

    let trans = false;
    constrain_font_size(params, trans);

    // resize label bars if necessary
    ////////////////////////////////////

    if (Utils.has(params.network_data.row_nodes[0], 'value')) {
      d3
        .selectAll('.row_bars')
        .attr('width', function(d) {
          let inst_value = 0;
          inst_value = params.labels.bar_scale_row(Math.abs(d.value)) / zoom_y;
          return inst_value;
        })
        .attr('x', function(d) {
          let inst_value = 0;
          inst_value = -params.labels.bar_scale_row(Math.abs(d.value)) / zoom_y;
          return inst_value;
        });
    }

    if (Utils.has(params.network_data.col_nodes[0], 'value')) {
      d3.selectAll('.col_bars').attr('width', function(d) {
        let inst_value = 0;
        if (d.value > 0) {
          inst_value = params.labels.bar_scale_col(d.value) / zoom_x;
        }
        return inst_value;
      });
    }
  }

  function two_translate_zoom(params, pan_dx, pan_dy, fin_zoom) {
    // get parameters
    if (!params.viz.run_trans) {
      // define the commonly used variable half_height
      let half_height = params.viz.clust.dim.height / 2;

      // y pan room, the pan room has to be less than half_height since
      // zooming in on a gene that is near the top of the clustergram also causes
      // panning out of the visible region
      let y_pan_room = half_height / params.viz.zoom_switch;

      // prevent visualization from panning down too much
      // when zooming into genes near the top of the clustergram
      if (pan_dy >= half_height - y_pan_room) {
        // explanation of panning rules
        /////////////////////////////////
        // prevent the clustergram from panning down too much
        // if the amount of panning is equal to the half_height then it needs to be reduced
        // effectively, the the visualization needs to be moved up (negative) by some factor
        // of the half-width-of-the-visualization.
        //
        // If there was no zooming involved, then the
        // visualization would be centered first, then panned to center the top term
        // this would require a
        // correction to re-center it. However, because of the zooming the offset is
        // reduced by the zoom factor (this is because the panning is occurring on something
        // that will be zoomed into - this is why the pan_dy value is not scaled in the two
        // translate transformations, but it has to be scaled afterwards to set the translate
        // vector)
        // pan_dy = half_height - (half_height)/params.viz.zoom_switch

        // if pan_dy is greater than the pan room, then panning has to be restricted
        // start by shifting back up (negative) by half_height/params.viz.zoom_switch then shift back down
        // by the difference between half_height and pan_dy (so that the top of the clustergram is
        // visible)
        let shift_top_viz = half_height - pan_dy;
        let shift_up_viz =
          -half_height / params.viz.zoom_switch + shift_top_viz;

        // reduce pan_dy so that the visualization does not get panned to far down
        pan_dy = pan_dy + shift_up_viz;
      }

      // prevent visualization from panning up too much
      // when zooming into genes at the bottom of the clustergram
      if (pan_dy < -(half_height - y_pan_room)) {
        shift_top_viz = half_height + pan_dy;

        shift_up_viz = half_height / params.viz.zoom_switch - shift_top_viz; //- move_up_one_row;

        // reduce pan_dy so that the visualization does not get panned to far down
        pan_dy = pan_dy + shift_up_viz;
      }

      // will improve this !!
      let zoom_y = fin_zoom;
      let zoom_x = 1;

      // search duration - the duration of zooming and panning
      let search_duration = 700;

      // center_y
      let center_y = -(zoom_y - 1) * half_height;

      // do not update viz links
      /////////////////////////////
      // if (d3.select('.row_tile').empty()){
      //   let links_in_view = update_viz_links(params, 0, 0, zoom_x, zoom_y, true);
      //   draw_viz_links(params, links_in_view);
      // }

      // transform clust group
      ////////////////////////////
      // d3.select('#clust_group')
      viz
        .get_clust_group()
        .transition()
        .duration(search_duration)
        // first apply the margin transformation
        // then zoom, then apply the final transformation
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

      // transform row labels
      d3
        .select('#row_label_zoom_container')
        .transition()
        .duration(search_duration)
        .attr(
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

      // transform row_viz_zoom_container
      // use the offset saved in params, only zoom in the y direction
      d3
        .select('#row_viz_zoom_container')
        .transition()
        .duration(search_duration)
        .attr(
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

      // transform col labels
      d3
        .select('#col_label_zoom_container')
        .transition()
        .duration(search_duration)
        .attr(
          'transform',
          ' scale(' + 1 + ',' + 1 + ')' + 'translate(' + [pan_dx, 0] + ')'
        );

      // transform col_class
      d3
        .select('#col_viz_zoom_container')
        .transition()
        .duration(search_duration)
        .attr(
          'transform',
          ' scale(' + 1 + ',' + 1 + ')' + 'translate(' + [pan_dx, 0] + ')'
        );

      // set y translate: center_y is positive, positive moves the visualization down
      // the translate vector has the initial margin, the first y centering, and pan_dy
      // times the scaling zoom_y
      let net_y_offset =
        params.viz.clust.margin.top + center_y + pan_dy * zoom_y;

      // reset the zoom translate and zoom
      params.zoom.scale(zoom_y);
      params.zoom.translate([pan_dx, net_y_offset]);

      let trans = true;
      constrain_font_size(params, trans);

      // re-size of the highlighting rects
      /////////////////////////////////////////
      d3.select('#row_label_zoom_container').each(function() {
        // get the bounding box of the row label text
        let bbox = d3
          .select(this)
          .select('text')[0][0]
          .getBBox();

        // use the bounding box to set the size of the rect
        d3
          .select(this)
          .select('rect')
          .attr('x', bbox.x * 0.5)
          .attr('y', 0)
          .attr('width', bbox.width * 0.5)
          .attr('height', params.matrix.y_scale.bandwidth())
          .style('fill', 'yellow');
      });

      // column value bars
      ///////////////////////
      // reduce the height of the column value bars based on the zoom applied
      // recalculate the height and divide by the zooming scale
      // col_label_obj.select('rect')
      if (Utils.has(params.network_data.col_nodes[0], 'value')) {
        d3
          .selectAll('.col_bars')
          .transition()
          .duration(search_duration)
          .attr('width', function(d) {
            let inst_value = 0;
            if (d.value > 0) {
              inst_value = params.labels.bar_scale_col(d.value) / zoom_x;
            }
            return inst_value;
          });
      }

      if (Utils.has(params.network_data.row_nodes[0], 'value')) {
        d3
          .selectAll('.row_bars')
          .transition()
          .duration(search_duration)
          .attr('width', function(d) {
            let inst_value = 0;
            inst_value =
              params.labels.bar_scale_row(Math.abs(d.value)) / zoom_y;
            return inst_value;
          })
          .attr('x', function(d) {
            let inst_value = 0;
            inst_value =
              -params.labels.bar_scale_row(Math.abs(d.value)) / zoom_y;
            return inst_value;
          });
      }
    }
  }

  function update_viz_links(params, trans_x, trans_y, zoom_x, zoom_y, trans) {
    // get translation vector absolute values
    let buffer = 1;
    let min_x =
      Math.abs(trans_x) / zoom_x - buffer * params.matrix.x_scale.bandwidth();
    let min_y =
      Math.abs(trans_y) / zoom_y - buffer * params.matrix.y_scale.bandwidth();

    let max_x =
      Math.abs(trans_x) / zoom_x + params.viz.clust.dim.width / zoom_x;
    // let max_y = Math.abs(trans_y)/zoom_y + params.viz.clust.dim.height ;
    let max_y =
      Math.abs(trans_y) / zoom_y + params.viz.clust.dim.height / zoom_y;

    // show the full height of the clustergram if force_square
    if (params.viz.force_square || trans) {
      max_y = Math.abs(trans_y) / zoom_y + params.viz.clust.dim.height;
    }

    if (min_x < 0) {
      min_x = 0;
    }
    if (min_y < 0) {
      min_y = 0;
    }

    // test-filter
    params.cf.dim_x.filter([min_x, max_x]);
    params.cf.dim_y.filter([min_y, max_y]);

    // redefine links
    let inst_links = params.cf.dim_x.top(Infinity);

    return inst_links;
  }

  function draw_viz_links(params, inst_links) {
    // exit old elements
    d3
      .selectAll('.tile')
      .data(inst_links, function(d) {
        return d.name;
      })
      .exit()
      .remove();

    // enter new elements
    //////////////////////////
    d3
      .select('#clust_group')
      .selectAll('.tile')
      .data(inst_links, function(d) {
        return d.name;
      })
      .enter()
      .append('rect')
      .style('fill-opacity', 0)
      .attr('class', 'tile new_tile')
      .attr('width', params.matrix.rect_width)
      .attr('height', params.matrix.rect_height)
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

    // // check the number of tiles
    // console.log(d3.selectAll('.tile')[0].length);
    // console.log('\n\n')
  }

  function constrain_font_size(params, trans) {
    let search_duration = 700;

    let fraction_keep = {};

    let keep_width = {};
    keep_width.row =
      params.bounding_width_max.row *
      params.labels.row_keep *
      params.zoom.scale();
    keep_width.col =
      params.bounding_width_max.col *
      params.labels.col_keep *
      params.zoom.scale() /
      params.viz.zoom_switch;

    function normal_name(d) {
      let inst_name = d.name.replace(/_/g, ' ').split('#')[0];
      if (inst_name.length > params.labels.max_label_char) {
        inst_name = inst_name.substring(0, params.labels.max_label_char) + '..';
      }
      return inst_name;
    }

    if (keep_width.row > params.norm_label.width.row) {
      params.viz.zoom_scale_font.row =
        params.norm_label.width.row / keep_width.row;

      d3.selectAll('.row_label_text').each(function() {
        if (trans) {
          d3
            .select(this)
            .select('text')
            .transition()
            .duration(search_duration)
            .style(
              'font-size',
              params.labels.default_fs_row * params.viz.zoom_scale_font.row +
                'px'
            )
            .attr(
              'y',
              params.matrix.y_scale.bandwidth() *
                params.scale_font_offset(params.viz.zoom_scale_font.row)
            );
        } else {
          d3
            .select(this)
            .select('text')
            .style(
              'font-size',
              params.labels.default_fs_row * params.viz.zoom_scale_font.row +
                'px'
            )
            .attr(
              'y',
              params.matrix.y_scale.bandwidth() *
                params.scale_font_offset(params.viz.zoom_scale_font.row)
            );
        }
      });
    } else {
      d3.selectAll('.row_label_text').each(function() {
        if (trans) {
          d3
            .select(this)
            .select('text')
            .transition()
            .duration(search_duration)
            .style('font-size', params.labels.default_fs_row + 'px')
            // if there is a transition, then set zoom_scale_font to 1
            // its either two translate zoom or sooming into matrix from search
            .attr(
              'y',
              params.matrix.y_scale.bandwidth() * params.scale_font_offset(1)
            );
          d3
            .select(this)
            .select('text')
            .text(function(d) {
              return normal_name(d);
            });
        } else {
          d3
            .select(this)
            .select('text')
            .style('font-size', params.labels.default_fs_row + 'px')
            // .attr('y', params.matrix.y_scale.bandwidth() *
            //   params.scale_font_offset(params.viz.zoom_scale_font.row))
            .text(function(d) {
              return normal_name(d);
            });
        }
      });
    }

    if (keep_width.col > params.norm_label.width.col) {
      params.viz.zoom_scale_font.col =
        params.norm_label.width.col / keep_width.col;

      d3.selectAll('.col_label_click').each(function() {
        if (trans) {
          d3
            .select(this)
            .select('text')
            .transition()
            .duration(search_duration)
            .style(
              'font-size',
              params.labels.default_fs_col * params.viz.zoom_scale_font.col +
                'px'
            );
        } else {
          d3
            .select(this)
            .select('text')
            .style(
              'font-size',
              params.labels.default_fs_col * params.viz.zoom_scale_font.col +
                'px'
            );
        }
      });
    } else {
      d3.selectAll('.col_label_click').each(function() {
        if (trans) {
          d3
            .select(this)
            .select('text')
            .transition()
            .duration(search_duration)
            .style('font-size', params.labels.default_fs_col + 'px');
          d3
            .select(this)
            .select('text')
            .text(function(d) {
              return normal_name(d);
            });
        } else {
          d3
            .select(this)
            .select('text')
            .style('font-size', params.labels.default_fs_col + 'px')
            .text(function(d) {
              return normal_name(d);
            });
        }
      });
    }

    let max_row_width = params.norm_label.width.row;
    let max_col_width = params.norm_label.width.col;

    // constrain text after zooming
    if (params.labels.row_keep < 1) {
      d3.selectAll('.row_label_text').each(function() {
        trim_text(this, 'row');
      });
    }
    if (params.labels.col_keep < 1) {
      d3.selectAll('.col_label_click').each(function() {
        trim_text(this, 'col');
      });
    }

    function trim_text(inst_selection, inst_rc) {
      let max_width, inst_zoom;

      let safe_row_trim_text = 0.9;

      if (inst_rc === 'row') {
        max_width = params.norm_label.width.row * safe_row_trim_text;
        inst_zoom = params.zoom.scale();
      } else {
        // the column label has extra length since its rotated
        max_width = params.norm_label.width.col;
        inst_zoom = params.zoom.scale() / params.viz.zoom_switch;
      }

      let tmp_width = d3
        .select(inst_selection)
        .select('text')
        .node()
        .getBBox().width;
      let inst_text = d3
        .select(inst_selection)
        .select('text')
        .text();
      let actual_width = tmp_width * inst_zoom;

      if (actual_width > max_width) {
        let trim_fraction = max_width / actual_width;
        let keep_num_char = Math.floor(inst_text.length * trim_fraction) - 3;
        let trimmed_text = inst_text.substring(0, keep_num_char) + '..';
        d3
          .select(inst_selection)
          .select('text')
          .text(trimmed_text);
      }
    }
  }

  function ini_doubleclick() {
    // disable double-click zoom: double click should reset zoom level
    d3.selectAll('svg').on('dblclick.zoom', null);

    // double click to reset zoom - add transition
    d3.select('#main_svg').on('dblclick', function() {
      // programmatic zoom reset
      two_translate_zoom(params, 0, 0, 1);
    });
  }

  function downsample(params, min_rect_height) {
    console.log('downsampling');

    let ini_num_rows = params.network_data.row_nodes.length;

    // calc the increase in rect size required
    // first get the current size of the rectangle
    let ini_rect_height = d3.select('.tile').attr('height');
    let reduce_by = 2 * min_rect_height / ini_rect_height;

    let col_nodes = params.network_data.col_nodes;

    let new_num_rows = ini_num_rows / reduce_by;

    // get cluster height
    let clust_height = params.viz.clust.dim.height;
    // initialize scale
    let y_scale = scaleBand().range([0, clust_height]);
    // define domain
    y_scale.domain(range(new_num_rows));

    // get new bandwidth to calculate new y position
    let tile_height = y_scale.bandwidth();

    let ini_tile_height = params.matrix.y_scale.bandwidth();

    let increase_ds = 1; // 0.25*reduce_by;

    let ds_factor = ini_tile_height / tile_height * increase_ds;

    // get data from global_network_data
    let links_in_view = params.network_data.links;

    // use crossfilter to calculate new links

    // load data into crossfilter
    let cfl = crossfilter(links_in_view);

    // downsample dimension - define the key that will be used to do the reduction
    let dim_ds = cfl.dimension(function(d) {
      // merge together rows into a smaller number of rows
      let row_num = Math.floor(d.y / tile_height);
      let col_name = col_nodes[d.target].name;
      let inst_key = 'row_' + row_num + '_' + col_name;
      return inst_key;
    });

    // define reduce functions
    function reduceAddAvg(p, v) {
      ++p.count;
      if (v.value > 0) {
        p.sum_up += v.value;
      } else {
        p.sum_dn += v.value;
      }
      p.value_up = p.sum_up / p.count;
      p.value_dn = p.sum_dn / p.count;

      // make new row name
      p.name =
        'row_' +
        String(Math.floor(v.y / tile_height)) +
        '_' +
        col_nodes[v.target].name;

      p.source = Math.floor(v.y / tile_height);
      p.target = v.target;
      return p;
    }

    function reduceRemoveAvg(p, v) {
      --p.count;
      if (v.value > 0) {
        p.sum_up -= v.value;
      } else {
        p.sum_dn -= v.value;
      }
      p.value_up = p.sum_up / p.count;
      p.value_dn = p.sum_dn / p.count;

      p.name = 'no name';
      p.target = 0;
      p.source = 0;
      return p;
    }

    function reduceInitAvg() {
      return {
        count: 0,
        sum_up: 0,
        sum_dn: 0,
        avg: 0,
        name: '',
        source: 0,
        target: 0,
      };
    }

    // gather tmp version of new links
    let tmp_red = dim_ds
      .group()
      .reduce(reduceAddAvg, reduceRemoveAvg, reduceInitAvg)
      .top(Infinity);

    // initialize array of new_links
    let new_links = [];

    // gather data from reduced sum
    new_links = map(tmp_red, 'value');

    // add new tiles
    /////////////////////////

    // exit old elements
    d3
      .selectAll('.tile')
      .data(new_links, function(d) {
        return d.name;
      })
      .exit()
      .remove();

    // d3.selectAll('.horz_lines').remove();

    // define compound color scale
    let color_scale = scaleLinear()
      .domain([-1, 1])
      .range([params.matrix.tile_colors[1], params.matrix.tile_colors[0]]);

    // enter new elements
    //////////////////////////
    d3
      .select('#clust_group')
      .selectAll('.tile')
      .data(new_links, function(d) {
        return d.name;
      })
      .enter()
      .append('rect')
      .style('fill-opacity', 0)
      .attr('class', 'tile ds_tile')
      .attr('width', params.matrix.rect_width)
      .attr('height', tile_height)
      .attr('transform', function(d) {
        return (
          'translate(' +
          params.matrix.x_scale(d.target) +
          ',' +
          y_scale(d.source) +
          ')'
        );
      })
      .style('fill', function(d) {
        // return d.value > 0 ? params.matrix.tile_colors[0] : params.matrix.tile_colors[1];
        let abs_val_up = Math.abs(d.value_up);
        let abs_val_dn = Math.abs(d.value_dn);
        let inst_value = (abs_val_up - abs_val_dn) / (abs_val_up + abs_val_dn);

        return color_scale(inst_value);
      })
      .style('fill-opacity', function(d) {
        // calculate output opacity using the opacity scale
        let val_updn = Math.abs(d.sum_up) + Math.abs(d.sum_dn);
        let output_opacity = params.matrix.opacity_scale(val_updn * ds_factor);
        return output_opacity;
      });
  }

  return {
    zoomed: zoomed,
    two_translate_zoom: two_translate_zoom,
    ini_doubleclick: ini_doubleclick,
  };
};

export default Zoom;
