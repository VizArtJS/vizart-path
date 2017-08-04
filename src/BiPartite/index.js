import {
    AbstractChart,
    DefaultCategoricalColor,
    makeColorScale,
    mergeBase,
    FieldType,
    check,
} from 'vizart-core';
import { select } from 'd3-selection';
import { transition } from 'd3-transition';
import { format } from 'd3-format';
import { interpolate } from 'd3-interpolate';

import buildPartiteData from './data';
import PartiteLayout from './layout';


const DefaultOptions = {
    chart: { type: 'biPartite' },
    animation:{
        duration: {
            partite: 500,
        }
    },
    data: {
        source: {
            name: null,
            type: FieldType.STRING,
            accessor: null,
        },

        target: {
            name: null,
            type: FieldType.STRING,
            accessor: null
        },

        links: [
            {
                name: null,
                type: FieldType.NUMBER,
                accessor: null
            },
            {
                name: null,
                type: FieldType.NUMBER,
                accessor: null
            }
        ],
    },
    color: DefaultCategoricalColor,
    plots: {
        buffMargin: 1,
        minHeight: 14,
        gap: 110,
        gapEdge: 140,
        mainRectGap: 10
    }
};

const c1 = [-80, 80];
const c3 = [60, 220];
const b = 20;
let commaFormat = format(',');
let edgePolygon = (bb, d)=> {
    return [0, d.y1, bb, d.y2, bb, d.y2 + d.h2, 0, d.y1 + d.h1].join(" ");
}

class BiPartite extends AbstractChart {

    constructor(canvasId, _userOptions) {
        super(canvasId, _userOptions);

        this._s = (d)=> { return d[this._options.data.source.accessor]};
        this._t = (d)=> { return d[this._options.data.target.accessor]};
        this._l0 = (d)=> { return d[this._options.data.links[0].accessor]};
        this._l1 = (d)=> { return d[this._options.data.links[1].accessor]};
    }

    render(_data) {
        super.render(_data);

        this.bb = (this._options.chart.innerWidth - 2 * (c1[1] - c1[0]) - 2 * (c3[1] - c3[0]) - 4 * b) / 2;

        this.update();
    };

    update() {
        super.update();


        this._data.forEach((biP, s)=>{
            this._svg.append("g")
                .attr("id", biP.id)
                .attr("transform","translate("+ ((this._options.chart.width / 2 ) * s)+",0)");

            let partite = new PartiteLayout(biP.data,
                this._options.chart.innerHeight,
                this._options.plots.buffMargin,
                this._options.plots.minHeight)
                .layout();

            this._drawPart(partite, biP.id, 0);
            this._drawPart(partite, biP.id, 1);
            this._drawEdges(partite, biP.id);
            this._drawHeader(biP.header, biP.id);

            [0,1].forEach((p)=>{
                this._svg.select("#"+biP.id)
                    .select(".part"+p)
                    .select(".mainbars")
                    .selectAll(".mainbar")
                    .on("mouseover",(d, i)=>{ return this._selectSegment(p, i); })
                    .on("mouseout",(d, i)=>{ return this._deSelectSegment(p, i); });
            });
        });
    }

    data(_data) {
        if (check(_data) === true) {
            this._data = buildPartiteData(_data, this._options);
        }

        return this._data;
    };

    createOptions(_userOpt) {
        return mergeBase(DefaultOptions, _userOpt);
    };

    _selectSegment(m, s) {
        let that = this;

        for(let k of that._data) {
            let newData = {keys: [], data: []};

            newData.keys = k.data.keys.map((d) => {
                return d;
            });
            newData.data[m] = k.data.data[m].map((d) => {
                return d;
            });

            newData.data[1 - m] = k.data.data[1 - m]
                .map((v) => {
                    return v.map((d, i) => {
                        return (s == i ? d : 0);
                    });
                });


            that._transitionLayout(new PartiteLayout(newData,
                that._options.chart.innerHeight,
                that._options.plots.buffMargin,
                that._options.plots.minHeight)
                .layout(), k.id);

            let selectedBar = that._svg.select("#" + k.id)
                .select(".part" + m)
                .select(".mainbars")
                .selectAll(".mainbar")
                .filter((d, i) => { return (i == s); });

            selectedBar.select(".mainrect").style("stroke-opacity", 1);
            selectedBar.select(".barlabel").style('font-weight', 'bold');
            selectedBar.select(".barvalue").style('font-weight', 'bold');
            selectedBar.select(".barpercent").style('font-weight', 'bold');
        }
    }

