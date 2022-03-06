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
    /**
     * @param {Object} attrs Attributes of new Drawable.
     */
    constructor(attrs={}) {
        this.name = attrs.name;
        this.level = (attrs.level === undefined) ? 0 : Number(attrs.level);
        this.dx = (attrs.dx === undefined) ? 0 : Number(attrs.dx);
        this.dy = (attrs.dy === undefined) ? 0 : Number(attrs.dy);
        this.width = attrs.width;
        this.height = attrs.height;
        this.rotation = (attrs.rotation === undefined) ? 0 : Number(attrs.rotation);
        this.visible = (attrs.visible === undefined) ? true : attrs.visible;
        this.hScale = (attrs.hScale === undefined) ? 1 : Number(attrs.hScale);
        this.vScale = (attrs.vScale === undefined) ? 1 : Number(attrs.vScale);
    }

    /**
     * Dummy function
     * @param {CanvasRenderingContext2D} ctx Canvas context
     */
    drawFunction(ctx) {
        throw new Error("Calling draw function of GameDrawable, nothing to draw!")
    }

    /**
     * Transforms input context and calls draw function of passed drawable.
     * @param {CanvasRenderingContext2D} ctx Rendering context.
     * @param {Point} center Center Point of parent Element.
     * @param {GameDrawable} drawable Child drawable to be drawn.
     * @returns {Promise<void>}
     */
    async draw(ctx,center,drawable) {
        ctx.save()
        // let t = getTransform(ctx);
        // let rad = Math.atan2(t.b, t.a);
        ctx.transform(this.hScale,0,0,this.vScale,this.dx,this.dy);

        // ctx.rotate(rad)
        ctx.rotate(this.rotation)

        await drawable.drawFunction(ctx)

        ctx.restore()
    }

    /**
     * Returns true when mouse is inside drawable.
     * @param {Point} mouse Mouse position on canvas.
     * @param {CanvasRenderingContext2D} tempContext Hidden rendering context to check pixel state.
     * @param {function(CanvasRenderingContext2D,Object)} drawFunction Drawing function of child drawable.
     * @param {Object} drawAttrs Attributes to pass to drawFunction.
     * @returns {Promise<boolean>} True when mouse is inside drawable, false otherwise.
     */
    async isInside(mouse, tempContext, drawFunction, drawAttrs) {
        tempContext.save()
        tempContext.setTransform(1,0,0,1,0,0);
        //clear the temp context
        tempContext.clearRect(0, 0,tempContext.canvas.width,tempContext.canvas.height);
        tempContext.restore()

        // call the draw function
        await drawFunction(tempContext,drawAttrs)

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

// module.exports = GameImage

export { GameDrawable, loadImage }