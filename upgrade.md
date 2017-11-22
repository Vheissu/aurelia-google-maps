# Upgrade Docs from 2.x

## Replace usage of EventAggregator

There are no longer any usages of the EventAggregator in this plugin, as our users found issues when using these
events with multiple maps on the page.

Events are now dispatched onto the `<google-maps>` DOM node. You can add a callback to this event with:

```html
<google-maps
    ...
    marker-render.delegate="myCoolCallback()"
    >
```

These events are bubbling, so they can be caught at parent nodes instead. Check out [/src/events.ts](/src/events.ts) 
to see a full list of events available.

## DOM event name change

`marker-rendered` was changed to `marker-render` to develop consistency in the naming. Now all events are **present-tense**.