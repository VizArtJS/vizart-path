import {
    DefaultCategoricalColor,
    mergeBase,
    AbstractChart
} from 'vizart-core';
import { transition } from 'd3-transition';
import { chord, ribbon } from 'd3-chord';
import { descending, ascending, range } from 'd3-array';
import { arc } from 'd3-shape';
import { select, selectAll, event as d3Event } from 'd3-selection';

const DefaultOptions = {
    chart: {
        type: 'chord',
    },
    color: DefaultCategoricalColor,
    data: {
        source: {
            accessor: null,
            name: null,
            formatter: null
        },
        target: {
            accessor: null,
            name: null,
            formatter: null
        },

        links:[
            {
                accessor: null,
                name: null,
                formatter: null
            },
            {
                accessor: null,
                name: null,
                formatter: null
            }
        ]
    },
    plots: {
        drawTicks: true
    },
    ordering: {
        name: 'row', //row, column or volume
        direction: 'asc'
    }
};

// Returns an array of tick angles and labels, given a group.
let _groupTicks =(d)=> {
    let k = (d.endAngle - d.startAngle) / d.value;

    return range(0, d.value, d.value / 25).map( (v, i)=> {
        return {
            angle: v * k + d.startAngle,
            label: i % 5 ? null : v + "%"
        };
    });
}

import Matrix from './Matrix';
import './chord.css';

class Chord extends AbstractChart {

    constructor(canvasId, _userOptions) {
        super(canvasId, _userOptions);

        this.outerRadius = Math.min(this._options.chart.innerWidth, this._options.chart.innerHeight) / 2;

        this._s = (d)=> { return d[this._options.data.source.accessor]};
        this._t = (d)=> { return d[this._options.data.target.accessor]};
        this._l0 = (d)=> { return d[this._options.data.links[0].accessor]};
        this._l1 = (d)=> { return d[this._options.data.links[1].accessor]};
    }


    transitionColor(colorOptions) {
        super.transitionColor(colorOptions);

        let _trans = transition()
            .duration(1250)
            .delay((d, i) => {
                return i * 50;
            });

        this._svg.selectAll("g.group").select("path")
            .transition(_trans)
            .style("fill",  (d)=> { return this._color(d._id); });

        this._svg.selectAll("path.chord")
            .transition(_trans)
            .style("fill",  (d)=> {
                return this._color(d.source._id);
            })
    };



    render(_data) {
        super.render(_data);

        this._container.attr("preserveAspectRatio", "xMinYMin")
            .attr("viewBox", "0 0 " + this._options.chart.width + " " + this._options.chart.height);
        this._svg.attr("transform", "translate(" + this._options.chart.width/ 2 + "," + this._options.chart.height / 2 + ")");

        let _chord = chord()
            .padAngle(.05)
            .sortGroups(descending)
            .sortSubgroups(ascending);

        this._matrix = new Matrix()
            .layout(_chord)
            .filter((item, r, c)=> {
                return (this._s(item) === r.name && this._t(item) === c.name) ||
                    (this._s(item) === c.name && this._t(item) === r.name);
            })
            .reduce( (items, r, c)=> {
                let value;
                if (!items[0]) {
                    value = 0;
                } else {
                    value = items.reduce( (m, n)=> {
                        let _val0 = this._l0(n) ? this._l0(n) : 0;
                        let _val1 = this._l1(n) ? this._l1(n) : 0;

                        if (r === c) {
                            return m + (_val0 + _val1);
                        } else {
                            return m + (this._s(n) === r.name ? _val0: _val1);
                        }
                    }, 0);
                }
                return {value: value, data: items};
            });

        this.update();
    }

