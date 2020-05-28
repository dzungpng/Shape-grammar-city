import Drawable from '../rendering/gl/Drawable';
import {vec3, mat3} from 'gl-matrix';
import { gl } from '../globals';

import LSystem from '../lsystem/LSystem';
import { Branch } from '../lsystem/LSystem';

var ObjMtlLoader = require("obj-mtl-loader");

class Mesh extends Drawable {
    indices: Uint32Array;
    positions: Float32Array;
    normals: Float32Array;

    constructor() {
        super(); 
    }

    create() { }

    createLSystemBranches(angle: number, step: number, grammar: string, iteration: number, branches : Branch[]) {
        // Grabbing branch geometry from obj
        var objMtlLoader = new ObjMtlLoader();
        var vertices: any;
        var faces: any;
        var normals: any;
        objMtlLoader.load("./objs/cylinder.obj", function (err: any, result: any) {
            if (err) {
                console.log('Could not load branch obj!')
            }
            vertices = result.vertices;
            faces = result.faces;
            normals = result.normals;
        });

        let pos: Array<number> = [];
        let idx: Array<number> = [];
        let nor: Array<number> = [];
        for (let i = 0; i < branches.length; i++) {
            let forward = vec3.create();
            vec3.subtract(forward, branches[i].end, branches[i].start);
            vec3.normalize(forward, forward);

            let left = vec3.create();
            vec3.cross(left, vec3.fromValues(0.0, 1.0, 0.0), forward);

            let up = vec3.create();

            if (vec3.length(left) < 0.0001) {
                vec3.cross(up, forward, vec3.fromValues(0.0, 0.0, 1.0));
                vec3.cross(left, up, forward);
            }
            else {
                vec3.cross(up, forward, left);
            }

            vec3.normalize(left, left);
            vec3.normalize(up, up);

            let world2local = mat3.fromValues(left[0]   , left[1]   , left[2],
                                              up[0]     , up[1]     , up[2],
                                              forward[0], forward[1], forward[2]);

            let scale = vec3.length(forward);

            let offset = idx.length;

            // for each branch, use the loaded cylinder obj to create the vbo
            for (let j = 0; j < faces.length; j++) {
                // index
                idx.push(offset + 3 * j + 0);
                idx.push(offset + 3 * j + 1);
                idx.push(offset * j + 2);
      
                // position
                let v_idx = faces[j].indices;
                for(let j = 0; j < 3; j++){
      
                  var tmpPos = vec3.fromValues(vertices[v_idx[j]- 1][0], vertices[v_idx[j]- 1][1], vertices[v_idx[j]- 1][2]);
                  
                  // transform pos according to this branch
                  tmpPos[2] = tmpPos[2] * scale; // scale in the forward(z component) direction
      
                  vec3.transformMat3(tmpPos, tmpPos, world2local);
                  vec3.add(tmpPos, tmpPos, branches[i].start);
      
                  pos.push(tmpPos[0]); // x
                  pos.push(tmpPos[1]); // y
                  pos.push(tmpPos[2]); // z
                  pos.push(1.);        // w
                }
      
                // normal
                let n_idx = faces[j].normal;
                for(let j = 0; j < 3; j++){
      
                  var tmpNor = vec3.fromValues(normals[n_idx[j]- 1][0], normals[n_idx[j]- 1][1], normals[n_idx[j]- 1][2]);
      
                  // transform normal according to this branch
                  vec3.transformMat3(tmpNor, tmpNor, world2local);
      
                  nor.push(tmpNor[0]); // x
                  nor.push(tmpNor[1]); // y
                  nor.push(tmpNor[2]); // z
                  nor.push(.0);        // w
                }
            }

        }
        this.createMesh(idx, pos, nor);
    }

    createMesh(idx: Array<number>, pos: Array<number>, nor: Array<number>) {
        this.indices = new Uint32Array(idx);
        this.normals = new Float32Array(nor);
        this.positions = new Float32Array(pos);

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

        console.log(`Created Mesh`);
    }
};

export default Mesh;