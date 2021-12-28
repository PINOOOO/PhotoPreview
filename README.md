# PhotoPreview

一款Web移动端图片预览的组件

## 支持功能
* 图片打开关闭过渡
* 支持手势上下滑动关闭
* 支持手势左右翻页
* 支持双指放大
* 支持类ins双指放大后单指拖动

<div align="center">
<img src="https://media.giphy.com/media/hpfu3kwqmpLhsvnUT1/giphy.gif" width='40%'>
<img src="https://media.giphy.com/media/bCrldriJ5zXmxhjODx/giphy.gif" width='40%'>
</div>


## 快速体验
```js
import PhotoPreview from 'lego-photo-preview'
import 'lego-photo-preview/photopreview.min.css'

// 单图模式
this.photoPreview = new PhotoPreview()
const target = xxx // 被点击的img dom
this.photoPreview.open({
  target,
  url:url // 被点击dom的url
})
this.photoPreview.$on('left', ()=>{
  console.log('从左向右划 →');
})
this.photoPreview.$on('right', ()=>{
  console.log('从右向左划 ←');
})

// 多图模式
imgList: [
    'https://xxx.com',
    'https://xxx.com',
    ...
]
this.photoPreview = new PhotoPreview()
this.photoPreview = new PhotoPreview({
  mode:"multitude",
  imgList:this.imgList 
})

this.photoPreview.open({
  index: index + 1 // index为this.imgList中的第几张
})

```

## 实现以及原理

[https://juejin.cn/post/6878252181703622669](https://juejin.cn/post/6878252181703622669)
