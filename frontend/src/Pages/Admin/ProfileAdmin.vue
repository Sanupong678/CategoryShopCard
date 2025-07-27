<template>
  <div class="profile-admin-wrapper">
    <div style="display: flex; justify-content: flex-end; margin-bottom: 12px;">
      <button class="btn-logout" @click="logout">Logout</button>
    </div>
    <h2 class="profile-title">ข้อมูลผู้ประกอบการ</h2>
    <div v-if="!isAdmin" class="profile-login-bar">
      <input v-model="loginPassword" type="password" placeholder="รหัสผ่านผู้ดูแลระบบ" class="login-input" />
      <button @click="handleLogin" class="btn-login">เข้าสู่ระบบ</button>
      <span v-if="loginError" class="login-error">รหัสผ่านไม่ถูกต้อง</span>
    </div>
    <div class="profile-admin-flex">
      <!-- ซ้าย: กล่องรูปภาพ -->
      <div class="profile-left">
        <div class="profile-image-box">
          <button class="arrow-btn left" @click="prevImage" :disabled="profile.images.length <= 1">&#60;</button>
          <div class="profile-image-content">
            <img v-if="currentImage" :src="currentImage" class="profile-image-preview-large" />
            <div v-else class="profile-image-placeholder-large">ยังไม่มีรูปภาพ</div>
          </div>
          <button class="arrow-btn right" @click="nextImage" :disabled="profile.images.length <= 1">&#62;</button>
        </div>
        <!-- อัปโหลดรูปโปรไฟล์ -->
        <input type="file" name="images" ref="profileUpload" @change="onFileChange" accept="image/*" id="profile-upload" style="display:none" multiple />
        <label for="profile-upload" class="btn-upload">เลือกไฟล์รูปภาพ</label>
      </div>
      <!-- ขวา: ฟอร์ม 2 คอลัมน์ -->
      <form class="profile-right" @submit.prevent="saveProfile">
        <div class="profile-form-grid">
          <div class="form-group">
            <label>ชื่อจริง</label>
            <input v-model="profile.firstName" type="text" required />
          </div>
          <div class="form-group">
            <label>นามสกุล</label>
            <input v-model="profile.lastName" type="text" required />
          </div>
          <div class="form-group">
            <label>อายุ</label>
            <input v-model="profile.age" type="number" min="1" max="120" required />
          </div>
          <div class="form-group">
            <label>ชื่อเล่น</label>
            <input v-model="profile.nickname" type="text" />
          </div>
          <div class="form-group">
            <label>เบอร์โทรศัพท์</label>
            <input v-model="profile.phone" type="tel" required />
          </div>
          <div class="form-group">
            <label>จังหวัด</label>
            <input v-model="profile.province" type="text" />
          </div>
        </div>
        <div class="form-group">
          <label>รายละเอียด</label>
          <textarea v-model="profile.detail" rows="2"></textarea>
        </div>
        <div class="profile-form-grid">
          <div class="form-group">
            <label>Facebook</label>
            <div style="display:flex; gap:8px; align-items:center;">
              <input v-model="profile.facebook" type="text" placeholder="ลิงก์ Facebook หรือ username" />
              <a v-if="profile.facebook" :href="facebookUrl" target="_blank" class="btn-fb">ไปที่ Facebook</a>
            </div>
          </div>
          <div class="form-group">
            <label>ID Line</label>
            <input v-model="profile.lineId" type="text" />
          </div>
        </div>
        <!-- อัปโหลด QR code -->
        <div class="form-group">
          <label>QR Code Line</label>
          <input type="file" name="qrcode" @change="onQrcodeChange" accept="image/*" />
          <div v-if="profile.qrcode" class="qrcode-preview">
            <img :src="profile.qrcode.startsWith('http') ? profile.qrcode : backendUrl + profile.qrcode" alt="QR Code" style="max-width:120px;max-height:120px;" />
          </div>
        </div>
        <div class="profile-btn-row">
          <button type="button" class="btn-cancel" @click="fetchProfile">ยกเลิก</button>
          <button type="submit" class="btn-primary">ยืนยัน</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>

