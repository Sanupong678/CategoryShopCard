<template>
  <div class="pageshop-wrapper">
    <!-- Hero Section -->
    <div class="hero-section">
      <div class="hero-background">
        <div class="hero-overlay"></div>
      </div>
      <div class="hero-content">
        <div class="category-info">
          <div class="category-image-container">
            <img 
              v-if="category" 
              :src="getCategoryImageUrl(category)" 
              class="category-image" 
              :alt="category?.name"
            />
            <div v-else class="category-placeholder">
              <span class="placeholder-icon">📦</span>
            </div>
          </div>
          <div class="category-details">
            <h1 class="category-title">{{ category?.name || 'หมวดหมู่สินค้า' }}</h1>
            <p class="category-description">ค้นพบสินค้าคุณภาพในหมวดหมู่นี้</p>
            <div class="product-count">
              <span class="count-number">{{ products.length }}</span>
              <span class="count-text">สินค้า</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="main-content">
      <div class="content-container">
        <!-- Loading State -->
        <div v-if="loading" class="loading-container">
          <div class="loading-spinner"></div>
          <p class="loading-text">กำลังโหลดสินค้า...</p>
        </div>

        <!-- Products Section -->
        <div v-else>
          <!-- Section Header -->
          <div class="section-header">
            <div class="section-title">
              <h2>สินค้าในหมวดหมู่นี้</h2>
              <div class="title-underline"></div>
            </div>
            <div class="section-actions">
              <div class="filter-controls">
                <select class="sort-select" v-model="sortBy" @change="sortProducts">
                  <option value="name">เรียงตามชื่อ</option>
                  <option value="price-low">ราคาต่ำไปสูง</option>
                  <option value="price-high">ราคาสูงไปต่ำ</option>
                </select>
              </div>
            </div>
          </div>

          <!-- No Products State -->
          <div v-if="products.length === 0" class="no-products-container">
            <div class="no-products-icon">🛍️</div>
            <h3 class="no-products-title">ยังไม่มีสินค้า</h3>
            <p class="no-products-description">ยังไม่มีสินค้าในหมวดหมู่นี้ กรุณาตรวจสอบอีกครั้งในภายหลัง</p>
          </div>

          <!-- Products Grid -->
          <div v-else class="products-grid">
            <ProductCard
              v-for="product in sortedProducts"
              :key="product._id"
              :product="product"
              :categories="categories"
              :backend-url="backendUrl"
              :show-new-badge="false"
              :show-description="true"
              :show-time="false"
              :show-actions="true"
              :show-admin-actions="false"
              @card-click="viewProduct"
              @contact="contactSeller"
            />
          </div>

          <!-- Load More Button -->
          <div v-if="products.length > 0" class="load-more-section">
            <button class="load-more-btn">
              <span class="btn-text">โหลดสินค้าเพิ่มเติม</span>
              <span class="btn-icon">↓</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Product Detail Modal -->
    <ProductDetailModal
      :product="selectedProduct"
      :categories="categories"
      :backend-url="backendUrl"
      @close="closeModal"
    />
  </div>
</template>

<script>
import axios from 'axios';
import ProductCard from './ProductCard.vue';
import ProductDetailModal from './ProductDetailModal.vue';

