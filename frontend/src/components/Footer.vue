<template>
  <footer class="footer">
    <div class="footer-container">
      <!-- Contact Information -->
      <div class="footer-section">
        <div class="footer-section-header">
          <span class="footer-icon"></span>
          <template v-if="isAdmin">
            <input v-model="contactTitle" class="footer-title-edit-input" />
            <button @click="saveContactTitle" class="footer-btn-save">บันทึก</button>
            <span v-if="errorContactTitle" class="footer-error">{{ errorContactTitle }}</span>
          </template>
          <template v-else>
            <h3 class="footer-title">{{ contactTitle }}</h3>
          </template>
        </div>

        <div class="footer-content about-content">
          <div v-for="(item, idx) in contactItems" :key="idx" class="about-row">
            <template v-if="isAdmin">
              <select v-model="item.icon" class="footer-icon-select">
                <option value="">(ไม่มีไอคอน)</option>
                <option v-for="icon in iconOptions" :value="icon.value" :key="icon.value">
                  {{ icon.label }}
                </option>
              </select>
              <span v-if="item.icon" :class="item.icon"></span>
              <input v-model="item.label" class="footer-edit-input" placeholder="หัวข้อ เช่น โทรศัพท์:" />
              <input v-model="item.value" class="footer-edit-input" placeholder="ข้อมูล เช่น 099-9999999" />
              <button @click="removeContact(idx)" class="footer-btn-del">ลบ</button>
            </template>
            <template v-else>
              <span v-if="item.icon" :class="item.icon"></span>
              <div class="contact-text">
                <span class="about-text">{{ item.value }}</span>
              </div>
            </template>
          </div>
        </div>
        <div v-if="isAdmin" style="margin-top:12px;">
          <button @click="addContact" class="footer-btn-add">+ เพิ่ม</button>
        </div>
      </div>


      <!-- About Section -->
      <div class="footer-section">
        <div class="footer-section-header">
          <span class="footer-icon"></span>
          <template v-if="isAdmin">
            <input v-model="aboutTitle" class="footer-title-edit-input" />
            <button @click="saveAboutTitle" class="footer-btn-save">บันทึก</button>
            <span v-if="errorAboutTitle" class="footer-error">{{ errorAboutTitle }}</span>
          </template>
          <template v-else>
            <h3 class="footer-title">{{ aboutTitle }}</h3>
          </template>
        </div>
        <div class="footer-content about-content">
          <div v-for="(item, idx) in aboutItems" :key="idx" class="about-row">
            <template v-if="isAdmin">
              <select v-model="item.icon" class="footer-icon-select">
                <option value="">(ไม่มีไอคอน)</option>
                <option v-for="icon in iconOptions" :value="icon.value" :key="icon.value">
                  {{ icon.label }}
                </option>
              </select>
              <span v-if="item.icon" :class="item.icon"></span>
              <input v-model="item.text" class="footer-edit-input" />
              <button @click="removeAbout(idx)" class="footer-btn-del">ลบ</button>
            </template>
            <template v-else>
              <span v-if="item.icon" :class="item.icon"></span>
              <span class="about-text">{{ item.text }}</span>
            </template>
          </div>
        </div>
        <div v-if="isAdmin" style="margin-top:12px;">
          <button @click="addAbout" class="footer-btn-add">+ เพิ่ม</button>
        </div>
      </div>

      <!-- Help Center -->
      <div class="footer-section">
        <div class="footer-section-header">
          <span class="footer-icon"></span>
          <template v-if="isAdmin">
            <input v-model="helpTitle" class="footer-title-edit-input" />
            <button @click="saveHelpTitle" class="footer-btn-save">บันทึก</button>
            <span v-if="errorHelpTitle" class="footer-error">{{ errorHelpTitle }}</span>
          </template>
          <template v-else>
            <h3 class="footer-title">{{ helpTitle }}</h3>
          </template>
        </div>
        <div class="footer-content">
          <div v-for="(item, idx) in helpItems" :key="idx" class="footer-link">
            <template v-if="isAdmin">
              <select v-model="item.icon" class="footer-icon-select">
                <option value="">(ไม่มีไอคอน)</option>
                <option v-for="icon in iconOptions" :value="icon.value" :key="icon.value">
                  {{ icon.label }}
                </option>
              </select>
              <span v-if="item.icon" :class="item.icon"></span>
              <input v-model="item.text" class="footer-edit-input" />
              <button @click="removeHelp(idx)" class="footer-btn-del">ลบ</button>
            </template>
            <template v-else>
              <span v-if="item.icon" :class="item.icon"></span>
              <span class="link-text">{{ item.text }}</span>
            </template>
          </div>
        </div>
        <div v-if="isAdmin" style="margin-top:12px;">
          <button @click="addHelp" class="footer-btn-add">+ เพิ่ม</button>
        </div>
      </div>

    </div>
    <div class="button-edit">
      <button v-if="!isAdmin" @click="isAdmin = true" class="footer-btn-switch">เข้าสู่โหมดแอดมิน</button>
      <button v-if="isAdmin" @click="isAdmin = false" class="footer-btn-switch">ดูโหมดผู้ใช้</button>
    </div>
    <!-- Footer Bottom (always at the bottom) -->
    <div class="footer-bottom-bar">
      <div class="footer-bottom-inner">
        <div class="copyright">
          <template v-if="isAdmin">
            <input v-model="copyright" class="footer-edit-input copyright-input" />
            <button @click="copyright = ''" class="footer-btn-del">ลบ</button>
            <button @click="saveBottom" class="footer-btn-save">บันทึก</button>
            <span v-if="errorBottom" class="footer-error">{{ errorBottom }}</span>
          </template>
          <template v-else>
            {{ copyright }}
          </template>
        </div>
        <div class="social-links-bottom">
          <div v-for="(link, idx) in socialLinks" :key="idx" class="footer-social-item-bottom">
            <template v-if="isAdmin">
              <select v-model="link.icon" class="footer-icon-select">
                <option value="">(ไม่มีไอคอน)</option>
                <option v-for="icon in iconOptions" :value="icon.value" :key="icon.value">
                  {{ icon.label }}
                </option>
              </select>
              <span v-if="link.icon" :class="link.icon"></span>
              <input v-model="link.url" class="footer-edit-input social-url-input" placeholder="URL" />
              <button @click="removeSocial(idx)" class="footer-btn-del">ลบ</button>
            </template>
            <template v-else>
              <a :href="link.url" class="social-link-bottom" :title="link.label" target="_blank">
                <span v-if="link.icon" :class="link.icon"></span>
              </a>
            </template>
          </div>
          <button v-if="isAdmin" @click="addSocial" class="footer-btn-add">+ เพิ่ม</button>
        </div>
      </div>
    </div>
  </footer>
