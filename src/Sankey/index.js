import {
    AbstractChart,
    DefaultCategoricalColor,
    NoMargin,
    mergeBase
} from 'vizart-core';

import { sankey } from 'd3-sankey';
import { scaleLinear } from 'd3-scale';
import { select, selectAll, mouse, event} from 'd3-selection';
import { drag } from 'd3-drag';
import { timer } from 'd3-timer';

import VerticalSankey from './layout/VerticalSankey';
import CircularSankey from './layout/CircularSankey';


const DefaultOptions = {
    chart: {
        type: 'sankey',
        margin: NoMargin,
    },
    color: DefaultCategoricalColor,
    plots: {
        horizontal: true, // 'horizontal', 'vertical'
        layout: 32,
        nodeWidth: 15,
        nodePadding: 10,
        colorfulLink: true,
        linkColor: '#000',
        linkOpacity: 0.2,
        nodeOpacity: 1,
        nodeFontSize: 14,
        realTime: false,
        realTimeSpeed: 5000, // 5s
        realTimeInterval: 1 // 1s
    }
};

class Sankey extends AbstractChart {

    constructor(canvasId, _userOptions) {
        super(canvasId, _userOptions);

        this._layout;
        this.freqCounter = 1;
    }

    render(_data) {
        super.render(_data);

        this._nodeGroup = this._svg.append('g').attr('class', 'node-group');
        this._linkGroup = this._svg.append('g').attr('class', 'link-group');

        this.update(_data);
    };


