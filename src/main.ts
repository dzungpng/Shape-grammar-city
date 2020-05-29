import { vec3, vec4, mat3, mat4 } from 'gl-matrix';
import * as Stats from 'stats-js';
import * as DAT from 'dat-gui';

import Cube from './geometry/Cube';
import Mesh from './geometry/Mesh';
import LSystem, { Branch, Geometry } from './lsystem/LSystem';

import OpenGLRenderer from './rendering/gl/OpenGLRenderer';
import Camera from './Camera';
import { setGL } from './globals';
import ShaderProgram, { Shader } from './rendering/gl/ShaderProgram';
var ObjMtlLoader = require("obj-mtl-loader");


// Define an object with application parameters and button callbacks
// This will be referred to by dat.GUI's functions that add GUI elements.
const controls = {
  'Load Scene': loadScene, // A function pointer, essentially
  branchColor: [0, 128, 255],
  step: 2,
  angle: 22,
  iteration: 3,
  grammar: 'F \n F->F[+F]F[-F]F',
};

let cube: Cube;
let branchMesh: Mesh;

function loadScene() {
  cube = new Cube(vec3.fromValues(0, 0, 0));
  cube.create();
  branchMesh = new Mesh();
}

function createLSystemBranches(branches: Branch[]) {
  // Grabbing branch geometry from obj
  var objMtlLoader = new ObjMtlLoader();
  let pos: Array<number> = [];
  let idx: Array<number> = [];
  let nor: Array<number> = [];

  objMtlLoader.load('src/geometry/objs/cylinder.obj', function (err: any, result: any) {
    if (err) {
      console.log('Could not load branch obj!')
    }
    var vertices = result.vertices;
    var faces = result.faces;
    var normals = result.normals;

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

      let world2local = mat3.fromValues(left[0], left[1], left[2],
        up[0], up[1], up[2],
        forward[0], forward[1], forward[2]);

      let scale = vec3.length(forward);
      // let branchHeight = branches[i].start[2];
      // let baseHeight = 0.0;
      // let shrinkStep = 4.5; // how long should I shrink branch
      // let shrinkRate = 0.08; // how much should I shrink each time
      // let shrinkResult = 1.0 - this.clamp(0.0, 0.95, shrinkRate * (branchHeight - baseHeight)/shrinkStep);

      let offset = idx.length;
      // for each branch, use the loaded cylinder obj to create the vbo
      for (let j = 0; j < faces.length; j++) {
        //index
        idx.push(offset + 3 * j + 0);
        idx.push(offset + 3 * j + 1);
        idx.push(offset * j + 2);

        // position
        let v_idx = faces[j].indices;
        for (let j = 0; j < 3; j++) {

          var tmpPos = vec3.fromValues(vertices[v_idx[j] - 1][0], vertices[v_idx[j] - 1][1], vertices[v_idx[j] - 1][2]);

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
        for (let j = 0; j < 3; j++) {

          var tmpNor = vec3.fromValues(normals[n_idx[j] - 1][0], normals[n_idx[j] - 1][1], normals[n_idx[j] - 1][2]);

          // transform normal according to this branch
          vec3.transformMat3(tmpNor, tmpNor, world2local);

          nor.push(tmpNor[0]); // x
          nor.push(tmpNor[1]); // y
          nor.push(tmpNor[2]); // z
          nor.push(.0);        // w
        }
      }
    }
    branchMesh.createMesh(idx, pos, nor);
  })
}

function main() {
  // Initial display for framerate
  const stats = Stats();
  stats.setMode(0);
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.left = '0px';
  stats.domElement.style.top = '0px';
  document.body.appendChild(stats.domElement);

  // get canvas and webgl context
  const canvas = <HTMLCanvasElement>document.getElementById('canvas');
  const gl = <WebGL2RenderingContext>canvas.getContext('webgl2');
  if (!gl) {
    alert('WebGL 2 not supported!');
  }
  // `setGL` is a function imported above which sets the value of `gl` in the `globals.ts` module.
  // Later, we can import `gl` from `globals.ts` to access it
  setGL(gl);

  // Initial call to load scene
  loadScene();

  console.log(branchMesh)
  console.log(cube)
  // Setting up camera and renderer
  const camera = new Camera(vec3.fromValues(0, 49, 41), vec3.fromValues(0, 48, -8));

  const renderer = new OpenGLRenderer(canvas);
  renderer.setClearColor(169.0 / 255.0, 217.0 / 255.0, 198.0 / 255.0, 1.0);
  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);


  const lambert = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/lambert-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/lambert-frag.glsl')),
  ]);

  // Setting up LSystem
  let lsystem = new LSystem(controls.angle, controls.step);
  let branches: Branch[] = [];
  let geometry: Geometry[] = [];

  var rules = ['R', 'R -> FA', 'A -> [&FL!A]/////[&FL!A]///////[&FL!A]', 'F -> S/////F', 'F -> LS//L//F', 'S -> FL', 'L -> [∧∧{-f+f+f-|-f+f+f}]'];
  // lsystem.loadProgram(controls.grammar.split('\n'));
  lsystem.loadProgram(rules);

  lsystem.process(controls.iteration, branches, geometry);
  createLSystemBranches(branches);

  // When user edits the settings (ex. change the color of branches), this function is called
  function update() {
    // Reset lsystem
    //  lsystem.loadProgram(controls.grammar.split('\n'));
    lsystem.setDefaultAngle(controls.angle);
    lsystem.setDefaultStep(controls.step);
    branches = [];
    geometry = [];
    lsystem.process(controls.iteration, branches, geometry);
    createLSystemBranches(branches);
  }

  // Add controls to the gui
  const gui = new DAT.GUI({ width: 400 });
  gui.add(controls, 'Load Scene');
  gui.addColor(controls, 'branchColor').onChange(update);
  gui.add(controls, 'step', 1, 10).step(1).onChange(update);
  gui.add(controls, 'angle', 1, 180).step(1).onChange(update);
  gui.add(controls, 'iteration', 1, 20).step(1).onChange(update);
  gui.add(controls, 'grammar', [
    'F \n F->F[+F]F[-F]F',
    'F \n F->[+F]F[-F][F]',
    'F \n F->FF-[-F+F+F]+[+F-F-F]',
    'X \n X->F[+X]F[-X]+X \n F->FF',
    'X \n X->F[+X][-X]FX \n F->FF'
  ]).onChange(update);

  // This function will be called every frame
  let time = 0.0;
  function tick() {
    camera.update();
    stats.begin();
    gl.viewport(0, 0, window.innerWidth, window.innerHeight);
    renderer.clear();
    renderer.setGeoColor(
      vec4.fromValues(controls.branchColor[0] / 255.0, controls.branchColor[1] / 255.0, controls.branchColor[2] / 255.0, 1)
    );
    let branchesModelRot = mat4.create();

    mat4.fromXRotation(branchesModelRot, -0.5 * 3.1415926);
    renderer.render(camera, lambert, [
      branchMesh,
      // cube,
    ], time, branchesModelRot);
    time++;
    stats.end();

    // Tell the browser to call `tick` again whenever it renders a new frame
    requestAnimationFrame(tick);
  }

  window.addEventListener('resize', function () {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.setAspectRatio(window.innerWidth / window.innerHeight);
    camera.updateProjectionMatrix();
  }, false);

  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.setAspectRatio(window.innerWidth / window.innerHeight);
  camera.updateProjectionMatrix();

  // Start the render loop
  tick();
}

main();
