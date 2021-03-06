import {GameElement} from "./GameElement.js";
import {Point} from "../Misc.js";
import {GameShape} from "../drawables/GameShape.js";

/**
 * GameCanvas class. Handles canvas and drawing on it
 * @extends GameElement
 *
 * @property {number} width Width of the canvas element
 * @property {number} height Height of the canvas element
 * @property {GameShape} currentLine line that is currently being expanded (drawing). Undefined when not drawing
 * @property {number} lineWidth Width of the drawing line
 * @property {number} stroke Color of the "pencil". Default is "random"
 * @property {GameShape} background Rectangular canvas background
 */
class GameCanvas extends GameElement {
    #drawingInterval = undefined
    #currentLine = undefined
    get currentLine() {return this.#currentLine}

    #startDrawing = (event) => {
        const mouse = this.shared.mousePos
        const position = new Point(mouse.x-this.center.x,mouse.y-this.center.y)
            .rotateAround(new Point(0,0),-this.rotation)
        this.#currentLine = new GameShape('line',{
            level:0,
            coords:[...position.asArray(),...position.asArray()],
            stroke:this.stroke,
            lineWidth:this.lineWidth,
        })
        this.addChild(this.#currentLine,false)

        this.#drawingInterval = setInterval(this.#continueDrawing,10)
    }
    #continueDrawing = () => {
        if (this.#currentLine === undefined) {
            return;
        }
        const mouse = this.shared.mousePos
        let position = new Point(mouse.x - this.center.x, mouse.y - this.center.y)
        position = position.rotateAround(new Point(0, 0), -this.rotation)

        if (!this.isInside(mouse)) {
            this.#currentLine = undefined
            clearInterval(this.#drawingInterval)
            return
        }

        this.#currentLine.addPoint(position)
    }
    #finishDrawing = (event) => {
        if (this.#currentLine === undefined) {
            return;
        }
        const mouse = this.shared.mousePos
        let position = new Point(mouse.x-this.center.x,mouse.y-this.center.y)
        position = position.rotateAround(new Point(0,0),-this.rotation)
        this.#currentLine.addPoint(position)
        this.#currentLine = undefined;
        clearInterval(this.#drawingInterval)
    }

    /**
     * Constructor for GameCanvas
     * @param {Point} center Center of the element
     * @param {Object} attrs Attribute object
     */
    constructor(center,attrs={}) {
        super(center,[],attrs)

        this.width = (attrs.width === undefined) ? 300 : attrs.width
        this.height = (attrs.height === undefined) ? 300 : attrs.height
        this.lineWidth = (attrs.lineWidth === undefined) ? 2 : attrs.lineWidth
        this.stroke = (attrs.stroke === undefined) ? 'random' : attrs.stroke
        this.fill = (attrs.fill === undefined) ? 'antiquewhite' : attrs.fill

        this.background = new GameShape('rectangle',{
                width:this.width,
                height:this.height,
                fill:this.fill,
                level:-1
            }
        )
        this.addChild(this.background)

        this.clickable = true
        this.draggable = true
        this.stationary = true

        this.addOnClickListener(this.#startDrawing)
        this.addOnFinishDraggingListener(this.#finishDrawing)
    }

    /**
     * Clears the canvas by removing all children except the background drawable
     */
    clear() {
        this.children = [this.background]
    }

    /**
     * Returns the last line that was drawn
     * @returns {GameShape|undefined}
     */
    lastLine() {
        const line = this.children[this.children.length-1]
        return (line.type === 'line') ? line : undefined
    }

    /**
     * Returns object of attributes of current instance.
     * @returns {Object} Attribute object.
     */
    getAttrs() {
        return Object.assign({
            width: this.width,
            height: this.height,
            fill: this.fill,
            stroke: this.stroke,
        },super.getAttrs())
    }

    /**
     * Returns copy of current instance.
     * @param {string} newName Name of the newly created instance. Names have to be unique.
     * @returns {GameCanvas} New instance with the same attributes.
     */
    copy(newName) {
        const attrs = this.getAttrs()
        if (newName === undefined) {
            attrs.name = (attrs.name === undefined) ? undefined : attrs.name + "_copy"
        } else {
            attrs.name = newName
        }
        return new GameCanvas(attrs.center,attrs)
    }
}

export {GameCanvas}