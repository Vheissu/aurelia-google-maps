define(['exports', './aurelia-google-maps'], function (exports, _aureliaGoogleMaps) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.keys(_aureliaGoogleMaps).forEach(function (key) {
    if (key === "default") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _aureliaGoogleMaps[key];
      }
    });
  });
});