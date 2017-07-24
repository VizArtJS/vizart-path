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
* [Sequential Sunburst](#sequential-sunburst)
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


### Parallel Coordinates
[<img alt="Parallel Coordinates" src="https://github.com/vizartjs/vizartjs.github.io/blob/master/img/charts/parcoords.jpg">](https://vizartjs.github.io/parcoords.html)
```javascript
import { ParallelCoordinate } from 'vizart-path';
import 'vizart-path/dist/vizart-path.css';

const options = {
	chart: {
		margin: { left: 30, right: 30, top: 10, bottom: 30 }
	},
	plots: {
		hiddenAxis: ['name'],
	}
};

const _data = ...
const _chart = new ParallelCoordinate('#chart', options);
_chart.render(_data);
```


### Sequential Sunburst
[<img alt="Sequential Sunburst" src="https://github.com/vizartjs/vizartjs.github.io/blob/master/img/charts/sequential_sunburst.jpg">](https://vizartjs.github.io/sequential_sunburst.html)
```javascript
import { SequentialSunburst } from 'vizart-hierarchy';
import 'vizart-hierarchy/dist/vizart-hierarchy.css';

d3.text("./data/visit-sequences.csv", (text)=> {
	let csv = d3.csvParseRows(text);
	let json = VizArtHierarchy.buildHierarchy(csv);

	let sunburst = SequentialSunburst('#chart', {
		chart: {
			margin: {
				top: 40,
				bottom: 40,
				left: 0,
				right: 0
			},
		},
	},{
		sequence: '#sequence',
		explanation: '#explanation',
		percentage: '#percentage'
	});

	sunburst.render(json);
	sunburst.drawLegend('#legend')
});
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



## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details
