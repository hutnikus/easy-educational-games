class GameGif {
    name = undefined;
    //relative level in parent GameElement
    level = undefined;
    //relative center pos in parent GameElement
    dx = undefined;
    dy = undefined;

    width = undefined;
    height = undefined;

    rotation = undefined; //in radians todo add rotation
    scale = undefined; //todo add scaling

    img = undefined;
    currentFrame = 0;
    imgData = undefined;    //json file with {name}_data.json as name

    //number of frames to skip, higher = slower animation
    stagger = undefined;
    stg = 0;

    constructor(name='',attrs={}) {
        this.name = attrs.name;
        this.level = (attrs.level === undefined) ? 0 : Number(attrs.level);
        this.dx = (attrs.dx === undefined) ? 0 : Number(attrs.dx);
        this.dy = (attrs.dy === undefined) ? 0 : Number(attrs.dy);
        this.rotation = (attrs.rotation === undefined) ? 0 : Number(attrs.rotation);
        this.stagger = (attrs.stagger === undefined) ? 0 : Number(attrs.stagger);

        this.url = `resources/${name}_sheet.png`

        this.imgData = fetch(`resources/${name}_data.json`).then(response => {
            return response.json()
        }) //.then(jsondata => console.log(jsondata))

        this.img = loadImage(this.url)



        this.width = attrs.width;
        this.height = attrs.height;

        //todo add loading from url
    }

    async updateAnimation() {
        if (this.stg === this.stagger) {
            this.currentFrame += 1;
            if (this.currentFrame >= this.imgData.frame_count) {
                this.currentFrame = 0;
            }
            this.stg = 0;
        } else {
            this.stg += 1;
        }
    }

    async draw(ctx,centerX,centerY) {
        let fw = this.imgData.frame_width
        let fh = this.imgData.frame_height
        if (this.width !== undefined && this.height !== undefined) {
            ctx.save()
            ctx.translate(centerX+this.dx,centerY+this.dy)
            ctx.rotate(this.rotation)
            ctx.drawImage(
                this.img,
                this.currentFrame * fw, 0, fw, fh,
                -(this.width / 2), -(this.height / 2),this.width,this.height
            );
            ctx.restore()
        } else {
            if (this.width === undefined) {
                this.width = fw
            }
            if (this.height === undefined) {
                this.height = fh
            }
            await this.draw(ctx, centerX, centerY)
        }
    }

    isInside(centeredMouse, tempContext, centerX, centerY) {
        if (tempContext === undefined)
            return false

        centeredMouse.x -= this.dx
        centeredMouse.y -= this.dy

        let fw = this.imgData.frame_width
        let fh = this.imgData.frame_height

        let rotatedX = ((centeredMouse.x) * Math.cos(-this.rotation) - (centeredMouse.y) * Math.sin(-this.rotation)) + this.width/2;
        let rotatedY = ((centeredMouse.y) * Math.cos(-this.rotation) + (centeredMouse.x) * Math.sin(-this.rotation)) + this.height/2;

        if (rotatedX > this.width || rotatedX < 0 || rotatedY > this.height || rotatedY < 0)
            return false

        const pixelIndex = Math.floor(rotatedX) * 4 + Math.floor(rotatedY) * 4 * Math.floor(this.width)

        tempContext.clearRect(centerX+this.dx - (this.width / 2), centerY+this.dy - (this.height / 2),this.width,this.height);
        tempContext.drawImage(
            this.img,
            this.currentFrame * fw, 0, fw, fh,
            centerX+this.dx - (this.width / 2), centerY+this.dy - (this.height / 2),this.width,this.height);
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

// module.exports = GameGif

export { GameGif }