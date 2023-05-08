
/**
 * StdLib Module with EngDrom API
 */

let ENGDROM_MODULE = undefined;
class EngDromModule {
    constructor () {
        if (ENGDROM_MODULE) return ENGDROM_MODULE;
        ENGDROM_MODULE = this;

        this.reset();
    }
    reset () {
        this.__onload  = [];
        this.__onframe = [];
    }

    onload  (f) { ENGDROM_MODULE. __onload.push(f) }
    onframe (f) { ENGDROM_MODULE.__onframe.push(f) }

    runload () {
        for (let load of this.__onload)
            load(this);
    }
    runframe (camera) {
        for (let frame of this.__onframe)
            frame(camera);
    }
}
