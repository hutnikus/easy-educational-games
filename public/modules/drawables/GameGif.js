import {GameDrawable,loadImage} from "./GameDrawable.js";

class GameGif extends GameDrawable {
    // {name}_sheet.png generated from python
    img = undefined;

    currentFrame = 0;
    imgData = undefined;    //json file with {name}_data.json as name
    stagger = undefined;    // number of frames to skip, higher = slower animation
    stg = 0;                // variable of currently skipped frames

    constructor(gifName,attrs={}) {
        super(attrs)
        this.stagger = (attrs.stagger === undefined) ? 0 : Number(attrs.stagger);

        if (gifName === undefined) {
            this.imgData = attrs.imgData
            this.img = attrs.img
            return
        }

        const url = `resources/${gifName}_sheet.png`

        //load data from ${gifName}_data.json
        this.imgData = fetch(`resources/${gifName}_data.json`).then(response => {
            return response.json()
        }) //.then(jsondata => console.log(jsondata))

        this.img = loadImage(url)
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

    async drawFunction(ctx) {
        let fw = this.imgData.frame_width
        let fh = this.imgData.frame_height
        ctx.drawImage(
            await this.img,
            this.currentFrame * fw, 0, fw, fh,
            -(this.width / 2), -(this.height / 2),this.width,this.height
        );
    }

    async draw(ctx,center) {
        let fw = this.imgData.frame_width
        let fh = this.imgData.frame_height
        if (this.width !== undefined && this.height !== undefined) {
            await super.draw(ctx,center,this)
        } else {
            if (this.width === undefined) {
                this.width = fw
            }
            if (this.height === undefined) {
                this.height = fh
            }
            await this.draw(ctx, center)
        }
    }

    async isInside(mouse, tempContext, center) {
        const drawFunction = async function (ctx, attrs) {
            await attrs.obj.draw(ctx,attrs.center)
        }
        const drawAttrs = {
            obj: this,
            center: center
        }
        return await super.isInside(mouse, tempContext, drawFunction, drawAttrs)
    }

    getAttrs() {
        return Object.assign({
            img : this.img,
            currentFrame : 0,
            imgData : this.imgData,
            stagger : this.stagger,
            stg : 0,
        },super.getAttrs())
    }

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