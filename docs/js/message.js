function createMessager(el) {
  return function(msg) {
    var newMsgEl = document.createElement("p");
    newMsgEl.innerHTML = msg;
    el.appendChild(newMsgEl);
  };
}
