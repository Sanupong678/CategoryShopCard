<template>
  <div class="product-card" @click="handleCardClick">
    <!-- New Badge (if showNewBadge is true) -->
    <div v-if="showNewBadge" class="new-product-badge">
      <span class="badge-text">NEW</span>
    </div>

    <!-- Product Image -->
    <div class="product-image-container">
      <img 
        :src="getProductImage()" 
        :alt="product.nameproduct" 
        class="product-image"
        @error="handleImageError"
      />
      <div class="product-overlay">
        <button class="view-details-btn">ดูรายละเอียด</button>
      </div>
      <!-- Sold Status Overlay -->
      <div v-if="product.status === 'ขาย'" class="sold-overlay">
        <div class="sold-badge">ขายแล้ว</div>
      </div>
    </div>

    <!-- Product Info -->
    <div class="product-info">
      <h3 class="product-name">{{ product.nameproduct }}</h3>
      <div class="product-meta">
        <span class="product-category">{{ getCategoryName() }}</span>
        <span class="product-subcategory">{{ product.subcategory }}</span>
      </div>
      <div class="product-price-container">
        <span class="product-price">฿{{ formatPrice(product.price) }}</span>
        <span class="price-unit">บาท</span>
      </div>
      <div v-if="showDescription" class="product-description">
        {{ truncateDescription(product.description) }}
      </div>
      <div v-if="showTime" class="added-time">
        <span class="time-icon">⏰</span>
        <span class="time-text">เพิ่มเมื่อ {{ formatTimeAgo(product.createdAt) }}</span>
      </div>
    </div>

    <!-- Product Actions -->
    <div v-if="showActions" class="product-actions">
      <button class="contact-btn" @click.stop="handleContact">
        <span class="btn-icon">📞</span>
        ติดต่อผู้ขาย
      </button>
    </div>

    <!-- Admin Actions (if showAdminActions is true) -->
    <div v-if="showAdminActions" class="admin-actions">
      <button class="edit-btn" @click.stop="handleEdit">
        แก้ไข
      </button>
      <button class="delete-btn" @click.stop="handleDelete">
        ลบ
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProductCard',
  props: {
    product: {
      type: Object,
      required: true
    },
    categories: {
      type: Array,
      default: () => []
    },
    backendUrl: {
      type: String,
      default: 'http://localhost:5000'
    },
    showNewBadge: {
      type: Boolean,
      default: false
    },
    showDescription: {
      type: Boolean,
      default: true
    },
    showTime: {
      type: Boolean,
      default: false
    },
    showActions: {
      type: Boolean,
      default: true
    },
    showAdminActions: {
      type: Boolean,
      default: false
    }
  },
  emits: ['card-click', 'contact', 'edit', 'delete'],
  methods: {
    getProductImage() {
      // ตรวจสอบว่าเป็น Base64 หรือ URL
      if (this.product.displayImages && this.product.displayImages.length > 0) {
        const imageUrl = this.product.displayImages[0];
        if (imageUrl && imageUrl.trim()) {
          if (imageUrl.startsWith('data:image/')) {
            return imageUrl; // Base64 image
          }
          return this.backendUrl + imageUrl; // URL image
        }
      }
      // ใช้ data URL แทนไฟล์
      return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlPC90ZXh0Pjwvc3ZnPg==';
    },
    handleImageError(event) {
      console.warn('Image failed to load:', event.target.src);
      // ใช้ data URL แทนไฟล์
      event.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlPC90ZXh0Pjwvc3ZnPg==';
      event.target.onerror = null; // Prevent infinite loop
    },
    formatPrice(price) {
      return new Intl.NumberFormat('th-TH').format(price);
    },
    getCategoryName() {
      const category = this.categories.find(cat => cat._id === this.product.category);
      return category ? category.name : 'ไม่ระบุ';
    },
    truncateDescription(description) {
      if (!description) return '';
      return description.length > 100 ? description.substring(0, 100) + '...' : description;
    },
    formatTimeAgo(dateString) {
      const date = new Date(dateString);
      const now = new Date();
      const diffInMs = now - date;
      const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
      const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));

      if (diffInDays > 0) {
        return `${diffInDays} วันที่แล้ว`;
      } else if (diffInHours > 0) {
        return `${diffInHours} ชั่วโมงที่แล้ว`;
      } else if (diffInMinutes > 0) {
        return `${diffInMinutes} นาทีที่แล้ว`;
      } else {
        return 'เมื่อสักครู่';
      }
    },
    handleCardClick() {
      this.$emit('card-click', this.product);
    },
    handleContact() {
      this.$emit('contact', this.product);
    },
    handleEdit() {
      this.$emit('edit', this.product);
    },
    handleDelete() {
      this.$emit('delete', this.product);
    }
  }
}
</script>

<style scoped>
/* Shared Product Grid Layout */
.product-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 20px;
  max-width: 100%;
}

/* Responsive Design for Product Grid */
@media (max-width: 1200px) {
  .product-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 992px) {
  .product-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .product-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
}

@media (max-width: 480px) {
  .product-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
}

.product-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12), 0 1.5px 6px rgba(60, 60, 60, 0.06);
  transition: all 0.3s ease;
  border: 1px solid #f0f0f0;
  cursor: pointer;
  position: relative;
  width: 220px;
  height: 320px;
  flex-shrink: 0;
  z-index: 1;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18), 0 2px 8px rgba(60, 60, 60, 0.10);
}

