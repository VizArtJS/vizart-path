import {
  AbstractChart,
  wrapSVGText,
  DefaultCategoricalColor,
  mergeBase,
} from 'vizart-core';
import { descending } from 'd3-array';
import { arc } from 'd3-shape';

import StretchedChordLayout from './StretchedChordLayout';
import CustomChordLayout from './CustomChordLayout';

import transformMatrix from './matrix';

const DefaultOptions = {
  chart: {
    type: 'stretched-chord',
  },
  data: {
    source: {
      accessor: null,
      name: null,
      formatter: null,
    },
    target: {
      accessor: null,
      name: null,
      formatter: null,
    },

    link: {
      accessor: null,
      name: null,
      formatter: null,
    },
  },
  color: DefaultCategoricalColor,
  plots: {
    innerRadiusRatio: 0.95,
    opacityDefault: 0.7, //default opacity of chords
    opacityLow: 0.02, //hover opacity of those chords not hovered over
    pullOutSize: 150, //How many pixels should the two halves be pulled apart
    fontSize: '16px',
    emptyPercent: 0.01, //What % of the circle should become empty
    chordPadding: 0.02,
  },
};

class StretchedChord extends AbstractChart {
  constructor(canvasId, _userOptions) {
    super(canvasId, _userOptions);

    this.outerRadius =
      Math.min(
        this._options.chart.innerWidth,
        this._options.chart.innerHeight
      ) / 2;
  }

  createOptions(_userOpt) {
    return mergeBase(DefaultOptions, _userOpt);
  }

