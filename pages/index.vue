<template>
</template>

<script lang="ts">
import Vue from 'vue'
import Time from "~/modules/time";

export default Vue.extend({
  middleware({ redirect, route }) {
    if (route.name !== 'daily-review') {
      return redirect(`/${Time.today()}`)
    }
  }
})
</script>

<style>
</style>
