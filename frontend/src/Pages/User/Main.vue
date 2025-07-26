<template>
  <div class="admin-container">
    <!-- Banner Section -->
    <div class="banner-section">
      <div v-if="banner && banner.imageUrl" class="banner-display">
        <img :src="getBannerImageUrl(banner)" class="banner-image" />
      </div>
    </div>

    <!-- Category Section -->
    <div class="section-header">
      <h2 class="section-title">📦 หมวดหมู่สินค้า</h2>
      <p class="section-subtitle">หมวดหมู่สินค้าของร้านค้า</p>
    </div>
    <div class="category-container">
      <button 
        v-if="categories.length > 8 && currentPage > 0" 
        class="nav-arrow left-arrow" 
        @click="previousPage"
        title="รายการก่อนหน้า"
      >
        ‹
      </button>
      <div class="category-grid">
        <router-link 
          v-for="category in displayedCategories" 
          :key="category._id" 
          :to="`/shop/${category._id}`" 
          class="category-card"
        >
          <div class="category-image-container">
            <img :src="getCategoryImageUrl(category)" :alt="category.name" class="category-image" />
          </div>
          <div class="category-name">{{ category.name }}</div>
        </router-link>
      </div>
      <button 
        v-if="categories.length > 8 && hasNextPage" 
        class="nav-arrow right-arrow" 
        @click="nextPage"
        title="รายการถัดไป"
      >
        ›
      </button>
    </div>
    <div v-if="categories.length > 8" class="pagination-info">
      <div class="pagination-text">
        <span class="current-page">หน้า {{ currentPage + 1 }}</span>
        <span class="separator">จาก</span>
        <span class="total-pages">{{ totalPages }}</span>
      </div>
      <div class="total-items">(ทั้งหมด {{ categories.length }} รายการ)</div>
    </div>

    <!-- Latest Products Section -->
    <div class="latest-section">
      <div class="section-header">
        <h2 class="section-title">🆕 สินค้าล่าสุด</h2>
        <p class="section-subtitle">สินค้าใหม่ที่เพิ่มเข้ามาใน 7 วันที่ผ่านมา</p>
      </div>
      <div v-if="loadingProducts" class="loading-container">
        <div class="loading-spinner"></div>
        <p class="loading-text">กำลังโหลดสินค้าล่าสุด...</p>
      </div>
      <div v-else-if="latestProducts.length === 0" class="no-products-container">
        <div class="no-products-icon">📦</div>
        <h3 class="no-products-title">ยังไม่มีสินค้าใหม่</h3>
        <p class="no-products-description">ยังไม่มีสินค้าใหม่ที่เพิ่มเข้ามาใน 7 วันที่ผ่านมา</p>
      </div>
      <div v-else class="product-grid">
        <ProductCard
          v-for="product in latestProducts"
          :key="product._id"
          :product="product"
          :categories="categories"
          :backend-url="backendUrl"
          :show-new-badge="true"
          :show-description="false"
          :show-time="true"
          :show-actions="true"
          :show-admin-actions="false"
          @card-click="viewProduct"
          @contact="contactSeller"
        />
      </div>
    </div>

    <!-- Why Choose Us Section -->
    <WhyContent
      :title="whyTitle"
      :subtitle="whySubtitle"
      :color="whyContent.color"
      :color2="whyContent.color2"
      :description="whyContent.description"
      :features="whyContent.features"
    />

    <!-- Product Detail Modal -->
    <ProductDetailModal
      :product="selectedProduct"
      :categories="categories"
      :backend-url="backendUrl"
      @close="closeProductModal"
    />
  </div>
</template>
<script>
import axios from 'axios';
import ProductCard from '../../components/ProductCard.vue';
import ProductDetailModal from '../../components/ProductDetailModal.vue';
import NavbarUser from '../../components/NavbarUser.vue';
import WhyContent from '../../components/WhyContent.vue';

