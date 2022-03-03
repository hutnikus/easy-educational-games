import {GameDrawable} from "./GameDrawable.js";
import {Point,randomColor} from "../Misc.js"

// const Misc = require("../Misc.js")
// const Point = Misc.Point

const shapes = ["rectangle","oval","polygon","line"]

class GameShape extends GameDrawable {
    #typeValue = undefined;       // TYPES = ['rectangle','polygon','oval','line']
    set type(newType) {
        if (!shapes.includes(newType)) {
            throw new Error(`Incorrect type name. Should be of "${shapes}", is ${type}`)
        }
        this.#typeValue = newType
    }
    get type() {
        return this.#typeValue
    }
    #fillValue = undefined;       // color
    set fill(newFill) {
        if (newFill === "random") {
            this.#fillValue = randomColor()
            return
        }
        this.#fillValue = newFill
    }
    get fill() {
        return this.#fillValue
    }
    #strokeValue = undefined;     // color
    set stroke(newStroke) {
        if (newStroke === "random") {
            this.#strokeValue = randomColor()
            return
        }
        this.#strokeValue = newStroke
    }
    get stroke() {
        return this.#strokeValue
    }
    #lineWidthValue = undefined;  // width of stroke/outline
    set lineWidth(newLineWidth) {
        if (newLineWidth === undefined) {
            this.#lineWidthValue = 0
            return
        }
        if (isNaN(newLineWidth)) {
            throw new Error("Line width value is not a number!")
        }
        this.#lineWidthValue = newLineWidth
    }
    get lineWidth() {
        return this.#lineWidthValue
    }

    // sizes in oval
    rY = undefined;
    rX = undefined;

    coords = undefined;     // points in line / polygon in format [x1,y1,...,xn,yn]

    initRectangle() {
        if (this.width === undefined) {
            throw new Error("Rectangle needs a defined width!")
        }
        if (this.height === undefined) {
            throw new Error("Rectangle needs a defined height!")
        }
    }
    initOval(rx,ry) {
        if (rx === undefined) {
            throw new Error("Oval needs a defined rX!")
        } else {
            this.rX = Number(rx);
        }
        if (ry === undefined) {
            throw new Error("Oval needs a defined rY!")
        } else {
            this.rY = Number(ry);
        }
    }
    initPolygon(coords) {
        if (!Array.isArray(coords)) {
            throw new Error("Polygon needs a defined coords array!")
        }
        if (coords.length < 6) {
            throw new Error("Array of coords must be at least 3 points (6 items) long!")
        }
        if (coords.length % 2 !== 0) {
            throw new Error("Array of coords needs to be of even size!")
        }
        this.coords = []
        for (let i = 0; i < coords.length; i+=2) {
            this.addPoint(new Point(coords[i],coords[i+1]))
        }
    }
    initLine(coords) {
        if (!Array.isArray(coords)) {
            throw new Error("Line needs a defined coords array!")
        }
        if (coords.length < 4) {
            throw new Error("Array of coords must be at least 2 points (4 items) long!")
        }
        if (coords.length % 2 !== 0) {
            throw new Error("Array of coords needs to be of even size!")
        }
        this.coords = []
        for (let i = 0; i < coords.length; i+=2) {
            this.addPoint(new Point(coords[i],coords[i+1]))
        }
    }

    constructor(type='rectangle',attrs={}) {
        super(attrs)
        this.type = type;
        this.fill = attrs.fill
        this.stroke = attrs.stroke
        this.lineWidth = attrs.lineWidth


        if (type === 'rectangle') {
            this.initRectangle()
        }
        else if (type === 'oval') {
            this.initOval(attrs.rX,attrs.rY)
        }
        else if (type === 'polygon') {
            this.initPolygon(attrs.coords)
        }
        else if (type === 'line') {
            this.initLine(attrs.coords)
        }
    }

    setLine(from,to) {
        this.initLine([...from.asArray(),...to.asArray()])
    }

    addPoint(point) {
        if (this.coords === undefined) {
            throw "Undefined coords!"
        }
        this.coords.push(point.x,point.y)
    }

    async drawFunction(ctx) {
        ctx.color = this.fill

        if (this.type === 'rectangle') {
            if (this.fill !== undefined) {
                ctx.fillStyle = this.fill;
                ctx.fillRect(- (this.width / 2), - (this.height / 2), this.width, this.height)
            }
            if (this.stroke !== undefined) {
                ctx.strokeStyle = this.stroke
                ctx.lineWidth = this.lineWidth
                ctx.strokeRect(- (this.width / 2), - (this.height / 2), this.width, this.height)
            }
            return
        }
        else if (this.type === 'oval') {
            ctx.beginPath();
            ctx.ellipse(0,0,this.rX,this.rY,0,0,2*Math.PI);
        }
        else if (this.type === 'polygon' || this.type === 'line') {
            ctx.beginPath();
            ctx.moveTo(this.coords[0],this.coords[1])
            for (let i = 2; i < this.coords.length-1; i+=2) {
                ctx.lineTo(this.coords[i],this.coords[i+1])
            }
            if (this.type === 'polygon') {
                ctx.closePath()
            }
        }
        if (this.fill !== undefined) {
            ctx.fillStyle = this.fill;
            ctx.fill();
        }
        if (this.stroke !== undefined) {
            ctx.strokeStyle = this.stroke
            ctx.lineWidth = this.lineWidth
            ctx.stroke()
        }
    }

    async draw(ctx,center) {
        await super.draw(ctx,center,this)
    }

    async isInside(mouse, tempContext, center) {
        const drawFunction = async function (ctx, attrs) {
            await attrs.obj.draw(ctx,attrs.center)
        }
        const drawAttrs = {
            obj: this,
            center: center
        }
        return await super.isInside(mouse, tempContext, drawFunction, drawAttrs)
    }
}

function getDistanceLinePoint(lp1, lp2, p) {
    return ((Math.abs((lp2.y - lp1.y) * p.x - (lp2.x - lp1.x) * p.y + lp2.x * lp1.y - lp2.y * lp1.x)) / lp1.distanceTo(lp2))
}

function getLineAngle(lp1, lp2) {
    const x = lp2.x - lp1.x
    const y = lp2.y - lp1.y

    return Math.atan2(y,x)
}

function triangleArea(p1, p2, p3) {
    return Math.abs((p1.x * (p2.y - p3.y) + p2.x * (p3.y - p1.y)+ p3.x * (p1.y - p2.y))/2);
}

function insidePolygon(point, vs) {
    // ray-casting algorithm based on
    // https://wrf.ecse.rpi.edu/Research/Short_Notes/pnpoly.html/pnpoly.html

    const x = point.x, y = point.y;

    let inside = false;
    for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
        const xi = vs[i][0], yi = vs[i][1];
        const xj = vs[j][0], yj = vs[j][1];

        const intersect = ((yi > y) !== (yj > y))
            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }

    return inside;
}



function isColor(strColor) {
    const s = new Option().style;
    s.color = strColor;
    return s.color !== '';
}

// module.exports = GameShape

export {GameShape}