    update(_data) {
        let that = this;

        if (this._options.plots.horizontal === true) {
            this._layout = CircularSankey()
                .nodeWidth(this._options.plots.nodeWidth)
                .nodePadding(this._options.plots.nodePadding)
                .size([this._options.chart.innerWidth, this._options.chart.innerHeight])
                .nodes(this._data.nodes)
                .links(this._data.links)
                .layout(this._options.plots.layout);
        } else {
            this._layout = VerticalSankey()
                .nodeWidth(this._options.plots.nodeWidth)
                .nodePadding(this._options.plots.nodePadding)
                .size([this._options.chart.innerWidth, this._options.chart.innerHeight])
                .nodes(this._data.nodes)
                .links(this._data.links)
                .layout(this._options.plots.layout);
        }

        let path = this._layout.link();

        // nodes
        let links = this._linkGroup.selectAll(".sankey-link")
            .data(this._data.links);

        links.exit()
            .transition()
            .delay(this._options.animation.duration.remove)
            .style('stroke-opacity', 0)
            .remove();

        links
            .attr('data-link-source',  (d, i)=> { return d.source.name; })
            .attr('data-link-target',  (d, i)=> { return d.target.name;  })
            .transition()
            .duration(this._options.animation.duration.update)
            .delay( (d, i)=> {
                return i / this._data.links.length * this._options.animation.duration.update;
            })
            .attr("d", path)
            .style("stroke-width", (d)=> {
                return Math.max(1, d.dy);
            })
            .style("stroke", (d)=> {
                return this._options.plots.colorfulLink ? this._colorScale(d.source.name) : this._options.plots.linkColor;
            })
            .style('stroke-opacity', this._options.plots.linkOpacity);

        links
            .enter().append("path")
            .attr("class", "sankey-link")
            .attr("d", path)
            .attr('data-link-source', (d, i)=> {
                return d.source.name;
            })
            .attr('data-link-target', (d, i)=> {
                return d.target.name;
            })
            .style("fill", 'none')
            .style("stroke-width",  (d)=> {
                return Math.max(1, d.dy);
            })
            .style("stroke", (d)=> {
                return this._options.plots.colorfulLink ? this._colorScale(d.source.name) : this._options.plots.linkColor;
            })
            .style('stroke-opacity', this._options.plots.linkOpacity);

        this._linkGroup.selectAll(".sankey-link").classed('backwards',  (d)=> {
            return d.target.x < d.source.x;
        });

        let nodes = this._nodeGroup.selectAll(".sankey-node")
            .data(this._data.nodes);

        nodes.exit().transition()
            .duration(this._options.animation.duration.remove)
            .remove();

        nodes
            .transition()
            .delay(this._options.animation.duration.remove)
            .attr("transform", (d)=> {
                return "translate(" + d.x + "," + d.y + ")";
            });



        let _drag = drag()
            .subject( (d)=> {
                return d;
            })
            .on("start", function () {
                this.parentNode.appendChild(this);
            })
            .on("end", function() {
                if (that._options.plots.horizontal) {
                    select(this).attr("transform", "translate(" + d.x + "," +
                        (d.y = Math.max(0, Math.min(that._options.chart.innerHeight - d.dy, event.y))) + ")");
                } else {
                    select(this).attr("transform", "translate(" +
                        (d.x = Math.max(0, Math.min(that._options.chart.innerWidth - d.dy, event.x))) + "," + d.y + ")");
                }


                that._layout.relayout();
                links.attr("d", path);
            })

        nodes
            .call(_drag);

        nodes.select('.sankey-node-rect')
            .transition()
            .duration(this._options.animation.duration.update)
            .delay( (d, i)=> {
                return i / this._data.nodes.length * this._options.animation.duration.update;
            })
            .attr("height", this._options.plots.horizontal
                ?  (d)=> {
                    return d.dy > 0 ? d.dy : 0.5;
                }
                : this._layout.nodeWidth() > 0 ? this._layout.nodeWidth() : 0.5)
            .attr("width", this._options.plots.horizontal ? this._layout.nodeWidth() :  (d)=> {
                return d.dy;
            })
            .style("fill",  (d)=> {
                return d.color = this._colorScale(d.name);
            })
            .style('fill-opacity', this._options.plots.nodeOpacity);

        nodes.select('title')
            .text( (d)=> {
                return d.name + "\n" + d.value;
            });


        if (this._options.plots.horizontal === true) {
            nodes.select('.sankey-node-title')
                .transition()
                .duration(this._options.animation.duration.update)
                .delay( (d, i)=> {
                    return i / this._data.nodes.length * this._options.animation.duration.update;
                })
                .attr("x", -6)
                .attr("y", (d)=> {
                    return d.dy / 2;
                })
                .attr("dy", ".35em")
                .attr("text-anchor", "end")
                .attr("transform", null)
                .text( (d)=> {
                    return d.name;
                })
                .filter( (d)=> {
                    return d.x < width / 2;
                })
                .attr("x", this._options.plots.horizontal ? (6 + this._layout.nodeWidth()) : 0)
                .attr("text-anchor", "start")
                .style('font-size', this._options.plots.nodeFontSize + 'px');
        } else {
            nodes.select('.sankey-node-title')
                .transition()
                .duration(this._options.animation.duration.update)
                .delay( (d, i)=> {
                    return i / this._data.nodes.length * this._options.animation.duration.update;
                })
                .attr("text-anchor", "middle")
                //.attr("transform", "rotate(-20)")
                .attr("x", (d)=> {
                    return d.dy / 2
                })
                .attr("y", this._layout.nodeWidth() / 2)
                .attr("dy", ".35em")
                .text( (d)=> {
                    return d.name;
                })
                .filter( (d)=> {
                    return d.x < this._options.chart.innerWidth / 2;
                })
                .style('font-size', this._options.plots.nodeFontSize + 'px');
        }


        let appendedNodes = nodes
            .enter().
            append("g")
            .attr("class", "sankey-node")
            .attr("transform",  (d)=> {
                return "translate(" + d.x + "," + d.y + ")";
            })
            .call(_drag);

        appendedNodes.append("rect")
            .attr('class', 'sankey-node-rect')
            .attr("height", this._options.plots.horizontal
                ? (d)=> {
                    return d.dy > 0 ? d.dy : 0.5;
                }
                : this._layout.nodeWidth() > 0 ? this._layout.nodeWidth() : 0.5)
            .attr("width", this._options.plots.horizontal ? this._layout.nodeWidth() :  (d)=> {
                return d.dy;
            })
            .style("fill",  (d)=> {
                return d.color = this._colorScale(d.name);
            })
            .style('fill-opacity', this._options.plots.nodeOpacity)
            .style('shape-rendering', 'crispEdges')
            .append("title")
            .text( (d)=> {
                return d.name + "\n" + d.value;
            });

        if (this._options.plots.horizontal === true) {
            appendedNodes.append("text")
                .attr('class', 'sankey-node-title')
                .attr("x", -6)
                .attr("y",  (d)=> {
                    return d.dy / 2;
                })
                .attr("dy", ".35em")
                .attr("text-anchor", "end")
                .attr("transform", null)
                .text( (d)=> {
                    return d.name;
                })
                .filter( (d)=> {
                    return d.x < this._options.chart.innerWidth / 2;
                })
                .attr("x", 6 + this._layout.nodeWidth())
                .attr("text-anchor", "start")
                .style('font-size', this._options.plots.nodeFontSize + 'px');
        } else {
            appendedNodes.append("text")
                .attr("text-anchor", "middle")
                //.attr("transform", "rotate(-20)")
                .attr("x", (d)=> {
                    return d.dy / 2
                })
                .attr("y", this._layout.nodeWidth() / 2)
                .attr("dy", ".35em")
                .text( (d)=> {
                    return d.name;
                })
                .filter( (d)=> {
                    return d.x < this._options.chart.innerWidth / 2;
                })
                .style('font-size', this._options.plots.nodeFontSize + 'px');
        }


        // this._linkGroup.selectAll('.sankey-link')
        //     .on('mousemove', mouseOnPath)
        //     .on('mouseout', this._mouseOffPath);

        // nodeGroup.selectAll('.sankey-node-rect')
        //     .on('mousemove', mouseOnNode)
        //     .on('mouseout', mouseOffNode);


        if (this._options.plots.realTime === false) {
            select(this._containerId).select('canvas').empty();
        } else {
            let t = timer(tick, this._options.plots.realTimeInterval * 1000);

            let linkExtent = extent(this._data.links,  (d)=> {
                return d.value
            });
            let frequencyScale = scaleLinear().domain(linkExtent).range([1, 100]);
            let particleSize = scaleLinear().domain(linkExtent).range([1, 5]);


            this._data.links.forEach(function (link) {
                link.freq = frequencyScale(link.value);
                link.particleSize = particleSize(link.value);
                link.particleColor = scaleLinear().domain([1, 1000]).range([link.source.color, link.target.color]);
            });


            let particles = [];

            function tick(elapsed, time) {

                particles = particles.filter( (d)=> {
                    return d.time > (elapsed - this._options.plots.realTimeSpeed)
                });

                if (freqCounter > 100) {
                    freqCounter = 1;
                }

                selectAll(".sankey-link")
                    .each(
                        function (d) {
                            if (d.freq >= freqCounter) {
                                let offset = (Math.random() - .5) * d.dy;
                                particles.push({link: d, time: elapsed, offset: offset, path: this})
                            }
                        });

                particleEdgeCanvasPath(elapsed);
                freqCounter++;

            }

            function particleEdgeCanvasPath(elapsed) {
                let context = select(canvasId).select('canvas').node().getContext("2d");

                context.clearRect(0, 0, width, height);

                context.fillStyle = "gray";
                context.lineWidth = "1px";
                for (let x in particles) {
                    let currentTime = elapsed - particles[x].time;
                    let currentPercent = currentTime / options.plots.realTimeSpeed * particles[x].path.getTotalLength();
                    let currentPos = particles[x].path.getPointAtLength(currentPercent);
                    context.beginPath();
                    context.fillStyle = particles[x].link.particleColor(currentTime);
                    context.fillOpacity = 0.7
                    context.arc(currentPos.x, currentPos.y + particles[x].offset, particles[x].link.particleSize, 0, 2 * Math.PI);
                    context.fill();
                }
            }
        }
    };


