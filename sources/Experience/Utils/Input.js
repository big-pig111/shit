import EventEmitter from './EventEmitter.js'

export default class Input extends EventEmitter
{
    constructor()
    {
        super()

        this.keys = {}
        this.mouse = {
            x: 0,
            y: 0,
            deltaX: 0,
            deltaY: 0,
            leftButton: false,
            rightButton: false,
            middleButton: false
        }

        this.touch = {
            touches: [],
            deltaX: 0,
            deltaY: 0
        }

        this.setKeyboardListeners()
        this.setMouseListeners()
        this.setTouchListeners()
    }

    setKeyboardListeners()
    {
        // 键盘按下
        window.addEventListener('keydown', (event) => {
            this.keys[event.code] = true
            this.trigger('keydown', event)
        })

        // 键盘释放
        window.addEventListener('keyup', (event) => {
            this.keys[event.code] = false
            this.trigger('keyup', event)
        })
    }

    setMouseListeners()
    {
        // 鼠标移动
        window.addEventListener('mousemove', (event) => {
            const previousX = this.mouse.x
            const previousY = this.mouse.y

            this.mouse.x = event.clientX
            this.mouse.y = event.clientY
            this.mouse.deltaX = event.clientX - previousX
            this.mouse.deltaY = event.clientY - previousY

            this.trigger('mousemove', event)
        })

        // 鼠标按下
        window.addEventListener('mousedown', (event) => {
            if (event.button === 0) this.mouse.leftButton = true
            if (event.button === 1) this.mouse.middleButton = true
            if (event.button === 2) this.mouse.rightButton = true

            this.trigger('mousedown', event)
        })

        // 鼠标释放
        window.addEventListener('mouseup', (event) => {
            if (event.button === 0) this.mouse.leftButton = false
            if (event.button === 1) this.mouse.middleButton = false
            if (event.button === 2) this.mouse.rightButton = false

            this.trigger('mouseup', event)
        })

        // 鼠标滚轮
        window.addEventListener('wheel', (event) => {
            this.trigger('wheel', event)
        })
    }

    setTouchListeners()
    {
        // 触摸开始
        window.addEventListener('touchstart', (event) => {
            this.touch.touches = Array.from(event.touches)
            this.trigger('touchstart', event)
        })

        // 触摸移动
        window.addEventListener('touchmove', (event) => {
            if (this.touch.touches.length > 0) {
                const currentTouch = event.touches[0]
                const previousTouch = this.touch.touches[0]
                
                this.touch.deltaX = currentTouch.clientX - previousTouch.clientX
                this.touch.deltaY = currentTouch.clientY - previousTouch.clientY
            }
            
            this.touch.touches = Array.from(event.touches)
            this.trigger('touchmove', event)
        })

        // 触摸结束
        window.addEventListener('touchend', (event) => {
            this.touch.touches = Array.from(event.touches)
            this.trigger('touchend', event)
        })
    }

    // 检查按键是否按下
    isKeyPressed(keyCode)
    {
        return this.keys[keyCode] || false
    }

    // 检查鼠标按钮是否按下
    isMousePressed(button = 'left')
    {
        switch(button) {
            case 'left': return this.mouse.leftButton
            case 'right': return this.mouse.rightButton
            case 'middle': return this.mouse.middleButton
            default: return false
        }
    }

    // 获取鼠标位置
    getMousePosition()
    {
        return { x: this.mouse.x, y: this.mouse.y }
    }

    // 获取鼠标移动增量
    getMouseDelta()
    {
        return { x: this.mouse.deltaX, y: this.mouse.deltaY }
    }

    // 重置鼠标增量（每帧调用一次）
    resetMouseDelta()
    {
        this.mouse.deltaX = 0
        this.mouse.deltaY = 0
    }

    // 重置触摸增量
    resetTouchDelta()
    {
        this.touch.deltaX = 0
        this.touch.deltaY = 0
    }

    destroy()
    {
        window.removeEventListener('keydown', this.setKeyboardListeners)
        window.removeEventListener('keyup', this.setKeyboardListeners)
        window.removeEventListener('mousemove', this.setMouseListeners)
        window.removeEventListener('mousedown', this.setMouseListeners)
        window.removeEventListener('mouseup', this.setMouseListeners)
        window.removeEventListener('wheel', this.setMouseListeners)
        window.removeEventListener('touchstart', this.setTouchListeners)
        window.removeEventListener('touchmove', this.setTouchListeners)
        window.removeEventListener('touchend', this.setTouchListeners)
    }
}
