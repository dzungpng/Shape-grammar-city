import {mat4, vec4} from 'gl-matrix';
import Drawable from './Drawable';
import Camera from '../../Camera';
import {gl} from '../../globals';
import ShaderProgram from './ShaderProgram';

// In this file, `gl` is accessible because it is imported above
class OpenGLRenderer {
  geoColor : vec4;
  constructor(public canvas: HTMLCanvasElement) {
    this.geoColor = vec4.fromValues(0, 1, 0, 1)
  }

  setGeoColor(color: vec4) {
    this.geoColor = color;
  }

  setClearColor(r: number, g: number, b: number, a: number) {
    gl.clearColor(r, g, b, a);
  }

  setSize(width: number, height: number) {
    this.canvas.width = width;
    this.canvas.height = height;
  }

  clear() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  }

  render(camera: Camera, prog: ShaderProgram, drawables: Array<Drawable>, time: number, model: mat4) {
    // let model = mat4.create();
    // let viewProj = mat4.create();
    // mat4.multiply(viewProj, camera.projectionMatrix, camera.viewMatrix);
    // prog.setModelMatrix(model);
    // prog.setViewProjMatrix(viewProj);
    prog.setGeometryColor(this.geoColor);
    // prog.setCameraPostion(vec4.fromValues(camera.position[0], camera.position[1], camera.position[2], 1));
    // prog.setTime(time);
    let viewProj = mat4.create();
    mat4.multiply(viewProj, camera.projectionMatrix, camera.viewMatrix);
    prog.setModelMatrix(model);
    prog.setViewProjMatrix(viewProj);
    for (let drawable of drawables) {
      prog.draw(drawable);
    }
  }
};

export default OpenGLRenderer;
