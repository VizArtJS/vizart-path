# vizart-path

* [Demo](https://vizartjs.github.io/demo.html) quick reference with source code
* [Documentation](https://github.com/VizArtJS/vizart-path/wiki)



## Usage:

1. Install

```
npm install vizart-path --save
```

2. ES6 Usage

```
import 'vizart-path/dist/vizart-path.css';
import { Chord } from 'vizart-path';

const _chord = new Chord(_domId, _opt)....
```

## Three steps to use a chart
1. initialize a chart with domId and declarative options
```
let _opt = {
  ...
};
const _chart = new Chord('#chart', _opt)
```
You only need to provide essential options. [Demo](https://vizartjs.github.io/demo.html) is a good place to check essential options for all charts. You may check up Documentation of each component for full option spec so as to control more chart behaviours.

2. Render a chart with data
```
_chart.render(data) // this should be called only once
```
3. Change a chart on the fly
```
let _opt = _chart.options();
_opt.plots.opacityArea = o.4
_chart.options(_opt);

_chart.update();
```



## Development
1. Clone repository
2. Run commands
```
npm install         // install dependencies
npm run dev         // view demos in web browser at localhost:3005
npm run build       // build
npm run test        // run tests only
npm run test:cover  // run tests and view coverage report
```

## API
* [Chord](#chord)
* [Strentched Chord](#strentched-chord)
* [Parallel Coordinates](#parallel-coordinates)
* [Sankey](#sankey)
* [Bi-Partite](#bi-partite)

### Chord
[<img alt="Chord" src="https://github.com/vizartjs/vizartjs.github.io/blob/master/img/charts/chord.jpg">](https://vizartjs.github.io/chord.html)
```javascript
import { Chord } from 'vizart-path';
import 'vizart-path/dist/vizart-path.css';

const options = {
	chart: {
		margin: { left: 30, right: 30, top: 10, bottom: 30 }
	},
 data: {
		source: { accessor: 'importer1', },
		target: { accessor: 'importer2', },
		links: [
			{ accessor: 'flow1', },
			{ accessor: 'flow2', },
		]
	}
};

const _data = [
	{ importer1: 'U.S.', importer2: 'China', flow1: 132, flow2: 32 }
]

const _chart = new Chord('#chart', options);
_chart.render(_data);
```
Options spec
```
{
    chart: {
        type: 'chord',
        margin: NoMargin
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
}
```

### Strentched Chord
[<img alt="Strentched Chord" src="https://github.com/vizartjs/vizartjs.github.io/blob/master/img/charts/stretched_chord.jpg">](https://vizartjs.github.io/stretched_chord.html)
```javascript
import { StrentchedChord } from 'vizart-path';
import 'vizart-path/dist/vizart-path.css';

const options = {
	chart: {
		margin: { left: 30, right: 30, top: 10, bottom: 30 }
	},
	data: {
		source: { name: 'Color', accessor: 'color' },
		target: { name: 'Clarity', accessor: 'clarity' },
		link: {name: 'Price', accessor: 'price'}
	},
	plots: {
		emptyPercent: 0.001,
		chordPadding: 0.0002
	}
};

const _data = ...
const _chart = new StrentchedChord('#chart', options);
_chart.render(_data);
```
Options sepc
```
 {
    chart: {
        type: 'stretched-chord',
    },
    data:{
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

        link: {
            accessor: null,
            name: null,
            formatter: null
        }
    },
    color: DefaultCategoricalColor,
    plots: {
        innerRadiusRatio: 0.95,
        opacityDefault: 0.7, //default opacity of chords
        opacityLow: 0.02, //hover opacity of those chords not hovered over
        pullOutSize: 150, //How many pixels should the two halves be pulled apart
        fontSize: '16px',
        emptyPercent: 0.01, //What % of the circle should become empty
        chordPadding: 0.02
    },
}
```

### Parallel Coordinates
[<img alt="Parallel Coordinates" src="https://github.com/vizartjs/vizartjs.github.io/blob/master/img/charts/parallel_coordinates.jpg">](https://vizartjs.github.io/parcoords.html)
```javascript
import { ParallelCoordinate } from 'vizart-path';
import 'vizart-path/dist/vizart-path.css';

const options = {
	chart: {
		margin: { left: 30, right: 30, top: 10, bottom: 30 }
	},
	plots: {
		hideAxis: ['name'],
	}
};

const _data = ...
const _chart = new ParallelCoordinate('#chart', options);
_chart.render(_data);
```
Options spec
```
{
    chart: {
        type: 'parallel_coordinates',
        margin: NoMargin
    },
    color: DefaultCategoricalColor,
    plots: {
        hideAxis:[],
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
}
```


### Sankey
[<img alt="Sankey" src="https://github.com/vizartjs/vizartjs.github.io/blob/master/img/charts/sankey.jpg">](https://vizartjs.github.io/sankey.html)
```javascript
import { Sankey } from 'vizart-path';
import 'vizart-path/dist/vizart-path.css';

const options = {
	chart: {
		margin: { left: 30, right: 30, top: 10, bottom: 30 }
	},
};

const _data = ...
const _chart = new Sankey('#chart', options);
_chart.render(_data);
```

Options spec
```
{
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
}
```


### Bi-Partite
[<img alt="Bi Partite" src="https://github.com/vizartjs/vizartjs.github.io/blob/master/img/charts/partite.jpg">](https://vizartjs.github.io/partite.html)
```javascript
import { BiPartite } from 'vizart-path';
import 'vizart-path/dist/vizart-path.css';

const options = {
	data: {
		source: {
			name: 'product',
			type: 'string',
			accessor: 'product'
		},

		target: {
			name: 'customer',
			type: 'string',
			accessor: 'customer'
		},

		links: [
			{
				name: 'volume',
				type: 'number',
				accessor: 'volume'
			},
			{
				name: 'profit',
				type: 'number',
				accessor: 'profit'
			}
		],
	},
};

const _data = ...
const _chart = new BiPartite('#chart', options);
_chart.render(_data);
```

Options spec
```
{
    chart: {
        type: 'biPartite',
        margin: NoMargin,
    },
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
}
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details
