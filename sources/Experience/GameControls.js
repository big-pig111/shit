import * as THREE from 'three'
import Experience from './Experience.js'

export default class GameControls
{
    constructor()
    {
        this.experience = new Experience()
        this.config = this.experience.config
        this.time = this.experience.time
        this.input = this.experience.input
        this.scene = this.experience.scene

        // 游戏主体对象
        this.player = null
        this.playerSpeed = 5
        this.playerRotationSpeed = 0.05

        // 移动状态
        this.moveState = {
            forward: false,
            backward: false,
            left: false,
            right: false,
            up: false,
            down: false
        }

        // 旋转状态
        this.rotationState = {
            pitch: 0,  // 俯仰角
            yaw: 0,    // 偏航角
            roll: 0    // 翻滚角
        }

        this.setPlayer()
        this.setControls()
    }

    setPlayer()
    {
        // 创建玩家对象（可以是一个简单的立方体或加载的模型）
        const geometry = new THREE.BoxGeometry(1, 1, 1)
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 })
        this.player = new THREE.Mesh(geometry, material)
        this.player.position.set(0, 0, 0)
        this.scene.add(this.player)

        // 创建玩家方向指示器
        const arrowGeometry = new THREE.ConeGeometry(0.2, 0.5, 8)
        const arrowMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 })
        this.playerArrow = new THREE.Mesh(arrowGeometry, arrowMaterial)
        this.playerArrow.position.set(0, 0.8, 0)
        this.player.add(this.playerArrow)
    }

    setControls()
    {
        // 键盘控制
        this.input.on('keydown', (event) => {
            this.handleKeyDown(event)
        })

        this.input.on('keyup', (event) => {
            this.handleKeyUp(event)
        })

        // 鼠标控制（第一人称视角）
        this.input.on('mousemove', (event) => {
            this.handleMouseMove(event)
        })

        // 触摸控制（移动端）
        this.input.on('touchmove', (event) => {
            this.handleTouchMove(event)
        })
    }

    handleKeyDown(event)
    {
        switch(event.code) {
            case 'KeyW':
            case 'ArrowUp':
                this.moveState.forward = true
                break
            case 'KeyS':
            case 'ArrowDown':
                this.moveState.backward = true
                break
            case 'KeyA':
            case 'ArrowLeft':
                this.moveState.left = true
                break
            case 'KeyD':
            case 'ArrowRight':
                this.moveState.right = true
                break
            case 'KeyQ':
            case 'Space':
                this.moveState.up = true
                break
            case 'KeyE':
            case 'ShiftLeft':
                this.moveState.down = true
                break
        }
    }

    handleKeyUp(event)
    {
        switch(event.code) {
            case 'KeyW':
            case 'ArrowUp':
                this.moveState.forward = false
                break
            case 'KeyS':
            case 'ArrowDown':
                this.moveState.backward = false
                break
            case 'KeyA':
            case 'ArrowLeft':
                this.moveState.left = false
                break
            case 'KeyD':
            case 'ArrowRight':
                this.moveState.right = false
                break
            case 'KeyQ':
            case 'Space':
                this.moveState.up = false
                break
            case 'KeyE':
            case 'ShiftLeft':
                this.moveState.down = false
                break
        }
    }

    handleMouseMove(event)
    {
        // 只在按住鼠标右键时进行视角控制
        if (this.input.isMousePressed('right')) {
            const delta = this.input.getMouseDelta()
            
            // 水平旋转（偏航）
            this.rotationState.yaw -= delta.x * 0.002
            
            // 垂直旋转（俯仰）
            this.rotationState.pitch -= delta.y * 0.002
            
            // 限制俯仰角度
            this.rotationState.pitch = Math.max(-Math.PI/2, Math.min(Math.PI/2, this.rotationState.pitch))
        }
    }

    handleTouchMove(event)
    {
        // 触摸控制
        const delta = this.input.getTouchDelta()
        
        // 水平旋转
        this.rotationState.yaw -= delta.x * 0.005
        
        // 垂直旋转
        this.rotationState.pitch -= delta.y * 0.005
        
        // 限制俯仰角度
        this.rotationState.pitch = Math.max(-Math.PI/2, Math.min(Math.PI/2, this.rotationState.pitch))
    }

    update()
    {
        if (!this.player) return

        // 更新移动
        this.updateMovement()
        
        // 更新旋转
        this.updateRotation()
        
        // 重置增量值
        this.input.resetMouseDelta()
        this.input.resetTouchDelta()
    }

    updateMovement()
    {
        const deltaTime = this.time.delta * 0.001
        const moveSpeed = this.playerSpeed * deltaTime

        // 获取玩家当前方向
        const forward = new THREE.Vector3(0, 0, -1)
        const right = new THREE.Vector3(1, 0, 0)
        const up = new THREE.Vector3(0, 1, 0)

        // 应用旋转到方向向量
        forward.applyQuaternion(this.player.quaternion)
        right.applyQuaternion(this.player.quaternion)

        // 计算移动向量
        const moveVector = new THREE.Vector3()

        if (this.moveState.forward) {
            moveVector.add(forward.clone().multiplyScalar(moveSpeed))
        }
        if (this.moveState.backward) {
            moveVector.add(forward.clone().multiplyScalar(-moveSpeed))
        }
        if (this.moveState.left) {
            moveVector.add(right.clone().multiplyScalar(-moveSpeed))
        }
        if (this.moveState.right) {
            moveVector.add(right.clone().multiplyScalar(moveSpeed))
        }
        if (this.moveState.up) {
            moveVector.add(up.clone().multiplyScalar(moveSpeed))
        }
        if (this.moveState.down) {
            moveVector.add(up.clone().multiplyScalar(-moveSpeed))
        }

        // 应用移动
        this.player.position.add(moveVector)
    }

    updateRotation()
    {
        // 应用旋转
        this.player.rotation.set(
            this.rotationState.pitch,
            this.rotationState.yaw,
            this.rotationState.roll
        )
    }

    // 获取玩家位置
    getPlayerPosition()
    {
        return this.player ? this.player.position.clone() : new THREE.Vector3()
    }

    // 获取玩家旋转
    getPlayerRotation()
    {
        return this.player ? this.player.rotation.clone() : new THREE.Euler()
    }

    // 设置玩家位置
    setPlayerPosition(position)
    {
        if (this.player) {
            this.player.position.copy(position)
        }
    }

    // 设置玩家旋转
    setPlayerRotation(rotation)
    {
        if (this.player) {
            this.player.rotation.copy(rotation)
            this.rotationState.pitch = rotation.x
            this.rotationState.yaw = rotation.y
            this.rotationState.roll = rotation.z
        }
    }

    // 设置玩家速度
    setPlayerSpeed(speed)
    {
        this.playerSpeed = speed
    }

    // 设置旋转速度
    setRotationSpeed(speed)
    {
        this.playerRotationSpeed = speed
    }

    destroy()
    {
        if (this.player) {
            this.scene.remove(this.player)
        }
    }
}
