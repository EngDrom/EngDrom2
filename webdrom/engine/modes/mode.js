
class EngineMode {
    constructor (engine) {
        this.engine = engine;
    }

    width () {
        return this.engine.canvas.canvas.getAttribute("width")
    }
    height () {
        return this.engine.canvas.canvas.getAttribute("height")
    }

    get_context () {
        return this.engine.canvas.web_gl;
    }
    get_player_controller (mode = "edit") {
        return this.get_level().player_controllers[mode]
    }
    get_level () {
        return this.engine.canvas.level;
    }
    get_camera () {
        return this.engine.canvas.camera;
    }
    cleanup () {
        let level = this.get_level();
        
        for (let [ name, type, instance, options ] of level.instances)
            instance.reset();
        
        this.get_camera().reload();
    }

    onbegin () { // change mode
    }
    onlevelbegin () { // enter level
    }
    ontick (delta_t) { // on frame
    }
    onrender () {
    }
    onclick (event) {
        return true; // allow renderRTS
    }
    oncontextmenu (event) {
    }
    onlevelend () { // quit level
    }
    onend () { // change mode
    }
}

class EditEngineMode extends EngineMode {
    get_player_controller () {
        return super.get_player_controller("edit")
    }
    onbegin () {
        this.cleanup();
    }
    onlevelbegin () {
        this.cleanup();
    }
}

class PlayEngineMode extends EngineMode {
    get_player_controller () {
        return super.get_player_controller("play")
    }
    onbegin () {
        this.cleanup();
    }
    onlevelbegin () {
        this.cleanup();
    }
    onend () {
        this.cleanup();
    }
    onlevelend () {
        this.cleanup();
    }
    ontick (delta_t) {
        this.get_level().tick(delta_t)
    }
}
