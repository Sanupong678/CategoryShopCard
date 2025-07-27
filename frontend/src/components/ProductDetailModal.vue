<template>
  <div v-if="product" class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2>รายละเอียดสินค้า</h2>
        <button class="close-btn" @click="closeModal">×</button>
      </div>
      
      <div class="modal-body">
        <!-- Product Images Carousel -->
        <div class="product-images-section">
          <div class="main-image-container">
            <img 
              :src="getModalImageUrl(product.displayImages[currentImageIndex])" 
              :alt="product.nameproduct"
              class="modal-main-image"
              @error="handleModalImageError"
              @click="showImagePopup = true"
            />
            <!-- Navigation Arrows -->
            <button 
              v-if="product.displayImages && product.displayImages.length > 1" 
              class="modal-nav-arrow prev" 
              @click="previousModalImage"
            >
              ‹
            </button>
            <button 
              v-if="product.displayImages && product.displayImages.length > 1" 
              class="modal-nav-arrow next" 
              @click="nextModalImage"
            >
              ›
            </button>
          </div>
          
          <!-- Thumbnail Navigation -->
          <div v-if="product.displayImages && product.displayImages.length > 1" class="modal-thumbnail-nav">
            <div class="modal-thumbnail-container">
              <button 
                v-for="(image, index) in product.displayImages" 
                :key="index"
                class="modal-thumbnail-btn"
                :class="{ active: currentImageIndex === index }"
                @click="goToModalImage(index)"
              >
                <img :src="getModalImageUrl(image)" :alt="`รูปภาพ ${index + 1}`" />
              </button>
            </div>
          </div>
        </div>

        <!-- Product Details -->
        <div class="product-details">
          <div class="product-header">
            <h1 class="modal-product-name">{{ product.nameproduct }}</h1>
            <div class="modal-product-price">
              <span class="price-amount">฿{{ formatPrice(product.price) }}</span>
              <span class="price-unit">บาท</span>
            </div>
          </div>

          <div class="product-meta-info">
            <div class="meta-item">
              <span class="meta-label">หมวดหมู่:</span>
              <span class="meta-value">{{ getCategoryName(product.category) }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">หมวดย่อย:</span>
              <span class="meta-value">{{ product.subcategory }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">เบอร์โทรติดต่อ:</span>
              <span class="meta-value phone-number">{{ product.phone }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">เพิ่มเมื่อ:</span>
              <span class="meta-value">{{ formatDateTime(product.createdAt) }}</span>
            </div>
          </div>

          <div class="product-description-section">
            <h3 class="description-title">รายละเอียดสินค้า</h3>
            <p class="modal-product-description">{{ product.description }}</p>
          </div>

          <!-- Contact Actions -->
          <div class="modal-actions">
            <button class="modal-contact-btn" @click="contactSeller">
              <span class="btn-icon">📞</span>
              ติดต่อผู้ขาย
            </button>
            <button class="modal-call-btn" @click="callSeller">
              <span class="btn-icon">📱</span>
              โทรเลย
            </button>
          </div>
        </div>
      </div>
    </div>
    <!-- Image Popup Modal -->
    <div v-if="showImagePopup" class="image-popup-overlay">
      <div class="image-popup-content">
        <button v-if="product.displayImages && product.displayImages.length > 1" class="image-popup-arrow left" @click.stop="popupPrevImage">‹</button>
        <img :src="getModalImageUrl(product.displayImages[currentImageIndex])" :alt="product.nameproduct" class="image-popup-img" />
        <button v-if="product.displayImages && product.displayImages.length > 1" class="image-popup-arrow right" @click.stop="popupNextImage">›</button>
        <button class="image-popup-close" @click="showImagePopup = false">×</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProductDetailModal',
  props: {
    product: {
      type: Object,
      default: null
    },
    categories: {
      type: Array,
      default: () => []
    },
    backendUrl: {
      type: String,
      default: 'http://localhost:5000'
    }
  },
  emits: ['close'],
  data() {
    return {
      currentImageIndex: 0,
      showImagePopup: false
    }
  },
  watch: {
    product(newProduct) {
      if (newProduct) {
        this.currentImageIndex = 0;
      }
    }
  },
  methods: {
    closeModal() {
      this.$emit('close');
    },
    getModalImageUrl(imagePath) {
      if (!imagePath || !imagePath.trim()) {
        // ใช้ data URL แทนไฟล์
        return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlPC90ZXh0Pjwvc3ZnPg==';
      }
      // ตรวจสอบว่าเป็น Base64 หรือ URL
      if (imagePath.startsWith('data:image/')) {
        return imagePath; // Base64 image
      }
      return this.backendUrl + imagePath; // URL image
    },
    handleModalImageError(event) {
      console.warn('Modal image failed to load:', event.target.src);
      // ใช้ data URL แทนไฟล์
      event.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlPC90ZXh0Pjwvc3ZnPg==';
      event.target.onerror = null; // Prevent infinite loop
    },
    formatPrice(price) {
      return new Intl.NumberFormat('th-TH').format(price);
    },
    getCategoryName(categoryId) {
      const category = this.categories.find(cat => cat._id === categoryId);
      return category ? category.name : 'ไม่ระบุ';
    },
    formatDateTime(dateString) {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    },
    // Modal Image Navigation
    previousModalImage() {
      if (this.product.displayImages && this.product.displayImages.length > 1) {
        this.currentImageIndex = this.currentImageIndex === 0 
          ? this.product.displayImages.length - 1 
          : this.currentImageIndex - 1;
      }
    },
    nextModalImage() {
      if (this.product.displayImages && this.product.displayImages.length > 1) {
        this.currentImageIndex = this.currentImageIndex === this.product.displayImages.length - 1 
          ? 0 
          : this.currentImageIndex + 1;
      }
    },
    goToModalImage(index) {
      this.currentImageIndex = index;
    },
    contactSeller() {
      if (this.product.phone) {
        window.open(`tel:${this.product.phone}`, '_blank');
      }
    },
    callSeller() {
      if (this.product.phone) {
        window.open(`tel:${this.product.phone}`, '_blank');
      }
    },
    popupPrevImage() {
      if (this.product.displayImages && this.product.displayImages.length > 1) {
        this.currentImageIndex = this.currentImageIndex === 0
          ? this.product.displayImages.length - 1
          : this.currentImageIndex - 1;
      }
    },
    popupNextImage() {
      if (this.product.displayImages && this.product.displayImages.length > 1) {
        this.currentImageIndex = this.currentImageIndex === this.product.displayImages.length - 1
          ? 0
          : this.currentImageIndex + 1;
      }
    }
  }
}
</script>

<style scoped>
/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 16px;
  max-width: 900px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  position: relative;
  z-index: 10000;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 30px;
  border-bottom: 1px solid #e0e0e0;
}

.modal-header h2 {
  margin: 0;
  color: #2c3e50;
  font-size: 24px;
  font-weight: 700;
}

.close-btn {
  background: none;
  border: none;
  font-size: 28px;
  cursor: pointer;
  color: #7f8c8d;
  padding: 5px;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: #f8f9fa;
  color: #2c3e50;
}

.modal-body {
  padding: 30px;
  display: flex;
  gap: 40px;
}

/* Product Images Section */
.product-images-section {
  flex: 1;
  max-width: 400px;
}

.main-image-container {
  position: relative;
  height: 300px;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 20px;
}

.modal-main-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.modal-nav-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.6);
  color: white;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  font-size: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-nav-arrow:hover {
  background: rgba(0, 0, 0, 0.8);
  transform: translateY(-50%) scale(1.1);
}

