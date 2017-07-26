import {
    DefaultCategoricalColor,
    AbstractChart,
    NoMargin,
    mergeBase,
    check,
    FieldType
} from 'vizart-core';

import { default as crossfilter } from 'crossfilter';
import isNumber from 'lodash-es/isNumber';
import isDate from 'lodash-es/isDate';
import isArray from 'lodash-es/isArray';
import { extent } from 'd3-array';
import { keys } from 'd3-collection';
import { select } from 'd3-selection';

import './parallel-coordinates.css';
import ParCoords from './ParCoords';


const Composites = [
    'source-over',
    'source-in',
    'source-out',
    'source-atop',
    'destination-over',
    'destination-in',
    'destination-out',
    'destination-atop',
    'lighter',
    'darken',
    'xor',
    'copy'
];

const DefaultOptions = {
    chart: {
        type: 'parallel_coordinates',
        margin: NoMargin
    },
    color: DefaultCategoricalColor,
    plots: {
        hiddenAxis:[],
        flipAxes: [],
        alpha: 0.25,
        bundlingStrength: 0.5,
        bundleDimension: null,
        composite: 'darken',
        smoothness: 0.0,
        showControlPoints: false,
        animationTime: 1100, // How long it takes to flip the axis when you double click
        brushMode: '1D-axes',
        brushPredicate: 'AND',
        colorDimension: null,
        renderingMode: 'queue',
        dimensions: null,
        autoSortDimensions: 'asc',
        evenScale: null
    }
};

class ParallelCoordinate extends AbstractChart {

    constructor(canvasId, _userOptions) {
        super(canvasId, _userOptions);
        this.parcoords;
    }


    render (_data) {
        this.data(_data);

        if (!select(this._containerId).classed("parcoords")) {
            select(this._containerId).classed("parcoords", true);
        }

        this.update();
    };

    update() {
        super.update();

        this.parcoords = ParCoords()(this._containerId)
            .data(this._data)
            .hideAxis(this._options.plots.hiddenAxis)
            .alpha(this._options.plots.alpha)
            .composite(this._options.plots.composite)
            .margin(this._options.chart.margin)
            .mode(this._options.plots.renderingMode)
            .evenScale(this._options.plots.evenScale)
            .shadows()

        this.parcoords.color( (d)=> {
            return this._colorScale(d[this._options.plots.colorDimension]);
        });

        // Bundling
        if (check(this._options.plots.bundleDimension) === true) {
            this.parcoords.bundling(this._options.plots.bundleDimension);
        }


        // Color
        let dimensions = keys(this.parcoords.dimensions());
        if ((check(this._options.plots.colorDimension) === false) && dimensions.length > 0) {
            this._options.plots.colorDimension = dimensions[0];
        }

        // dimensions
        if ((check(this._options.plots.dimensions) === true) ) {
            this.parcoords.dimensions(this._options.plots.dimensions);
        } else {
            this.parcoords.dimensions(this.sortDimensions(this._data, this._options.plots.autoSortDimensions));
        }

        this.parcoords.render();


        // Brush
        this.brushMode(this._options.plots.brushMode);
        this.brushPredicate(this._options.plots.brushPredicate);

    };

    hideAxis(_axis) {
        this.parcoords.hideAxis(_axis);
    };

    alpha(_alpha) {
        this._options.plots.alpha = _alpha;
        this.parcoords.alpha(_alpha);
    };

    /**
     * requires sylvester and lapack to run
     * try install them in your app: npm install --save sylvester, npm install --save lapack
     *
     * @param _dimension
     */
    bundleDimension(_dimension) {
        this._options.plots.bundleDimension = _dimension;
        this.parcoords.bundleDimension(_dimension);
    };

    bundlingStrength(_strength) {
        this._options.plots.bundlingStrength = _strength;
        this.parcoords.bundlingStrength(_strength);
    };

    composite(_composite) {
        this._options.plots.composite = _composite;
        this.parcoords.composite(_composite);
    }

    curveSmoothness(_smoothness) {
        this._options.plots.smoothness = _smoothness;
        this.parcoords.smoothness(_smoothness);
    };

    brushMode(_mode) {
        this._options.plots.brushMode = _mode;
        this.parcoords.brushMode(_mode);
    };

    renderingMode(_mode) {
        this._options.plots.renderingMode = _mode;
        this.parcoords.mode(_mode);
    };

    brushPredicate(_predicate) {
        this._options.plots.brushPredicate = _predicate;
        this.parcoords.brushPredicate(_predicate);
    };

    // getters
    getDimensions() {
        return this.parcoords.dimensions();
    };

    getBrushModes() {
        return this.parcoords.brushModes();
    };

    resetBrushes() {
        this.parcoords.brushReset();
    };

    getComposites() {
        return Composites;
    };

    colorDimension(_dimension) {
        this._options.plots.colorDimension = _dimension;
        let _dim = parcoords.dimensions()[_dimension];

        if (!_dim) {
            throw new Error('invalid dimension, please use getDimensions() firstly. ' + _dimension);
        }

        switch (_dim.type) {
            case FiledType.STRING:
                this._options.color.scaleType = 'categorical';
                break;
            case FiledType.NUMBER:
            case FiledType.DATE:
                this._options.color.scaleType = 'gradient';
                break;

            default:
                this._options.color.scaleType = 'categorical';
                break;
        }


        this._colorScale = makeColorScale(this._options.color);


        switch (_dim.type) {
            case FiledType.STRING:
                break;
            case FiledType.NUMBER:
            case FiledType.DATE:
                this._colorScale.domain(extent(this._data,  (d)=> {
                    return d[_dimension]
                }));
                break;

            default:
                break;
        }


        this.parcoords.color( (d)=> { return this._colorScale(d[_dimension]);
        }).render();
    };

    transitionColor(colorOptions) {
        super.transitionColor(colorOptions);

        this.parcoords.color((d) => {
            return this._colorScale(d[this._options.plots.colorDimension]);
        }).render();
    };


    sortDimensions(_data, _direction = 'asc') {
        if (this._options.plots.dimensions != null) {
            console.log('dimensions have been already defined, no need to auto detect');
            return {};
        }


        let _dimensionList = [];
        let ndx = crossfilter(_data);
        let sample = _data[0];

        for (let _k of keys(sample)) {
            let _value = sample[_k];

            if (isNumber(_value) || isDate(_value)) {
                // nothing to do
                _dimensionList.push(_k);
            } else {
                // only massive string discrete values will cause performance problems
                let _dim = ndx.dimension((d) => { return d[_k];  });
                let size = _dim.group().size();

                if (size > 3000) {
                    // exclude this axis
                } else {
                    _dimensionList.push(_k);
                }
            }
        }
        _dimensionList.sort((a, b)=>{
            return _direction === 'asc'
                ? a.localeCompare(b)
                : b.localeCompare(a);
        });

        let retDim = {};

        for (let i = 0; i < _dimensionList.length; i++) {
            let name = _dimensionList[i];
            retDim[name] = {
                title: name,
                index: i
            }
        }

        return retDim
    }

    createOptions(_userOpt) {
        return mergeBase(DefaultOptions, _userOpt);
    };
}

export default ParallelCoordinate;