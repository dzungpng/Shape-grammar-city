import {vec3, vec4} from 'gl-matrix';
import * as Stats from 'stats-js';
import * as DAT from 'dat-gui';

import Cube from './geometry/Cube';
import Mesh from './geometry/Mesh';

import OpenGLRenderer from './rendering/gl/OpenGLRenderer';
import Camera from './Camera';
import {setGL} from './globals';
import ShaderProgram, {Shader} from './rendering/gl/ShaderProgram';


// Define an object with application parameters and button callbacks
// This will be referred to by dat.GUI's functions that add GUI elements.
const controls = {
  'Load Scene': loadScene, // A function pointer, essentially
  branchColor: [ 0, 128, 255 ],
  step: 2,
  angle: 22,
  iteration: 2,
  grammar: 'F \n F->F[+F]F[-F]F',
};

let cube: Cube;
let branchMesh: Mesh;

function loadScene() {
  cube = new Cube(vec3.fromValues(0, 0, 0));
  cube.create();
  branchMesh = new Mesh();
}

function main() {
  // Initial display for framerate
  const stats = Stats();
  stats.setMode(0);
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.left = '0px';
  stats.domElement.style.top = '0px';
  document.body.appendChild(stats.domElement);

  // Add controls to the gui
  const gui = new DAT.GUI({width: 400});
  gui.add(controls, 'Load Scene');
  gui.addColor(controls, 'branchColor'); 
  gui.add(controls, 'step', 1, 10).step(1);
  gui.add(controls, 'angle', 1, 180).step(1);
  gui.add(controls, 'iteration', 1, 20).step(1);
  gui.add(controls, 'grammar', [
    'F \n F->F[+F]F[-F]F',
    'F \n F->[+F]F[-F][F]',
    'F \n F->FF-[-F+F+F]+[+F-F-F]',
    'X \n X->F[+X]F[-X]+X \n F->FF',
    'X \n X->F[+X][-X]FX \n F->FF'
  ]);

  // get canvas and webgl context
  const canvas = <HTMLCanvasElement> document.getElementById('canvas');
  const gl = <WebGL2RenderingContext> canvas.getContext('webgl2');
  if (!gl) {
    alert('WebGL 2 not supported!');
  }
  // `setGL` is a function imported above which sets the value of `gl` in the `globals.ts` module.
  // Later, we can import `gl` from `globals.ts` to access it
  setGL(gl);

  // Initial call to load scene
  loadScene();

  const camera = new Camera(vec3.fromValues(0, 0, 5), vec3.fromValues(0, 0, 0));

  const renderer = new OpenGLRenderer(canvas);
  renderer.setClearColor(0.2, 0.2, 0.2, 1);
  gl.enable(gl.DEPTH_TEST);

  const lambert = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/lambert-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/lambert-frag.glsl')),
  ]);

  // This function will be called every frame
  let time = 0.0;
  function tick() {
    camera.update();
    stats.begin();
    gl.viewport(0, 0, window.innerWidth, window.innerHeight);
    renderer.clear();
    renderer.setGeoColor(vec4.fromValues(controls.branchColor[0]/255.0, controls.branchColor[1]/255.0, controls.branchColor[2]/255.0, 1));
    renderer.render(camera, lambert, [
      cube,
    ], time);
    time++;
    stats.end();

    // Tell the browser to call `tick` again whenever it renders a new frame
    requestAnimationFrame(tick);
  }

  window.addEventListener('resize', function() {
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
