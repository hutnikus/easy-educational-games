import {Point} from "./Misc.js";

class GameElement {
    name = undefined;

    //relative to parent game object
    level = undefined;

    //centered coordinates
    center = undefined;

    //everything drawable
    children = []

    clickable = undefined

    onClick = []

    constructor(x,y,children,attrs={}) {
        this.name = attrs.name;
        this.center = Point(x,y);

        for (const child of children) {
            this.addChild(child)
        }

        this.clickable = (attrs.clickable === undefined) ? true : attrs.clickable;
        this.level = (attrs.level === undefined) ? 0 : Number(attrs.level);
    }

    addChild(child,sort=true) {
        const nameIsUsed = this.children.filter(c => c.name === child.name && child.name !== undefined).length > 0
        if (nameIsUsed) {
            throw `used name "${child.name}"`;
        }
        this.children.push(child)
        if (sort) {
            this.children = this.children.sort(((a, b) => a.level - b.level))
        }
    }

    getChildByName(name) {
        let child = this.children.filter(child => child.name === name)
        if (child.length === 0) {
            throw `No child of ${this} has name:${name}`
        } else if (child.length > 1) {
            throw `There are multiple children with name:${name} in ${this}`
        }
        return child[0]
    }

    //draws every child
    async draw(ctx) {
        //wait for loading all images
        for (const e of this.children) {
            e.img = await e.img
            e.imgData = await e.imgData
        }

        for (const obj of this.children) {
            await obj.draw(ctx, this.center);
        }
    }

    async animate() {
        this.children
            .filter(obj => obj.updateAnimation !== undefined)
            .forEach(obj=>obj.updateAnimation())
    }

    //checks if mouse position is within any of the drawables
    async isInside(mouse, tempContext) {
        if (!this.clickable) {
            return false
        }

        for (const child of this.children) {
            const insideChild = await child.isInside(mouse, tempContext, this.center)
            // console.log('inside child',insideChild, child)
            if (insideChild) {
                // console.error("was inside", child)
                return true;
            }
        }
        return false;
    }

    addOnClickListener(callback,attrs) {
        this.onClick.push([callback,attrs])
    }

    click() {
        for (const onClickElement of this.onClick) {
            onClickElement[0](onClickElement[1])
        }
    }

    copy() {
        return new GameElement(
            this.center.x,this.center.y,
            this.children
        )
    }
}

// module.exports = GameElement

export { GameElement }