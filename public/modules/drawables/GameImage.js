// const Misc = require("../Misc.js")
// const Point = Misc.Point

import {Point} from "../Misc.js";

class GameImage {
    name = undefined;
    //relative level in parent GameElement
    level = undefined;
    //relative center pos in parent GameElement
    dx = undefined;
    dy = undefined;

    width = undefined;
    height = undefined;

    rotation = undefined; //in radians todo add rotation

    img = undefined;

    constructor(name='',extension='png',attrs={}) {
        this.name = attrs.name;
        this.level = (attrs.level === undefined) ? 0 : Number(attrs.level);
        this.dx = (attrs.dx === undefined) ? 0 : Number(attrs.dx);
        this.dy = (attrs.dy === undefined) ? 0 : Number(attrs.dy);
        this.rotation = (attrs.rotation === undefined) ? 0 : Number(attrs.rotation);

        this.url = `resources/${name}.${extension}`

        this.img = (attrs.img === undefined) ? loadImage(this.url) : attrs.img;

        this.width = attrs.width;
        this.height = attrs.height;

        //todo add loading from url
    }

    async draw(ctx,centerX,centerY) {
        if (this.width !== undefined && this.height !== undefined) {
            ctx.save()
            ctx.translate(centerX+this.dx,centerY+this.dy)
            ctx.rotate(this.rotation)
            ctx.drawImage(this.img, - (this.width / 2), - (this.height / 2),this.width,this.height);
            ctx.restore()
        } else {
            this.width = this.img.width
            this.height = this.img.height
            await this.draw(ctx, centerX, centerY)
        }
    }

    isInside(centeredMouse, tempContext, centerX, centerY) {
        if (tempContext === undefined)
            return false

        centeredMouse.x -= this.dx
        centeredMouse.y -= this.dy

        let rotatedX = ((centeredMouse.x) * Math.cos(-this.rotation) - (centeredMouse.y) * Math.sin(-this.rotation)) + this.width/2;
        let rotatedY = ((centeredMouse.y) * Math.cos(-this.rotation) + (centeredMouse.x) * Math.sin(-this.rotation)) + this.height/2;

        if (rotatedX > this.width || rotatedX < 0 || rotatedY > this.height || rotatedY < 0)
            return false

        const pixelIndex = Math.floor(rotatedX) * 4 + Math.floor(rotatedY) * 4 * Math.floor(this.width)

        tempContext.clearRect(centerX+this.dx - (this.width / 2), centerY+this.dy - (this.height / 2),this.width,this.height);
        tempContext.drawImage(this.img, centerX+this.dx - (this.width / 2), centerY+this.dy - (this.height / 2),this.width,this.height);
        const imageData = tempContext.getImageData(centerX+this.dx - (this.width / 2), centerY+this.dy - (this.height / 2),this.width,this.height); // get the image array

        const red=imageData.data[pixelIndex];
        const green=imageData.data[pixelIndex+1];
        const blue=imageData.data[pixelIndex+2];
        const alpha=imageData.data[pixelIndex+3];

        // const pixel = new Pixel(red,green,blue,alpha)

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

export { GameImage }