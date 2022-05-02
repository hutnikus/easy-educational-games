import {GameDrawable,loadImage} from "./GameDrawable.js";
import {Point} from "../Misc.js";

/**
 * Gif drawable class
 * @extends GameDrawable
 *
 * @property {Image} img Image to be drawn. File generated from python script (NAME_sheet.png)
 * @property {{frame_count:number,frame_width:number,frame_height:number}} imgData Data from resources/GIFNAME_data.json
 * @property {number} stagger Number of frames skipped while redrawing the context
 * @property {number} currentFrame Current frame of image
 */
class GameGif extends GameDrawable {
    #img = undefined
    get img() {return this.#img}
    #currentFrame = 0
    get currentFrame() {return this.#currentFrame}
    #stg = 0
    #imgData = undefined
    get imgData() {return this.#imgData}

    /**
     * Setter for displayed gif.
     * Requires presence of both name_sheet.png and name_data.json in resources/ directory
     * @param {string} gifName Name of gif without extension
     */
    setImg(gifName) {
        const dataUrl = `resources/${gifName}_data.json`
        const imageUrl = `resources/${gifName}_sheet.png`

        //load data from ${gifName}_data.json
        fetch(dataUrl).then(response => {
            response.json().then(value => {
                this.#imgData = value
            })
        })

        loadImage(imageUrl).then(value => {
            this.#img = value
        })
    }


    /**
     * Constructor of Gif drawable
     * @param {string} gifName Name of the gif (without "_sheet.png")
     * @param {Object} attrs Attribute object
     */
    constructor(gifName,attrs={}) {
        super(attrs)
        this.stagger = (attrs.stagger === undefined) ? 0 : Number(attrs.stagger);

        if (gifName === undefined) {
            this.#imgData = attrs.imgData
            this.#img = attrs.img
            return
        }

        this.setImg(gifName)
    }

    /**
     * Updates counter of skipped frames or updates the current image
     */
    updateAnimation() {
        if (!this.imgData) {
            return
        }
        if (this.#stg === this.stagger) {
            this.#currentFrame += 1;
            if (this.#currentFrame >= this.imgData.frame_count) {
                this.#currentFrame = 0;
            }
            this.#stg = 0;
        } else {
            this.#stg += 1;
        }
    }

    /**
     * Called when drawing
     * @param {CanvasRenderingContext2D} ctx Rendering context on which the method draws
     */
    drawFunction(ctx) {
        if (!this.img) {
            return
        }
        let fw = this.imgData.frame_width
        let fh = this.imgData.frame_height
        ctx.drawImage(
            this.img,
            this.#currentFrame * fw, 0, fw, fh,
            -(this.width / 2), -(this.height / 2),this.width,this.height
        );
    }

    /**
     * Checks parameters and calls parent draw() method
     * @param {CanvasRenderingContext2D} ctx Rendering context on which the method draws
     * @param {Point} center Center Point of parent Element
     */
    draw(ctx,center) {
        if (!this.imgData) {
            return
        }
        let fw = this.imgData.frame_width
        let fh = this.imgData.frame_height
        if (this.width !== undefined && this.height !== undefined) {
            super.draw(ctx,center,this)
        } else {
            if (this.width === undefined) {
                this.width = fw
            }
            if (this.height === undefined) {
                this.height = fh
            }
            this.draw(ctx, center)
        }
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
            img : this.img,
            currentFrame : 0,
            imgData : this.imgData,
            stagger : this.stagger,
            stg : 0,
        },super.getAttrs())
    }

    /**
     * Returns copy of current instance.
     * @param {string} newName Name of the newly created instance. Names have to be unique.
     * @returns {GameGif} New instance of GameGif with the same attributes.
     */
    copy(newName) {
        const attrs = this.getAttrs()
        if (newName === undefined) {
            attrs.name = (attrs.name === undefined) ? undefined : attrs.name + "_copy"
        } else {
            attrs.name = newName
        }
        return new GameGif(undefined,attrs)
    }
}

// module.exports = GameGif

export { GameGif }