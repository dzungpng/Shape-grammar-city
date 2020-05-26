import {vec3, vec4} from 'gl-matrix';
import Drawable from '../rendering/gl/Drawable';
import {gl} from '../globals';

class Cube extends Drawable {
    indices: Uint32Array;
    positions: Float32Array;
    normals: Float32Array;
    center: vec4;

    constructor(center: vec3) {
        super(); // Call the constructor of the super class. This is required.
        this.center = vec4.fromValues(center[0], center[1], center[2], 1);
    }

    create() {
        this.positions = new Float32Array([
            // front
            0.5, 0.5, 0.5, 1.0,
            0.5, -0.5, 0.5, 1.0,
            -0.5, -0.5, 0.5, 1.0,
            -0.5, 0.5, 0.5, 1.0,
            // right
            0.5, 0.5, -0.5, 1.0,
            0.5, -0.5, -0.5, 1.0,
            0.5, -0.5, 0.5, 1.0,
            0.5, 0.5, 0.5, 1.0,
            // left
            -0.5, 0.5, 0.5, 1.0,
            -0.5, -0.5, 0.5, 1.0, 
            -0.5, -0.5, -0.5, 1.0,
            -0.5, 0.5, -0.5, 1.0,
            // back
            -0.5, 0.5, -0.5, 1.0,
            -0.5, -0.5, -0.5, 1.0, 
            0.5, -0.5, -0.5, 1.0, 
            0.5, 0.5, -0.5, 1.0,
            // top
            0.5, 0.5, -0.5, 1.0,
            0.5, 0.5, 0.5, 1.0,
            -0.5, 0.5, 0.5, 1.0,
            -0.5, 0.5, -0.5, 1.0, 
            // bottom
            0.5, -0.5, 0.5, 1.0,
            0.5, -0.5, -0.5, 1.0,
            -0.5, -0.5, -0.5, 1.0,
            -0.5, -0.5, 0.5, 1.0
        ])
      
        this.indices = new Uint32Array(36);  
        let idx = 0;
        for(let i = 0; i < 6; i++){
            this.indices[idx++] = i*4;
            this.indices[idx++] = i*4+1;
            this.indices[idx++] = i*4+2;
            this.indices[idx++] = i*4;
            this.indices[idx++] = i*4+2;
            this.indices[idx++] = i*4+3;
        }

        this.normals = new Float32Array(96)
        let idxn = 0;
        //Front
        for(let i = 0; i < 4; i++){
            this.normals[idxn++] = 0;
            this.normals[idxn++] = 0;
            this.normals[idxn++] = 1;
            this.normals[idxn++] = 0;
        }
        //Right
        for(let i = 0; i < 4; i++){
            this.normals[idxn++] = 1;
            this.normals[idxn++] = 0;
            this.normals[idxn++] = 0;
            this.normals[idxn++] = 0;
        }
        //Left
        for(let i = 0; i < 4; i++){
            this.normals[idxn++] = -1;
            this.normals[idxn++] = 0;
            this.normals[idxn++] = 0;
            this.normals[idxn++] = 0;
        }
        //Back
        for(let i = 0; i < 4; i++){
            this.normals[idxn++] = 0;
            this.normals[idxn++] = 0;
            this.normals[idxn++] = -1;
            this.normals[idxn++] = 0;
        }
        //Top
        for(let i = 0; i < 4; i++){
            this.normals[idxn++] = 0;
            this.normals[idxn++] = 1;
            this.normals[idxn++] = 0;
            this.normals[idxn++] = 0;
        }
        //Bottom
        for(let i = 0; i < 4; i++){
            this.normals[idx++] = 0;
            this.normals[idx++] = -1;
            this.normals[idx++] = 0;
            this.normals[idx++] = 0;
        }

        this.generateIdx();
        this.generatePos();
        this.generateNor();
    
        this.count = this.indices.length;
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.bufIdx);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);
    
        gl.bindBuffer(gl.ARRAY_BUFFER, this.bufNor);
        gl.bufferData(gl.ARRAY_BUFFER, this.normals, gl.STATIC_DRAW);
    
        gl.bindBuffer(gl.ARRAY_BUFFER, this.bufPos);
        gl.bufferData(gl.ARRAY_BUFFER, this.positions, gl.STATIC_DRAW);
    
        console.log(`Created cube`);
    }

}

export default Cube;
