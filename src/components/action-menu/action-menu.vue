<template>
  <div class='action-menu'>
    <button 
      @click='intendToGet("all")'
      class='action-menu__get-statuses'
    >All</button>
    <button 
      @click='intendToGet("pressReview")'
      class='action-menu__get-statuses'
    >Press Review</button>
    <button 
      @click='intendToGet("clojure")'
      class='action-menu__get-statuses'
    >Clojure</button>
    <button 
      @click='intendToGet("golang")'
      class='action-menu__get-statuses'
    >Golang</button>
    <button 
      @click='intendToGet("javascript")'
      class='action-menu__get-statuses'
    >JavaScript</button>
    <button
      @click='intendToGet("php")'
      class='action-menu__get-statuses'
    >PHP</button>
    <button 
      @click='intendToGet("rust")'
      class='action-menu__get-statuses'
    >Rust</button>
    <button
      @click='intendToGet("python")'
      class='action-menu__get-statuses'
    >Python</button>
    <button 
      @click='intendToGet("scala")'
      class='action-menu__get-statuses'
    >Scala</button>
    <button 
      @click='intendToGet("vueJs")'
      class='action-menu__get-statuses'
    >Vue.js</button>
  </div>
</template>

<script>
import EventHub from '../../modules/event-hub';

export default {
  name: 'action-menu',
  methods: {
    intendToGet: function (aggregateType) {
      EventHub.$emit(
        'status_list.reload_intended',
        {
          aggregateType
        }
      );
    }
  }
}
</script>

<style lang='scss' scoped>
@import './action-menu.scss';
</style>