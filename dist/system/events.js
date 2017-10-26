System.register([], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var Events;
    return {
        setters: [],
        execute: function () {
            Events = (function () {
                function Events() {
                }
                Events.BOUNDSCHANGED = "bounds-change";
                Events.MAPCLICK = 'map-click';
                Events.MAPOVERLAYCOMPLETE = 'map-overlay-complete';
                Events.MARKERRENDERED = 'marker-render';
                Events.MARKERCLICK = 'marker-click';
                Events.MARKERMOUSEOVER = 'marker-mouse-over';
                Events.MARKERMOUSEOUT = 'marker-mouse-out';
                Events.POLYGONCLICK = 'polygon-click';
                Events.POLYGONRENDERED = 'polygon-render';
                Events.INFOWINDOWSHOW = 'info-window-show';
                Events.START_MARKER_HIGHLIGHT = 'start-marker-highlight';
                Events.STOP_MARKER_HIGHLIGHT = 'stop-marker-highlight';
                Events.PAN_TO_MARKER = 'pan-to-marker';
                Events.CLEAR_MARKERS = 'clear-markers';
                return Events;
            }());
            exports_1("Events", Events);
        }
    };
});
//# sourceMappingURL=events.js.map