export default {
  components: {
    ProductCard,
    ProductDetailModal
  },
  name: 'PageShop',
  data() {
    return {
      category: null,
      products: [],
      backendUrl: 'http://localhost:5000',
      loading: true,
      sortBy: 'name',
      categories: [],
      selectedProduct: null,
      currentImageIndex: 0
    }
  },
  computed: {
    sortedProducts() {
      const products = [...this.products];
      switch (this.sortBy) {
        case 'name':
          return products.sort((a, b) => a.nameproduct.localeCompare(b.nameproduct));
        case 'price-low':
          return products.sort((a, b) => a.price - b.price);
        case 'price-high':
          return products.sort((a, b) => b.price - a.price);
        default:
          return products;
      }
    }
  },
  async created() {
    await this.fetchCategories();
    await this.fetchData();
  },
  methods: {
    async fetchCategories() {
      try {
        const response = await axios.get(`${this.backendUrl}/api/categories`);
        this.categories = response.data;
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    },
    async fetchData() {
      try {
        const categoryId = this.$route.params.categoryId;
        
        // Fetch category data
        const catRes = await axios.get(`${this.backendUrl}/api/categories/${categoryId}`);
        this.category = catRes.data;
        
        // Fetch products in category
        const prodRes = await axios.get(`${this.backendUrl}/api/products/by-category?category=${categoryId}`);
        this.products = prodRes.data;
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        this.loading = false;
      }
    },
    getProductImage(product) {
      if (product.images && product.images.length > 0) {
        const imageUrl = product.images[0];
        if (imageUrl && imageUrl.trim()) {
          // ตรวจสอบว่าเป็น Base64 หรือ URL
          if (imageUrl.startsWith('data:image/')) {
            return imageUrl; // Base64 image
          }
          return this.backendUrl + imageUrl; // URL image
        }
      }
      // ใช้ data URL แทนไฟล์
      return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlPC90ZXh0Pjwvc3ZnPg==';
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
    handleImageError(event) {
      console.warn('Image failed to load:', event.target.src);
      // ใช้ data URL แทนไฟล์
      event.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlPC90ZXh0Pjwvc3ZnPg==';
      event.target.onerror = null; // Prevent infinite loop
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
    truncateDescription(description) {
      if (!description) return '';
      return description.length > 100 ? description.substring(0, 100) + '...' : description;
    },
    sortProducts() {
      // This will trigger the computed property
    },
    viewProduct(product) {
      this.selectedProduct = product;
      this.currentImageIndex = 0;
    },
    closeModal() {
      this.selectedProduct = null;
      this.currentImageIndex = 0;
    },
    // Modal Image Navigation
    previousModalImage() {
      if (this.selectedProduct.images && this.selectedProduct.images.length > 1) {
        this.currentImageIndex = this.currentImageIndex === 0 
          ? this.selectedProduct.images.length - 1 
          : this.currentImageIndex - 1;
      }
    },
    nextModalImage() {
      if (this.selectedProduct.images && this.selectedProduct.images.length > 1) {
        this.currentImageIndex = this.currentImageIndex === this.selectedProduct.images.length - 1 
          ? 0 
          : this.currentImageIndex + 1;
      }
    },
    goToModalImage(index) {
      this.currentImageIndex = index;
    },
    contactSeller(product) {
      // Open contact modal or navigate to contact page
      if (product.phone) {
        window.open(`tel:${product.phone}`, '_blank');
      }
    },
    callSeller(product) {
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
    }
  }
}
</script>

<style scoped>
.pageshop-wrapper {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

/* Hero Section */
.hero-section {
  position: relative;
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.hero-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
}

.hero-content {
  position: relative;
  z-index: 2;
  max-width: 1200px;
  width: 100%;
  padding: 0 20px;
}

.category-info {
  display: flex;
  align-items: center;
  gap: 30px;
  color: white;
}

.category-image-container {
  position: relative;
}

.category-image {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  border: 4px solid rgba(255, 255, 255, 0.2);
}

.category-placeholder {
  width: 120px;
  height: 120px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 4px solid rgba(255, 255, 255, 0.2);
}

.placeholder-icon {
  font-size: 40px;
}

.category-details {
  flex: 1;
}

.category-title {
  font-size: 36px;
  font-weight: 800;
  margin: 0 0 10px 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.category-description {
  font-size: 18px;
  margin: 0 0 20px 0;
  opacity: 0.9;
}

.product-count {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.count-number {
  font-size: 24px;
  font-weight: 700;
  color: #ffd700;
}

.count-text {
  font-size: 16px;
  opacity: 0.8;
}

/* Main Content */
.main-content {
  padding: 60px 0;
}

.content-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* Loading State */
.loading-container {
  text-align: center;
  padding: 80px 20px;
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
  font-size: 18px;
  color: #666;
  margin: 0;
}

/* Section Header */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
  padding-bottom: 20px;
  border-bottom: 2px solid #e0e0e0;
}

.section-title h2 {
  font-size: 28px;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
}

.title-underline {
  width: 60px;
  height: 4px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 2px;
  margin-top: 10px;
}

.sort-select {
  padding: 12px 20px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  background: white;
  color: #2c3e50;
  cursor: pointer;
  transition: all 0.3s ease;
}

.sort-select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

/* No Products State */
.no-products-container {
  text-align: center;
  padding: 80px 20px;
}

.no-products-icon {
  font-size: 60px;
  margin-bottom: 20px;
}

.no-products-title {
  font-size: 24px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 10px 0;
}

.no-products-description {
  font-size: 16px;
  color: #7f8c8d;
  margin: 0;
}

/* Products Grid */
.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 30px;
  margin-bottom: 60px;
}

.product-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  cursor: pointer;
  border: 1px solid #f0f0f0;
}

.product-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.product-image-container {
  position: relative;
  height: 250px;
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
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
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
  padding: 24px;
}

.product-name {
  font-size: 20px;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 12px 0;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-meta {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.product-category {
  background: #667eea;
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.product-subcategory {
  background: #f8f9fa;
  color: #6c757d;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.product-price-container {
  display: flex;
  align-items: baseline;
  gap: 4px;
  margin-bottom: 12px;
}

.product-price {
  font-size: 24px;
  font-weight: 800;
  color: #e74c3c;
}

.price-unit {
  font-size: 14px;
  color: #7f8c8d;
}

.product-description {
  font-size: 14px;
  color: #6c757d;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-actions {
  padding: 0 24px 24px 24px;
}

.contact-btn {
  width: 100%;
  background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%);
  color: white;
  border: none;
  padding: 14px 20px;
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

.contact-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(46, 204, 113, 0.3);
}

.btn-icon {
  font-size: 18px;
}

/* Load More Section */
.load-more-section {
  text-align: center;
  padding: 40px 0;
}

.load-more-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 16px 32px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.load-more-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
}

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
  z-index: 1000;
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
  .hero-section {
    height: 250px;
  }
  
  .category-info {
    flex-direction: column;
    text-align: center;
    gap: 20px;
  }
  
  .category-title {
    font-size: 28px;
  }
  
  .category-description {
    font-size: 16px;
  }
  
  .section-header {
    flex-direction: column;
    gap: 20px;
    align-items: stretch;
  }
  
  .products-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .product-card {
    max-width: 400px;
    margin: 0 auto;
  }

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
  .hero-content {
    padding: 0 15px;
  }
  
  .content-container {
    padding: 0 15px;
  }
  
  .category-image {
    width: 100px;
    height: 100px;
  }
  
  .category-placeholder {
    width: 100px;
    height: 100px;
  }
  
  .category-title {
    font-size: 24px;
  }

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
</style>
