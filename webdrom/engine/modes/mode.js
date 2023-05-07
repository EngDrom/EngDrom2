
class EngineMode {
    constructor (engine) {
        this.engine = engine;
    }

    onbegin () { // change mode
    }
    onlevelbegin () { // enter level
    }
    ontick (delta_t) { // on frame
    }
    onlevelend () { // quit level
    }
    onend () { // change mode
    }
}

class EditEngineMode {
    onbegin () {
        
    }
    onlevelbegin () {

    }
}
