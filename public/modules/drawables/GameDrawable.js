class GameDrawable {
    name = undefined;       // unique name of the Drawable object
    level = undefined;      // relative level in parent GameElement

    // relative position to center pos of parent GameElement
    dx = undefined;
    dy = undefined;

    // size of the Drawable object (not used every time)
    width = undefined;
    height = undefined;

    // in radians, default 0
    rotation = undefined;

    //scaling, default 1 for both
    hScale = undefined;
    vScale = undefined;

    visible = undefined

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

    async draw(ctx,center,drawable) {
        ctx.save()
        ctx.setTransform(this.hScale,0,0,this.vScale,center.x+this.dx,center.y+this.dy);

        ctx.rotate(this.rotation)

        await drawable.drawFunction(ctx)

        ctx.restore()
    }

    async isInside(mouse, tempContext, drawFunction, drawAttrs) {
        //clear the temp context
        tempContext.clearRect(0, 0,tempContext.canvas.width,tempContext.canvas.height);

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
}

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