

class PlanePlayerController extends PlayerController {
    append (camera, key) {
        if (key == "ArrowRight") camera.velocity( 1, 0, 0);
        if (key == "ArrowLeft")  camera.velocity(-1, 0, 0);
        if (key == "ArrowUp")    camera.velocity( 0, 1, 0);
        if (key == "ArrowDown")  camera.velocity( 0,-1, 0);
    }
    compute (camera, keys_status) {
        camera.sri.position.ssp.x = 0;
        camera.sri.position.ssp.y = 0;
        camera.sri.position.ssp.z = 0;

        for (let ckey in keys_status)
            if (keys_status[ckey])
                this.append(camera, ckey);
    } 
    onkeystart (camera, key, keys_status) {
        this.compute(camera, keys_status)
    }

    onkeyend (camera, key, keys_status) {
        this.compute(camera, keys_status)
    }

    ondrag (camera, dx, dy) {
        // Do nothing in a 2D Plane
    }
    
    ontick (camera, delta_t) {
        camera.integrate(delta_t);
    }
}

