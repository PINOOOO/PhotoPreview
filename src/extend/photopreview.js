import AlloyFinger from 'alloyfinger'

class preview {
  constructor (options) {
    // 基础信息
    this.previewDom = null // .preview DOM
    this.previewCardDom = null // .preview-card DOM
    this.previewMaskDom = null // .preview-mask DOM
    this.previewImageDom = null // .preview-image DOM
    this.finger = null // 记录已注册的alloyfinger
    this.isSingle = options && options.mode ? options.mode === 'single' : true // 是否为单张预览
    this.close = this.close.bind(this) // 关闭preview
    this.thumb = {}  // 当前变化小图的信息 
    this.originY = null // 当前居中离顶部的高度
    this.currentMove = 0  // 多图模式下 .preview-list当前向右移动的距离
    this.innerWidth = 0

    // 手势所需信息
    this.startX = this.startY = this.scaleStartX = this.scaleStartY = null
    this.isMoving = false // 判断是否单指正在移动中
    this.leaveHight = 200 // 设置上下滑离开的最小高度
    this.type = '' // 当前操作的手势状态
    this.fingerNum = 1 // 当前获取到手指数量
    this.firstTouch = '' // 记录第一次双指按下的touches 和 img的信息
    this.timeoutId = '' 
    this.initialPinchLength = '' // 初始双指两点之间的距离
    this.initialBoundingRect = ''  // .preview-image中img的信息
    this.currentPinchLength = '' // 当前双指两点之间的距离
    this.config = {  // 双指记录信息
      scale: 1,
      translateX: 0,
      translateY: 0,
      maxScale: 3,
      minScale: 1,
      transitionDuration: 400
    }

    if (!this.isSingle && (!options.imgList || options.imgList.length === 0)) {
      console.log('缺少imgList参数')
      return
    }   
    if (this.isSingle) {
      this.initDom(options && options.target)
    }
    if (!this.isSingle) {
      this.imgList = options.imgList
      this.initDom()
    }
  }

  $onEvent = {
    left: () => 0,
    right: () => 0,
  }
  $on (type, fun) {
    this.$onEvent[type] = fun
  }

  initDom () {
    if (document.querySelector('.preview')) return
    const target = document.querySelector('body') 
    this.innerWidth = window.innerWidth
    let preview, html = ''
    if (!this.isSingle) {
      html =`<div class="preview-list" style="width:${this.imgList.length * this.innerWidth + 30}px">`
      this.imgList.forEach(url => {
      html += `
        <div class='preview-card' style="width:${this.innerWidth}px">
          <div class='preview-image'>
            <img src='${url}' style="width:${this.innerWidth}px">
          </div>
        </div>`
      })
      html += "</div><div class='preview-mask'></div>"
    } else {
      html = `
        <div class="preview-card">
          <div class='preview-image'><img style="width:${this.innerWidth}px"></div>
        </div>
        <div class="preview-mask"></div> 
      `
    }

    preview = document.createElement('div')
    preview.classList.add('preview')
    preview.innerHTML = html
    target.appendChild(preview)

    this.previewDom = document.querySelector('.preview')
    this.previewListDom = document.querySelector('.preview-list') || ''
    this.previewMaskDom = document.querySelector('.preview-mask')
    this.cardImageDom = this.isSingle ? '' : document.querySelectorAll('.card-image img')

    this.previewCardDomAll = this.isSingle ? '' : document.querySelectorAll('.preview-card')
    this.previewImageDomAll = document.querySelectorAll('.preview-card img')

    this.previewCardDom =this.isSingle ? document.querySelector('.preview-card') : document.querySelectorAll('.preview-card')[0]
    this.previewImageDom = this.isSingle ? document.querySelector('.preview-image img') : document.querySelectorAll('.preview-card img')[0]
  }
  initFinger () {
    this.finger = new AlloyFinger(this.previewDom, {
      touchStart: (evt) => {
        const currentNum = evt.touches.length        
        if (currentNum === 1) {
          this.fingerNum = 1
          this.startX = evt.touches[0].pageX
          this.startY = evt.touches[0].pageY                    
        }
        // 判断当前是否为双指一起移动
        if (currentNum === 2 && this.isMoving) {
          this.fingerNum = 2
          return
        }
        // 判断是否移动过img，若无则开始初始双指操作
        if (currentNum === 2 && !this.scaleStartX) {
          this.fingerNum = 2
          this.doublePointStart(evt)
        }
        // 判断是否移动过img，若有则不需要初始
        if (currentNum === 2 && this.scaleStartX) {
          this.fingerNum = 2
        }
      },
      touchMove: (evt) => {
        const currentNum = evt.touches.length
  
        // 双指放大
        if (this.firstTouch && currentNum === 2 && !this.caleStartX) {         
          this.doublePointMove(evt)
          return
        }
        // 双指后的单指移动
        if (this.firstTouch && currentNum === 1 && this.scaleStartX) {
          this.scalePointMove(evt)
          return
        }
        // 双指情况下 松开第一个手指  拦截返回 避免误操作普通单指操作
        if (this.firstTouch && currentNum === 1 && !this.scaleStartX) return
  
        if (this.fingerNum === 1 && currentNum === 1) {
          evt.preventDefault()
          this.isMoving = true
          this.singlePointMove(evt)
          
          
        }
      },
      touchEnd: (evt) => {
        // 双指情况下 松开第二个手指
        if (this.fingerNum === 2 && this.firstTouch) {
          this.fingerNum--
          if (this.scaleStartX) return
          const finger = evt.touches|| evt.targetTouches
          if (finger.length >= 1 && finger[0].pageX) {
            this.scaleStartX = finger[0].pageX
            this.scaleStartY = finger[0].pageY
          } else {
            this.doublePointEnd(evt)
            this.fingerNum--
          }
          return
        }
        // 双指情况下 松开第一个手指
        if (this.fingerNum === 1 && this.firstTouch) {
          this.doublePointEnd(evt)
          return
        }
        if (this.fingerNum === 1) {
          if (this.isMoving) {
            this.singlePointEnd(evt)
            this.isMoving = false
            this.type = ''
            return
          }
        }
        this.fingerNum--
      }
    })
  }