    _mouseOnNode(d, i) {
        this._nodeGroup.selectAll('.sankey-node-rect')
            .transition('transition-sankey-node')
            .duration(this._options.animation.duration.quickUpdate)
            .style('fill-opacity', 0.2);

        select(this)
            .transition('transition-sankey-node')
            .duration(this._options.animation.duration.quickUpdate)
            .style('fill-opacity', 1);

        this._linkGroup.selectAll('.sankey-link')
            .transition()
            .duration(this._options.animation.duration.quickUpdate)
            .style("stroke", function (d) {
                return options.plots.linkColor;
            })
            .style('stroke-opacity', 0.1);


        this._linkGroup.select(".sankey-link[data-link-source=\"" + d.name + "\"]")
            .transition('highlight-link-transition')
            .duration(this._options.animation.duration.quickUpdate)
            .style("stroke", function (_d) {
                return options.plots.colorfulLink ? colorScale(_d.source.name) : options.plots.linkColor;
            })
            .style('stroke-opacity', 0.5);
        this._linkGroup.select(".sankey-link[data-link-target=\"" + d.name + "\"]")
            .transition('highlight-link-transition')
            .duration(this._options.animation.duration.quickUpdate)
            .style("stroke", function (_d) {
                return options.plots.colorfulLink ? colorScale(_d.source.name) : options.plots.linkColor;
            })
            .style('stroke-opacity', 0.5);

    }

