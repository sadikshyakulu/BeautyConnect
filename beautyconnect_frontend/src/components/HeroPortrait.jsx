import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'

function disposeObject(object) {
  object.traverse(child => {
    child.geometry?.dispose()

    const materials = Array.isArray(child.material)
      ? child.material
      : child.material
        ? [child.material]
        : []

    materials.forEach(material => {
      Object.values(material).forEach(value => {
        if (value?.isTexture) value.dispose()
      })
      material.dispose()
    })
  })
}

export default function HeroPortrait() {
  const containerRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return undefined

    let isActive = true
    let animationFrame = 0
    let mixer = null
    let modelWidth = 5.2
    let modelHeight = 5.2
    let pointerYaw = 0
    let pointerPitch = 0
    let manualYaw = 0
    let manualPitch = 0
    let isDragging = false
    let lastPointerX = 0
    let lastPointerY = 0

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100)
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'low-power',
    })
    const modelFrame = new THREE.Group()
    const clock = new THREE.Clock()
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.15
    renderer.setClearColor(0x000000, 0)
    renderer.domElement.setAttribute('aria-hidden', 'true')
    renderer.domElement.setAttribute('role', 'presentation')
    container.appendChild(renderer.domElement)
    container.dataset.modelState = 'loading'

    scene.add(new THREE.HemisphereLight(0xfff0e5, 0x443432, 2.5))

    const keyLight = new THREE.DirectionalLight(0xffe6d2, 3.4)
    keyLight.position.set(-3, 4, 5)
    scene.add(keyLight)

    const fillLight = new THREE.DirectionalLight(0xffffff, 1.8)
    fillLight.position.set(4, 1, 4)
    scene.add(fillLight)

    const rimLight = new THREE.DirectionalLight(0xc97861, 2.2)
    rimLight.position.set(0, 3, -4)
    scene.add(rimLight)

    scene.add(modelFrame)

    const updateCamera = () => {
      const bounds = container.getBoundingClientRect()
      if (!bounds.width || !bounds.height) return

      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
      renderer.setSize(bounds.width, bounds.height, false)
      camera.aspect = bounds.width / bounds.height
      camera.updateProjectionMatrix()

      const halfFov = THREE.MathUtils.degToRad(camera.fov / 2)
      const verticalDistance = modelHeight / (2 * Math.tan(halfFov))
      const horizontalDistance = modelWidth / (2 * Math.tan(halfFov) * camera.aspect)
      camera.position.set(0, 0, Math.max(verticalDistance, horizontalDistance) * 1.12)
      camera.lookAt(0, 0, 0)
    }

    const resizeObserver = new ResizeObserver(updateCamera)
    resizeObserver.observe(container)
    updateCamera()

    const onPointerDown = event => {
      if (event.pointerType === 'mouse' && event.button !== 0) return

      isDragging = true
      lastPointerX = event.clientX
      lastPointerY = event.clientY
      container.classList.add('is-dragging')
      container.setPointerCapture(event.pointerId)
    }

    const onPointerMove = event => {
      if (isDragging) {
        manualYaw = (manualYaw + (event.clientX - lastPointerX) * 0.008) % (Math.PI * 2)
        manualPitch = THREE.MathUtils.clamp(manualPitch + (event.clientY - lastPointerY) * 0.004, -0.3, 0.3)
        lastPointerX = event.clientX
        lastPointerY = event.clientY
        return
      }

      if (event.pointerType === 'mouse') {
        const bounds = container.getBoundingClientRect()
        pointerYaw = ((event.clientX - bounds.left) / bounds.width - 0.5) * 0.12
        pointerPitch = ((event.clientY - bounds.top) / bounds.height - 0.5) * -0.06
      }
    }

    const onPointerUp = event => {
      isDragging = false
      pointerYaw = 0
      pointerPitch = 0
      container.classList.remove('is-dragging')
      if (container.hasPointerCapture(event.pointerId)) {
        container.releasePointerCapture(event.pointerId)
      }
    }

    const onPointerLeave = () => {
      if (isDragging) return
      pointerYaw = 0
      pointerPitch = 0
    }

    container.addEventListener('pointerdown', onPointerDown)
    container.addEventListener('pointermove', onPointerMove)
    container.addEventListener('pointerup', onPointerUp)
    container.addEventListener('pointercancel', onPointerUp)
    container.addEventListener('pointerleave', onPointerLeave)

    new GLTFLoader().load(
      '/beauty-portrait.glb',
      gltf => {
        if (!isActive) {
          disposeObject(gltf.scene)
          return
        }

        const model = gltf.scene
        const bounds = new THREE.Box3().setFromObject(model)
        const size = bounds.getSize(new THREE.Vector3())
        const center = bounds.getCenter(new THREE.Vector3())
        const scale = 5.2 / Math.max(size.x, size.y, 0.001)

        model.scale.setScalar(scale)
        model.position.set(-center.x * scale, -center.y * scale, -center.z * scale)
        modelFrame.add(model)

        modelWidth = size.x * scale
        modelHeight = size.y * scale
        updateCamera()
        container.dataset.modelState = 'loaded'

        if (!reducedMotion && gltf.animations.length) {
          mixer = new THREE.AnimationMixer(model)
          gltf.animations.forEach(clip => mixer.clipAction(clip).play())
        }
      },
      undefined,
      () => {
        if (isActive) container.dataset.modelState = 'error'
      },
    )

    const renderFrame = () => {
      if (!isActive) return

      const delta = Math.min(clock.getDelta(), 0.05)
      const elapsed = clock.elapsedTime

      mixer?.update(delta)

      const idleYaw = reducedMotion ? 0 : Math.sin(elapsed * 0.24) * 0.12
      const targetYaw = manualYaw + pointerYaw + idleYaw
      const targetPitch = manualPitch + pointerPitch
      modelFrame.rotation.y += (targetYaw - modelFrame.rotation.y) * 0.035
      modelFrame.rotation.x += (targetPitch - modelFrame.rotation.x) * 0.035

      if (!reducedMotion) {
        modelFrame.position.y = Math.sin(elapsed * 0.7) * 0.025
      }

      renderer.render(scene, camera)
      animationFrame = window.requestAnimationFrame(renderFrame)
    }

    renderFrame()

    return () => {
      isActive = false
      window.cancelAnimationFrame(animationFrame)
      resizeObserver.disconnect()
      container.removeEventListener('pointerdown', onPointerDown)
      container.removeEventListener('pointermove', onPointerMove)
      container.removeEventListener('pointerup', onPointerUp)
      container.removeEventListener('pointercancel', onPointerUp)
      container.removeEventListener('pointerleave', onPointerLeave)
      container.classList.remove('is-dragging')
      disposeObject(modelFrame)
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [])

  return <div className="hero-portrait-canvas" ref={containerRef} />
}