import axios from 'axios';
export default {
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
        images: [], // array of image url or blob
        qrcode: '', // เพิ่มตัวแปรสำหรับ QR code
        lineQrcodeText: '', // เพิ่มตัวแปรสำหรับข้อความใต้ QR
      },
      currentImageIndex: 0,
      backendUrl: 'http://localhost:5000',
      isAdmin: false, // เพิ่มตัวแปรสำหรับตรวจสอบสิทธิ์
      loginPassword: '', // เพิ่มตัวแปรสำหรับรหัสผ่าน
      loginError: false, // เพิ่มตัวแปรสำหรับแสดงข้อความผิดพลาด
      qrcodeFile: null, // เพิ่มตัวแปรสำหรับไฟล์ QR code
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
        const token = localStorage.getItem('token');
        const res = await axios.get(this.backendUrl + '/api/admin/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // รองรับหลายรูปและ Base64
        let images = [];
        if (res.data.imageUrls && Array.isArray(res.data.imageUrls)) {
          images = res.data.imageUrls.map(url => {
            if (url.startsWith('data:image/')) {
              return url; // Base64 image
            }
            return this.backendUrl + url; // URL image
          });
        } else if (res.data.imageUrl) {
          if (res.data.imageUrl.startsWith('data:image/')) {
            images = [res.data.imageUrl]; // Base64 image
          } else {
            images = [this.backendUrl + res.data.imageUrl]; // URL image
          }
        } else if (res.data.imagesBase64 && Array.isArray(res.data.imagesBase64)) {
          images = res.data.imagesBase64; // Base64 images
        }
        
        this.profile = { ...this.profile, ...res.data, images };
        this.currentImageIndex = 0;
      } catch (err) {
        if (err.response && err.response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('isAdmin');
          this.$router.replace('/');
        }
      }
    },
    onFileChange(e) {
      const files = Array.from(e.target.files);
      this.profile.images = files.map(file => URL.createObjectURL(file));
      // ในการอัปโหลดจริงควรเก็บไฟล์ไว้ด้วย (mockup นี้แค่แสดง preview)
      this.currentImageIndex = 0;
    },
    onQrcodeChange(e) {
      const file = e.target.files[0];
      if (file) {
        this.profile.qrcode = URL.createObjectURL(file);
        this.qrcodeFile = file;
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
    async saveProfile() {
      try {
        const formData = new FormData();
        for (const key in this.profile) {
          if (key === 'images' || key === 'qrcode') continue;
          if (this.profile[key]) formData.append(key, this.profile[key]);
        }
        // แนบไฟล์รูปโปรไฟล์
        if (this.$refs.profileUpload && this.$refs.profileUpload.files.length > 0) {
          Array.from(this.$refs.profileUpload.files).forEach(file => {
            formData.append('images', file);
          });
        }
        // แนบไฟล์ QR code
        if (this.qrcodeFile) {
          formData.append('qrcode', this.qrcodeFile);
        }
        const token = localStorage.getItem('token');
        await axios.put(this.backendUrl + '/api/admin/profile', formData, {
          headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` }
        });
        alert('บันทึกโปรไฟล์สำเร็จ');
        this.fetchProfile();
      } catch (err) {
        if (err.response && err.response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('isAdmin');
          this.$router.replace('/');
        } else {
          alert('เกิดข้อผิดพลาดในการบันทึกโปรไฟล์');
        }
      }
    },
    async handleLogin() {
      try {
        const res = await axios.post('http://localhost:5000/api/auth/login', {
          username: 'admin',
          password: this.loginPassword
        });
        localStorage.setItem('token', res.data.token);
        this.isAdmin = true;
        localStorage.setItem('isAdmin', '1');
        this.loginError = false;
        this.$router.push('/admin');
      } catch (err) {
        this.loginError = true;
      }
    },
    async logout() {
      try {
        await axios.post(this.backendUrl + '/api/auth/logout', {}, { withCredentials: true });
      } catch (e) {}
      localStorage.removeItem('token');
      localStorage.removeItem('isAdmin');
      this.$router.replace('/');
    }
  },
  mounted() {
    this.fetchProfile();
    // ตรวจสอบสิทธิ์ก่อนเข้าหน้า
    const storedIsAdmin = localStorage.getItem('isAdmin');
    if (storedIsAdmin !== '1') {
      this.$router.replace('/');
      return;
    }
    if (storedIsAdmin === '1') {
      this.isAdmin = true;
    }
  }
};
</script>

<style scoped>
.profile-admin-wrapper {
  max-width: 1100px;
  margin: 32px auto;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 16px rgba(0,0,0,0.07);
  padding: 32px 24px 32px 24px;
}
.profile-title {
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 18px;
}
.profile-admin-flex {
  display: flex;
  gap: 36px;
}
.profile-left {
  flex: 0 0 340px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  gap: 18px;
}
.profile-image-box {
  width: 300px;
  height: 350px;
  background: #e3e3e3;
  border-radius: 8px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.profile-image-content {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.profile-image-preview-large {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}
.profile-image-placeholder-large {
  width: 100%;
  text-align: center;
  color: #444;
  font-size: 20px;
}
.arrow-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0,0,0,0.08);
  border: none;
  color: #333;
  font-size: 28px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  cursor: pointer;
  z-index: 2;
  transition: background 0.2s;
}
.arrow-btn.left { left: 8px; }
.arrow-btn.right { right: 8px; }
.arrow-btn:disabled { opacity: 0.3; cursor: not-allowed; }
.btn-upload {
  background: #667eea;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
  display: inline-block;
  margin-top: 8px;
}
.btn-upload:hover { background: #4b5bdc; }
.profile-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.profile-form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px 24px;
}
.form-group label {
  font-weight: 600;
  margin-bottom: 6px;
  display: block;
}
.form-group input[type="text"],
.form-group input[type="email"],
.form-group input[type="tel"],
.form-group input[type="number"],
.form-group textarea {
  width: 100%;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid #ccc;
  font-size: 15px;
}
.form-group textarea { resize: vertical; }
.btn-primary {
  background: #2ecc40;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 12px 32px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-primary:hover { background: #27ae60; }
.btn-cancel {
  background: #eee;
  color: #333;
  border: none;
  border-radius: 8px;
  padding: 12px 32px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  margin-right: 12px;
  transition: all 0.2s;
}
.btn-cancel:hover { background: #ccc; }
.btn-fb {
  background: #1877f2;
  color: #fff;
  border-radius: 6px;
  padding: 6px 14px;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  transition: background 0.2s;
}
.btn-fb:hover { background: #145db2; }
.profile-btn-row {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 18px;
}
.profile-login-bar {
  margin-bottom: 18px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.login-input {
  width: 100%;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid #ccc;
  font-size: 15px;
}
.btn-login {
  background: #667eea;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 12px 32px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-login:hover { background: #4b5bdc; }
.login-error {
  color: #ff0000;
  font-size: 14px;
  text-align: center;
}
.go-admin-bar {
  margin-bottom: 18px;
  display: flex;
  justify-content: flex-end;
}
.btn-go-admin {
  background: #667eea;
  color: #fff;
  border-radius: 6px;
  padding: 7px 18px;
  font-size: 15px;
  font-weight: 600;
  text-decoration: none;
  transition: background 0.2s;
}
.btn-go-admin:hover { background: #4b5bdc; }
.qrcode-preview {
  margin-top: 10px;
  text-align: center;
}
.qrcode-preview img {
  border: 1px solid #ccc;
  border-radius: 8px;
}
.btn-logout {
  background: #e74c3c;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 10px 24px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-logout:hover { background: #c0392b; }
/* Responsive Design */
@media (max-width: 1400px) {
  .profile-admin-wrapper {
    max-width: 1000px;
  }
}

@media (max-width: 1200px) {
  .profile-admin-wrapper {
    max-width: 100%;
    padding: 24px 16px;
  }
  
  .profile-admin-flex {
    gap: 24px;
  }
  
  .profile-left {
    flex: 0 0 300px;
  }
  
  .profile-image-box {
    width: 280px;
    height: 320px;
  }
}

@media (max-width: 992px) {
  .profile-admin-wrapper {
    padding: 20px 12px;
  }
  
  .profile-admin-flex {
    gap: 20px;
  }
  
  .profile-left {
    flex: 0 0 280px;
  }
  
  .profile-image-box {
    width: 260px;
    height: 300px;
  }
  
  .profile-form-grid {
    grid-template-columns: 1fr 1fr;
    gap: 16px 20px;
  }
}

@media (max-width: 768px) {
  .profile-admin-wrapper {
    padding: 16px 10px;
  }
  
  .profile-admin-flex {
    flex-direction: column;
    gap: 20px;
  }
  
  .profile-left {
    flex: none;
    flex-direction: row;
    justify-content: center;
    gap: 20px;
  }
  
  .profile-image-box {
    width: 240px;
    height: 280px;
    margin: 0;
  }
  
  .profile-form-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .profile-title {
    font-size: 20px;
  }
  
  .btn-upload {
    padding: 8px 16px;
    font-size: 14px;
  }
  
  .btn-primary,
  .btn-cancel {
    padding: 10px 24px;
    font-size: 14px;
  }
  
  .btn-logout {
    padding: 8px 20px;
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .profile-admin-wrapper {
    padding: 12px 8px;
  }
  
  .profile-admin-flex {
    gap: 16px;
  }
  
  .profile-left {
    gap: 16px;
  }
  
  .profile-image-box {
    width: 200px;
    height: 240px;
  }
  
  .profile-title {
    font-size: 18px;
  }
  
  .profile-form-grid {
    gap: 12px;
  }
  
  .form-group input[type="text"],
  .form-group input[type="email"],
  .form-group input[type="tel"],
  .form-group input[type="number"],
  .form-group textarea {
    padding: 8px 10px;
    font-size: 14px;
  }
  
  .btn-upload {
    padding: 6px 12px;
    font-size: 13px;
  }
  
  .btn-primary,
  .btn-cancel {
    padding: 8px 20px;
    font-size: 13px;
  }
  
  .btn-logout {
    padding: 6px 16px;
    font-size: 13px;
  }
  
  .btn-fb {
    padding: 4px 10px;
    font-size: 12px;
  }
  
  .login-input {
    padding: 8px 10px;
    font-size: 14px;
  }
  
  .btn-login {
    padding: 10px 24px;
    font-size: 14px;
  }
}

/* Tablet Landscape */
@media (min-width: 768px) and (max-width: 1024px) {
  .profile-admin-wrapper {
    padding: 18px 14px;
  }
  
  .profile-left {
    flex: 0 0 320px;
  }
  
  .profile-image-box {
    width: 300px;
    height: 340px;
  }
}

/* Large Desktop */
@media (min-width: 1600px) {
  .profile-admin-wrapper {
    max-width: 1200px;
  }
  
  .profile-admin-flex {
    gap: 40px;
  }
  
  .profile-left {
    flex: 0 0 380px;
  }
  
  .profile-image-box {
    width: 360px;
    height: 400px;
  }
}
</style>