  // 打开大图
  async open (config) {
    if (this.isSingle && !config.url) return
    if (this.isSingle) {
      this.previewImageDom.src = config.url || ''
    } else {
      const left = `${(config.index - 1 )* - (this.innerWidth + 30)}`
      this.previewCardDom = this.previewCardDomAll[config.index - 1]
      this.previewImageDom = this.previewImageDomAll[config.index - 1]
      this.previewListDom.style.left = `${left}px`
      this.currentMove = Number(left)
    }
    
    if (config.target || config.index) {
      const target = config.target || document.querySelectorAll('.card-image img')[config.index - 1]
      this.getDomRect(target)
    }

    if(!this.finger) this.initFinger()

    this.previewDom.classList.add('is-show')
    this.setCardTransform({ x: this.thumb.x, y: this.thumb.y, zoom: this.thumb.zoom })
    await this.sleep(50)
    this.previewDom.classList.add('is-fade-in-mask')
    this.setCardTransform({ x: 0, y:!this.isSingle ? 0 : this.originY, zoom: 1 })
    document.querySelector('.preview-mask').addEventListener('click',this.close)
  }
  // 关闭大图
  async close (isGesture) {
    if (isGesture) {
      this.previewDom.classList.remove('is-moving')
      this.previewMaskDom.style.opacity = 0
    }
    this.previewDom.classList.remove('is-fade-in-mask')
    this.setCardTransform({ x: this.thumb.x, y: this.thumb.y, zoom: this.thumb.zoom })
    await this.sleep(500)
    this.previewDom.classList.remove('is-show')
    this.previewMaskDom.removeEventListener('click', this.close)
    if(!this.isSingle) {
      this.previewCardDom.style.transform = ''
    }
    if(isGesture) {
      this.previewMaskDom.style.opacity = null
      this.previewCardDom.style.transform = ''
    }
  }