.new-product-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 700;
  z-index: 2;
  box-shadow: 0 2px 8px rgba(255, 107, 107, 0.3);
}

.product-image-container {
  position: relative;
  height: 140px;
  overflow: hidden;
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.product-card:hover .product-image {
  transform: scale(1.05);
}

.product-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.product-card:hover .product-overlay {
  opacity: 1;
}

.view-details-btn {
  background: white;
  color: #2c3e50;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.view-details-btn:hover {
  background: #667eea;
  color: white;
  transform: scale(1.05);
}

/* Sold Status Overlay */
.sold-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3;
}

.sold-badge {
  background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  box-shadow: 0 4px 12px rgba(231, 76, 60, 0.4);
  transform: rotate(-5deg);
}

.product-info {
  padding: 16px;
  height: 180px;
  display: flex;
  flex-direction: column;
}

.product-name {
  font-size: 14px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 6px 0;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex: 1;
}

.product-meta {
  display: flex;
  gap: 6px;
  margin-bottom: 6px;
  flex-wrap: wrap;
}

.product-category {
  background: #667eea;
  color: white;
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 9px;
  font-weight: 600;
}

.product-subcategory {
  background: #f8f9fa;
  color: #6c757d;
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 9px;
  font-weight: 600;
}

.product-price-container {
  display: flex;
  align-items: baseline;
  gap: 4px;
  margin-bottom: 6px;
}

.product-price {
  font-size: 16px;
  font-weight: 700;
  color: #27ae60;
}

.price-unit {
  font-size: 12px;
  color: #7f8c8d;
}

.product-description {
  font-size: 12px;
  color: #6c757d;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 6px;
}

.added-time {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  color: #95a5a6;
  margin-top: auto;
}

.time-icon {
  font-size: 10px;
}

.product-actions {
  padding: 0 16px 16px 16px;
}

.contact-btn {
  width: 100%;
  background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%);
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.contact-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(46, 204, 113, 0.3);
}

.btn-icon {
  font-size: 14px;
}

.admin-actions {
  padding: 0 16px 16px 16px;
  display: flex;
  gap: 8px;
}

.edit-btn, .delete-btn {
  flex: 1;
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.edit-btn {
  background: #3498db;
  color: white;
}

.edit-btn:hover {
  background: #2980b9;
  transform: translateY(-1px);
}

.delete-btn {
  background: #e74c3c;
  color: white;
}

.delete-btn:hover {
  background: #c0392b;
  transform: translateY(-1px);
}

/* Responsive Design for Product Card */
@media (max-width: 1200px) {
  .product-card {
    width: 100%;
    height: 320px;
  }
  
  .product-image-container {
    height: 140px;
  }
  
  .product-info {
    height: 180px;
    padding: 14px;
  }
  
  .product-name {
    font-size: 14px;
  }
  
  .product-price {
    font-size: 16px;
  }
  
  .product-meta {
    gap: 4px;
  }
  
  .product-category,
  .product-subcategory {
    font-size: 8px;
    padding: 1px 4px;
  }
}

@media (max-width: 768px) {
  .product-card {
    width: 100%;
    height: 280px;
  }
  
  .product-image-container {
    height: 120px;
  }
  
  .product-info {
    height: 160px;
    padding: 12px;
  }
  
  .product-name {
    font-size: 13px;
  }
  
  .product-price {
    font-size: 15px;
  }
  
  .product-meta {
    gap: 3px;
  }
  
  .product-category,
  .product-subcategory {
    font-size: 7px;
    padding: 1px 3px;
  }
  
  .contact-btn {
    padding: 6px 10px;
    font-size: 11px;
  }
  
  .btn-icon {
    font-size: 12px;
  }
  
  .sold-badge {
    padding: 7px 14px;
    font-size: 13px;
    letter-spacing: 0.8px;
  }
}

@media (max-width: 480px) {
  .product-card {
    width: 100%;
    height: 260px;
  }
  
  .product-image-container {
    height: 100px;
  }
  
  .product-info {
    height: 160px;
    padding: 10px;
  }
  
  .product-name {
    font-size: 12px;
  }
  
  .product-price {
    font-size: 14px;
  }
  
  .product-meta {
    gap: 2px;
  }
  
  .product-category,
  .product-subcategory {
    font-size: 6px;
    padding: 1px 2px;
  }
  
  .contact-btn {
    padding: 5px 8px;
    font-size: 10px;
  }
  
  .btn-icon {
    font-size: 11px;
  }
  
  .admin-actions {
    padding: 0 10px 10px 10px;
    gap: 6px;
  }
  
  .edit-btn, .delete-btn {
    padding: 6px 8px;
    font-size: 10px;
  }
  
  .sold-badge {
    padding: 6px 12px;
    font-size: 12px;
    letter-spacing: 0.5px;
  }
}

/* Tablet Landscape */
@media (min-width: 768px) and (max-width: 1024px) {
  .product-card {
    height: 300px;
  }
  
  .product-image-container {
    height: 130px;
  }
  
  .product-info {
    height: 170px;
    padding: 13px;
  }
}

/* Large Desktop */
@media (min-width: 1600px) {
  .product-card {
    height: 340px;
  }
  
  .product-image-container {
    height: 150px;
  }
  
  .product-info {
    height: 190px;
    padding: 16px;
  }
  
  .product-name {
    font-size: 15px;
  }
  
  .product-price {
    font-size: 17px;
  }
}
</style> 