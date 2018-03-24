const edgePolygon = (bb, d) =>
  [0, d.y1, bb, d.y2, bb, d.y2 + d.h2, 0, d.y1 + d.h1].join(' ');

export default edgePolygon;
