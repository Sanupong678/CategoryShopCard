<template>
  <div>
    <NavbarUser />
    <router-view />
    <FooterUser />
  </div>
</template>

<script>
import NavbarUser from './components/NavbarUser.vue';
import FooterUser from './components/FooterUser.vue';
export default {
  name: 'MainLayoutUser',
  components: {
    NavbarUser,
    FooterUser
  }
}
</script> 