    _deSelectSegment(m, s) {
        let that = this;

        for (let k of that._data) {
            that._transitionLayout(new PartiteLayout(k.data,
                that._options.chart.innerHeight,
                that._options.plots.buffMargin,
                that._options.plots.minHeight)
                .layout(), k.id);

            let selectedBar = that._svg.select("#" + k.id)
                .select(".part" + m)
                .select(".mainbars")
                .selectAll(".mainbar")
                .filter((d, i) => { return (i == s); });

            selectedBar.select(".mainrect").style("stroke-opacity", 0);
            selectedBar.select(".barlabel").style('font-weight', 'normal');
            selectedBar.select(".barvalue").style('font-weight', 'normal');
            selectedBar.select(".barpercent").style('font-weight', 'normal');
        }

    }

    transitionColor(colorOptions) {
        super.transitionColor(colorOptions);

        let _transition = transition()
            .duration(this._options.animation.duration.change);

        _transition.selectAll(".subbar")
            .style("fill", (d) => { return this._colorScale(d.key1);  });

        _transition.selectAll('.edge')
            .style("fill", (d) => { return this._colorScale(d.key1); });

    };


    _arcTween(a) {
        let that = this;
        let i = interpolate(this._current, a);
        this._current = i(0);

        return (t) => {
            return edgePolygon(that.bb, i(t));
        };
    }

    _drawPart(data, id, p) {
        this._svg.select("#" + id)
            .append("g")
            .attr("class", "part" + p)
            .attr("transform", "translate(" + ( p * (this.bb + b) + this._options.plots.gap) + ",0)");
        this._svg.select("#" + id)
            .select(".part" + p)
            .append("g")
            .attr("class", "subbars")
            .attr('x', 50);
        this._svg.select("#" + id)
            .select(".part" + p)
            .append("g")
            .attr("class", "mainbars");

        let mainbar = this._svg.select("#" + id)
            .select(".part" + p)
            .select(".mainbars")
            .selectAll(".mainbar")
            .data(data.mainBars[p])
            .enter()
            .append("g")
            .attr("class", "mainbar");

        mainbar.append("rect")
            .attr("class", "mainrect")
            .attr("x", 60)
            .attr("y", (d) => {
                return d.middle - d.height / 2; })
            .attr("width", b)
            .attr("height", (d) => { return d.height; })
            .style("shape-rendering", "auto")
            .style("fill-opacity", 0)
            .style("stroke-width", "0.5")
            .style("stroke", "black")
            .style("stroke-opacity", 0);


        if (p < 1) {
            mainbar.append("text")
                .attr("class", "barlabel")
                .attr("x", c1[1] - 30)
                .attr("y", (d) => { return d.middle + 5;  })
                .text((d, i) => {
                    return "(" + Math.round(100 * d.percent) + "%) " + data.keys[p][i] + " ";
                })
                .attr("text-anchor", "end");
        } else {
            mainbar.append("text")
                .attr("class", "barlabel")
                .attr("x", c1[1] + 10)
                .attr("y", (d) => { return d.middle + 5; })
                .text((d, i) => {
                    return " " + data.keys[p][i] + " (" + Math.round(100 * d.percent) + "%)";
                })
                .attr("text-anchor", "start");
        }
        /*
         mainbar.append("text").attr("class","barlabel")
         .attr("x", c1[p]).attr("y",function(d){ return d.middle+5;})
         .text(function(d,i){ return " " + data.keys[p][i] + " ("+Math.round(100*d.percent)+"%)";})
         .attr("text-anchor","start" );

         mainbar.append("text").attr("class","barvalue")
         .attr("x", c2[p]).attr("y",function(d){ return d.middle+5;})
         .text(function(d,i){ return commaFormat(round(d.value)) ;})
         .attr("text-anchor","end");

         mainbar.append("text").attr("class","barpercent")
         .attr("x", c3[p]).attr("y",function(d){ return d.middle+5;})
         .text(function(d,i){ return "( "+Math.round(100*d.percent)+"%)" ;})
         .attr("text-anchor","end").style("fill","grey");
         */
        this._svg.select("#" + id)
            .select(".part" + p)
            .select(".subbars")
            .selectAll(".subbar")
            .data(data.subBars[p])
            .enter()
            .append("rect")
            .attr("class", "subbar")
            .attr("x", 60)
            .attr("y", (d) => {  return d.y })
            .attr("width", b)
            .attr("height", (d) => { return d.h })
            .style("fill", (d) => { return this._colorScale(d.key1); });
    }

