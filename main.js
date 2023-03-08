import * as dat from 'dat.gui'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'

import './style.css'

import { CustomPass } from './CustomPass'
import t1 from './img/1.jpg'
import t2 from './img/2.jpg'
import t3 from './img/3.jpg'
import fragment from './shader/fragment.glsl'
import vertex from './shader/vertex.glsl'

export default class Sketch {
    constructor(options) {
        this.scene = new THREE.Scene()

        this.urls = [t1, t2, t3]
        this.textures = this.urls.map((url) => new THREE.TextureLoader().load(url))

        this.container = options.dom
        this.width = this.container.offsetWidth
        this.height = this.container.offsetHeight
        this.renderer = new THREE.WebGLRenderer()
        this.renderer.setPixelRatio(window.devicePixelRatio)
        this.renderer.setSize(this.width, this.height)
        this.renderer.setClearColor(0x141414, 1)
        this.renderer.outputEncoding = THREE.sRGBEncoding

        this.container.appendChild(this.renderer.domElement)

        this.camera = new THREE.PerspectiveCamera(
            70,
            window.innerWidth / window.innerHeight,
            0.001,
            1000
        )

        this.camera.position.set(1.377324613945763, -0.02874848137823341, 20.9857456502165847)
        this.zoomSpeed = 0.01

        window.addEventListener('mousewheel', () => {
            console.log(this.camera.position)
        })

        this.controls = new OrbitControls(this.camera, this.renderer.domElement)
        this.time = 0

        this.isPlaying = true

        this.initPost()

        this.addObjects()
        this.render()
        // this.setupResize();
        this.settings()
    }

    initPost() {
        // postprocessing

        this.composer = new EffectComposer(this.renderer)
        this.composer.addPass(new RenderPass(this.scene, this.camera))

        this.effect1 = new ShaderPass(CustomPass)
        this.composer.addPass(this.effect1)

        // const effect2 = new ShaderPass(RGBShiftShader);
        // effect2.uniforms['amount'].value = 0.0015;
        // this.composer.addPass(effect2);
    }

    settings() {
        // let that = this
        this.settings = {
            progress: 1,
            scale: 0.779,
            timeChange: 0.4,
            cosChange: 1.07,
        }
        // this.gui = new dat.GUI()
        // this.gui.add(this.settings, 'progress', 0, 1, 0.01)
        // this.gui.add(this.settings, 'scale', 0, 2, 0.001)
        // this.gui.add(this.settings, 'cosChange', 0, 10, 0.001)
        // this.gui.add(this.settings, 'timeChange', 0, 10, 0.001)
    }

    setupResize() {
        window.addEventListener('resize', () => {
            //Update Size
            sizes.width = window.innerWidth;
            sizes.height = window.innerHeight;
            //Update Camera
            camera.aspect = sizes.width / sizes.height
            camera.updateProjectionMatrix()
            renderer.setSize(sizes.width, sizes.height)
        })
    }

    addObjects() {
        // let that = this
        this.material = new THREE.ShaderMaterial({
            extensions: {
                derivatives: '#extension GL_OES_standard_derivatives : enable',
            },
            side: THREE.DoubleSide,
            uniforms: {
                time: { type: 'f', value: 0 },
                uTexture: { value: this.textures[0] },
                resolution: { type: 'v4', value: new THREE.Vector4() },
                uvRate1: {
                    value: new THREE.Vector2(1, 1),
                },
            },
            // wireframe: true,
            // transparent: true,
            vertexShader: vertex,
            fragmentShader: fragment,
        })

        this.geometry = new THREE.PlaneGeometry(1.9 / 2, 1 / 2, 1, 1)

        this.meshes = []

        this.textures.forEach((t, i) => {
            let m = this.material.clone()
            m.uniforms.uTexture.value = t
            let mesh = new THREE.Mesh(this.geometry, m)
            this.scene.add(mesh)
            this.meshes.push(mesh)
            mesh.position.x = i - 1
            // mesh.position.y = -1;
        })
    }

    render() {
        this.meshes.forEach((m) => {
            // m.position.y = -this.settings.progress;
            m.position.z = (this.settings.progress * Math.PI) / 2
        })
        this.time += 0.01
        this.material.uniforms.time.value = this.time

        this.effect1.uniforms['time'].value = this.time
        this.effect1.uniforms['progress'].value = this.settings.progress
        this.effect1.uniforms['scale'].value = this.settings.scale
        this.effect1.uniforms['timeChange'].value = this.settings.timeChange
        this.effect1.uniforms['cosChange'].value = this.settings.cosChange
        requestAnimationFrame(this.render.bind(this))
        // this.renderer.render(this.scene, this.camera);
        this.composer.render()
    }
}

new Sketch({
    dom: document.getElementById('container'),
})