    mouseOffNode(d, i) {
        this._linkGroup.selectAll('.sankey-link')
            .transition()
            .duration(this._options.animation.duration.quickUpdate)
            .style("stroke",  (d)=> {
                return this._options.plots.colorfulLink
                    ? this._colorScale(d.source.name)
                    : this._options.plots.linkColor;
            })
            .style('stroke-opacity', this._options.plots.linkOpacity);

        this._nodeGroup.selectAll('.sankey-node-rect')
            .transition('transition-sankey-node')
            .duration(this._options.animation.duration.quickUpdate)
            .style('fill-opacity', 1);
    }

    mouseOnPath(d, i) {
        tooltip.transition()
            .duration(this._options.animation.duration.quickUpdate)
            .style("opacity", .9);

        let coordinates = mouse(this);
        let x = coordinates[0];
        let y = coordinates[1];

        let html = Tooltip.noHandle(options.label.sourceLabel + ' ' + d.source.name,
            options.label.targetLabel,
            d.target.name,
            options.plots.colorfulLink
                ? colorScale(d.source.name)
                : options.plots.linkColor
        );

        tooltip.style("left", (x + 22) + "px")
            .style("top", (y + 84) + "px")
            .html(html);

        this._linkGroup.selectAll('.sankey-link')
            .transition()
            .duration(this._options.animation.duration.quickUpdate)
            .style("stroke", function (d) {
                return options.plots.linkColor;
            })
            .style('stroke-opacity', 0.1);

        select(this)
            .transition()
            .duration(this._options.animation.duration.quickUpdate)
            .style("stroke", function (d) {
                return options.plots.colorfulLink ? colorScale(d.source.name) : options.plots.linkColor;
            })
            .style('stroke-opacity', 0.5);

    }

    _mouseOffPath(d, i) {
        this._tooltip.transition()
            .duration(this._options.animation.duration.quickUpdate)
            .style("opacity", 0);

        this._linkGroup.selectAll('.sankey-link')
            .transition()
            .duration(this._options.animation.duration.quickUpdate)
            .style("stroke",  (d)=> {
                return this._options.plots.colorfulLink
                    ? this._colorScale(d.source.name)
                    : this._options.plots.linkColor;
            })
            .style('stroke-opacity', this._options.plots.linkOpacity);
    }


    transitionColor(colorOptions) {
        super.transitionColor(colorOptions);

        this._nodeGroup.selectAll('.sankey-node-rect')
            .transition()
            .duration(this._options.animation.duration.color)
            .delay( (d, i)=> {
                return i / this._data.nodes.length * this._options.animation.duration.color;
            })
            .style("fill",  (d)=> {
                return this._colorScale(d.name);
            });

        this._linkGroup.selectAll('.sankey-link')
            .transition()
            .duration(this._options.animation.duration.color)
            .delay( (d, i)=> {
                return i / this._data.links.length * this._options.animation.duration.color;
            })
            .style("stroke",  (d)=> {
                return this._options.plots.colorfulLink
                    ? this._colorScale(d.source.name)
                    : this._options.plots.linkColor
            });
    };


    createOptions(_userOpt) {
        return mergeBase(DefaultOptions, _userOpt);
    };

}

export default Sankey