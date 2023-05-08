
class AttachedPlayerController extends PlayerController {
    constructor (default_controller, mesh) {
        super();

        this.controller = default_controller;
        this.mesh       = mesh;
    }

    ondrag (camera, dx, dy) {
        camera.sri = this.mesh.sri;

        this.controller.ondrag(camera, dx, dy);
    }
    onkeystart (camera, key, keys_status) {
        camera.sri = this.mesh.sri;

        this.controller.onkeystart(camera, key, keys_status);
    }
    onkeyend (camera, key, keys_status) {
        camera.sri = this.mesh.sri;

        this.controller.onkeyend(camera, key, keys_status);
    }
    get_override () {
        return this.controller.get_override();
    }
    ontick (camera, delta_t) {
        if (camera instanceof Camera)
            camera.set_override(this.get_override());
        camera.sri = this.mesh.sri;

        this.controller.ontick(camera, delta_t);
    }
}
