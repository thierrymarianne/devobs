<template>
  <div class='action-menu'>
    <button 
      @click='intendToGet("all")'
      class='action-menu__get-statuses'
      v-if='isVisible.all'
    >All</button>
    <button 
      @click='intendToGet("pressReview")'
      class='action-menu__get-statuses'
    >Press Review</button>
    <button 
      @click='intendToGet("clojure")'
      class='action-menu__get-statuses'
      v-if='isVisible.clojure'
    >Clojure</button>
    <button 
      @click='intendToGet("golang")'
      class='action-menu__get-statuses'
      v-if='isVisible.golang'
    >Golang</button>
    <button 
      @click='intendToGet("javascript")'
      class='action-menu__get-statuses'
      v-if='isVisible.javascript'
    >JavaScript</button>
    <button
      @click='intendToGet("php")'
      class='action-menu__get-statuses'
      v-if='isVisible.php'
    >PHP</button>
    <button
      @click='intendToGet("python")'
      class='action-menu__get-statuses'
      v-if='isVisible.python'
    >Python</button>
    <button 
      @click='intendToGet("rust")'
      class='action-menu__get-statuses'
      v-if='isVisible.rust'
    >Rust</button>
    <button 
      @click='intendToGet("scala")'
      class='action-menu__get-statuses'
      v-if='isVisible.scala'
    >Scala</button>
    <button 
      @click='intendToGet("vueJs")'
      class='action-menu__get-statuses'
      v-if='isVisible.vueJs'
    >Vue.js</button>
  </div>
</template>

<script>
import EventHub from '../../modules/event-hub';
import SharedState from '../../modules/shared-state';

export default {
  computed: {
    isVisible: function () {
      const hasFullMenu = 'peek' in this.$route.query
      || !SharedState.state.productionMode;

      return {
        all: hasFullMenu,
        clojure: hasFullMenu,
        javascript: hasFullMenu,
        golang: hasFullMenu,
        php: hasFullMenu,
        python: hasFullMenu,
        rust: hasFullMenu, 
        scala: hasFullMenu,
        vueJs: hasFullMenu
      }
    },
  },
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
  },
}
</script>

<style lang='scss' scoped>
@import './action-menu.scss';
</style>