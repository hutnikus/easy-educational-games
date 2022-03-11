import {Point} from "./Misc.js";

/**
 * GameHibox class. Used for collision detection
 *
 * @property {Point} delta Deviation from center point of parent Element
 * @property {number} r Radius of the hitbox circle
 */
class GameHitbox {
    /**
     * Constructor for GameHibox
     * @param r     Radius of the circle
     * @param {number} dx Horizontal deviation from center of the element
     * @param {number} dy Vertical deviation from center of the element
     */
    constructor(r,dx=0,dy=0, ) {
        if (r <= 0) {
            throw "Hitbox needs a valid radius"
        }
        this.r = r
        this.delta = new Point(
            (dx === undefined) ? 0 : Number(dx),
            (dy === undefined) ? 0 : Number(dy),
        )
    }

    /**
     * Draw function for the hitbox. Draws a coloured circle
     * @param {CanvasRenderingContext2D} ctx Context on which the hitbox is drawn
     * @param {Point} center Center of the parent Element
     */
    draw(ctx, center) {
        ctx.strokeStyle = 'red'
        ctx.lineWidth = 5
        ctx.beginPath();
        const p = this.delta.copy()
        ctx.ellipse(p.x,p.y,this.r,this.r,0,0,2*Math.PI);

        ctx.strokeStyle = 'red'
        ctx.lineWidth = 4
        ctx.stroke()
        ctx.strokeStyle = 'green'
        ctx.lineWidth = 2
        ctx.stroke()
    }

    /**
     * Creates new instance with identical attributes
     * @returns {GameHitbox} Copy of this instance
     */
    copy() {
        return new GameHitbox(this.r,this.delta.x,this.delta.y)
    }
}

export {GameHitbox}