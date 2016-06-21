'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _aureliaGoogleMaps = require('./aurelia-google-maps');

Object.keys(_aureliaGoogleMaps).forEach(function (key) {
  if (key === "default") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _aureliaGoogleMaps[key];
    }
  });
});