import { Component, Prop, h, State, Watch, Element } from "@stencil/core";

//@ts-ignore
import worker from "worker#../../worker.js";

@Component({
  tag: "wc-typeme",
  styleUrl: "wc-typeme.css",
  shadow: true
})
export class TypeMe {
  FORWARD = 1;
  BACKSPACE = -1;
  LINEBREAK = 2;
  PAUSE = 3;
  END = 0;

  @Element() el: HTMLElement;

  @Prop() loop = false;
  @Prop({ attribute: "strings" }) strings;
  @Prop({ attribute: "children" }) childList = "";
  @Prop({ attribute: "className" }) mainClassName = "";
  @Prop() hideCursor = false;
  @Prop() typingSpeed = 240; // WPM
  @Prop() deleteSpeed = 800; // WPM
  @Prop() backspaceDelay = 500; // ms
  @Prop() startAnimation = true;
  @Prop() onAnimationEnd = () => {};
  @Prop() cursorCharacter = "|";
  @Prop() cursorBlinkSpeed = 800; // ms

  @State() containerCn = "tm";
  @State() cursorCn = "tm-cursor";

  @State() deleteChar = 0;
  @State() itemIndex = 0;
  @State() charIndex = 0;

  @State() typedString = "";
  @State() newTypedString = "";

  @State() typingInterval = (1000 * 60) / (this.typingSpeed * 5); // ms
  @State() deleteInterval = (1000 * 60) / (this.deleteSpeed * 5); // ms

  @State() nextItem: any;
  @State() elapsed = 0;

  @State() animationPaused = false;
  @State() animationEnded = false;

  @State() instanceId =
    Math.random()
      .toString(36)
      .substring(2, 5) +
    Math.random()
      .toString(36)
      .substring(2, 5);

  worker: Worker;

  connectedCallback() {
    this.setStyles();
    this.handleAnimation();
  }

  componentDidLoad() {
    const hasSlotText = this.handleSlotBaseText();
    if (hasSlotText) {
      this.handleAnimation();
    }
  }

  // The idea is to update the styles if the prop changes
  @Watch("cursorBlinkSpeed")
  cursorBlinkSpeedHandler() {
    this.setStyles();
  }

  @Watch("typedString")
  typedStringHandler() {
    this.handleAnimation();
    if (this.mainClassName) {
      this.containerCn = `${this.containerCn} ${this.mainClassName}`;
    }
    if (!this.startAnimation || this.animationEnded || this.animationPaused) {
      this.cursorCn = `${this.cursorCn} tm-blink`;
    }
  }

  setStyles() {
    this.el.style.setProperty(
      "--cursor-blink-speed",
      `${this.cursorBlinkSpeed}ms`,
      "!important"
    );
  }

