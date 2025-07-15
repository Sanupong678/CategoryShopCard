<template>
  <div class="profile-card-wrapper">
    <div class="profile-card">
      <div class="profile-avatar-section">
        <img v-if="currentImage" :src="currentImage" class="profile-avatar" />
        <div v-else class="profile-avatar-placeholder">👤</div>
        <div class="profile-name">{{ profile.firstName }} {{ profile.lastName }}</div>
        <div class="profile-nickname" v-if="profile.nickname">"{{ profile.nickname }}"</div>
        <div class="profile-location-age">
          <span v-if="profile.province"><i class="fas fa-map-marker-alt"></i> {{ profile.province }}</span>
          <span v-if="profile.age"> | <i class="fas fa-birthday-cake"></i> {{ profile.age }} ปี</span>
        </div>
      </div>
      <div class="profile-contact-section">
        <a v-if="profile.phone" :href="'tel:' + profile.phone" class="contact-btn phone" title="โทรศัพท์">
          <i class="fas fa-phone"></i> {{ profile.phone }}
        </a>
        <a v-if="profile.facebook" :href="facebookUrl" target="_blank" class="contact-btn facebook" title="Facebook">
          <i class="fab fa-facebook"></i> Facebook
        </a>
        <a v-if="profile.lineId" :href="'https://line.me/ti/p/' + profile.lineId" target="_blank" class="contact-btn line" title="Line">
          <i class="fab fa-line"></i> Line
        </a>
      </div>
      <div class="profile-about-section">
        <div class="about-title"><i class="fas fa-user"></i> เกี่ยวกับฉัน</div>
        <div class="about-detail">{{ profile.detail || '—' }}</div>
      </div>
      <div class="profile-extra-section">
        <div class="extra-row">
          <i class="fas fa-id-badge"></i>
          <span>ID Line:</span>
          <span class="extra-value">{{ profile.lineId || '-' }}</span>
        </div>
        <div class="extra-row">
          <i class="fab fa-facebook"></i>
          <span>Facebook:</span>
          <span class="extra-value">{{ profile.facebook || '-' }}</span>
        </div>
      </div>
      <div v-if="profile.images.length > 1" class="profile-gallery-section">
        <div class="gallery-title"><i class="fas fa-images"></i> แกลเลอรี่</div>
        <div class="gallery-thumbnails">
          <img v-for="(img, idx) in profile.images" :key="idx" :src="img" class="gallery-thumb" :class="{active: idx === currentImageIndex}" @click="currentImageIndex = idx" />
        </div>
      </div>
    </div>
  </div>
  <div class="admin-login-btn-wrapper">
    <button class="admin-login-btn" @click="showLoginModal = true">
      <i class="fas fa-lock"></i> เข้าสู่ระบบผู้ดูแลระบบ
    </button>
  </div>
  <div v-if="showLoginModal" class="modal-overlay" @click.self="showLoginModal = false">
    <div class="modal-content">
      <div class="modal-header">เข้าสู่ระบบผู้ดูแลระบบ</div>
      <div class="modal-body">
        <input v-model="loginUsername" placeholder="Username" class="modal-input" />
        <input v-model="loginPassword" type="password" placeholder="Password" class="modal-input" />
        <div v-if="loginError" class="login-error">ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง</div>
      </div>
      <div class="modal-footer">
        <button class="modal-btn" @click="handleAdminLogin">เข้าสู่ระบบ</button>
        <button class="modal-btn cancel" @click="showLoginModal = false">ยกเลิก</button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import NavbarUser from '../../components/NavbarUser.vue';
export default {
  components: { NavbarUser },
  data() {
    return {
      profile: {
        firstName: '',
        lastName: '',
        age: '',
        nickname: '',
        phone: '',
        province: '',
        detail: '',
        facebook: '',
        lineId: '',
        images: [],
      },
      currentImageIndex: 0,
      backendUrl: 'http://localhost:5000',
      showLoginModal: false,
      loginUsername: '',
      loginPassword: '',
      loginError: false,
    };
  },
  computed: {
    currentImage() {
      return this.profile.images.length > 0 ? this.profile.images[this.currentImageIndex] : '';
    },
    facebookUrl() {
      if (!this.profile.facebook) return '';
      if (this.profile.facebook.startsWith('http')) return this.profile.facebook;
      return 'https://facebook.com/' + this.profile.facebook;
    }
  },
  methods: {
    async fetchProfile() {
      try {
        const res = await axios.get(this.backendUrl + '/api/admin/profile');
        let images = [];
        if (res.data.imageUrls) images = res.data.imageUrls.map(url => this.backendUrl + url);
        else if (res.data.imageUrl) images = [this.backendUrl + res.data.imageUrl];
        this.profile = { ...this.profile, ...res.data, images };
        this.currentImageIndex = 0;
      } catch (err) {
        console.error('Error fetching profile:', err);
      }
    },
    prevImage() {
      if (this.profile.images.length > 1) {
        this.currentImageIndex = (this.currentImageIndex - 1 + this.profile.images.length) % this.profile.images.length;
      }
    },
    nextImage() {
      if (this.profile.images.length > 1) {
        this.currentImageIndex = (this.currentImageIndex + 1) % this.profile.images.length;
      }
    },
    handleAdminLogin() {
      if (this.loginUsername === 'admin' && this.loginPassword === '1234') {
        localStorage.setItem('isAdmin', '1');
        this.showLoginModal = false;
        this.loginError = false;
        this.$router.push('/admin');
      } else {
        this.loginError = true;
      }
    },
  },
  mounted() {
    this.fetchProfile();
  }
};
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');

