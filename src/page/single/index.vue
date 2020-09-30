<template>
  <div class="list">
    <div class="card" v-for='(item,index) in imgList' :key="index"  @click="openPreview($event,index)">
      <div class="card-image">
        <img :src="item">
      </div>
    </div>
  </div>
</template>

<script>
import PhotoPreview from '@/extend/photopreview'
export default {
  data () {
    return {
      imgList: [
        'https://iovo-oss.yy.com/fimo/1596189400803_1596189398799gexCHaFwT_size_w1200_h800.jpg',
        'https://iovo-oss.yy.com/fimo/1595757396914_1595757394757WoeMZTUDe_size_w1200_h800.jpg',
        'https://iovo-oss.yy.com/fimo/1600069032984_1600069029787qYlhMC8ft_size_w1200_h1200.jpg',
        'https://iovo-oss.yy.com/fimo/1598660155488_1598660153758pFlfLZpbU_size_w1200_h800.jpg',
        'https://iovo-oss.yy.com/fimo/1600069132499_1600069129192xXCpd__2W_size_w1200_h1200.jpg',
        'https://iovo-oss.yy.com/fimo/1597750574004_1597750571780DDKu5hLgH_size_w1200_h800.jpg',
        'https://iovo-oss.yy.com/fimo/1596862351133_1596862348979HA4xYIu5q_size_w1200_h801.jpg',
        'https://iovo-oss.yy.com/fimo/1599219497048_1599219494022SJuJKZNIc_size_w1200_h1200.jpg'
      ]
    }
  },
  mounted () {
    this.photoPreview = new PhotoPreview()
    this.photoPreview.$on('left', ()=>{
      console.log('从左向右划 →');
    })
    this.photoPreview.$on('right', ()=>{
      console.log('从右向左划 ←');
    })
  },
  methods : {
    openPreview($event, index) {
      const target = $event.currentTarget.childNodes[0].childNodes[0]
      this.photoPreview.open({
        target,
        url:this.imgList[index]
      })
    },
  }
}
</script>



<style lang='scss' scoped>
.list {
  width: 100%;
  height: 100%;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  padding: 20px 20px;
  background-color: #f5f5f5;
}
.card {
  position: relative;
  margin-bottom: 18px;
  padding: 20px;
  width: 346px;
  height: 346px;
  background-color: #fff;
  vertical-align: top;
  cursor: pointer;
}
.card-image {
  display: flex;
  align-items: center;
  overflow: hidden;
  justify-content: center;
  width: 306px;
  height: 306px;
  text-align: center;
  img {
    max-width: 306px;
    max-height: 306px;
    background-color: #f5f5f5;
    pointer-events: none;
  }
}

</style>