  render(_data) {
    super.render(_data);

    let outerRadius =
      Math.min(
        this._options.chart.innerWidth,
        this._options.chart.innerHeight
      ) /
        2 -
      (this._isMobileSize ? 80 : 100);
    let innerRadius = outerRadius * this._options.plots.innerRadiusRatio;
    let opacityDefault = this._options.plots.opacityDefault;
    let opacityLow = this._options.plots.opacityLow;
    let pullOutSize = this._options.plots.pullOutSize;

    //////////////////////////////////////////////////////
    //////////////////// Titles on top ///////////////////
    //////////////////////////////////////////////////////
    let wrapper = this._svg
      .append('g')
      .attr('class', 'chordWrapper')
      .attr(
        'transform',
        'translate(' +
          this._options.chart.width / 2 +
          ',' +
          this._options.chart.height / 2 +
          ')'
      );

    let titleWrapper = this._svg.append('g').attr('class', 'title-rapper');
    let titleOffset = this._isMobileSize ? 15 : 40;
    let titleSeparate = this._isMobileSize ? 30 : 0;

    let width = this._options.chart.innerWidth;

    //Title	top left
    titleWrapper
      .append('text')
      .attr('class', 'title left')
      .style('font-size', this._options.plots.fontSize)
      .attr(
        'x',
        width / 2 +
          this._options.chart.margin.left -
          outerRadius -
          titleSeparate
      )
      .attr('y', titleOffset)
      .text(this._options.data.source.name);
    titleWrapper
      .append('line')
      .attr('class', 'titleLine left')
      .attr(
        'x1',
        (width / 2 +
          this._options.chart.margin.left -
          outerRadius -
          titleSeparate) *
          0.6
      )
      .attr(
        'x2',
        (width / 2 +
          this._options.chart.margin.left -
          outerRadius -
          titleSeparate) *
          1.4
      )
      .attr('y1', titleOffset + 8)
      .attr('y2', titleOffset + 8);
    //Title top right
    titleWrapper
      .append('text')
      .attr('class', 'title right')
      .style('font-size', this._options.plots.fontSize)
      .attr(
        'x',
        width / 2 +
          this._options.chart.margin.left +
          outerRadius +
          titleSeparate
      )
      .attr('y', titleOffset)
      .text(this._options.data.target.name);
    titleWrapper
      .append('line')
      .attr('class', 'titleLine right')
      .attr(
        'x1',
        (width / 2 +
          this._options.chart.margin.left -
          outerRadius -
          titleSeparate) *
          0.6 +
          2 * (outerRadius + titleSeparate)
      )
      .attr(
        'x2',
        (width / 2 +
          this._options.chart.margin.left -
          outerRadius -
          titleSeparate) *
          1.4 +
          2 * (outerRadius + titleSeparate)
      )
      .attr('y1', titleOffset + 8)
      .attr('y2', titleOffset + 8);

    ////////////////////////////////////////////////////////////
    /////////////////// Animated gradient //////////////////////
    ////////////////////////////////////////////////////////////

    let defs = wrapper.append('defs');
    let linearGradient = defs
      .append('linearGradient')
      .attr('id', 'animatedGradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '100%')
      .attr('y2', '0')
      .attr('spreadMethod', 'reflect');

    linearGradient
      .append('animate')
      .attr('attributeName', 'x1')
      .attr('values', '0%;100%')
      //	.attr("from","0%")
      //	.attr("to","100%")
      .attr('dur', '7s')
      .attr('repeatCount', 'indefinite');

    linearGradient
      .append('animate')
      .attr('attributeName', 'x2')
      .attr('values', '100%;200%')
      //	.attr("from","100%")
      //	.attr("to","200%")
      .attr('dur', '7s')
      .attr('repeatCount', 'indefinite');

    linearGradient
      .append('stop')
      .attr('offset', '5%')
      .attr('stop-color', '#E8E8E8');
    linearGradient
      .append('stop')
      .attr('offset', '45%')
      .attr('stop-color', '#A3A3A3');
    linearGradient
      .append('stop')
      .attr('offset', '55%')
      .attr('stop-color', '#A3A3A3');
    linearGradient
      .append('stop')
      .attr('offset', '95%')
      .attr('stop-color', '#E8E8E8');

    ////////////////////////////////////////////////////////////
    ////////////////////////// Data ////////////////////////////
    ////////////////////////////////////////////////////////////

    let chordData = transformMatrix(this._data, this._options);
    console.log(chordData);
    let Names = chordData.rowLabel;
    let matrix = chordData.matrix;

    //Calculate how far the Chord Diagram needs to be rotated clockwise to make the dummy
    //invisible chord center vertically
    let offset = chordData.offset;

    let startAngle = d => {
      return d.startAngle + offset;
    };
    let endAngle = d => {
      return d.endAngle + offset;
    };

    // Returns an event handler for fading a given chord group
    let fade = opacity => {
      return (d, i) => {
        wrapper
          .selectAll('path.chord')
          .filter(d => {
            return (
              d.source.index !== i &&
              d.target.index !== i &&
              Names[d.source.index] !== ''
            );
          })
          .transition('fadeOnArc')
          .style('opacity', opacity);
      };
    };

    // Fade function when hovering over chord
    let fadeOnChord = d => {
      let chosen = d;
      wrapper
        .selectAll('path.chord')
        .transition('fadeOnChord')
        .style('opacity', d => {
          return d.source.index === chosen.source.index &&
            d.target.index === chosen.target.index
            ? opacityDefault
            : opacityLow;
        });
    };

    //Custom sort function of the chords to keep them in the original order
    let _chordLayout = CustomChordLayout() //d3.chord()
      .padding(this._options.plots.chordPadding)
      .sortChords(descending) //which chord should be shown on top when chords cross. Now the biggest chord is at the bottom
      .matrix(matrix);

    let _arc = arc()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius)
      .startAngle(startAngle) //startAngle and endAngle now include the offset in degrees
      .endAngle(endAngle);

    let _chordPath = StretchedChordLayout() //Call the stretched chord function
      .radius(innerRadius)
      .startAngle(startAngle)
      .endAngle(endAngle)
      .pullOutSize(pullOutSize);

    ////////////////////////////////////////////////////////////
    //////////////////// Draw outer Arcs ///////////////////////
    ////////////////////////////////////////////////////////////

    let g = wrapper
      .selectAll('g.group')
      .data(_chordLayout.groups)
      .enter()
      .append('g')
      .attr('class', 'group')
      .on('mouseover', fade(opacityLow))
      .on('mouseout', fade(opacityDefault));

    g
      .append('path')
      .style('stroke', (d, i) => {
        return Names[i] === '' ? 'none' : '#00A1DE';
      })
      .style('fill', (d, i) => {
        return Names[i] === '' ? 'none' : '#00A1DE';
      })
      .style('pointer-events', (d, i) => {
        return Names[i] === '' ? 'none' : 'auto';
      })
      .attr('d', _arc)
      .attr('transform', (d, i) => {
        //Pull the two slices apart
        d.pullOutSize = pullOutSize * (d.startAngle + 0.001 > Math.PI ? -1 : 1);
        return 'translate(' + d.pullOutSize + ',' + 0 + ')';
      });

    ////////////////////////////////////////////////////////////
    ////////////////////// Append Names ////////////////////////
    ////////////////////////////////////////////////////////////

    //The text also needs to be displaced in the horizontal directions
    //And also rotated with the offset in the clockwise direction
    g
      .append('text')
      .each(d => {
        d.angle = (d.startAngle + d.endAngle) / 2 + offset;
      })
      .attr('dy', '.35em')
      .attr('class', 'titles')
      .style('font-size', this._isMobileSize ? '8px' : '10px')
      .attr('text-anchor', d => {
        return d.angle > Math.PI ? 'end' : null;
      })
      .attr('transform', (d, i) => {
        let c = _arc.centroid(d);
        return (
          'translate(' +
          (c[0] + d.pullOutSize) +
          ',' +
          c[1] +
          ')' +
          'rotate(' +
          (d.angle * 180 / Math.PI - 90) +
          ')' +
          'translate(' +
          20 +
          ',0)' +
          (d.angle > Math.PI ? 'rotate(180)' : '')
        );
      })
      .text((d, i) => {
        return Names[i];
      })
      .call(wrapSVGText, 100);

    ////////////////////////////////////////////////////////////
    //////////////////// Draw inner chords /////////////////////
    ////////////////////////////////////////////////////////////

    wrapper
      .selectAll('path.chord')
      .data(_chordLayout.chords)
      .enter()
      .append('path')
      .attr('class', 'chord')
      .style('stroke', 'none')
      //.style("fill", "#C4C4C4")
      .style('fill', 'url(#animatedGradient)') //An SVG Gradient to give the impression of a flow from left to right
      .style('opacity', d => {
        return Names[d.source.index] === '' ? 0 : opacityDefault;
      }) //Make the dummy strokes have a zero opacity (invisible)
      .style('pointer-events', (d, i) => {
        return Names[d.source.index] === '' ? 'none' : 'auto';
      }) //Remove pointer events from dummy strokes
      .attr('d', _chordPath)
      .on('mouseover', fadeOnChord)
      .on('mouseout', fade(opacityDefault));
  }
}

export default StretchedChord;
