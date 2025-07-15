<template>
  <footer class="footer">
    <div class="footer-container">
      <!-- Contact Information -->
      <div class="footer-section">
        <div class="footer-section-header">
          <span class="footer-icon">📍</span>
          <h3 class="footer-title">ติดต่อเรา</h3>
        </div>
        <div class="footer-content">
          <div class="contact-item">
            <span class="contact-icon">🏪</span>
            <div class="contact-text">
              <div class="contact-label">ที่อยู่:</div>
              <div class="contact-value">เลขที่ 687/6 อำเภอเวียงป่าเป้า จังหวัดเชียงราย 57100</div>
            </div>
          </div>
          <div class="contact-item">
            <span class="contact-icon">📞</span>
            <div class="contact-text">
              <div class="contact-label">โทรศัพท์:</div>
              <div class="contact-value">097-935-9145</div>
            </div>
          </div>
          <div class="contact-item">
            <span class="contact-icon">📧</span>
            <div class="contact-text">
              <div class="contact-label">อีเมล:</div>
              <a href="mailto:tumsanupong@gmail.com" class="contact-link">tumsanupong@gmail.com</a>
            </div>
          </div>
        </div>
      </div>

      <!-- About Section -->
      <div class="footer-section">
        <div class="footer-section-header">
          <span class="footer-icon">ℹ️</span>
          <h3 class="footer-title">เกี่ยวกับ Website Card</h3>
        </div>
        <div class="footer-content">
          <div class="footer-link">
            <span class="link-icon">👥</span>
            <span class="link-text">เกี่ยวกับเรา</span>
          </div>
          <div class="footer-link">
            <span class="link-icon">🔗</span>
            <span class="link-text">ติดตาม Website Card</span>
          </div>
          <div class="footer-link">
            <span class="link-icon">📱</span>
            <span class="link-text">แอปพลิเคชัน</span>
          </div>
        </div>
      </div>

      <!-- Help Center -->
      <div class="footer-section">
        <div class="footer-section-header">
          <span class="footer-icon">❓</span>
          <h3 class="footer-title">ศูนย์ช่วยเหลือ</h3>
        </div>
        <div class="footer-content">
          <div class="footer-link">
            <span class="link-icon">⭐</span>
            <span class="link-text">ทำไมต้องเลือกสินค้ากับเรา</span>
          </div>
          <div class="footer-link">
            <span class="link-icon">🔒</span>
            <span class="link-text">ปลอดภัยกับผู้ซื้ออย่างไร</span>
          </div>
          <div class="footer-link">
            <span class="link-icon">📖</span>
            <span class="link-text">วิธีการใช้งาน</span>
          </div>
          <div class="footer-link">
            <span class="link-icon">💬</span>
            <span class="link-text">ติดต่อฝ่ายสนับสนุน</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer Bottom -->
    <div class="footer-bottom">
      <div class="footer-bottom-container">
        <div class="copyright">
          © 2024 ITCOM. สงวนลิขสิทธิ์ทุกประการ
        </div>
        <div class="social-links">
          <a href="#" class="social-link" title="Facebook">
            <span class="social-icon">📘</span>
          </a>
          <a href="#" class="social-link" title="Line">
            <span class="social-icon">💬</span>
          </a>
          <a href="#" class="social-link" title="Instagram">
            <span class="social-icon">📷</span>
          </a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'Footer',
}
</script>

<style scoped>
/* Footer Container */
.footer {
  background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
  color: white;
  margin-top: 60px;
  overflow: hidden;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
}

/* Main Footer Content */
.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 40px;
}

/* Footer Section */
.footer-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.footer-section-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.footer-icon {
  font-size: 24px;
}

.footer-title {
  font-size: 18px;
  font-weight: 700;
  margin: 0;
  color: #ecf0f1;
}

/* Footer Content */
.footer-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Contact Items */
.contact-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  transition: all 0.3s ease;
}

.contact-item:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateX(4px);
}

.contact-icon {
  font-size: 18px;
  flex-shrink: 0;
  margin-top: 2px;
}

.contact-text {
  flex: 1;
}

.contact-label {
  font-size: 12px;
  font-weight: 600;
  color: #bdc3c7;
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.contact-value {
  font-size: 14px;
  color: #ecf0f1;
  line-height: 1.4;
}

.contact-link {
  color: #3498db;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.3s ease;
}

.contact-link:hover {
  color: #5dade2;
  text-decoration: underline;
}

/* Footer Links */
.footer-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.footer-link:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateX(4px);
}

.link-icon {
  font-size: 16px;
  flex-shrink: 0;
}

.link-text {
  font-size: 14px;
  color: #ecf0f1;
  font-weight: 500;
}

/* Footer Bottom */
.footer-bottom {
  background: rgba(0, 0, 0, 0.2);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: 20px 0;
}

.footer-bottom-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.copyright {
  font-size: 13px;
  color: #bdc3c7;
}

.social-links {
  display: flex;
  gap: 16px;
}

.social-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  color: white;
  text-decoration: none;
  transition: all 0.3s ease;
}

.social-link:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.social-icon {
  font-size: 18px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .footer-container {
    grid-template-columns: 1fr;
    gap: 30px;
    padding: 30px 16px;
  }
  
  .footer-bottom-container {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }
  
  .contact-item,
  .footer-link {
    padding: 10px;
  }
  
  .footer-title {
    font-size: 16px;
  }
}

@media (max-width: 480px) {
  .footer-container {
    padding: 20px 12px;
  }
  
  .footer-bottom-container {
    padding: 0 12px;
  }
  
  .social-links {
    gap: 12px;
  }
  
  .social-link {
    width: 36px;
    height: 36px;
  }
  
  .social-icon {
    font-size: 16px;
  }
}
</style>