.modal-nav-arrow.prev {
  left: 15px;
}

.modal-nav-arrow.next {
  right: 15px;
}

.modal-thumbnail-nav {
  display: flex;
  justify-content: center;
}

.modal-thumbnail-container {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
}

.modal-thumbnail-btn {
  width: 60px;
  height: 60px;
  border: 2px solid transparent;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  background: none;
  padding: 0;
}

.modal-thumbnail-btn img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.modal-thumbnail-btn.active {
  border-color: #667eea;
  transform: scale(1.1);
}

.modal-thumbnail-btn:not(.active) {
  opacity: 0.6;
}

/* Product Details Section */
.product-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.product-header {
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 20px;
}

.modal-product-name {
  font-size: 28px;
  font-weight: 800;
  color: #2c3e50;
  margin: 0 0 16px 0;
  line-height: 1.2;
}

.modal-product-price {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.price-amount {
  font-size: 32px;
  font-weight: 900;
  color: #e74c3c;
}

.price-unit {
  font-size: 16px;
  color: #7f8c8d;
}

.product-meta-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.meta-label {
  font-weight: 600;
  color: #2c3e50;
  min-width: 120px;
}

.meta-value {
  color: #6c757d;
}

.phone-number {
  color: #667eea;
  font-weight: 600;
  cursor: pointer;
}

.phone-number:hover {
  text-decoration: underline;
}

.product-description-section {
  flex: 1;
}

.description-title {
  font-size: 18px;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 12px 0;
}

.modal-product-description {
  font-size: 16px;
  color: #6c757d;
  line-height: 1.6;
  margin: 0;
}

.modal-actions {
  display: flex;
  gap: 16px;
  margin-top: auto;
}

.modal-contact-btn, .modal-call-btn {
  flex: 1;
  padding: 16px 24px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.modal-contact-btn {
  background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%);
  color: white;
}

.modal-contact-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(46, 204, 113, 0.3);
}

.modal-call-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.modal-call-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.3);
}

/* Responsive Design */
@media (max-width: 768px) {
  .modal-body {
    flex-direction: column;
    gap: 30px;
  }

  .product-images-section {
    max-width: 100%;
  }

  .modal-actions {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .modal-content {
    margin: 10px;
    max-height: 95vh;
  }

  .modal-header {
    padding: 20px;
  }

  .modal-body {
    padding: 20px;
  }

  .modal-product-name {
    font-size: 24px;
  }

  .price-amount {
    font-size: 28px;
  }
}

/* Image Popup Modal */
.image-popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.85);
  z-index: 10001;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.2s;
}
.image-popup-content {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10002;
}
.image-popup-img {
  max-width: 80vw;
  max-height: 80vh;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.25);
  background: #fff;
}
.image-popup-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.6);
  color: white;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  font-size: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10003; /* Ensure arrows are above image */
}
.image-popup-arrow:hover {
  background: rgba(0, 0, 0, 0.8);
  transform: translateY(-50%) scale(1.1);
}
.image-popup-arrow.left {
  left: 15px;
}
.image-popup-arrow.right {
  right: 15px;
}
.image-popup-close {
  position: absolute;
  top: -18px;
  right: -18px;
  background: #fff;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  font-size: 2rem;
  color: #333;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
  z-index: 10004;
}
.image-popup-close:hover {
  background: #f0f0f0;
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style> 