export default {
  components: {
    ProductCard,
    ProductDetailModal,
    NavbarUser,
    WhyContent
  },
  data() {
    return {
      banner: null,
      backendUrl: 'http://localhost:5000',
      categories: [],
      currentPage: 0,
      itemsPerPage: 8,
      latestProducts: [],
      loadingProducts: true,
      selectedProduct: null,
      whyContent: { color: '#f8f9fd', description: '', features: [] },
      whyTitle: '💡 ทำไมต้องเลือกเรา?',
      whySubtitle: 'ข้อดีของการใช้ Website Card',
    }
  },
  computed: {
    displayedCategories() {
      const start = this.currentPage * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.categories.slice(start, end);
    },
    hasNextPage() {
      return (this.currentPage + 1) * this.itemsPerPage < this.categories.length;
    },
    totalPages() {
      return Math.ceil(this.categories.length / this.itemsPerPage);
    }
  },
  methods: {
    async fetchBanner() {
      try {
        const res = await axios.get(this.backendUrl + '/api/banner');
        this.banner = res.data;
        console.log('Banner data:', this.banner);
      } catch (error) {
        console.error('Error fetching banner:', error);
      }
    },
    async fetchCategories() {
      try {
        const response = await axios.get(`${this.backendUrl}/api/categories`);
        this.categories = response.data;
        console.log('Categories data:', this.categories);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    },
    async fetchLatestProducts() {
      try {
        this.loadingProducts = true;
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const response = await axios.get(`${this.backendUrl}/api/products`);
        const allProducts = response.data;
        this.latestProducts = allProducts.filter(product => {
          const productDate = new Date(product.createdAt);
          return productDate >= sevenDaysAgo;
        }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      } catch (error) {
        console.error('Error fetching latest products:', error);
      } finally {
        this.loadingProducts = false;
      }
    },
    async fetchWhyContent() {
      try {
        const res = await axios.get(this.backendUrl + '/api/whycontent');
        this.whyContent = res.data;
        if (res.data.title) this.whyTitle = res.data.title;
        if (res.data.subtitle) this.whySubtitle = res.data.subtitle;
      } catch (e) {
        this.whyContent = { color: '#f8f9fd', description: '', features: [] };
      }
    },
    nextPage() {
      if (this.hasNextPage) {
        this.currentPage++;
      }
    },
    previousPage() {
      if (this.currentPage > 0) {
        this.currentPage--;
      }
    },
    viewProduct(product) {
      this.selectedProduct = product;
    },
    closeProductModal() {
      this.selectedProduct = null;
    },
    contactSeller(product) {
      if (product.phone) {
        window.open(`tel:${product.phone}`, '_blank');
      }
    },
    getCategoryImageUrl(category) {
      // ตรวจสอบว่าเป็น Base64 หรือ URL
      if (category.image && category.image.startsWith('data:image/')) {
        return category.image; // Base64 image
      }
      if (category.imageUrl) {
        return this.backendUrl + category.imageUrl; // URL image
      }
      // ใช้ data URL แทนไฟล์
      return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlPC90ZXh0Pjwvc3ZnPg==';
    },
    getBannerImageUrl(banner) {
      if (banner.image && banner.image.startsWith('data:image/')) {
        return banner.image; // Base64 image
      }
      if (banner.imageUrl) {
        return this.backendUrl + banner.imageUrl; // URL image
      }
      // ใช้ data URL แทนไฟล์
      return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlPC90ZXh0Pjwvc3ZnPg==';
    }
  },
  mounted() {
    this.fetchBanner();
    this.fetchCategories();
    this.fetchLatestProducts();
    this.fetchWhyContent();
  }
}
</script>
<style>
/* Global Styles */
* {
  box-sizing: border-box;
}

.admin-container {
  max-width: 1600px;
  margin: 0 auto;
  padding: 20px;
  background: #f8f9fa;
  min-height: 100vh;
}

/* Banner Section */
.banner-section {
  margin-bottom: 40px;
}

.banner-upload-area {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 60px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.2);
  border: 2px dashed rgba(255, 255, 255, 0.3);
}

.banner-upload-area:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(102, 126, 234, 0.3);
}

.upload-content {
  color: white;
}

.upload-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.upload-text {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 8px;
}

.upload-subtitle {
  font-size: 14px;
  opacity: 0.8;
}

.banner-display {
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.banner-image {
  width: 100%;
  height: 400px;
  object-fit: cover;
}

.banner-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20px;
  display: flex;
  justify-content: center;
}

.edit-banner-btn {
  background: rgba(255, 255, 255, 0.9);
  color: #333;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.edit-banner-btn:hover {
  background: white;
  transform: translateY(-1px);
}

.edit-icon {
  font-size: 16px;
}

/* Section Headers */
.section-header {
  text-align: center;
  margin-bottom: 32px;
}

.section-title {
  font-size: 28px;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 8px 0;
}

.section-subtitle {
  font-size: 16px;
  color: #7f8c8d;
  margin: 0;
}

.category-container {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 24px;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 20px;
  flex: 1;
}

.category-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  text-align: center;
  transition: all 0.3s ease;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  border: 1px solid #f0f0f0;
  position: relative;
  width: 150px;
  min-height: 120px;
  text-decoration: none !important;
  color: #2c3e50 !important;
}

.category-card:visited, .category-card:active, .category-card:hover {
  text-decoration: none !important;
  color: #2c3e50 !important;
}

.category-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.category-image-container {
  position: relative;
  margin-bottom: 12px;
}

.category-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
  margin: 0 auto 8px;
  display: block;
}

