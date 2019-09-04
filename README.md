# round-slider

A round slider webcomponent


## Properties


- `value` - Required for single slider
- `low` - Required for high/low slider
- `high` - Required for high/low slider

- `min` - Lower limit of values
- `max` - Higher limit of values
- `step` - Step size of slider

- `radius` - Outer radius of slider (including handle) in pixels (default: 80)
- `startAngle` - Angle in degrees at which slider bar starts (default: 135)
- `arcLength` - Length in degrees of slider bar (default: 270)

- `handleSize` - Radius of handle in pixels (default: 6)
- `disabled` - Boolean property disabling the slider (default: false)


## Events

The slider dispatches two events

- `value-changing` when the value is changed but the mouse button is still pressed
- `value-changed` on release of mouse button

Both events pass an object as `detail` with either `value`, `low`, or `high` set to the new value depending on which slider was pulled.

## CSS styles

The following css variables can be used to change the styles:

- `--round-slider-path-color` - color of bar path
- `--round-slider-bar-color` - color of bar
- `--round-slider-handle-color` - color of handles
- `--round-slider-low-handle-color` - color of low handle (overrides `--round-slider-handle-color`)
- `--round-slider-high-handle-color` - color of high handle (overrides `--round-slider-handle-color`)
- `--round-slider-path-width` - bar width in pixels (default: 3)
- `--round-slider-linecap` - svg linecaps of bar (default: `round`)