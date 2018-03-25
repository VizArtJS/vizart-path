// side effects for setters
import { keys } from 'd3-collection';
import { dispatch } from 'd3-dispatch';
import computeClusterCentroids from '../util/computeClusterCentroids';
import flipAxisAndUpdatePCP from '../util/flipAxisAndUpdatePCP';

const without = (arr, items) => {
  items.forEach(el => {
    delete arr[el];
  });
  return arr;
};

const sideEffects = (
  config,
  ctx,
  pc,
  xscale,
  flags,
  brushedQueue,
  foregroundQueue
) =>
  dispatch
    .apply(this, keys(config))
    .on('composite', d => {
      ctx.foreground.globalCompositeOperation = d.value;
      ctx.brushed.globalCompositeOperation = d.value;
    })
    .on('alpha', d => {
      ctx.foreground.globalAlpha = d.value;
      ctx.brushed.globalAlpha = d.value;
    })
    .on('brushedColor', d => {
      ctx.brushed.strokeStyle = d.value;
    })
    .on('width', d => pc.resize())
    .on('height', d => pc.resize())
    .on('margin', d => pc.resize())
    .on('rate', d => {
      brushedQueue.rate(d.value);
      foregroundQueue.rate(d.value);
    })
    .on('dimensions', d => {
      config.dimensions = pc.applyDimensionDefaults(keys(d.value));
      xscale.domain(pc.getOrderedDimensionKeys());
      pc.sortDimensions();
      if (flags.interactive) {
        pc.render().updateAxes();
      }
    })
    .on('bundleDimension', d => {
      if (!keys(config.dimensions).length) pc.detectDimensions();
      pc.autoscale();
      if (typeof d.value === 'number') {
        if (d.value < keys(config.dimensions).length) {
          config.bundleDimension = config.dimensions[d.value];
        } else if (d.value < config.hideAxis.length) {
          config.bundleDimension = config.hideAxis[d.value];
        }
      } else {
        config.bundleDimension = d.value;
      }

      config.clusterCentroids = computeClusterCentroids(
        config,
        config.bundleDimension
      );
      if (flags.interactive) {
        pc.render();
      }
    })
    .on('hideAxis', d => {
      pc.dimensions(pc.applyDimensionDefaults());
      pc.dimensions(without(config.dimensions, d.value));
    })
    .on('flipAxes', d => {
      if (d.value && d.value.length) {
        d.value.forEach(function(axis) {
          flipAxisAndUpdatePCP(config, pc, axis);
        });
        pc.updateAxes(0);
      }
    });

export default sideEffects;
