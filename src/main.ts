import {vec2, vec3, vec4, mat3, mat4} from 'gl-matrix';
import * as Stats from 'stats-js';
import * as DAT from 'dat-gui';
import Mesh from './geometry/Mesh'
import OpenGLRenderer from './rendering/gl/OpenGLRenderer';
import Camera from './Camera';
import {setGL} from './globals';
import ShaderProgram, {Shader} from './rendering/gl/ShaderProgram';
import Turtle from './lsystem/Turtle';
import {LSystem, Geometry, Branch} from './lsystem/LSystem';
var OBJLoader = require("obj-mtl-loader");

const invPi = 0.3183099;
const Pi    = 3.1415926;

// Define an object with application parameters and button callbacks
// This will be referred to by dat.GUI's functions that add GUI elements.
const controls = {
  'Load Scene': loadScene, 
  branchColor: [0, 128, 255],
  step: 2,
  angle: 22.5,
  iteration: 7,
  grammar: '3',
};

// Camera
const camera = new Camera(vec3.fromValues(0, 60, 70), vec3.fromValues(0, 35, -8));

// Obj Mesh
let mergedBranchMesh: Mesh;

interface faceInfo{
  indices: Array<number>;
  texture: Array<number>;
  normal:  Array<number>;
};

function loadScene() {
  // initialize Meshes
  mergedBranchMesh = new Mesh();
}

function clamp(a: number, b: number, x: number): number {
  let result;
  result = Math.max(a, Math.min(b, x));
  return result;
}

// ----------------------------------------------
// ------------- Mesh Loading  ------------------
// ----------------------------------------------

