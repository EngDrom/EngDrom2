
class GridEngineMode extends EditEngineMode {
    constructor (engine) {
        super(engine);

        this.editor = new GridEditor(this, undefined, undefined); // TODO find both
    }
    onrender () {
        this.editor.render(this.get_camera());
    }
}
