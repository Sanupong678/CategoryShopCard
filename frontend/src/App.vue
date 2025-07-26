<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
/* Global CSS to prevent overlapping containers */
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
  overflow-x: hidden;
  position: relative;
}

#app {
  position: relative;
  z-index: 1;
  min-height: 100vh;
  overflow-x: hidden;
}

/* Prevent container overlapping */
.container, .wrapper, .layout {
  position: relative;
  z-index: 1;
}

/* Modal and overlay z-index hierarchy */
.modal-overlay, .search-modal-overlay {
  z-index: 9999 !important;
}

.modal-content, .search-modal-content {
  z-index: 10000 !important;
}

/* Navbar z-index */
.navbar {
  z-index: 100 !important;
}

/* Product cards and other elements */
.product-card, .category-card {
  z-index: 1;
}

/* Prevent horizontal scroll on mobile */
@media (max-width: 768px) {
  body {
    overflow-x: hidden;
  }
  
  .container, .wrapper, .layout {
    overflow-x: hidden;
  }
}
</style>
