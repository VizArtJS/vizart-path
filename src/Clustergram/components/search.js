/* Handles searching rows or columns.
 !! need to generalize to column and row
 * ----------------------------------------------------------------------- */
import { select, selectAll } from 'd3-selection';
import indexOf from 'lodash-es/indexOf';

const Search = function(params, nodes, prop) {

    /* Collect entities from row or columns.
     */
    let entities = [],
        i;

    for (i = 0; i < nodes.length; i++) {
        entities.push(nodes[i][prop]);
    }

    /* Find a gene (row) in the clustergram.
     */
    function find_entities(search_term) {
        if (entities.indexOf(search_term) !== -1) {
            un_highlight_entities();
            zoom_and_highlight_found_entity(search_term);
            highlight_entity(search_term);
        }
    }

    /* Zoom into and highlight the found the gene
     */
    function zoom_and_highlight_found_entity(search_term) {
        let idx = indexOf(entities, search_term),
            inst_y_pos = params.matrix.y_scale(idx),
            pan_dy = params.viz.clust.dim.height / 2 - inst_y_pos;

        // viz exposes two_translate_zoom from zoom object
        viz.two_translate_zoom(params, 0, pan_dy, params.viz.zoom_switch);
    }

    function un_highlight_entities() {
        d3.selectAll('.row_label_text').select('rect').style('opacity', 0);
    }

    function highlight_entity(search_term) {

        d3.selectAll('.row_label_text')
            .filter(function (d) {
                return d[prop] === search_term;
            })
            .select('rect')
            .style('opacity', 1);
    }

    /* Returns all the genes in the clustergram.
     */
    function get_entities() {
        return entities;
    }

    return {
        find_entities: find_entities,
        get_entities: get_entities
    }
}

export default Search;