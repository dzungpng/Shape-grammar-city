import Drawable from '../rendering/gl/Drawable';
import { vec3, mat3 } from 'gl-matrix';
import { gl } from '../globals';
import { Branch } from '../lsystem/LSystem';

class Mesh extends Drawable {
    indices: Uint32Array;
    positions: Float32Array;
    normals: Float32Array;

    constructor() {
        super(); // Call the constructor of the super class. This is required.
        // this.center = vec4.fromValues(center[0], center[1], center[2], 1);

    }

    create() {

    }

    createMesh(idx: Array<number>, pos: Array<number>, nor: Array<number>) {

        //console.log(pos);

        this.indices = new Uint32Array(idx);
        this.normals = new Float32Array(nor);
        this.positions = new Float32Array(pos);
        //console.log(this.normals);


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

// import { Branch } from '../lsystem/LSystem';

// class Mesh extends Drawable {
//     indices: Uint32Array;
//     positions: Float32Array;
//     normals: Float32Array;

//     constructor() {
//         super();
//     }

//     create() { }


//     createLSystemBranches(branches: Branch[]) {
//         // Grabbing branch geometry from obj
//         var ObjMtlLoader = require("obj-mtl-loader");
//         var objMtlLoader = new ObjMtlLoader();

//         objMtlLoader.load('src/geometry/objs/cylinder.obj', function (err: any, result: any) {
//             if (err) {
//                 console.log('Could not load branch obj!')
//             }
//             var vertices = result.vertices;
//             var faces = result.faces;
//             var normals = result.normals;

//             let pos: Array<number> = [];
//             let idx: Array<number> = [];
//             let nor: Array<number> = [];
//             for (let i = 0; i < branches.length; i++) {
//                 let forward = vec3.create();
//                 vec3.subtract(forward, branches[i].end, branches[i].start);
//                 vec3.normalize(forward, forward);

//                 let left = vec3.create();
//                 vec3.cross(left, vec3.fromValues(0.0, 1.0, 0.0), forward);

//                 let up = vec3.create();

//                 if (vec3.length(left) < 0.0001) {
//                     vec3.cross(up, forward, vec3.fromValues(0.0, 0.0, 1.0));
//                     vec3.cross(left, up, forward);
//                 }
//                 else {
//                     vec3.cross(up, forward, left);
//                 }

//                 vec3.normalize(left, left);
//                 vec3.normalize(up, up);

//                 let world2local = mat3.fromValues(left[0], left[1], left[2],
//                                                   up[0], up[1], up[2],
//                                                   forward[0], forward[1], forward[2]);

//                 let scale = vec3.length(forward);
//                 // let branchHeight = branches[i].start[2];
//                 // let baseHeight = 0.0;
//                 // let shrinkStep = 4.5; // how long should I shrink branch
//                 // let shrinkRate = 0.08; // how much should I shrink each time
//                 // let shrinkResult = 1.0 - this.clamp(0.0, 0.95, shrinkRate * (branchHeight - baseHeight)/shrinkStep);

//                 let offset = idx.length;
//                 // for each branch, use the loaded cylinder obj to create the vbo
//                 for (let j = 0; j < faces.length; j++) {
//                     //index
//                     idx.push(offset + 3 * j + 0);
//                     idx.push(offset + 3 * j + 1);
//                     idx.push(offset * j + 2);

//                     // position
//                     let v_idx = faces[j].indices;
//                     for(let j = 0; j < 3; j++){

//                         var tmpPos = vec3.fromValues(vertices[v_idx[j]- 1][0], vertices[v_idx[j]- 1][1], vertices[v_idx[j]- 1][2]);

//                         // transform pos according to this branch
//                         tmpPos[2] = tmpPos[2] * scale; // scale in the forward(z component) direction

//                         vec3.transformMat3(tmpPos, tmpPos, world2local);
//                         vec3.add(tmpPos, tmpPos, branches[i].start);

//                         pos.push(tmpPos[0]); // x
//                         pos.push(tmpPos[1]); // y
//                         pos.push(tmpPos[2]); // z
//                         pos.push(1.);        // w
//                     }

//                     // normal
//                     let n_idx = faces[j].normal;
//                     for(let j = 0; j < 3; j++){

//                         var tmpNor = vec3.fromValues(normals[n_idx[j]- 1][0], normals[n_idx[j]- 1][1], normals[n_idx[j]- 1][2]);

//                         // transform normal according to this branch
//                         vec3.transformMat3(tmpNor, tmpNor, world2local);

//                         nor.push(tmpNor[0]); // x
//                         nor.push(tmpNor[1]); // y
//                         nor.push(tmpNor[2]); // z
//                         nor.push(.0);        // w
//                     }
//                 }
//             }
//             this.indices = new Uint32Array(idx);
//             this.normals = new Float32Array(nor);
//             this.positions = new Float32Array(pos);

//             this.generateIdx();
//             this.generatePos();
//             this.generateNor();

//             this.count = this.indices.length;
//             gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.bufIdx);
//             gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);

//             gl.bindBuffer(gl.ARRAY_BUFFER, this.bufNor);
//             gl.bufferData(gl.ARRAY_BUFFER, this.normals, gl.STATIC_DRAW);

//             gl.bindBuffer(gl.ARRAY_BUFFER, this.bufPos);
//             gl.bufferData(gl.ARRAY_BUFFER, this.positions, gl.STATIC_DRAW);

//             console.log(`Created Mesh`);
//         })
//     }
// };

// export default Mesh;