// generate branch VBO 
function GenerateMergedBranchMesh(branches: Branch[]){
  // these are data to be pushed to VBO
  var indices: number[] = [];
  var nor: number[] = [];
  var pos: number[] = [];

  var objMtlLoader = new OBJLoader();
  objMtlLoader.load("src/objs/cylinder.obj", function(err : any, result: any) {
    if(err){
      /*Handle error here*/
      console.log("Obj Loader Error");
    }
    var branchVertices = result.vertices;
    var branchFaces = result.faces;
    var branchNormals = result.normals;

    // add branches info 
    for(let i = 0; i < branches.length; i++){
      
      // -----------------------------------------------------------
      // ------------------ transform part -------------------------
      // -----------------------------------------------------------

      let forward = vec3.create();
      vec3.subtract(forward, branches[i].endPos, branches[i].startPos);
    
      let s = vec3.length(forward);
    
      vec3.normalize(forward, forward);
    
      let left = vec3.create();
      vec3.cross(left, vec3.fromValues(0.0, 1.0, 0.0), forward);
    
      let up = vec3.create();
    
      if (vec3.length(left) < 0.0001)
      {   
          vec3.cross(up, forward, vec3.fromValues(0.0, 0.0, 1.0));
          vec3.cross(left, up, forward);
      }
      else
      { 
          vec3.cross(up, forward, left);
      }
    
      vec3.normalize(left, left);
      vec3.normalize(up, up);

      let world2local = mat3.fromValues(left[0], left[1], left[2],
                                        up[0], up[1], up[2],
                                        forward[0], forward[1], forward[2]);
      // -----------------------------------------------------------
      
      // to shrink branch radius
      let branchHeight = branches[i].startPos[2];
      let baseHeight = 0.0;
      let shrinkStep = 4.5; // how long should I shrink branch
      let shrinkRate = 0.08; // how much should I shrink each time
      let shrinkResult = 1.0 - clamp(0.0, 0.95, shrinkRate * (branchHeight - baseHeight)/shrinkStep);

      let indexOffset = indices.length;
      
      // add vbo for each branch
      for (var _i = 0; _i < branchFaces.length; _i++) {
          // index
          indices.push(indexOffset + 3 * _i + 0);
          indices.push(indexOffset + 3 * _i + 1);
          indices.push(indexOffset + 3 * _i + 2);

          // position
          let vertexIdx = branchFaces[_i].indices;
          for(let j = 0; j < 3; j++){

            var tmpPos = vec3.fromValues(
              branchVertices[vertexIdx[j]- 1][0], 
              branchVertices[vertexIdx[j]- 1][1], 
              branchVertices[vertexIdx[j]- 1][2]
            );
            
            // transform pos according to this branch
            tmpPos[2] = tmpPos[2] * s; // scale in the forward(z component) direction
            // higher -> thiner
            tmpPos[0] = tmpPos[0] * shrinkResult;
            tmpPos[1] = tmpPos[1] * shrinkResult;

            vec3.transformMat3(tmpPos, tmpPos, world2local);
            vec3.add(tmpPos, tmpPos, branches[i].startPos);

            pos.push(tmpPos[0]); // x
            pos.push(tmpPos[1]); // y
            pos.push(tmpPos[2]); // z
            pos.push(1.);        // w
          }

          // normal
          let normalIdx = branchFaces[_i].normal;
          for(let j = 0; j < 3; j++){

            var tmpNor = vec3.fromValues(
              branchNormals[normalIdx[j]- 1][0],
              branchNormals[normalIdx[j]- 1][1],
              branchNormals[normalIdx[j]- 1][2]
            );

            // transform normal according to this branch
            vec3.transformMat3(tmpNor, tmpNor, world2local);

            nor.push(tmpNor[0]); // x
            nor.push(tmpNor[1]); // y
            nor.push(tmpNor[2]); // z
            nor.push(.0);        // w
          }
      }
    }

    // create mergedBranchMesh
    mergedBranchMesh.createMesh(indices, pos, nor);
  });
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

  // Add controls to the gui
  const gui = new DAT.GUI();

 
  // Open GL Renderer
  const renderer = new OpenGLRenderer(canvas);
  renderer.setClearColor(169.0 / 255.0, 217.0 / 255.0, 198.0 / 255.0, 1.0);
  gl.enable(gl.DEPTH_TEST);
  // enable transparent
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);


  // setup lambert shader
  const lambertBranch = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/lambert-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/lambert-frag.glsl')),
  ]);
  const color = vec4.fromValues(controls.branchColor[0]/255.0, controls.branchColor[1]/255.0, controls.branchColor[2]/255.0, 1);
  renderer.setGeoColor(color)

  // --------------------------------------------
  // LSystem 
  var system = new LSystem(controls.angle, controls.step);

  // initialize rules
  var rules1 = ['R', 'R -> FA', 'A -> [&FLA]/////[&FLA]///////[&FLA]', 'F -> S/////F', 'F -> LS//L//F','S -> FL', 'L -> [∧∧X]'];  
  var rules2 = ['R', 'R -> FA', 'A -> [&FL!A]/////[&FL!A]///////[&FL!A]', 'F -> S/////F', 'F -> LS//L//F', 'S -> FL', 'L -> [∧∧{-f+f+f-|-f+f+f}]'];
  var rules3 = ['A', 
               'A -> [&FL!A]/////’[&FL!A]///////’[&FL!A]',
               'F -> S ///// F',
               'S -> F L',
               'L -> [’’’∧∧{-f+f+f-|-f+f+f}]',
               ];
  
  const rulesMap = new Map();
  rulesMap.set('1', rules1);
  rulesMap.set('2', rules2);
  rulesMap.set('3', rules3);
  
  system.loadProgram(rulesMap.get(controls.grammar));
  system.setDefaultStep(controls.step);
  system.setDefaultAngle(controls.angle);
  system.process(controls.iteration);
  GenerateMergedBranchMesh(system.getBranches());

  // GUI function
  function update(){
    system.loadProgram(rulesMap.get(controls.grammar));
    system.setDefaultStep(controls.step);
    system.setDefaultAngle(controls.angle);
    system.process(controls.iteration);
    GenerateMergedBranchMesh(system.getBranches());
  }

  function updateColor() {
    const newColor = vec4.fromValues(controls.branchColor[0]/255.0, controls.branchColor[1]/255.0, controls.branchColor[2]/255.0, 1);
    renderer.setGeoColor(newColor)
  }


  // GUI
  // Add controls to the gui
  gui.add(controls, 'Load Scene');
  gui.addColor(controls, 'branchColor').onChange(updateColor);
  gui.add(controls, 'step', 1, 10).step(1).onChange(update);
  gui.add(controls, 'angle', 1, 180).step(1).onChange(update);
  gui.add(controls, 'iteration', 1, 20).step(1).onChange(update);
  gui.add(controls, 'grammar', [
    '1',
    '2',
    '3',
  ]).onChange(update);

  // set up a timer
  var prevTime = Date.now();
  var timer = 0.0;

  // This function will be called every frame
  function tick() {
    camera.update();
    stats.begin();
    gl.viewport(0, 0, window.innerWidth, window.innerHeight);

    renderer.clear();
    
    // set uniforms
    timer += 1.0;
    if(timer > 10000.0){
      timer -= 10000.0;
    }

    // scene lamber shader
    // branches
    let branchesModelRot = mat4.create();
    mat4.fromXRotation(branchesModelRot, -0.5 * 3.1415926);
    renderer.render(camera, lambertBranch, [
      mergedBranchMesh,
    ], timer, branchesModelRot);

    prevTime = Date.now();

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
