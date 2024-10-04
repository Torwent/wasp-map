import "../leaflet.js";

(function (factory) {
  var L;
  if (typeof define === "function" && define.amd) {
    define(["leaflet"], factory);
  } else if (typeof module !== "undefined") {
    L = require("leaflet");
    module.exports = factory(L);
  } else {
    if (typeof window.L === "undefined") {
      throw new Error("Leaflet must be loaded first");
    }
    factory(window.L);
  }
})(function (L) {
  L.Map.addInitHook(function () {
    this.on("dblclick", (e) => {
      if (e.originalEvent.ctrlKey) {
        let plane = this.getPlane();
        let x = Math.floor(e.latlng.lng) * 4 - 4096;
        let y = 60 - (Math.floor(e.latlng.lat) * 4 - 50370);
        let copystr = `[${x},${y}], ${plane}`;
        navigator.clipboard.writeText(copystr).then(
          () => this.addMessage(`Copied to clipboard: ${copystr}`),
          () => console.error("Cannot copy text to clipboard")
        );
      }
    });
  });
});
