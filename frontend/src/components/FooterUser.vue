@import './Footer.vue';
<template>
  <footer class="footer">
    <div class="footer-container">
      <!-- Contact Information -->
      <div class="footer-section">
        <div class="footer-section-header">
          <span class="footer-icon"></span>
          <h3 class="footer-title">{{ contactTitle }}</h3>
        </div>
        <div class="footer-content about-content">
          <div v-for="(item, idx) in contactItems" :key="idx" class="about-row">
            <span v-if="item.icon" :class="item.icon"></span>
            <span class="about-text">{{ item.value }}</span>
          </div>
        </div>
      </div>
      <!-- About Section -->
      <div class="footer-section">
        <div class="footer-section-header">
          <span class="footer-icon"></span>
          <h3 class="footer-title">{{ aboutTitle }}</h3>
        </div>
        <div class="footer-content about-content">
          <div v-for="(item, idx) in aboutItems" :key="idx" class="about-row">
            <span v-if="item.icon" :class="item.icon"></span>
            <span class="about-text">{{ item.text }}</span>
          </div>
        </div>
      </div>
      <!-- Help Center -->
      <div class="footer-section">
        <div class="footer-section-header">
          <span class="footer-icon"></span>
          <h3 class="footer-title">{{ helpTitle }}</h3>
        </div>
        <div class="footer-content">
          <div v-for="(item, idx) in helpItems" :key="idx" class="footer-link">
            <span v-if="item.icon" :class="item.icon"></span>
            <span class="link-text">{{ item.text }}</span>
          </div>
        </div>
      </div>
    </div>
    <!-- Footer Bottom (always at the bottom) -->
    <div class="footer-bottom-bar">
      <div class="footer-bottom-inner">
        <div class="copyright">
          {{ copyright }}
        </div>
        <div class="social-links-bottom">
          <div v-for="(link, idx) in socialLinks" :key="idx" class="footer-social-item-bottom">
            <a :href="link.url" class="social-link-bottom" :title="link.text" target="_blank">
              <span v-if="link.icon" :class="link.icon"></span>
            </a>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'FooterUser',
  data() {
    return {
      contactItems: [],
      aboutItems: [],
      helpItems: [],
      socialLinks: [],
      copyright: '',
      aboutTitle: 'เกี่ยวกับ Website Card',
      contactTitle: 'ติดต่อเรา',
      helpTitle: 'ศูนย์ช่วยเหลือ'
    }
  },
  mounted() {
    this.fetchFooterData();
  },
  methods: {
    async fetchFooterData() {
      try {
        const res = await fetch('http://localhost:5000/api/footer');
        const data = await res.json();
        this.contactItems = data.contactItems || [];
        this.aboutItems = data.aboutItems || [];
        this.helpItems = data.helpItems || [];
        this.socialLinks = data.socialLinks || [];
        this.copyright = data.copyright || '';
        this.aboutTitle = data.aboutTitle || 'เกี่ยวกับ Website Card';
        this.contactTitle = data.contactTitle || 'ติดต่อเรา';
        this.helpTitle = data.helpTitle || 'ศูนย์ช่วยเหลือ';
      } catch (error) {
        console.error('Error fetching footer data:', error);
      }
    }
  }
}
</script>

<style scoped>
</style>
