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
import { chord } from 'vizart-path';

const chart = chord(_domId, _opt)....
```

## Three steps to use a chart
1. initialize a chart with domId and declarative options
```
const opt = {
  ...
};
const chart = chord('#chart', opt)
```
You only need to provide essential options. [Demo](https://vizartjs.github.io/demo.html) is a good place to check essential options for all charts. You may check up Documentation of each component for full option spec so as to control more chart behaviours.

2. Render a chart with data
```
chart.render(data) // this should be called only once
```
3. Change a chart on the fly (with options in a minimum)
```
// copy and update full options
const opt = chart.options();
opt.plots.opacityArea = o.4

// or in minimum
const opt = { plots: {opacityArea: 0.2 }};

// update options and redraw chart
chart.options(opt);
chart.update();

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
* [Chord](https://github.com/VizArtJS/vizart-path/wiki/chord)
* [Sankey](https://github.com/VizArtJS/vizart-path/wiki/sankey)
* [Parallel Coordinates](https://github.com/VizArtJS/vizart-path/wiki/parallel-coordinates)
* [Bi Partite](https://github.com/VizArtJS/vizart-path/wiki/bi-partite)
* [Stretched Chord](https://github.com/VizArtJS/vizart-path/wiki/stretched-chord)

## Credits
My works is based on other people's awesome visualizations:
* Bi Partites is based on [Pasha's BiPartite viz](http://bl.ocks.org/NPashaP/cd80ab54c52f80c4d84cad0ba9da72c2)
* Stretched Chord is based on [Nadieh Bremer's Stretched Chord](https://www.visualcinnamon.com/2015/08/stretched-chord.html)
* Parallel Coordinates is based on [syntagmatic's Parallel Coordinates](https://github.com/syntagmatic/parallel-coordinates)


## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details
