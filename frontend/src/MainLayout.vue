<template>
  <div>
    <Navbar/>
    <router-view />
    <Footer />
  </div>
</template>
<script>
import Footer from './components/Footer.vue';
import Navbar from './components/Navbar.vue';
export default {
  name: 'MainLayout',
  components: {
    Navbar,
    Footer
  }
}
</script> 