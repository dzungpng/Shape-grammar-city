import { vec3, mat3 } from "gl-matrix";

class Turtle {
    pos: vec3;
    up: vec3;
    forward: vec3;
    left: vec3;
    Rad2Deg: number = 57.295779513082320876798154814105;
    Deg2Rad: number = 0.017453292519943295769236907684886;

    constructor() {
        this.pos = vec3.fromValues(0, 0, 0);
        this.up = vec3.fromValues(0, 0, 1);
        this.forward = vec3.fromValues(1, 0, 0);
        this.left = vec3.fromValues(0, 1, 0);
    }

    moveForward(length : number) {
        this.pos[0] += length * this.forward[0];
        this.pos[1] += length * this.forward[1];
        this.pos[2] += length * this.forward[2];
    }

    applyUpRot(degrees : number) {                                                  
        var world2local = mat3.fromValues(this.left[0], this.left[1], this.left[2],
                                          this.up[0], this.up[1], this.up[2],
                                          this.forward[0], this.forward[1], this.forward[2]);
        var rad = this.Deg2Rad * degrees;

        var tmpForward = vec3.create();
        vec3.rotateY(tmpForward, vec3.fromValues(.0, .0, 1.), vec3.fromValues(.0, .0, .0), rad);
        vec3.transformMat3(this.forward, tmpForward, world2local);

        let tmpLeft = vec3.create();
        vec3.rotateY(tmpLeft, vec3.fromValues(1., .0, .0), vec3.fromValues(.0, .0, .0), rad);
        vec3.transformMat3(this.left, tmpLeft, world2local);
    }

    applyLeftRot(degrees: number){
        let world2local = mat3.fromValues(this.left[0], this.left[1], this.left[2],
                                          this.up[0], this.up[1], this.up[2],
                                          this.forward[0], this.forward[1], this.forward[2]);
        let rad = this.Deg2Rad * degrees;
                                          
        let tmpForward = vec3.create();
        vec3.rotateX(tmpForward, vec3.fromValues(.0, .0, 1.), vec3.fromValues(.0, .0, .0), rad);
        vec3.transformMat3(this.forward, tmpForward, world2local);

        let tmpUp = vec3.create();
        vec3.rotateX(tmpUp, vec3.fromValues(.0, 1., .0), vec3.fromValues(.0, .0, .0), rad);
        vec3.transformMat3(this.up, tmpUp, world2local);
    }

    applyForwardRot(degrees: number){
        let world2local = mat3.fromValues(this.left[0], this.left[1], this.left[2],
                                          this.up[0], this.up[1], this.up[2],
                                          this.forward[0], this.forward[1], this.forward[2]);
        let rad = this.Deg2Rad * degrees;
                                         
        let tmpUp = vec3.create();
        vec3.rotateZ(tmpUp, vec3.fromValues(.0, 1., .0), vec3.fromValues(.0, .0, .0), rad);
        vec3.transformMat3(this.up, tmpUp, world2local);

        let tmpLeft = vec3.create();
        vec3.rotateZ(tmpLeft, vec3.fromValues(1., .0, .0), vec3.fromValues(.0, .0, .0), rad);
        vec3.transformMat3(this.left, tmpLeft, world2local);
    }
}

export default Turtle;
