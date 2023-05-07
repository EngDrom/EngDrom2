
class FileTree extends Component {
    constructor (parent, click_action) {
        super(parent);

        this.element = createElement("div", {}, "", []);
        this.click_action = click_action;

        fetch('/api/fs/tree/').then((body) => body.json().then((json) => {
            this.config = json
            
            this.config.sort(this.compare_config)
            for (let conf of this.config)
                this.traverse_config(conf);
            this._first_render();
            this.render(false);
        }))
    }
    compare_config (a, b) {
        if (a.type == b.type) return (a.name < b.name) ? -1 : 1;
        return (a.type < b.type) ? 1 : -1;
    }

    onclick (event, node) {
        let path = node.config.text;
        let sn   = node;
        node = node.parent;

        while (!node.is_tree_root) {
            path = node.config.text + "/" + path;
            node = node.parent;
        }

        if (this.click_action)
            this.click_action(event, sn, path);
    }
    traverse_config (cur_conf=undefined) {
        if (cur_conf === undefined) cur_conf = this.config;

        cur_conf.text = cur_conf.name;

        if (cur_conf.type != "folder") {
            cur_conf.action = (...h) => this.onclick(...h);

            return ;
        }

        cur_conf.files.sort(this.compare_config)
        for (let file of cur_conf.files)
            this.traverse_config(file)
    }

    _first_render () {
        this.element = createElement("div", {}, "", [ new MTree(this, this.config).render() ]);
    }
    _render () {
        return this.element;
    }
}