    _drawEdges(data, id) {
        this._svg.select("#" + id).append("g")
            .attr("class", "edges")
            .attr("transform", "translate(" + 190 + ",0)")
            .attr("x", 60);

        this._svg.select("#" + id)
            .select(".edges")
            .selectAll(".edge")
            .data(data.edges)
            .enter()
            .append("polygon")
            .attr("class", "edge")
            .attr("points", (d)=>{ return edgePolygon(this.bb, d)})
            .style("fill", (d) => { return this._colorScale(d.key1); })
            .style("opacity", 0.5).each(function(d) { this._current = d;  });
    }

    _drawHeader(header, id) {
        select("#" + id)
            .select(".part0")
            .append("g")
            .attr("class", "header")
            .append("text")
            .text(header[2])
            .style("font-size", "18")
            .attr("x", c1[1] + this.bb / 2)
            .attr("y", -10)
            .style("text-anchor", "middle")
            .style("font-weight", "bold");

        [0, 1].forEach( (d)=> {
            let h = select("#" + id)
                .select(".part" + d)
                .append("g")
                .attr("class", "header");

            if (d < 1) {
                h.append("text")
                    .text(header[d])
                    .attr("x", (c1[1] - 50))
                    .attr("y", -10).style("fill", "grey")
                    .attr("text-anchor", "end");
            } else {
                h.append("text")
                    .text(header[d])
                    .attr("x", (c1[d] + 30))
                    .attr("y", -10).style("fill", "grey")
                    .attr("text-anchor", "start");
            }

            h.append("line")
                .attr("x1", c1[d])
                .attr("y1", -2)
                .attr("x2", c3[d])
                .attr("y2", -2)
                .style("stroke", "black")
                .style("stroke-width", "1")
                .style("shape-rendering", "crispEdges");
        });
    }



    _transitionPart(data, id, p) {
        let mainbar = this._svg.select("#" + id)
            .select(".part" + p)
            .select(".mainbars")
            .selectAll(".mainbar")
            .data(data.mainBars[p]);

        mainbar.select(".mainrect")
            .transition()
            .duration(this._options.animation.duration.partite)
            .attr("y", (d)=> { return d.middle - d.height / 2;  })
            .attr("height", (d)=> { return d.height; });

        mainbar.select(".barlabel")
            .transition()
            .duration(this._options.animation.duration.partite)
            .attr("y", (d)=> { return d.middle + 5; });

        mainbar.select(".barvalue")
            .transition()
            .duration(this._options.animation.duration.partite)
            .attr("y", (d)=> { return d.middle + 5; })
            .text((d)=> { return commaFormat(Math.round(d.value)); });

        mainbar.select(".barpercent")
            .transition()
            .duration(this._options.animation.duration.partite)
            .attr("y", (d)=> { return d.middle + 5;  })
            .text((d)=> { return "( " + Math.round(100 * d.percent) + "%)"; });

        this._svg.select("#" + id)
            .select(".part" + p)
            .select(".subbars")
            .selectAll(".subbar")
            .data(data.subBars[p])
            .transition()
            .duration(this._options.animation.duration.partite)
            .attr("y", (d)=> { return d.y; })
            .attr("height", (d)=> { return d.h  });
    }

    _transitionEdges(data, id) {
        this._svg.select("#" + id)
            .append("g")
            .attr("class", "edges")
            .attr("transform", "translate(" + 190 + ",0)");

        let that = this;

        this._svg.select("#" + id)
            .select(".edges")
            .selectAll(".edge")
            .data(data.edges)
            .transition()
            .duration(this._options.animation.duration.partite)
            .attrTween("points", function(a){
                let i = interpolate(this._current, a);
                this._current = i(0);

                return (t)=> {
                    return edgePolygon(that.bb, i(t));
                };
            })
            .style("opacity",  (d)=> {
                return (d.h1 == 0 || d.h2 == 0 ? 0 : 0.5);
            });
    }

    _transitionLayout(data, id) {
        this._transitionPart(data, id, 0);
        this._transitionPart(data, id, 1);
        this._transitionEdges(data, id);
    }

}

export default BiPartite;