function timing(fn, ...args) {
  var start = performance.now();
  fn.apply(null, args);
  var time = performance.now() - start;
  return time;
}
