<template>
  <div class="container">
    <h1>This is secret page.</h1>
    <NuxtLink to="/">
      Back home
    </NuxtLink>
  </div>
</template>

<script>
export default {
  middleware: 'authenticated'
}
</script>

<style scoped></style>
