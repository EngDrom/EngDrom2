
class PlayerController {
    constructor (override) {
        this.override = override;
        if (this.override === undefined)
            this.override = {};
    }

    onkeystart (camera, key, keys_status) {  }
    onkeyend   (camera, key, keys_status) {  }
    ondrag     (camera, dx, dy) {  }

    ontick (camera, delta_t) {  }
}
