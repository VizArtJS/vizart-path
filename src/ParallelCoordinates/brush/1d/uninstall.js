const uninstall = (state, pc) => ()=> {
  if (pc.g() !== undefined && pc.g() !== null)
    pc
      .g()
      .selectAll('.brush')
      .remove();

  state.brushes = {};
  delete pc.brushExtents;
  delete pc.brushReset;
};

export default uninstall;
