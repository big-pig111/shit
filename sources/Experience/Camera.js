import * as THREE from 'three'
import Experience from './Experience.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

export default class Camera
{
    constructor(_options)
    {
        // Options
        this.experience = new Experience()
        this.config = this.experience.config
        this.debug = this.experience.debug
        this.time = this.experience.time
        this.sizes = this.experience.sizes
        this.targetElement = this.experience.targetElement
        this.scene = this.experience.scene

        // Set up
        this.mode = 'default' // defaultCamera \ debugCamera

        this.setInstance()
        this.setModes()
    }

    setInstance()
    {
        // Set up
        this.instance = new THREE.PerspectiveCamera(25, this.config.width / this.config.height, 0.1, 150)
        this.instance.rotation.reorder('YXZ')

        this.scene.add(this.instance)
    }

    setModes()
    {
        this.modes = {}

        // Default
        this.modes.default = {}
        this.modes.default.instance = this.instance.clone()
        this.modes.default.instance.rotation.reorder('YXZ')

        // Debug
        this.modes.debug = {}
        this.modes.debug.instance = this.instance.clone()
        this.modes.debug.instance.rotation.reorder('YXZ')
        this.modes.debug.instance.position.set(5, 5, 5)
        
        this.modes.debug.orbitControls = new OrbitControls(this.modes.debug.instance, this.targetElement)
        this.modes.debug.orbitControls.enabled = true
        this.modes.debug.orbitControls.screenSpacePanning = true
        this.modes.debug.orbitControls.enableKeys = false
        this.modes.debug.orbitControls.zoomSpeed = 0.25
        this.modes.debug.orbitControls.enableDamping = true
        this.modes.debug.orbitControls.update()

        // 添加键盘切换相机模式
        this.setKeyboardControls()
    }

    setKeyboardControls()
    {
        // 按C键切换相机模式
        if (this.experience.input) {
            this.experience.input.on('keydown', (event) => {
                if (event.code === 'KeyC') {
                    this.toggleMode()
                }
            })
        }
    }

    toggleMode()
    {
        this.mode = this.mode === 'default' ? 'debug' : 'default'
        console.log(`Camera mode switched to: ${this.mode}`)
    }


    resize()
    {
        this.instance.aspect = this.config.width / this.config.height
        this.instance.updateProjectionMatrix()

        this.modes.default.instance.aspect = this.config.width / this.config.height
        this.modes.default.instance.updateProjectionMatrix()

        this.modes.debug.instance.aspect = this.config.width / this.config.height
        this.modes.debug.instance.updateProjectionMatrix()
    }

    update()
    {
        // Update debug orbit controls
        this.modes.debug.orbitControls.update()

        // 如果存在游戏控制，让相机跟随玩家
        if (this.experience.gameControls && this.mode === 'default') {
            const playerPosition = this.experience.gameControls.getPlayerPosition()
            const playerRotation = this.experience.gameControls.getPlayerRotation()
            
            // 相机位置：玩家位置 + 偏移
            this.instance.position.copy(playerPosition)
            this.instance.position.y += 1.6 // 眼睛高度
            
            // 相机旋转：跟随玩家旋转
            this.instance.rotation.copy(playerRotation)
        } else {
            // 应用坐标
            this.instance.position.copy(this.modes[this.mode].instance.position)
            this.instance.quaternion.copy(this.modes[this.mode].instance.quaternion)
        }
        
        this.instance.updateMatrixWorld() // To be used in projection
    }

    destroy()
    {
        this.modes.debug.orbitControls.destroy()
    }
}
