import {GameElement} from "./GameElement.js";
import {Point} from "../Misc.js";
import {GameShape} from "../drawables/GameShape.js";

/**
 * GameCanvas class. Handles canvas and drawing on it
 * @extends GameElement
 *
 * @property {number} width Width of the canvas element
 * @property {number} height Height of the canvas element
 * @property {GameShape} current line that is currently being expanded (drawing). Undefined when not drawing
 * @property {number} lineWidth Width of the drawing line
 * @property {number} stroke Color of the "pencil". Default is "random"
 * @property {GameShape} background Rectangular canvas background
 * @property {NodeJS.Timer} interval Value returned from setInterval() call. Used to stop drawing [clearInterval()]
 */
class GameCanvas extends GameElement {
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

        this.addOnClickListener(GameCanvas.#startDrawing,this)
        this.addOnFinishDraggingListener(GameCanvas.#finishDrawing,this)
    }

    /**
     * Clears the canvas by removing all children except the background drawable
     */
    clear() {
        this.children = [this.background]
    }

    /**
     * Creates new current line drawable and starts the drawing interval
     * @param {GameCanvas} self Instance of GameCanvas passed on construction
     * @static
     * @private
     */
    static #startDrawing(self) {
        const mouse = self.shared.mousePos
        const position = new Point(mouse.x-self.center.x,mouse.y-self.center.y)
            .rotateAround(new Point(0,0),-self.rotation)
        self.current = new GameShape('line',{
            level:0,
            coords:[...position.asArray(),...position.asArray()],
            stroke:self.stroke,
            lineWidth:self.lineWidth,
        })
        self.addChild(self.current,false)

        self.interval = setInterval(()=>GameCanvas.#continueDrawing(self),20)
    }

    /**
     * Appends points to current line drawable or stops drawing when mouse leaves the canvas element
     * @param {GameCanvas} self Instance of GameCanvas passed on construction
     * @returns {Promise<void>}
     * @static
     * @private
     */
    static async #continueDrawing(self) {
        if (self.current === undefined) {
            return;
        }
        const mouse = self.shared.mousePos
        let position = new Point(mouse.x-self.center.x,mouse.y-self.center.y)
        position = position.rotateAround(new Point(0,0),-self.rotation)

        if (!await self.isInside(mouse)) {
            self.current = undefined
            clearInterval(self.interval)
            return
        }

        self.current.addPoint(position)
    }

    /**
     * Appends the last point to current line drawable and stops the drawing process
     * @param {GameCanvas} self Instance of GameCanvas passed on construction
     * @static
     * @private
     */
    static #finishDrawing(self) {
        if (self.current === undefined) {
            return;
        }
        const mouse = self.shared.mousePos
        let position = new Point(mouse.x-self.center.x,mouse.y-self.center.y)
        position = position.rotateAround(new Point(0,0),-self.rotation)
        self.current.addPoint(position)
        self.current = undefined;
        clearInterval(self.interval)
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
        const retCanvas = new GameCanvas(attrs.center,attrs)
        // remove drawing of this instance
        retCanvas.removeOnClickListener(GameCanvas.#startDrawing)
        retCanvas.removeOnFinishDraggingListener(GameCanvas.#finishDrawing)
        // add drawing for new instance
        retCanvas.addOnClickListener(GameCanvas.#startDrawing,retCanvas)
        retCanvas.addOnFinishDraggingListener(GameCanvas.#finishDrawing,retCanvas)
        return retCanvas
    }
}

export {GameCanvas}