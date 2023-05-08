

class FillableComponent extends Component {
    constructor (parent) {
        super(parent);

        this.element = createElement("div", {}, "", [])
    }

    fill (element) {
        for (let child of this.element.childNodes)
            this.element.removeChild(child);
        
        if (element)
            this.element.appendChild(element);
    }

    _render () {
        return this.element;
    }
}

