import map from 'lodash-es/map';
import difference from 'lodash-es/difference';

const check_need_exit_enter = function(old_params, params) {

    // exit, update, enter

    // check if exit or enter or both are required
    let old_row_nodes = old_params.network_data.row_nodes;
    let old_col_nodes = old_params.network_data.col_nodes;
    let old_row = map(old_row_nodes, function (d) {
        return d.name;
    });
    let old_col = map(old_col_nodes, function (d) {
        return d.name;
    });
    let all_old_nodes = old_row.concat(old_col);

    let row_nodes = params.network_data.row_nodes;
    let col_nodes = params.network_data.col_nodes;
    let row = map(row_nodes, function (d) {
        return d.name;
    });
    let col = map(col_nodes, function (d) {
        return d.name;
    });
    let all_nodes = row.concat(col);

    let exit_nodes = difference(all_old_nodes, all_nodes).length;
    let enter_nodes = difference(all_nodes, all_old_nodes).length;

    let delays = {};

    delays.exit = 0;

    if (exit_nodes > 0) {
        delays.update = 1000;
    } else {
        delays.update = 0;
    }

    if (enter_nodes > 0) {
        delays.enter = 1000;
    } else {
        delays.enter = 0;
    }

    delays.update = delays.update + delays.exit;
    delays.enter = delays.enter + delays.exit + delays.update;

    return delays;
}

export default check_need_exit_enter;