  // 设置previewCardDom transform
  setCardTransform (config) {
    this.previewCardDom.style.transform = (
      `translate3d(${config.x}px, ${config.y}px, 0px)` +
      `scale(${config.zoom})`
    )
  }
  // 获取两点之间的长度
  getLengthOfLine(point1, point2) {
    const middlePoint = {
      clientX: point2.clientX,
      clientY: point1.clientY
    }
  
    const legX = Math.abs(middlePoint.clientX - point1.clientX)
    const legY = Math.abs(middlePoint.clientY - point2.clientY)
  
    return Math.sqrt(legX * legX + legY * legY)
  }
  // 获取两点之间的中间点
  getMiddleOfLine (point1, point2) {
    return {
      clientX: Math.min(point2.clientX, point1.clientX) + (Math.abs(point2.clientX - point1.clientX) / 2),
      clientY: Math.min(point2.clientY, point1.clientY) + (Math.abs(point2.clientY - point1.clientY) / 2)
    }
  }
  // 获取图片中点
  getMiddleTouchOnElement (touches, boundingRect) {
    const middleTouch = this.getMiddleOfLine(touches[0], touches[1])
  
    return {
      clientX: middleTouch.clientX - boundingRect.left,
      clientY: middleTouch.clientY - boundingRect.top
    }
  }
  // 判断双指点击区域是否在图片内
  isTouchesInsideRect (touches, rect) {
    return Array.prototype.every.call(touches, (touch) => (
      (touch.clientX <= rect.right) && (touch.clientX >= rect.left) &&
      (touch.clientY <= rect.bottom) && (touch.clientY >= rect.top)
    ))
  }
  // 设置previewImageDom动画时长
  setTransitionDuration (duration) {
    this.previewImageDom.style.transitionDuration = `${duration}ms`
  }
  // 设置previewImageDom transform
  setTransform (scale, translateX, translateY) {
    scale = scale < this.config.minScale ? this.config.minScale : scale
    scale = scale > this.config.maxScale ? this.config.maxScale : scale
    this.previewImageDom.style.transform = (
      `translate3d(${translateX}px, ${translateY}px, 0)` +
      `scale3d(${scale}, ${scale}, 1)`
    )
  }
  // 设置previewImageDom transformOrigin
  setTransformOrigin (x, y) {
    this.previewImageDom.style.transformOrigin = `${x} ${y} 0`
  }
  // 重置双指部分信息
  resetProperties () {
    this.firstTouch = null
    this.initialPinchLength = null
    this.currentPinchLength = null
    this.initialBoundingRect = null
    this.scaleStartX = null
    this.scaleStartY = null
  }

  // 双指touchStart
  doublePointStart (evt) {
    this.initialBoundingRect = this.previewImageDom.getBoundingClientRect()
    if (!evt.touches.length || !this.isTouchesInsideRect(evt.touches, this.initialBoundingRect)) {
      return
    }
  
    evt.preventDefault()
    this.setTransitionDuration(0)
    const touch1 = evt.touches[0]
    const touch2 = evt.touches[1]
    // 获取中间点
    const middleTouchOnElement = this.getMiddleTouchOnElement(
      evt.touches,
      this.initialBoundingRect
    )
    //  初始双指两点之间的距离
    this.initialPinchLength = this.getLengthOfLine(touch1, touch2)
    // 设置transform-origin
    this.setTransformOrigin(`${middleTouchOnElement.clientX}px`, `${middleTouchOnElement.clientY}px`)
    // 记录手指信息
    this.firstTouch = middleTouchOnElement
  }
  // 双指touchMove
  doublePointMove (evt) {
    const middleTouchOnElement = this.getMiddleTouchOnElement(
      evt.touches,
      this.initialBoundingRect
    )
    // 当前双指两点之间的距离
    this.currentPinchLength = this.getLengthOfLine(evt.touches[0], evt.touches[1])
    //  scale = 当前双指两点之间的距离 / 初始双指两点之间的距离
    const scale = this.currentPinchLength / this.initialPinchLength
    const translateX = middleTouchOnElement.clientX - this.firstTouch.clientX
    const translateY = middleTouchOnElement.clientY - this.firstTouch.clientY
    this.config.scale = scale
    this.config.translateX = translateX
    this.config.translateY = translateY
  
    this.setTransform(scale, translateX, translateY)
  
    if (this.config.onScale) {
      this.config.onScale(scale, translateX, translateY)
    }
  }
  // 双指touchEnd
  doublePointEnd (evt) {
    this.setTransitionDuration(this.config.transitionDuration)
    this.setTransform(1, 0, 0)
    clearTimeout(this.timeoutId)
  
    this.timeoutId = window.setTimeout(() => {
      this.setTransitionDuration(0)
      this.setTransformOrigin('50%', '50%')
    }, this.config.transitionDuration)
  
    this.resetProperties()
  }