    update() {
        super.update();
        let matrix = this._matrix;
        let _data = this._data;
        let _opt = this._options;
        let that = this;

        matrix.data(_data)
            .resetKeys()
            .addKeys([_opt.data.source.accessor, _opt.data.target.accessor])
            .update();


        let innerRadius = this.outerRadius / 1.1;
        let _arc = arc()
            .innerRadius(innerRadius)
            .outerRadius(innerRadius + 20);

        let _ribbon = ribbon()
            .radius(innerRadius);


        let _resetChords = ()=> {
            d3Event.preventDefault();
            d3Event.stopPropagation();
            that._svg.selectAll("path.chord")
                .transition()
                .duration(250)
                .style("opacity", 0.9);
        }



        let gChanged = this._svg.selectAll("g.group")
            .data(matrix.groups(),  (d)=> { return d._id; });

        let gEnter = gChanged.enter()
            .append("g")
            .attr("class", "group");

        let gExit = gChanged.exit();

        gEnter.append("path")
            .style("pointer-events", "none")
            .style("fill",  (d)=> { return this._color(d._id); })
            .attr("d", _arc);

        gEnter.append("text")
            .attr("dy", ".35em")
            // .on("click", (d)=> {this._groupClick(d)})
            .on("mouseover", (d)=> { this._dimChords(d)})
            .on("mouseout", _resetChords )
            .text( (d)=> { return d._id; });

        this._svg.selectAll("g.group")
            .select("path")
            .transition().duration(2000)
            .attrTween("d", matrix.groupTween(_arc));

        this._svg.selectAll("g.group").select("text")
            .transition()
            .duration(2000)
            .attr("transform",  (d)=> {
                d.angle = (d.startAngle + d.endAngle) / 2;
                let r = "rotate(" + (d.angle * 180 / Math.PI - 90) + ")";
                let t = " translate(" + (innerRadius + 26) + ")";
                return r + t + (d.angle > Math.PI ? " rotate(180)" : " rotate(0)");
            })
            .attr("text-anchor",  (d)=> {
                return d.angle > Math.PI ? "end" : "begin";
            });

        gExit.select("text").attr("fill", "orange");
        gExit.select("path").remove();

        gExit.transition().duration(1000)
            .style("opacity", 0).remove();

        let chords = this._svg.selectAll("path.chord")
            .data(matrix.chords(), (d)=> { return d._id; });

        chords.enter().append("path")
            .attr("class", "chord")
            .style("fill",  (d)=> {
                return this._color(d.source._id);
            })
            .attr("d", _ribbon)
            .on("mousemove", (d)=> {this._chordMouseover(d)} )
            .on("mouseout", (d)=> { this._hideTooltip(d)});

        chords.transition().duration(2000)
            .attrTween("d", matrix.chordTween(_ribbon));

        chords.exit().remove();

        // if (this._options.plots.drawTicks === true) {
        //     this._drawTicks();
        // }
    };

    _drawTicks() {
        this._svg.selectAll(".ticks").remove();

        let ticks = this._svg.append("g")
            .attr("class", "ticks")
            .attr("opacity", 0.1)
            .selectAll("g")
            .data(this._matrix.groups())
            .enter()
            .append("g")
            .selectAll("g")
            .data(_groupTicks)
            .enter()
            .append("g")
            .attr("transform", (d) => {
                return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")"
                    + "translate(" + this.outerRadius + ",0)";
            });

        ticks.append("line")
            .attr("x1", 1)
            .attr("y1", 0)
            .attr("x2", 5)
            .attr("y2", 0)
            .style("stroke", "#000");

        ticks.append("text")
            .attr("x", 8)
            .attr("dy", ".35em")
            .attr("text-anchor", (d)=> {
                return d.angle > Math.PI ? "end" : null;
            })
            .attr("transform", (d)=> {
                return d.angle > Math.PI ? "rotate(180)translate(-16)" : null;
            })
            .text( (d)=> { return d.label; });

        this._svg.selectAll(".ticks")
            .transition()
            .duration(340)
            .attr("opacity", 1);
    };


    // _groupClick(d) {
    //     d3Event.preventDefault();
    //     d3Event.stopPropagation();
    //     this._resetChords();
    // }


    _chordMouseover(d) {
        if (d3Event) {
            d3Event.preventDefault();
            d3Event.stopPropagation();
        }

        this._dimChords(d);
    }

    _hideTooltip() {
        if (d3Event) {
            d3Event.preventDefault();
            d3Event.stopPropagation();
        }

        this._resetChords();
    }

    _resetChords() {
        if (d3Event) {
            d3Event.preventDefault();
            d3Event.stopPropagation();
        }

        this._svg.selectAll("path.chord")
            .transition()
            .duration(250)
            .style("opacity", 0.9);
    }

    _dimChords(d) {
        if (d3Event) {
            d3Event.preventDefault();
            d3Event.stopPropagation();
        }
        
        this._svg.selectAll("path.chord")
                .transition()
                .duration(250)
                .style("opacity", (p)=> {
                if (d.source){
                    return (p._id === d._id) ? 0.9 : 0.1;
                } else { // COMPARE GROUP IDS
                    return (p.source._id === d._id || p.target._id === d._id) ? 0.9 : 0.1;
                }
        });
}

    createOptions(_userOpt) {
        return mergeBase(DefaultOptions, _userOpt);
    };
}

export default Chord;