  async handleAnimation() {
    if (this.startAnimation) {
      let items = [];

      if (this.strings && Array.isArray(this.strings)) {
        items = this.strings;
      }
      if (this.strings && typeof this.strings === "string") {
        const isStringifiedArray = string => {
          return string.charAt(0) === "[";
        };

        if (!isStringifiedArray(this.strings)) {
          items = [this.strings];
        } else {
          const parts = this.strings
            .substr(1, this.strings.length - 2)
            .split(",")
            .map(part => removeAllChar(part, "'"));

          function removeAllChar(string, char) {
            return string
              .split("")
              .filter(c => c != char)
              .join("");
          }

          items = [...parts];
        }
      }
      if (this.childList && typeof this.childList === "string") {
        items = [this.childList];
      }
      if (this.childList && Array.isArray(this.childList)) {
        items = this.childList;
      }

      const withWorker = false;

      let processedItems;

      if (withWorker) {
        if (!this.worker) {
          this.worker = new worker();
        }

        processedItems = await new Promise(resolve => {
          this.worker.postMessage({ action: "PROCESS_ITEM", payload: items });

          this.worker.onmessage = e => {
            const { payload } = e.data;
            resolve(payload);
          };
        });
      } else {
        processedItems = (() => {
          const lineBreak = "__LINEBREAK__";
          const deleteChars = "__DELETE__";
          const delay = "__DELAY__";
          return items.map(part => {
            if (part.trim() === lineBreak) {
              return { type: { displayName: "LineBreak" } };
            }
            if (part.trim().includes(deleteChars)) {
              const charsCount = part.trim().substring(10, part.trim().length);
              return {
                type: { displayName: "Delete" },
                props: { characters: Number(charsCount) }
              };
            }
            if (part.trim().includes(delay)) {
              const timing = part.trim().substring(9, part.trim().length) || 0;
              return {
                type: { displayName: "Delay" },
                props: { ms: Number(timing) }
              };
            }
            return part;
          });
        })();
      }

      this.nextItem = this.getNextItem(processedItems);
      let { direction } = this.nextItem;

      if (direction === this.END) {
        this.onAnimationEnd();
        if (this.loop) {
          this.charIndex = 0;
          this.itemIndex = 0;
          this.typedString = "";
          this.newTypedString = "";
        } else {
          this.animationEnded = true;
        }
      } else {
        if (direction === this.FORWARD) {
          // type next character
          let nts = `${this.newTypedString}${
            this.nextItem.string[this.charIndex]
          }`;
          this.newTypedString = nts;
          window.setTimeout(
            this.updateTypedString(this.typingInterval, nts),
            this.typingInterval
          );
          if (this.charIndex >= this.nextItem.string.length - 1) {
            this.charIndex = 0;
            this.itemIndex += 1;
          } else {
            this.charIndex += 1;
          }
        } else if (direction === this.LINEBREAK) {
          // break line
          let nts = `${this.newTypedString}•`;
          this.newTypedString = nts;
          window.setTimeout(
            this.updateTypedString(this.typingInterval, nts),
            this.typingInterval
          );
          this.itemIndex += 1;
          this.charIndex = 0;
        } else if (direction === this.BACKSPACE) {
          // delete previous character
          let nts = `${this.newTypedString.substring(
            0,
            this.newTypedString.length - 1
          )}`;

          this.newTypedString = nts;
          if (this.nextItem.chars === 1) {
            this.itemIndex += 1;
            this.charIndex = 0;
            this.deleteChar = 0;
          }
          if (this.nextItem.delay) {
            window.setTimeout(() => {
              window.setTimeout(
                this.updateTypedString(this.deleteInterval, nts),
                this.deleteInterval
              );
            }, this.backspaceDelay);
          } else {
            window.setTimeout(
              this.updateTypedString(this.deleteInterval, nts),
              this.deleteInterval
            );
          }
        } else if (direction === this.PAUSE) {
          // pause animation
          this.itemIndex += 1;
          this.charIndex = 0;
          window.setTimeout(() => {
            this.animationPaused = false;
            window.setTimeout(
              this.updateTypedString(this.typingInterval, this.newTypedString),
              this.typingInterval
            );
          }, this.nextItem.ms);
          this.animationPaused = true;
        }
      }
    }
  }

  handleSlotBaseText() {
    let hasSlotText = false;

    const slotData = this.el.textContent;
    if (slotData) {
      this.strings = [slotData];
      hasSlotText = true;
    }

    return hasSlotText;
  }

  getNextItem(items) {
    // * typing inferred by tooling, it can be changed
    let item: {
      type: { displayName: any };
      props: { characters: number; ms: any };
    };

    if (this.itemIndex >= items.length) {
      return {
        direction: this.END // animation ends
      };
    }
    item = items[this.itemIndex];
    if (typeof item === "string") {
      return {
        direction: this.FORWARD,
        string: item
      };
    }
    switch (item.type.displayName) {
      case "LineBreak":
        return {
          direction: this.LINEBREAK
        };

      case "Delete":
        let delay = false;
        let newDeleteChar = 0;
        if (this.deleteChar === 0) {
          if (item.props.characters === 0) {
            newDeleteChar = this.newTypedString.length;
          } else {
            newDeleteChar = item.props.characters;
          }
          this.deleteChar = newDeleteChar;
          delay = true;
        } else {
          newDeleteChar = this.deleteChar - 1;
          this.deleteChar = newDeleteChar;
        }
        return {
          delay,
          direction: this.BACKSPACE,
          chars: newDeleteChar
        };

      case "Delay":
        return {
          direction: this.PAUSE,
          ms: item.props.ms
        };

      default:
        throw "Error: Invalid item passed in `strings` props or as children.";
    }
  }

  updateTypedString(interval, nts) {
    return () => {
      let time = performance.now();
      if (this.elapsed === 0) {
        this.elapsed = time;
      }
      if (time >= this.elapsed + interval) {
        this.elapsed = time;
        const split = nts.split("•");
        this.typedString = split.map((str, index) => {
          return (
            <span key={`${this.instanceId}-${index}`}>
              {str}
              {split.length - index > 1 ? <br /> : null}
            </span>
          );
        });
      } else {
        // recursive call after delay
        // ? should there be a reference to the timeout so that we can cancel it?
        window.setTimeout(this.updateTypedString(interval, nts), interval);
      }
    };
  }

  render() {
    return [
      <span id="slot-container">
        <slot />
      </span>,
      <span class={this.containerCn}>
        {this.typedString}
        <span key={`${this.instanceId}-cur`} class={this.cursorCn}>
          {this.animationEnded && this.hideCursor ? "" : this.cursorCharacter}
        </span>
      </span>
    ];
  }
}
