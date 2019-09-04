import {
  LitElement,
  html,
  css,
  svg,
  property,
} from "lit-element";

class RoundSlider extends LitElement {

  @property({type: Number}) value;
  @property({type: Number}) high;
  @property({type: Number}) low;

  @property({type: Number}) min = 0;
  @property({type: Number}) max = 100;
  @property({type: Number}) step = 1;

  @property({type: Number}) radius = 80;
  @property({type: Number}) startAngle = 135;
  @property({type: Number}) arcLength = 270;

  @property({type: Number}) handleSize = 6;
  @property({type: Boolean}) disabled = false;

  @property({type: Boolean}) _dragging = false;

  constructor() {
    super();
    document.addEventListener('mouseup', this.dragEnd.bind(this));
    document.addEventListener('touchend', this.dragEnd.bind(this), {passive: false});
    document.addEventListener('mousemove', this.drag.bind(this));
    document.addEventListener('touchmove', this.drag.bind(this), {passive: false});
  }

  get _r0() {
    return this.radius;
  }
  get _rArc() {
    return this._r0 - this.handleSize*1.5;
  }
  get _start() {
    return this.startAngle*Math.PI/180;
  }
  get _len() {
    return Math.min(this.arcLength*Math.PI/180, 2*Math.PI-0.01);
  }
  get _end() {
    return this._start+this._len;
  }

  _getBoundaries() {
    const margin = this.handleSize * 1.5;

    const angleInside = (angle) => {
      let a = (this.startAngle + this.arcLength/2-angle+180+360) % 360 - 180;
      return (a < this.arcLength/2 && a > -this.arcLength/2);
    }

    let up = this._r0;
    if(!angleInside(270))
      up =  Math.max(
        -this._rArc*Math.sin(this._start) + margin,
        -this._rArc*Math.sin(this._end) + margin
      );

    let down = this._r0;
    if(!angleInside(90))
      down = Math.max(
        this._rArc*Math.sin(this._start) + margin,
        this._rArc*Math.sin(this._end) + margin
      );
    th

    let left = this._r0;
    if(!angleInside(180))
      left = Math.max(
        -this._rArc*Math.cos(this._start) + margin,
        -this._rArc*Math.cos(this._end) + margin
      );

    let right = this._r0;
    if(!angleInside(0))
      right = Math.max(
        this._rArc*Math.cos(this._start) + margin,
        this._rArc*Math.cos(this._end) + margin
      );

    return {
      up, down, left, right,
      width: left+right,
      height: up+down,
    }
  }

  dragStart(ev) {
    if(ev.target.classList.contains("handle")) {
      let handle = ev.target;
      if(handle.classList.contains("overflow"))
        handle = handle.nextElementSibling
      handle.setAttribute('r', this.handleSize*1.5);
      const min = handle.id === "high" ? this.low : this.min;
      const max = handle.id === "low" ? this.high : this.max;
      this._rotation = { handle, min, max }
    }
  }

  dragEnd(ev) {
    if(this._rotation) {
      const handle = this._rotation.handle;
      handle.setAttribute('r', this.handleSize);
      let event = new CustomEvent('value-changed', {
        detail: {
          [handle.id] : this[handle.id],
        }
      });
      this._rotation = false;
      this.dispatchEvent(event);
    }
  }

  drag(ev) {
    if(!this._rotation) return;

    ev.preventDefault();

    const mouseX = (ev.type === "touchmove") ? ev.touches[0].clientX : ev.clientX;
    const mouseY = (ev.type === "touchmove") ? ev.touches[0].clientY : ev.clientY;

    const rect = this.shadowRoot.querySelector("svg").getBoundingClientRect();
    const boundaries = this._getBoundaries();
    const x = mouseX - (rect.x + boundaries.left);
    const y = mouseY - (rect.y + boundaries.up);

    const angle = (Math.atan2(y,x) - this._start + 2*Math.PI) % (2*Math.PI);

    const pos = Math.round((angle/this._len*(this.max-this.min)+this.min)/this.step)*this.step;
    if(pos < this._rotation.min || pos > this._rotation.max) return;

    const handle = this._rotation.handle;
    this[handle.id] = pos;

    let event = new CustomEvent('value-changing', {
      detail: {
        [handle.id] : pos,
      }
    });
    this.dispatchEvent(event);
  }


  render() {

    if(!this.value && !this.high && !this.low)
      this.disabled = true;
    var up, left, width, height;
    ({up, left, width, height} = this._getBoundaries());

    const arc = (start, end) => {
      const r = this._rArc;
      return `
      M ${this._r0 + r*Math.cos(start)} ${this._r0 + r*Math.sin(start)}
      A ${r} ${r},
        0,
        ${(end-start) > Math.PI ? "1" : "0"} 1,
        ${this._r0+r*Math.cos(end)} ${this._r0+r*Math.sin(end)}
    `;
    }

    const valueFrac = (val) => {
      return (this[val]-this.min)/(this.max-this.min);
    }

    const handle = (id) => {
      const theta = this._start + valueFrac(id)*this._len;
      return svg`
        <circle
          id=${id}
          class="handle ${id} overflow"
          cx=${ this._r0 + this._rArc*Math.cos(theta) }
          cy=${ this._r0 + this._rArc*Math.sin(theta) }
          r=${2*this.handleSize}
          style="fill: rgba(0,0,0,0);"
        ></circle>
        <circle
          id=${id}
          class="handle ${id}"
          cx=${ this._r0 + this._rArc*Math.cos(theta) }
          cy=${ this._r0 + this._rArc*Math.sin(theta) }
          r=${this.handleSize}
        ></circle>
      `
    };

    return html`
    <div
      @mousedown=${this.dragStart}
      @touchstart=${this.dragStart}
      class="round-slider"
      style="
         height: ${height}px;
         width: ${width}px;
       "
    >
      <svg
        xmln="http://www.w3.org/2000/svg"
        viewBox="${this._r0-left} ${this._r0-up} ${width} ${height}"
      >
        <g class="slider">
          <path
            class="path"
            d=${arc(this._start, this._end)}
          />
          ${ this.disabled
            ? ''
            : svg`
          <path
            class="bar"
            d=${arc(
              this._start+this._len*(this.low !== undefined
                ? valueFrac("low")
                : 0
              ),
              this._start+this._len*((this.high !== undefined)
                ? valueFrac("high")
                : valueFrac("value")
              )
            )}
          />
          `}
        </g>

        ${ this.disabled
          ? ''
          : svg`
          <g class="handles">
          ${ this.low !== undefined
            ? this.low >= (0.99*this.max)
              ? html`${handle("high")} ${handle("low")}`
              : html`${handle("low")} ${handle("high")}`
            : html`${handle("value")}`
          }
          </g>
          `}
      </svg>
    </div>
    `;
  }

  static get styles() {
    return css`
      div {
        display: inline-block;
      }
      .slider {
        fill: none;
        stroke-width: var(--round-slider-path-width, 3);
        stroke-linecap: var(--round-slider-linecap, round);
      }
      .path {
        stroke: var(--round-slider-path-color, lightgray);
      }
      .bar {
        stroke: var(--round-slider-bar-color, lightblue);
      }
      .handles {
        fill: var(--round-slider-handle-color, var(--round-slider-bar-color, lightblue));
      }
      .handles .low {
        fill: var(--round-slider-low-handle-color);
      }
      .handles .high {
        fill: var(--round-slider-high-handle-color);
      }
    `;
  }

}

customElements.define('round-slider', RoundSlider);