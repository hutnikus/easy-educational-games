import {GameDrawable} from "./GameDrawable.js";
import {randomColor} from "../Misc.js";

/**
 * Text drawable class.
 * @extends GameDrawable
 *
 * @property {string} color Color of text. Can be CSS color.
 * @property {string} text Text to display. Can be only 1 line
 * @property {string} font Font (and size) of the text. Default "20px arial"
 * @property {number} maxWidth Shrink text width to this size
 */
class GameText extends GameDrawable {
    #color = undefined;
    set color(newColor) {
        if (newColor === "random") {
            this.#color = randomColor()
            return
        }
        this.#color = newColor
    }
    get color() {
        return this.#color
    }
    text = undefined;
    font = undefined;
    maxWidth = undefined;

    /**
     * Constructor of Text drawable
     * @param {string} text Displayed text
     * @param {Object} attrs Attribute object
     */
    constructor(text='sample text',attrs={}) {
        super(attrs)
        this.text = text;
        this.#color = attrs.color || "black"
        this.font = (attrs.font === undefined) ? '20px arial' : attrs.font;
        this.maxWidth = attrs.maxWidth
    }

    /**
     * Called when drawing
     * @param {CanvasRenderingContext2D} ctx Rendering context on which the method draws
     */
    drawFunction(ctx) {
        ctx.font = this.font;
        ctx.color = this.#color
        ctx.fillStyle = this.#color;
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(this.text,0,0,this.maxWidth)
    }

    /**
     * Calls parent draw function
     * @param {CanvasRenderingContext2D} ctx Rendering context on which the method draws
     * @param {Point} center Center Point of parent Element
     */
    draw(ctx,center) {
        super.draw(ctx,center,this)
    }

    /**
     * Returns true when mouse is inside drawable.
     * @param {Point} mouse Mouse position on canvas.
     * @param {CanvasRenderingContext2D} tempContext Hidden rendering context to check pixel state.
     * @param {Point} center Center Point of parent Element
     * @returns {boolean} True when mouse is inside drawable, false otherwise.
     */
    isInside(mouse, tempContext, center) {
        const drawFunction = function (ctx, attrs) {
            attrs.obj.draw(ctx,attrs.center)
        }
        const drawAttrs = {
            obj: this,
            center: center
        }
        return super.isInside(mouse, tempContext, drawFunction, drawAttrs)
    }

    /**
     * Returns object of attributes of current instance.
     * @returns {Object} Attribute object.
     */
    getAttrs() {
        return Object.assign({
            color : this.#color,
            text : this.text,
            font : this.font,
            maxWidth : this.maxWidth,
        },super.getAttrs())
    }

    /**
     * Returns copy of current instance.
     * @param {string} newName Name of the newly created instance. Names have to be unique.
     * @returns {GameText} New instance of GameText with the same attributes.
     */
    copy(newName) {
        const attrs = this.getAttrs()
        if (newName === undefined) {
            attrs.name = (attrs.name === undefined) ? undefined : attrs.name + "_copy"
        } else {
            attrs.name = newName
        }
        return new GameText(attrs.text,attrs)
    }

    /**
     * Returns measures of the drawable
     * @param {CanvasRenderingContext2D} ctx Rendering context upon which the calculations are made
     * @returns {TextMetrics} text metrics
     */
    measureText(ctx) {
        ctx.font = this.font;
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        return ctx.measureText(this.text)
    }
}

// module.exports = GameText

export { GameText }