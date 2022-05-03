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

    #initRectangle() {
        this.width = this.width || 100
        this.height = this.height || 100
    }
    #initOval(rx, ry) {
        this.rx = rx || ry || 50
        this.ry = ry || rx || 50
    }
    #initPolygon(coords) {
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
    #initLine(coords) {
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
            this.#initRectangle()
        }
        else if (type === 'oval') {
            this.#initOval(attrs.rx,attrs.ry)
        }
        else if (type === 'polygon') {
            this.#initPolygon(attrs.coords)
        }
        else if (type === 'line') {
            this.#initLine(attrs.coords)
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
     * Replaces coords array property with two points
     * @param {Point} from Start Point
     * @param {Point} to End Point
     */
    setLine(from,to) {
        if (this.type !== "line") {
            throw new Error(`You're trying to call setLine() on ${this.type}!`)
        }
        this.#initLine([...from.asArray(),...to.asArray()])
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