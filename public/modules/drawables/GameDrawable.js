import {Point} from "../Misc.js";

/**
 * Parent Drawable class, handles shared attributes and actions of drawables.
 *
 * @property {string} name Name of the drawable, used for searching for it within element.
 * @property {number} level Depth of drawable within element. Higher number will be on top.
 * @property {number} dx Deviation on X axis in pixels from center of parent Element.
 * @property {number} dy Deviation on Y axis in pixels from center of parent Element.
 * @property {number} width Width of the drawable in pixels. Used for rectangles and images.
 * @property {number} height Height of the drawable in pixels. Used for rectangles and images.
 * @property {number} rotation Rotation of the drawable. Measured in radians.
 * @property {boolean} visible Visibility of drawable. Skips drawing on false.
 * @property {number} hScale Scale of drawable on horizontal axis. 1 is default, -1 is mirrored.
 * @property {number} vScale Scale of drawable on vertical axis. 1 is default, -1 is mirrored.
 */
class GameDrawable {
    #name = undefined
    get name() {
        return this.#name
    }
    #level = 0
    set level(newLevel) {
        if (newLevel === undefined) {
            this.#level = 0
            return
        }
        if (isNaN(newLevel)) {
            throw new TypeError("Incorrect type of level, it has to be a number!")
        }
        this.#level = Number(newLevel)
    }
    get level() {
        return this.#level
    }
    #dx = 0
    set dx(newDX) {
        if (newDX === undefined) {
            this.#dx = 0
            return
        }
        if (isNaN(newDX)) {
            throw new TypeError("Incorrect type of dx, it has to be a number!")
        }
        this.#dx = Number(newDX)
    }
    get dx() {
        return this.#dx
    }
    #dy = 0
    set dy(newDY) {
        if (newDY === undefined) {
            this.#dy = 0
            return
        }
        if (isNaN(newDY)) {
            throw new TypeError("Incorrect type of dy, it has to be a number!")
        }
        this.#dy = Number(newDY)
    }
    get dy() {return this.#dy}
    #width = undefined
    set width(newWidth) {
        if (newWidth === undefined) {
            this.#width = undefined
            return
        }
        if (isNaN(newWidth)) {
            throw new TypeError("Incorrect type of width, it has to be a number!")
        }
        this.#width = Number(newWidth)
    }
    get width() {return this.#width}
    #height = undefined
    set height(newHeight) {
        if (newHeight === undefined) {
            this.#height = undefined
            return
        }
        if (isNaN(newHeight)) {
            throw new TypeError("Incorrect type of height, it has to be a number!")
        }
        this.#height = Number(newHeight)
    }
    get height() {return this.#height}
    #rotation = 0
    set rotation(newRotation) {
        if (newRotation === undefined) {
            this.#rotation = 0
            return
        }
        if (isNaN(newRotation)) {
            throw new TypeError("Incorrect type of rotation, it has to be a number!")
        }
        this.#rotation = Number(newRotation)
    }
    get rotation() {return this.#rotation}
    #visible = true
    set visible(newVisible) {
        if (newVisible === undefined) {
            this.#visible = true
            return
        }
        if (newVisible instanceof Boolean) {
            throw new TypeError("Incorrect type for visible, it has to be a boolean!")
        }
        this.#visible = newVisible
    }
    get visible() {return this.#visible}
    #hScale = 1
    set hScale(newScale) {
        if (newScale === undefined) {
            this.#hScale = 1
            return
        }
        if (isNaN(newScale)) {
            throw new TypeError("Incorrect type of hScale, it has to be a number!")
        }
        this.#hScale = Number(newScale)
    }
    get hScale() {return this.#hScale}
    #vScale = 1
    set vScale(newScale) {
        if (newScale === undefined) {
            this.#vScale = 1
            return
        }
        if (isNaN(newScale)) {
            throw new TypeError("Incorrect type of vScale, it has to be a number!")
        }
        this.#vScale = Number(newScale)
    }
    get vScale() {return this.#vScale}

    /**
     * @param {Object} attrs Attributes of new Drawable.
     */
    constructor(attrs={}) {
        this.#name = attrs.name;
        this.level = attrs.level
        this.dx = attrs.dx
        this.dy = attrs.dy
        this.width = attrs.width;
        this.height = attrs.height;
        this.rotation = attrs.rotation
        this.visible = attrs.visible
        this.hScale = attrs.hScale
        this.vScale = attrs.vScale
    }

    /**
     * Draws the object on the supplied context
     * @param {CanvasRenderingContext2D} ctx Rendering context on which the method draws
     */
    drawFunction(ctx) {
        console.error("Calling drawFunction in class GameDrawable. Use a subclass!")
    }

    /**
     * Transforms input context and calls draw function of passed drawable.
     * @param {CanvasRenderingContext2D} ctx Rendering context.
     */
    draw(ctx) {
        ctx.save()
        ctx.transform(this.hScale,0,0,this.vScale,this.dx,this.dy);
        ctx.rotate(this.rotation)
        this.drawFunction(ctx)
        ctx.restore()
    }

    /**
     * Returns true when mouse is inside drawable.
     * @param {Point} mouse Mouse position on canvas.
     * @param {CanvasRenderingContext2D} tempContext Hidden rendering context to check pixel state.
     * @returns {boolean} True when mouse is inside drawable, false otherwise.
     */
    isInside(mouse, tempContext) {
        tempContext.save()
        tempContext.setTransform(1,0,0,1,0,0);
        //clear the temp context
        tempContext.clearRect(0, 0,tempContext.canvas.width,tempContext.canvas.height);
        tempContext.restore()

        // call the draw function in subclass drawables
        this.drawFunction(tempContext)

        // get the pixel array
        const imageData = tempContext.getImageData(0, 0,tempContext.canvas.width,tempContext.canvas.height);

        // get the index of clicked pixel in pixel array
        const pixelIndex = Math.floor(mouse.x) * 4 + Math.floor(mouse.y) * 4 * Math.floor(tempContext.canvas.width);

        // get alpha at clicked pixel
        const alpha=imageData.data[pixelIndex+3];

        // clicked pixel is not empty
        return alpha !== 0
    }

    /**
     * Returns object of attributes of current instance.
     * @returns {Object} Attribute object.
     */
    getAttrs() {
        return {
            name : this.name,
            level : this.level,
            dx : this.dx,
            dy : this.dy,
            width : this.width,
            height : this.height,
            rotation : this.rotation,
            hScale : this.hScale,
            vScale : this.vScale,
            visible : this.visible,
        }
    }

    /**
     * Returns copy of current instance.
     * @param {string} newName Name of the newly created instance. Names have to be unique.
     * @returns {GameDrawable} New instance of Drawable with the same attributes.
     */
    copy(newName) {
        const attrs = this.getAttrs()
        if (newName === undefined) {
            attrs.name = (attrs.name === undefined) ? undefined : attrs.name + "_copy"
        } else {
            attrs.name = newName
        }
        return new GameDrawable(attrs)
    }
}

/**
 * Loads image from url.
 * @param {string} imageUrl Source url.
 * @returns {Promise<Image>} Image object.
 * @function
 */
async function loadImage(imageUrl) {
    let img;
    const imageLoadPromise = new Promise(resolve => {
        img = new Image();
        img.onload = resolve;
        img.src = imageUrl;
    });

    await imageLoadPromise;
    return img;
}

export { GameDrawable, loadImage }