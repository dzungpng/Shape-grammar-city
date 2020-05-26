import { vec3 } from "gl-matrix";
import Turtle from './Turtle'

interface Branch {
    start: vec3;
    end: vec3;
}

interface Geometry {
    position: vec3;
    str: string;
}

class LSystem {
    // mappings of rules
    productions: Map<string, string[]>;
    // result after each iteration
    iterations: string[];

    current: string;
    angle: number;
    step: number;
    grammar: string;

    constructor(defaultAngle: number, defaultStep: number) {
        this.angle = defaultAngle;
        this.step = defaultStep;
        this.productions = new Map<string, string[]>();
        this.iterations = [];
    }

    setDefaultAngle(defaultAngle: number) {
        this.angle = defaultAngle;
    }

    setDefaultStep(defaultStep: number) {
        this.step = defaultStep;
    }

    reset() {
        this.current = '';
        this.iterations = [];
        this.productions.clear();
    }

    iterate(input: string): string {
        var output = '';
        for (let i = 0; i < input.length; i++) {
            let sym: string = input.substr(i, 1);
            let next;
            if (this.productions.has(sym)) {
                var selectedIdx = Math.floor(this.productions.get(sym).length * Math.random());
                next = this.productions.get(sym)[selectedIdx];
            }
            else {
                next = sym;
            }
            output = output + next;
        }
        return output;
    }

    getIteration(n: number): string {
        if (n >= this.iterations.length) {
            for (let i = this.iterations.length; i <= n; i++) {
                this.current = this.iterate(this.current);
                this.iterations.push(this.current);
            }
        }
        return this.iterations[n];
    }

    addProduction(line: string) {
        let index;

        line = line.replace(/ /g, '');
        if (line.length == 0) return;

        index = line.indexOf("->");
        if (index != -1) {
            let symFrom = line.substr(0, index);
            let symTo = line.substr(index + 2);

            if (!this.productions.has(symFrom)) {
                this.productions.set(symFrom, []);
            }

            this.productions.get(symFrom).push(symTo);
        }
        else {
            this.current = line;
            this.iterations.push(line);
        }
    }

    loadProgram(rules: string[]) {
        this.reset();

        for (var rule of rules) {
            this.addProduction(rule);
        }
    }

    process(n: number, branches: Branch[]) {
        let models: Geometry[];
        this.processHelper(n, branches, models);
    }

    processHelper(n: number, branches: Branch[], models: Geometry[]) {
        let turtle: Turtle;
        let stack: Turtle[];

        // Initially turtle is pointing upwards
        turtle.applyUpRot(90);

        let insn: string = this.getIteration(n);
        for (let i = 0; i < insn.length; i++) {
            let sym: string = insn.substr(i, 1);

            if (sym === "F") {
                let start = vec3.fromValues(turtle.pos[0], turtle.pos[1], turtle.pos[2]);
                turtle.moveForward(this.step);
                const branch : Branch = {
                    start: start,
                    end: turtle.pos
                }
                branches.push(branch);
            }
            else if (sym === "f") {
                turtle.moveForward(this.step);
            }
            else if (sym === "+") {
                turtle.applyUpRot(this.angle);
            }
            else if (sym === "-") {
                turtle.applyUpRot(-this.angle);
            }
            else if (sym === "&") {
                turtle.applyLeftRot(this.angle);
            }
            else if (sym == "^") {
                turtle.applyLeftRot(-this.angle);
            }
            else if (sym == "\\") {
                turtle.applyForwardRot(this.angle);
            }
            else if (sym == "/") {
                turtle.applyForwardRot(-this.angle);
            }
            else if (sym == "|") {
                turtle.applyUpRot(180);
            }
            else if (sym == "[") {
                stack.push(turtle);
            }
            else if (sym == "]") {
                turtle = stack.slice(-1).pop();
            }
            else {
                var geo : Geometry = {
                    position: turtle.pos,
                    str: sym
                }
                models.push(geo);
            }
        }
    }
}

export default LSystem;
