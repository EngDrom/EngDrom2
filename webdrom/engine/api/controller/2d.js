

class PlanePlayerController extends PlayerController {
    onkeystart (camera, key) {
        if (key == "ArrowRight") camera.velocity( 1, 0, 0);
        if (key == "ArrowLeft")  camera.velocity(-1, 0, 0);
        if (key == "ArrowUp")    camera.velocity( 0, 1, 0);
        if (key == "ArrowDown")  camera.velocity( 0,-1, 0);
    }

    onkeyend (camera, key) {
        if (key == "ArrowRight") camera.velocity(-1, 0, 0);
        if (key == "ArrowLeft")  camera.velocity( 1, 0, 0);
        if (key == "ArrowUp")    camera.velocity( 0,-1, 0);
        if (key == "ArrowDown")  camera.velocity( 0, 1, 0);
    }

    ondrag (camera, dx, dy) {
        // Do nothing in a 2D Plane
    }
    
    ontick (camera, delta_t) {
        camera.integrate(delta_t);
    }
}

