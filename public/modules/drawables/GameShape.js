import {GameDrawable} from "./GameDrawable.js";
import {Point,randomColor} from "../Misc.js"

// const Misc = require("../Misc.js")
// const Point = Misc.Point

/**
 * @typedef {"rectangle" | "oval" | "polygon" | "line"} TYPE
 */

const shapes = ["rectangle","oval","polygon","line"]

/**
 * Shape drawable class. Draws rectangles, ovals, polygons and lines
 * @extends GameDrawable
 *
 * @property {TYPE} type Type of shape: rectangle, oval, polygon, line
 * @property {string} fill Fill of the shape. Can be CSS color or "random"
 * @property {string} stroke Stroke of the shape. Can be CSS color or "random"
 * @property {number} lineWidth Width of the line/outline
 * @property {number} rx Radius of oval on X axis
 * @property {number} ry Radius of oval on Y axis
 * @property {Array<number>} coords Array of points in line/polygon in format [x1,y1,...,xn,yn]
 */
class GameShape extends GameDrawable {
    #type;
    set type(newType) {
        if (!shapes.includes(newType)) {
            throw new Error(`Incorrect type name. Should be of "${shapes}", is ${newType}`)
        }
        this.#type = newType
    }
    get type() {
        return this.#type
    }
    #fill;
    set fill(newFill) {
        if (newFill === "random") {
            this.#fill = randomColor()
            return
        }
        this.#fill = newFill
    }
    get fill() {
        return this.#fill
    }
    #stroke;
    set stroke(newStroke) {
        if (newStroke === "random") {
            this.#stroke = randomColor()
            return
        }
        this.#stroke = newStroke
    }
    get stroke() {
        return this.#stroke
    }
    #lineWidth;
    set lineWidth(newLineWidth) {
        if (newLineWidth === undefined) {
            this.#lineWidth = 0
            return
        }
        if (isNaN(newLineWidth)) {
            throw new Error("Line width value is not a number!")
        }
        this.#lineWidth = newLineWidth
    }
    get lineWidth() {
        return this.#lineWidth
    }

    /**
     * Constructor of Shape drawable
     * @param {TYPE} type Type of shape: rectangle, oval, polygon, line
     * @param {Object} attrs Attribute object
     */
    constructor(type='rectangle',attrs={}) {
        super(attrs)

        if (type === "undefined") {
            this.type = attrs.type
            this.fill = attrs.fill
            this.stroke = attrs.stroke
            this.lineWidth = attrs.lineWidth
            this.rx = attrs.rx
            this.ry = attrs.ry
            this.coords = attrs.coords
            return
        }

        this.type = type;
        this.fill = attrs.fill
        this.stroke = attrs.stroke
        this.lineWidth = attrs.lineWidth


        if (type === 'rectangle') {
            this.width = this.width || 100
            this.height = this.height || 100
        }
        else if (type === 'oval') {
            this.rx = attrs.rx || attrs.ry || 50
            this.ry = attrs.ry || attrs.rx || 50
        }
        else if (["polygon","line"].includes(type)) {
            const coords = attrs.coords || this.parsePath(attrs.path) || []
            if (!Array.isArray(coords) || coords.some(x => isNaN(x))) {
                throw new Error("Wrong type of coords!")
            }
            this.coords = coords || []
        }

        if (!this.fill && !this.stroke) {
            if (this.type === "line") {
                this.stroke = "red"
            } else {
                this.fill = 'red'
            }
        }
    }

    /**
     * Parses path in format "x y command number c n c n ..."
     * @param {string} path
     * @returns {Array<Number>}
     */
    parsePath(path) {
        if (path === undefined) {
            return []
        }
        const pathArray = path.trim().split(/\s+/)
        const retPath = []

        function getNumber() {
            const raw = pathArray.shift()
            const value = parseFloat(raw)
            if (isNaN(value)) {
                throw new Error("Invalid number in path! " + raw)
            }
            return value
        }
        function getLetter() {
            const value = pathArray.shift()
            if (!"fbrl".includes(value)) {
                throw new Error("Invalid letter in path! " + value)
            }
            return value
        }
        function move(dist) {
            let newPoint = lastPoint.add(new Point(dist,0))
            newPoint = newPoint.rotateAround(lastPoint,rotation)
            return newPoint
        }
        function rotate(angle) {
            rotation += angle * (Math.PI / 180)
        }

        let lastPoint
        try {
            lastPoint = new Point(getNumber(), getNumber())
        } catch (e) {
            throw new Error("Path is not in correct format, it has to start with \"x y\" as values (0 0 for example)!")
        }
        retPath.push(lastPoint)
        let rotation = 0
        while (pathArray.length) {
            const command = getLetter()
            const number = getNumber()
            if (command === "f") {
                lastPoint = move(number)
                retPath.push(lastPoint)
            }
            else if (command === "b") {
                lastPoint = move(-number)
                retPath.push(lastPoint)
            }
            else if (command === "l") {
                rotate(-number)
            }
            else if (command === "r") {
                rotate(number)
            }
            else {
                throw new Error(`Unknown command "${command}"!`)
            }
        }
        return retPath.map(p => p.asArray()).flat(1)
    }

    setPath(path) {
        this.coords = this.parsePath(path)
    }

    /**
     * Replaces coords array property with two points
     * @param {Point} from Start Point
     * @param {Point} to End Point
     */
    setLine(from,to) {
        if (!(from instanceof Point) || !(to instanceof Point)) {
            throw new Error("From and to have to be Point objects!")
        }
        this.coords = [...from.asArray(),...to.asArray()]
    }

    /**
     * Appends Point to the coords array
     * @param {Point} point
     */
    addPoint(point) {
        if (this.coords === undefined) {
            throw "Undefined coords!"
        }
        this.coords.push(...point.asArray())
    }

    /**
     * Called when drawing
     * @param {CanvasRenderingContext2D} ctx Rendering context on which the method draws
     */
    drawFunction(ctx) {
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
            ctx.ellipse(0,0,this.rx,this.ry,0,0,2*Math.PI);
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
        if (this.type !== "line" && this.fill !== undefined) {
            ctx.fillStyle = this.fill;
            ctx.fill();
        }
        if (this.stroke !== undefined) {
            ctx.strokeStyle = this.stroke
            ctx.lineWidth = this.lineWidth
            ctx.stroke()
        }
    }

    /**
     * Returns object of attributes of current instance.
     * @returns {Object} Attribute object.
     */
    getAttrs() {
        return Object.assign({
            type : this.type,
            fill : this.fill,
            stroke : this.stroke,
            lineWidth : this.lineWidth,
            rx : this.rx,
            ry : this.ry,
            coords : (this.coords === undefined) ? undefined : [...this.coords],
        },super.getAttrs())
    }

    /**
     * Returns copy of current instance.
     * @param {string} newName Name of the newly created instance. Names have to be unique.
     * @returns {GameShape} New instance of GameShape with the same attributes.
     */
    copy(newName) {
        const attrs = this.getAttrs()
        if (newName === undefined) {
            attrs.name = (attrs.name === undefined) ? undefined : attrs.name + "_copy"
        } else {
            attrs.name = newName
        }
        return new GameShape("undefined",attrs)
    }
}

function isColor(strColor) {
    const s = new Option().style;
    s.color = strColor;
    return s.color !== '';
}

export {GameShape}