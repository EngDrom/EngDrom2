
function isNumeric(str) {
    return !isNaN(str) &&
           !isNaN(parseFloat(str))
}

class Vec3Input extends Component {
    constructor (parent, callback, dx = 0, dy = 0, dz = 0) {
        super(parent);

        this._first_render();
        this.dx = dx;
        this.dy = dy;
        this.dz = dz;

        this.callback = callback
    }

    getValue (input, def) {
        if (isNumeric(input.value)) return parseFloat(input.value);
        return def;
    }
    send () {
        let x = this.getValue(this.x_input, this.dx);
        let y = this.getValue(this.y_input, this.dy);
        let z = this.getValue(this.z_input, this.dz);
    
        this.callback(x, y, z);
    }

    onkey () {
        this.send();
    }
    onchange () {
        this.reset(this.x_input, this.dx);
        this.reset(this.y_input, this.dy);
        this.reset(this.z_input, this.dz);

        this.send();
    }
    setValue (x, y, z) {
        this.x_input.value = x;
        this.y_input.value = y;
        this.z_input.value = z;

        this.check(this.x_input, x);
        this.check(this.y_input, y);
        this.check(this.z_input, z);
    }
    check (input, value) {
        if (value === undefined) input.setAttribute("disabled", "true");
        else if (input.hasAttribute("disabled"))
            input.removeAttribute("disabled");
    }
    make_input () {
        let input = createElement("input", {}, "bg-Vwebdrom-background text-Vwebdrom-editor-text p-2 rounded-8", []);
        input.setAttribute("type", "number");
        input.setAttribute("disabled", "true");

        input.addEventListener("keyup",  () => this.onkey())
        input.addEventListener("change", () => this.onchange())

        return input;
    }
    reset (input, def) {
        if (isNumeric(input.value)) return ;
        input.value = def.toString();
    }
    _first_render () {
        this.x_input = this.make_input();
        this.y_input = this.make_input();
        this.z_input = this.make_input();

        this.element = createElement("div", {}, "flex p-2 gap-4", [
            this.x_input, this.y_input, this.z_input
        ]);
    }
    _render () {
        return this.element;
    }
}
class VecNInput extends Component {
    constructor (parent, callback, values) {
        super(parent);

        this.dimension = values.length;

        this.default_values = values;
        this._first_render();

        this.callback = callback
    }

    getValue (input, def) {
        if (isNumeric(input.value)) return parseFloat(input.value);
        return def;
    }
    send () {
        let res = [];
        for (let idx = 0; idx < this.dimension; idx ++)
            res.push( this.getValue(this.inputs[idx], this.default_values[idx]) )
    
        this.callback(...res);
    }

    onkey () {
        this.send();
    }
    onchange () {
        for (let idx = 0; idx < this.dimension; idx ++)
            this.reset(this.inputs[idx], this.default_values[idx])

        this.send();
    }
    setValue (...res) {
        for (let idx = 0; idx < this.dimension; idx ++) {
            this.inputs[idx].value = res[idx];
            this.check(this.inputs[idx], res[idx]);
        }
    }
    check (input, value) {
        if (value === undefined) input.setAttribute("disabled", "true");
        else if (input.hasAttribute("disabled"))
            input.removeAttribute("disabled");
    }
    make_input () {
        let input = createElement("input", {}, "bg-Vwebdrom-background text-Vwebdrom-editor-text p-2 rounded-8", []);
        input.setAttribute("type", "number");
        input.setAttribute("disabled", "true");

        input.addEventListener("keyup",  () => this.onkey())
        input.addEventListener("change", () => this.onchange())

        return input;
    }
    reset (input, def) {
        if (isNumeric(input.value)) return ;
        input.value = def.toString();
    }
    _first_render () {
        this.inputs = [];
        for (let idx = 0; idx < this.dimension; idx ++)
            this.inputs.push(this.make_input());

        this.element = createElement("div", {}, "flex p-2 gap-4", [
            ...this.inputs
        ]);
    }
    _render () {
        return this.element;
    }
}
