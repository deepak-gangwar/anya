import { _getClosest } from "../utils/math"
import { number } from "../utils/math"
import { lerp } from "../utils/math"

export default class Slider {
  constructor(options = {}) {
    this.bind()
    
    this.opts = {
      el: options.el || '.js-slider',
      ease: options.ease || 0.1,
      speed: options.speed || 1.5,
      velocity: 25,
      scroll: options.scroll || false
    }
    
    this.slider = document.querySelector('.js-slider')
    this.sliderInner = this.slider.querySelector('.js-slider__inner')
    this.slides = [...this.slider.querySelectorAll('.js-slide')]
    this.slidesNumb = 0

    this.sliderHeight = 0
    this.originalSliderHeight = 0

    this.clonesHeight = 0
    this.clones = []
    this.scrollPos;
    
    this.rAF = undefined
    
    // this.sliderWidth = 0
    
    this.onY = 0
    this.offY = 0
    
    this.currentY = 0
    this.lastY = 0
    
    this.min = 0
    this.max = 0

    this.centerY = window.innerHeight / 2
  }
  
  bind() {
    ['getPos', 'setPos', 'clone', 'update', 'on', 'off', 'resize']
      .forEach((fn) => this[fn] = this[fn].bind(this))
  }
  
  setBounds() {
    const bounds = this.slides[0].getBoundingClientRect()
    const slideHeight = bounds.height
    
    this.clonesHeight = this.getClonesHeight()
    
    this.slidesNumb = this.slides.length
    console.log(this.slidesNumb)
    this.sliderHeight = this.slidesNumb * slideHeight
    this.max = -(this.sliderHeight - window.innerHeight)
    
    this.slides.forEach((slide, index) => {
      slide.style.top = `${index * slideHeight}px`
    })
  }

  getPos() {
    return this.sliderInner.getBoundingClientRect().top
  }
  
  setPos(e) {
    if (!this.isDragging) return
    this.currentY = this.offY + ((e.clientY - this.onY) * this.opts.speed)
    this.clamp()
  }

  clamp() {
    this.currentY = Math.max(Math.min(this.currentY, this.min), this.max)
  }

  clone() {
    this.slides.forEach(slide => {
      let clone = slide.cloneNode(true)
      clone.classList.add('clone')

      this.sliderInner.appendChild(clone)
      this.clones.push(clone)
      this.slides.push(clone)
    })
  }

  getClonesHeight() {
    let height = 0
    this.clones.forEach(clone => {
      height += clone.offsetHeight
    })
    return height;
  }

  update() {
    this.lastY = lerp(this.lastY, this.currentY, this.opts.ease)
    this.lastY = Math.floor(this.lastY * 100) / 100 
    
    const sd = this.currentY - this.lastY
    const acc = sd / window.innerHeight
    let velo =+ acc
    
    this.sliderInner.style.transform = `translate3d(0, ${this.lastY}px, 0)`
    
    this.requestAnimationFrame()
  }
  
  on(e) {
    this.isDragging = true
    this.onY = e.clientY
    this.slider.classList.add('is-grabbing')
  }
  
  off(e) {
    this.snap()
    this.isDragging = false
    this.offY = this.currentY
    this.slider.classList.remove('is-grabbing')
  }
  
  closest() {
    const numbers = []
    this.slides.forEach((slide, index) => {
      const bounds = slide.getBoundingClientRect()
      const diff = this.currentY - this.lastY
      const center = (bounds.y + diff) + (bounds.height / 2)
      const fromCenter = this.centerY - center
      numbers.push(fromCenter)
    })

    let closest = number(0, numbers)
    closest = numbers[closest]
    
    return {
      closest
    }
  }

  snap() {
    const { closest } = this.closest()
    
    this.currentY = this.currentY + closest
    this.clamp()
  }

  requestAnimationFrame() {
    this.rAF = requestAnimationFrame(this.update)
  }

  cancelAnimationFrame() {
    cancelAnimationFrame(this.rAF)
  }
  
  addEventListeners() {
    this.update()
    
    this.slider.addEventListener('mousemove', this.setPos, { passive: true })
    this.slider.addEventListener('mousedown', this.on, false)
    this.slider.addEventListener('mouseup', this.off, false)
    
    window.addEventListener('resize', this.resize, false)
  }
  
  removeEventListeners() {
    this.cancelAnimationFrame(this.rAF)
    
    this.slider.removeEventListener('mousemove', this.setPos, { passive: true })
    this.slider.removeEventListener('mousedown', this.on, false)
    this.slider.removeEventListener('mouseup', this.off, false)
  }
  
  resize() {
    this.setBounds()
  }
  
  destroy() {
    this.removeEventListeners()
    
    this.opts = {}
  }
  
  init() {
    this.clone()
    this.setBounds()
    this.addEventListeners()
  }
}
