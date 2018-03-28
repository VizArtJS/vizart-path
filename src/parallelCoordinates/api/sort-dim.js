import { keys } from 'd3-collection';
import { default as crossfilter } from 'crossfilter';

//https://stackoverflow.com/questions/9716468/is-there-any-function-like-isnumeric-in-javascript-to-validate-numbers
const isNumeric = n => !isNaN(parseFloat(n)) && isFinite(n);

const sortDim = state => (_data, _direction = 'asc')=>  {
    const { _options } = state;

    if (_options.plots.dimensions != null) {
        console.log(
            'dimensions have been already defined, no need to auto detect'
        );
        return {};
    }

    const _dimensionList = [];
    const ndx = crossfilter(_data);
    const sample = _data[0];

    for (const _k of keys(sample)) {
        const _value = sample[_k];

        if (isNumeric(_value) || _value instanceof Date) {
            // nothing to do
            _dimensionList.push(_k);
        } else {
            // only massive string discrete values will cause performance problems
            const _dim = ndx.dimension(d => d[_k]);
            let size = _dim.group().size();

            if (size > 3000) {
                // exclude this axis
            } else {
                _dimensionList.push(_k);
            }
        }
    }
    _dimensionList.sort(
        (a, b) => (_direction === 'asc' ? a.localeCompare(b) : b.localeCompare(a))
    );

    let retDim = {};

    for (let i = 0; i < _dimensionList.length; i++) {
        let name = _dimensionList[i];
        retDim[name] = {
            title: name,
            index: i,
        };
    }

    return retDim;
}

export default sortDim;