import "../scss/downfall.scss";


export interface DownfallOptions {
  columns: number,
  gap: string,
  debounce?: number,
}

export interface DownfallColumn {
  threshold: number,
  node: HTMLDivElement,
}

export type DownfallElement = HTMLDivElement | HTMLImageElement;

// NOTE: or image url or data and template to set
export type DownfallTemplateData = { data: { [key: string]: any}, template: HTMLTemplateElement }
export type DownfallSource = string | DownfallTemplateData;

export class Downfall {

  defaultOptions: DownfallOptions = {
    columns: 3,
    gap: "1rem",
  }

  parent: HTMLElement;

  options: DownfallOptions;

  KLASS = "downfall";

  SHOWN_KLASS = "shown";

  columns: Array<DownfallColumn> = [];

  elements: Array<DownfallElement>;

  constructor(parent: HTMLElement, options: DownfallOptions) {
    this.parent = parent;
    this.options = {
      ...this.defaultOptions,
      ...options,
    }
    this.init();
  }

  init() {
    this.parent.classList.add(this.KLASS);
    this.columns = new Array(this.options.columns).fill(0).map(this._createColumn.bind(this))
    this.parent.style.display = "grid";
    this.parent.style.gridTemplateColumns = this.columns.map(_ => "1fr").join(` `);
    this.parent.style.gap = this.options.gap;
  }

  async add(_sources: DownfallSource[]) {
    const sources = _sources.slice();
    const toAdd = sources.shift();
    const currentColumn = this.columns.reduce((prev, next, i) => {
      return prev.threshold <= next.threshold ? prev : next;
    });

    if (typeof toAdd === "string") {
      await this._createImage(toAdd).then((image) => {
        currentColumn.node.appendChild(image);
        currentColumn.threshold += image.offsetHeight;
        // TODO: trigger opacity transition after element creation  
        // window.getComputedStyle(image).opacity;
        image.classList.add(this.SHOWN_KLASS);
      });
    } else {
      const fragment = this._createFragment(toAdd);
      const element = fragment.firstElementChild as HTMLElement;

      currentColumn.node.appendChild(fragment);

      await this._waitForImages(element).then(_ => {
        currentColumn.threshold += element.offsetHeight;
        element.classList.add(this.SHOWN_KLASS);
      });

    }


    if (sources.length) this.add(sources);
  }

  _createColumn(): DownfallColumn {
    const node = document.createElement("div");
    node.classList.add(this.KLASS + "__column");
    this.parent.appendChild(node);
    return {
      threshold: 0,
      node,
    }
  }

  _createImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.style.marginBottom = this.options.gap;
      img.style.width = "100%";

      // if (img.complete) resolve(img);
      img.onload = () => {
        resolve(img);
      };
      img.onerror = (error) => {
        reject(error)
      }
      img.src = src;
    });
  }

  _createFragment(templateData: DownfallTemplateData): DocumentFragment {
    const { data, template } = templateData;
    const clone = template.content.cloneNode(true) as DocumentFragment;

    Object.keys(data).forEach(key => {
      const targets = clone.querySelectorAll(`[data-template-${key}]`);
      Array.from(targets).forEach(t => {
        if (typeof data[key] === "string") {
          t.textContent = data[key];
        } else if (typeof data[key] === 'object' && !Array.isArray(data[key]) && data[key] !== null) {
          Object.keys(data[key]).forEach(attr => {
            t.setAttribute(attr, data[key][attr]);
          });
        }
      });
    });

    return clone;
  }

  _waitForImages(node: HTMLElement): Promise<HTMLImageElement[]> {
    const images = Array.from(node.querySelectorAll("img"));
    const promises: Promise<HTMLImageElement>[] = images.map(img => new Promise((resolve, reject) => {
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Image load was broken"));
    }));
    return Promise.all(promises);
  }

  _waitForImage() {

  }


}