</template>

<script>
import { iconOptions } from './footerIcons';
export default {
  name: 'Footer',
  data() {
    return {
      isAdmin: false,
      contactItems: [],
      aboutItems: [],
      helpItems: [],
      socialLinks: [],
      copyright: '',
      errorContact: '',
      errorAbout: '',
      errorHelp: '',
      errorBottom: '',
      aboutTitle: 'เกี่ยวกับ Website Card',
      errorAboutTitle: '',
      contactTitle: 'ติดต่อเรา',
      errorContactTitle: '',
      helpTitle: 'ศูนย์ช่วยเหลือ',
      errorHelpTitle: '',
      iconOptions
    }
  },
  mounted() {
    this.fetchFooterData();
  },
  watch: {
    isAdmin(newVal, oldVal) {
      console.log('isAdmin changed', newVal, oldVal);
      if (!newVal && oldVal) {
        // เมื่อออกจากโหมดแอดมิน (กดดูโหมดผู้ใช้) ให้ save ข้อมูลทั้งหมด
        this.saveAllSections();
      }
    }
  },
  methods: {
    async fetchFooterData() {
      console.log('fetchFooterData called');
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
    },
    // Save all sections to backend
    async saveAllSections() {
      console.log('saveAllSections called');
      try {
        await fetch('http://localhost:5000/api/footer', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contactItems: this.contactItems,
            aboutItems: this.aboutItems,
            helpItems: this.helpItems,
            socialLinks: this.socialLinks,
            copyright: this.copyright,
            aboutTitle: this.aboutTitle,
            contactTitle: this.contactTitle,
            helpTitle: this.helpTitle
          })
        });
      } catch (error) {
        console.error('Error saving footer data:', error);
      }
    },
    // Contact
    saveContact() {
      this.errorContact = '';
      if (this.contactItems.some(item => !item.label.trim() || !item.value.trim())) {
        this.errorContact = 'กรุณากรอกข้อมูลให้ครบทุกช่อง';
        return;
      }
      // TODO: ส่ง contactItems ไป backend
    },
    saveContactTitle() {
      this.errorContactTitle = '';
      if (!this.contactTitle.trim()) {
        this.errorContactTitle = 'กรุณากรอกชื่อหัวข้อ';
        return;
      }
      // TODO: ส่ง contactTitle ไป backend
    },
    addContact() {
      this.contactItems.push({ icon: '', label: '', value: '' });
    },
    removeContact(idx) {
      this.contactItems.splice(idx, 1);
    },
    // About
    saveAbout() {
      this.errorAbout = '';
      if (this.aboutItems.some(item => !item.text.trim())) {
        this.errorAbout = 'กรุณากรอกข้อความให้ครบทุกช่อง';
        return;
      }
      // TODO: ส่ง aboutItems ไป backend
    },
    saveAboutTitle() {
      this.errorAboutTitle = '';
      if (!this.aboutTitle.trim()) {
        this.errorAboutTitle = 'กรุณากรอกชื่อหัวข้อ';
        return;
      }
      // TODO: ส่ง aboutTitle ไป backend
    },
    addAbout() {
      this.aboutItems.push({ icon: '', text: '' });
    },
    removeAbout(idx) {
      this.aboutItems.splice(idx, 1);
    },
    // Help
    saveHelp() {
      this.errorHelp = '';
      if (this.helpItems.some(item => !item.text.trim())) {
        this.errorHelp = 'กรุณากรอกข้อความให้ครบทุกช่อง';
        return;
      }
      // TODO: ส่ง helpItems ไป backend
    },
    saveHelpTitle() {
      this.errorHelpTitle = '';
      if (!this.helpTitle.trim()) {
        this.errorHelpTitle = 'กรุณากรอกชื่อหัวข้อ';
        return;
      }
      // TODO: ส่ง helpTitle ไป backend
    },
    addHelp() {
      this.helpItems.push({ icon: '', text: '' });
    },
    removeHelp(idx) {
      this.helpItems.splice(idx, 1);
    },
    // Bottom
    saveBottom() {
      this.errorBottom = '';
      if (!this.copyright.trim()) {
        this.errorBottom = 'กรุณากรอกข้อความสำหรับสำเนาที่ต้องการบันทึก';
        return;
      }
      // TODO: ส่ง copyright ไป backend
    },
    addSocial() {
      this.socialLinks.push({ label: '', url: '', icon: '' });
    },
    removeSocial(idx) {
      this.socialLinks.splice(idx, 1);
    }
  }
}
</script>

<style>
@import './Footer.css';
</style>