  // 单指touchMove
  singlePointMove (evt) {
    const currentX = evt.changedTouches[0].pageX
    const currentY = evt.changedTouches[0].pageY
    const moveX = currentX - this.startX
    const moveY = currentY - this.startY
    // 左右滑动判断    
    if (this.type === 'turn' || (!this.type && Math.abs(moveX) > Math.abs(moveY))) {
      this.type = 'turn'
      if (!this.isSingle) {
        const sc = this.innerWidth / window.innerWidth
        document.querySelector('.preview-list').style.left = `${this.currentMove + (moveX)/sc}px`
        return
      }
      moveX > 0 ?  this.$onEvent.left() : this.$onEvent.right()
      return
    }
    // 上下滑动判断
    if (this.type === 'leave' || (!this.type && Math.abs(moveY) > Math.abs(moveX) )) {
      this.type = 'leave'

      const y = this.isSingle ? this.originY + moveY : 0 + moveY
      const screenheight = this.previewDom.offsetHeight / 2
      const opacity = Math.abs(moveY) / screenheight
      
      this.previewDom.classList.add('is-moving')
      this.previewCardDom.style.transform =  (`translate3d(0px, ${y}px, 0px) scale(1)`)
      this.previewMaskDom.style.opacity = 1 - opacity   
    }
  }
  // 单指touchEnd
  async singlePointEnd (evt) {
    const currentY = evt.changedTouches[0].pageY
    if(this.type === 'turn') {
      if(!this.isSingle) {
        this.resetPreviewListPosition()
        this.currentMove = Number(this.previewListDom.style.left.split('px')[0])
      }      
      return
    }
    if ((currentY - this.startY > this.leaveHight || currentY - this.startY < -this.leaveHight)) {
      this.close(true)      
    } else {
      this.previewDom.classList.remove('is-moving')
      this.previewCardDom.style.transform =  (`translate3d(0px, ${this.isSingle?this.originY:0}px, 0px) scale(1)`)
      this.previewMaskDom.style.opacity = 1
    }
  }

  // 双指放大后单指touchMove
  scalePointMove (evt) {
    const currentX = evt.changedTouches[0].pageX
    const currentY = evt.changedTouches[0].pageY
    const moveX = currentX - this.scaleStartX
    const moveY = currentY - this.scaleStartY
  
    const scale = this.config.scale
    const translateX = this.config.translateX + moveX
    const translateY = this.config.translateY + moveY
    this.setTransform(scale, translateX, translateY)
  }

  // 多图模式重置信息
  resetPreviewListPosition () {
    this.previewCardDom.style.transform = ''
    const left = Number(this.previewListDom.style.left.split('px')[0])
    let index = Math.round(left / -(this.innerWidth + 30))
    if(index >= this.imgList.length) {
      index = this.imgList.length - 1 
    }
    if (index < 0) {
      index = 0
    }
    this.previewListDom.style.left = `${- (this.innerWidth + 30) * index}px`
    this.previewListDom.style.transition = "all .2s"
    this.previewCardDom = this.previewCardDomAll[index]
    this.previewImageDom = this.previewImageDomAll[index]
    this.getDomRect(this.cardImageDom[index])
    setTimeout (()=> {
      this.previewListDom.style.transition = 'none'
    },200)
  }
  // 获取Dom信息 getBoundingClientRect()
  getDomRect (target) {
    const rect = target.getBoundingClientRect()
    const zoom = rect.width / document.documentElement.clientWidth
    this.originY = (document.documentElement.clientHeight - rect.height/zoom) / 2
    this.thumb = { 
      x: rect.left, 
      y: this.isSingle? rect.top : rect.top-this.originY , 
      w: rect.width, 
      h: rect.height, 
      zoom 
    }
  }
  sleep (delay) {
    return new Promise(resolve => setTimeout(resolve, delay))
  }
  destory () {
    this.resetProperties()
    this.finger.destroy()
    this.previewMaskDom.removeEventListener('click', this.close)
  }
}

export default preview