.category-overlay {
  position: absolute;
  top: -8px;
  right: -8px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.category-card:hover .category-overlay {
  opacity: 1;
}

.delete-category-btn {
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(231, 76, 60, 0.3);
}

.delete-category-btn:hover {
  background: #c0392b;
  transform: scale(1.1);
}

.category-name {
  font-size: 14px;
  font-weight: 600;
  color: #2c3e50;
  line-height: 1.4;
  word-break: break-word;
}

/* Navigation Arrows */
.nav-arrow {
  background: #ecf0f1;
  color: #7f8c8d;
  border: none;
  border-radius: 50%;
  width: 44px;
  height: 44px;
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.nav-arrow:hover {
  background: #d5dbdb;
  color: #2c3e50;
  transform: scale(1.05);
}

/* Pagination Info */
.pagination-info {
  text-align: center;
  margin-bottom: 24px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

.pagination-text {
  margin-bottom: 4px;
}

.current-page {
  font-weight: 600;
  color: #2c3e50;
}

.separator {
  color: #7f8c8d;
  margin: 0 8px;
}

.total-pages {
  font-weight: 600;
  color: #2c3e50;
}

.total-items {
  color: #95a5a6;
  font-size: 14px;
}

/* Add Category Section */
.add-category-section {
  display: flex;
  justify-content: center;
}

.add-category-btn {
  background: #34495e;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 12px rgba(52, 73, 94, 0.3);
}

.add-category-btn:hover {
  background: #2c3e50;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(52, 73, 94, 0.4);
}

.add-icon {
  font-size: 16px;
}

/* Latest Products Section */
.latest-section {
  background: white;
  border-radius: 16px;
  padding: 32px;
  margin-bottom: 40px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

/* Loading State */
.loading-container {
  text-align: center;
  padding: 60px 20px;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  font-size: 16px;
  color: #666;
  margin: 0;
}

/* No Products State */
.no-products-container {
  text-align: center;
  padding: 60px 20px;
}

.no-products-icon {
  font-size: 60px;
  margin-bottom: 20px;
}

.no-products-title {
  font-size: 20px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 10px 0;
}

.no-products-description {
  font-size: 14px;
  color: #7f8c8d;
  margin: 0;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 20px;
  max-width: 100%;
}

.product-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  border: 1px solid #f0f0f0;
  cursor: pointer;
  position: relative;
  width: 220px;
  height: 320px;
  flex-shrink: 0;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
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

.product-price {
  font-size: 16px;
  font-weight: 700;
  color: #27ae60;
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

/* Why Section */
.why-section {
  background: linear-gradient(135deg, #e90e0e 0%, #ffffff 100%);
  border-radius: 16px;
  padding: 40px;
  color: white;
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.2);
}

.why-section .section-title {
  color: white;
}

.why-section .section-subtitle {
  color: rgba(255, 255, 255, 0.8);
}

.why-content {
  margin-top: 24px;
}

.why-text {
  font-size: 16px;
  line-height: 1.7;
  margin-bottom: 24px;
  opacity: 0.9;
}

.why-features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  backdrop-filter: blur(10px);
}

.feature-icon {
  font-size: 24px;
}

.feature-text {
  font-size: 14px;
  font-weight: 500;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: white;
  border-radius: 16px;
  width: 500px;
  max-width: 90vw;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: modalSlideIn 0.3s ease;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 24px 0 24px;
  border-bottom: 1px solid #ecf0f1;
  margin-bottom: 24px;
}

.modal-title {
  font-size: 20px;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  font-size: 24px;
  color: #7f8c8d;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.modal-close:hover {
  background: #ecf0f1;
  color: #2c3e50;
}

.modal-body {
  padding: 0 24px;
}

.form-group {
  margin-bottom: 24px;
}

.form-label {
  display: block;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 8px;
  font-size: 14px;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #ecf0f1;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s ease;
  background: white;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.image-upload-area {
  border: 2px dashed #bdc3c7;
  border-radius: 12px;
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #f8f9fa;
}

.image-upload-area:hover {
  border-color: #667eea;
  background: #f0f4ff;
}

.upload-placeholder {
  color: #7f8c8d;
}

.upload-icon-large {
  font-size: 48px;
  margin-bottom: 16px;
}

.upload-text-large {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #2c3e50;
}

.upload-hint {
  font-size: 12px;
  color: #95a5a6;
}

.image-preview {
  max-width: 100%;
  max-height: 200px;
  object-fit: contain;
  border-radius: 8px;
}

.modal-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding: 24px;
  border-top: 1px solid #ecf0f1;
  margin-top: 24px;
}

.btn-secondary {
  background: #ecf0f1;
  color: #2c3e50;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  background: #d5dbdb;
}

.btn-primary {
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary:hover:not(:disabled) {
  background: #5a6fd8;
  transform: translateY(-1px);
}

.btn-primary:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
  transform: none;
}

/* Responsive Design */
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
  .admin-container {
    padding: 16px;
  }
  
  .section-title {
    font-size: 24px;
  }
  
  .category-grid {
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
    gap: 16px;
  }
  
  .product-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
  
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
  
  .why-features {
    grid-template-columns: 1fr;
  }
  
  .modal-content {
    width: 95vw;
  }
}

@media (max-width: 480px) {
  .product-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
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
}
</style>