.profile-card-wrapper {
  min-height: 100vh;
  background: linear-gradient(135deg, #e0e7ff 0%, #f8fafc 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 10px;
}
.profile-card {
  background: #fff;
  border-radius: 22px;
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.18);
  max-width: 420px;
  width: 100%;
  padding: 36px 32px 28px 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  transition: box-shadow 0.2s;
}
.profile-card:hover {
  box-shadow: 0 12px 40px rgba(102, 126, 234, 0.28);
}
.profile-avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 18px;
}
.profile-avatar {
  width: 110px;
  height: 110px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid #667eea;
  box-shadow: 0 2px 12px rgba(102, 126, 234, 0.18);
  background: #f3f4f6;
}
.profile-avatar-placeholder {
  width: 110px;
  height: 110px;
  border-radius: 50%;
  background: #e0e7ff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 54px;
  color: #667eea;
  border: 4px solid #667eea;
  margin-bottom: 8px;
}
.profile-name {
  font-size: 1.5rem;
  font-weight: 700;
  color: #22223b;
  margin-top: 12px;
}
.profile-nickname {
  font-size: 1.1rem;
  color: #4b5563;
  margin-top: 2px;
  margin-bottom: 4px;
  font-style: italic;
}
.profile-location-age {
  color: #6b7280;
  font-size: 1rem;
  margin-top: 2px;
  display: flex;
  gap: 8px;
  align-items: center;
}
.profile-contact-section {
  display: flex;
  gap: 12px;
  margin-bottom: 18px;
  justify-content: center;
  flex-wrap: wrap;
}
.contact-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 18px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  text-decoration: none;
  transition: background 0.18s, color 0.18s;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.08);
  border: none;
}
.contact-btn.phone {
  background: #22c55e;
  color: #fff;
}
.contact-btn.phone:hover {
  background: #16a34a;
}
.contact-btn.facebook {
  background: #1877f2;
  color: #fff;
}
.contact-btn.facebook:hover {
  background: #145db2;
}
.contact-btn.line {
  background: #06c755;
  color: #fff;
}
.contact-btn.line:hover {
  background: #059c3e;
}
.profile-about-section {
  width: 100%;
  background: linear-gradient(90deg, #e0e7ff 0%, #fff 100%);
  border-radius: 12px;
  padding: 18px 18px 14px 18px;
  margin-bottom: 18px;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.06);
}
.about-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #667eea;
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  gap: 6px;
}
.about-detail {
  color: #22223b;
  font-size: 1.05rem;
  line-height: 1.6;
  min-height: 32px;
}
.profile-extra-section {
  width: 100%;
  margin-bottom: 10px;
}
.extra-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1rem;
  color: #4b5563;
  margin-bottom: 2px;
}
.extra-value {
  font-weight: 500;
  color: #22223b;
}
.profile-gallery-section {
  width: 100%;
  margin-top: 18px;
}
.gallery-title {
  font-size: 1.05rem;
  font-weight: 600;
  color: #667eea;
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  gap: 6px;
}
.gallery-thumbnails {
  display: flex;
  gap: 8px;
  justify-content: center;
  flex-wrap: wrap;
}
.gallery-thumb {
  width: 48px;
  height: 48px;
  object-fit: cover;
  border-radius: 8px;
  border: 2px solid transparent;
  cursor: pointer;
  transition: border 0.18s;
  box-shadow: 0 1px 4px rgba(102, 126, 234, 0.10);
}
.gallery-thumb.active,
.gallery-thumb:hover {
  border: 2px solid #667eea;
}
.admin-login-btn-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 18px;
}
.admin-login-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  font-weight: 600;
  font-size: 1rem;
  padding: 10px 28px;
  border-radius: 8px;
  text-decoration: none;
  box-shadow: 0 2px 12px rgba(102, 126, 234, 0.10);
  transition: background 0.18s, box-shadow 0.18s;
  margin-top: 8px;
}
.admin-login-btn:hover {
  background: linear-gradient(90deg, #5a6fd8 0%, #6a4190 100%);
  box-shadow: 0 4px 18px rgba(102, 126, 234, 0.18);
}
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}
.modal-content {
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.18);
  padding: 32px 28px 24px 28px;
  min-width: 320px;
  max-width: 90vw;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.modal-header {
  font-size: 1.2rem;
  font-weight: 700;
  color: #667eea;
  margin-bottom: 18px;
}
.modal-body {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 18px;
}
.modal-input {
  width: 100%;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid #ccc;
  font-size: 1rem;
}
.login-error {
  color: #ff3333;
  font-size: 0.98rem;
  margin-top: 4px;
  text-align: center;
}
.modal-footer {
  display: flex;
  gap: 12px;
  justify-content: center;
  width: 100%;
}
.modal-btn {
  background: #667eea;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 10px 28px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.18s;
}
.modal-btn.cancel {
  background: #eee;
  color: #333;
}
.modal-btn.cancel:hover {
  background: #ccc;
}
.modal-btn:hover {
  background: #4b5bdc;
}
@media (max-width: 600px) {
  .profile-card {
    padding: 18px 6px 16px 6px;
    max-width: 98vw;
  }
  .profile-card-wrapper {
    padding: 10px 0;
  }
}
</style>
