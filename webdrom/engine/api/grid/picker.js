
class AtlasImage extends Component {
    constructor (parent, image, coordinates, id) {
        super(parent);

        this.image       = image;
        this.coordinates = coordinates;

        this.id = id;

        this.is_enabled = false;
        this._first_render();
    }

    onclick () {
        this.parent.enable(this.id);
    }
    _first_render () {
        const scale = 3.1;
        this.img_el = createElement("img", {}, "absolute", []);
        this.img_el.src = this.image.src;
        this.img_el.style.width  =   scale * this.image.width  + "px";
        this.img_el.style.height =   scale * this.image.height + "px";
        this.img_el.style.left   = (-scale * this.coordinates[0] + 0.1) + "px";
        this.img_el.style.top    = (-scale * this.coordinates[1] + 0.1) + "px";
        this.img_el.style.imageRendering = "pixelated";

        this.icon_el = createElement("div", {}, "border-Vwebdrom-editor-blue-contrast border-4 w-10 h-10 absolute", []);

        this.element = createElement("div", { onclick: () => this.onclick() }, "relative overflow-hidden", [this.img_el, this.icon_el]);
        this.element.style.width  = "48px";
        this.element.style.height = "48px";
        this.element.style.maxWidth  = "48px";
        this.element.style.maxHeight = "48px";

        this._update();
    }
    _update () {
        if (this.is_enabled) this.icon_el.style.display = "block";
        else this.icon_el.style.display = "none";
    }

    _render () {
        return this.element;
    }
}

class AtlasPicker extends Component {
    constructor (parent, atlas) {
        super(parent);
        if (atlas.picker) return atlas.picker;
        atlas.picker = this;

        this.element = createElement("div", {}, "p-4 flex flex-wrap", []);
        this.atlas   = atlas;

        atlas.wait().then(() => {
            this._make();
        })

        this.enabled_index = 0;
    }

    enable (id) {
        this.images[this.enabled_index].is_enabled = false;
        this.images[this.enabled_index]._update();

        this.enabled_index = id;

        this.images[this.enabled_index].is_enabled = true;
        this.images[this.enabled_index]._update();
    }
    _make () {
        this.images = [];
        for (let child of this.element.childNodes)
            this.element.removeChild(child);
        

        let index = 0;
        while (true) {
            let coords = this.atlas.rcoord(index);
            if (coords === undefined) break ;

            let image = new AtlasImage(this, this.atlas.image, coords, index);
            this.images.push(image);
            this.element.appendChild( image.render() );

            index ++;
        }

        this.enabled_index = 0;
        if (index !== 0)
            this.enable(0);
    }

    _render () {
        return this.element;
    }
}

