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
    draggable = undefined
    stationary = undefined      //can use draggable function call, but will stay put

    onClick = []    //[[callback,attrs],...]
    onDrag = []    //[[callback,attrs],...]
    onFinishDragging = []    //[[callback,attrs],...]

    shared = undefined      //object of shared values

    constructor(center,children,attrs={}) {
        this.name = attrs.name;
        this.center = center;

        for (const child of children) {
            this.addChild(child)
        }

        this.clickable = (attrs.clickable === undefined) ? false : attrs.clickable;
        this.draggable = (attrs.draggable === undefined) ? false : attrs.draggable;
        this.stationary = (attrs.stationary === undefined) ? false : attrs.stationary;
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
            if (obj.visible) {
                await obj.draw(ctx, this.center);
            }
        }
    }

    async animate() {
        this.children
            .filter(obj => obj.updateAnimation !== undefined)
            .forEach(obj=>obj.updateAnimation())
    }

    //checks if mouse position is within any of the drawables
    async isInside(mouse) {
        // if (!this.clickable) {
        //     return false
        // }

        for (const child of this.children) {
            const insideChild = await child.isInside(mouse, this.shared.tempContext, this.center)
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

    addOnDragListener(callback,attrs) {
        this.onDrag.push([callback,attrs])
    }

    addOnFinishDraggingListener(callback,attrs) {
        this.onFinishDragging.push([callback,attrs])
    }

    click() {
        for (const onClickElement of this.onClick) {
            onClickElement[0](onClickElement[1])
        }
    }

    drag(mousePos,delta) {
        if (!this.stationary) {
            this.center = Point(
                mousePos.x - delta.x,
                mousePos.y - delta.y
            )
        }

        for (const onDragElement of this.onDrag) {
            onDragElement[0](onDragElement[1])
        }
    }

    finishDragging() {
        for (const onFinishDraggingElement of this.onFinishDragging) {
            onFinishDraggingElement[0](onFinishDraggingElement[1])
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