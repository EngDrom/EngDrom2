

class WebEngine {
    constructor (parent, project) {
        this.canvas = new WebGLCanvas(parent, this);
        this.canvas._first_render();
        this.interval = setInterval( () => this.drawCallback(), 1000 / 60 );
        this.start_interval = (+ new Date());

        this.project = project;
    }
    drawCallback () {
        let end_interval = (+ new Date());
        //console.log("WEBDROM DRAW DELTA", end_interval - this.start_interval);
        let delta_interval  = end_interval - this.start_interval;
        this.start_interval = end_interval;

        //this.level .simulate(delta_interval); // simulate dt milliseconds
        this.canvas.drawCallback(delta_interval / 1000.0);

        // TODO run events
    }

    render_level_tree () {
        this.level_tree._make_component();
    }

    render () {
        return this.canvas.render();
    }
}

