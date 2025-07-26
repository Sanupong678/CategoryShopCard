<template>
  <nav class="navbar">
    <!-- Top Navigation Bar -->
    <div class="navbar-top">
      <div class="navbar-top-left">
        <router-link to="/admin" class="nav-link">
          <span class="nav-icon">🏠</span>
          หน้าหลัก
        </router-link>
        <a href="#" class="nav-link" @click.prevent="goToProfile">
          <span class="nav-icon">📞</span>
          ช่องทางติดต่อ
        </a>
      </div>
      <div class="navbar-top-right">
        <router-link to="/admin/management" class="nav-link">
          <span class="nav-icon">⚙️</span>
          จัดการสินค้า
        </router-link>
        <router-link to="/admin/profile" class="nav-link">
          <span class="nav-icon">👤</span>
          โปรไฟล์
        </router-link>
      </div>
    </div>

    <!-- Main Navigation Bar -->
    <div class="navbar-main">
      <div class="navbar-container">
        <!-- Logo Section -->
        <div class="logo-section">
          <div class="logo">
            <span class="logo-icon">🛍️</span>
            <span class="logo-text">ITCOM</span>
          </div>
        </div>

        <!-- Search Section -->
        <div class="search-section">
          <div class="search-container">
            <input 
              type="text" 
              placeholder="ค้นหาสินค้า..." 
              class="search-input"
              v-model="searchQuery"
              @keyup.enter="handleSearch"
            />
            <button class="search-btn" @click="handleSearch">
              <span class="search-icon">🔍</span>
            </button>
          </div>
        </div>
        <!-- Search Results Modal -->
        <div v-if="showSearchModal" class="search-modal-overlay" @click.self="closeSearchModal">
          <div class="search-modal-content">
            <div class="search-modal-header">
              <span>ผลการค้นหา "{{ searchQuery }}"</span>
              <button class="close-btn" @click="closeSearchModal">×</button>
            </div>
            <div v-if="loadingSearch" class="search-loading">กำลังค้นหา...</div>
            <div v-else-if="searchResults.length === 0" class="search-no-results">ไม่พบสินค้า</div>
            <div v-else class="search-results-grid">
              <ProductCard
                v-for="product in searchResults"
                :key="product._id"
                :product="product"
                :categories="categories"
                :backend-url="backendUrl"
                :show-description="false"
                :show-actions="false"
                @card-click="handleProductClick"
              />
            </div>
            <ProductDetailModal
              v-if="selectedProduct"
              :product="selectedProduct"
              :categories="categories"
              :backend-url="backendUrl"
              @close="closeProductModal"
            />
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
import axios from 'axios';
import ProductCard from './ProductCard.vue';
import ProductDetailModal from './ProductDetailModal.vue';
export default {
  name: 'Navbar',
  components: { ProductCard, ProductDetailModal },
  data() {
    return {
      searchQuery: '',
      searchResults: [],
      showSearchModal: false,
      loadingSearch: false,
      selectedProduct: null,
      backendUrl: 'http://localhost:5000',
      categories: []
    };
  },
  mounted() {
    this.fetchCategories();
  },
  methods: {
    async fetchCategories() {
      try {
        const res = await axios.get(this.backendUrl + '/api/categories');
        this.categories = res.data;
      } catch (e) {}
    },
    async handleSearch() {
      if (!this.searchQuery.trim()) return;
      this.loadingSearch = true;
      this.showSearchModal = true;
      try {
        const res = await axios.get(this.backendUrl + '/api/products?search=' + encodeURIComponent(this.searchQuery));
        this.searchResults = res.data;
      } catch (e) {
        this.searchResults = [];
      } finally {
        this.loadingSearch = false;
      }
    },
    handleProductClick(product) {
      this.selectedProduct = product;
    },
    closeProductModal() {
      this.selectedProduct = null;
    },
    closeSearchModal() {
      this.showSearchModal = false;
      this.searchResults = [];
      this.loadingSearch = false;
    },
    goToProfile() {
      this.$router.push('/admin/profile');
    }
  }
}
</script>

<style scoped>
/* Global Reset */
* {
  box-sizing: border-box;
}

/* Navbar Container */
.navbar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
  width: 100%;
}

/* Top Navigation Bar */
.navbar-top {
  display: flex;
  background: rgba(0, 0, 0, 0.1);
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.navbar-top-left,
.navbar-top-right {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 0 40px;
}

.navbar-top-left {
  justify-content: flex-start;
}

.navbar-top-right {
  justify-content: flex-end;
  margin-left: auto;
}

.nav-link {
  color: rgba(255, 255, 255, 0.9);
  text-decoration: none;
  font-size: 13px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.nav-link:hover {
  color: white;
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-1px);
}

.nav-icon {
  font-size: 14px;
}

/* Main Navigation Bar */
.navbar-main {
  padding: 16px 0;
}

.navbar-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  align-items: center;
  gap: 30px;
}

/* Logo Section */
.logo-section {
  flex-shrink: 0;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.logo:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.logo-icon {
  font-size: 24px;
}

.logo-text {
  font-size: 20px;
  font-weight: 700;
  color: white;
  letter-spacing: 1px;
}

/* Search Section */
.search-section {
  flex: 1;
  max-width: 800px;
  display: flex;
  justify-content: center;
}

.search-container {
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.3s ease;
}

.search-container:focus-within {
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
  transform: translateY(-1px);
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  padding: 14px 20px;
  font-size: 15px;
  background: transparent;
  color: #2c3e50;
}

.search-input::placeholder {
  color: #95a5a6;
}

.search-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  padding: 14px 20px;
  cursor: pointer;
  color: white;
  font-size: 16px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.search-btn:hover {
  background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
  transform: scale(1.05);
}

.search-icon {
  font-size: 16px;
}

.search-modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}
.search-modal-content {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.18);
  padding: 32px 24px 24px 24px;
  min-width: 340px;
  max-width: 90vw;
  max-height: 80vh;
  overflow-y: auto;
  width: 600px;
  position: relative;
}
.search-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 1.1rem;
  font-weight: 600;
  color: #667eea;
  margin-bottom: 18px;
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
  background: #eee;
}
.search-loading {
  text-align: center;
  color: #888;
  font-size: 1.1rem;
  margin: 30px 0;
}
.search-no-results {
  text-align: center;
  color: #888;
  font-size: 1.1rem;
  margin: 30px 0;
}
.search-results-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 18px;
  justify-content: flex-start;
}


/* Responsive Design */
@media (max-width: 1400px) {
  .navbar-container {
    max-width: 1200px;
  }
}

@media (max-width: 1200px) {
  .navbar-container {
    max-width: 100%;
    padding: 0 16px;
  }
  
  .search-section {
    max-width: 500px;
  }
}

@media (max-width: 1024px) {
  .navbar-container {
    gap: 20px;
    padding: 0 12px;
  }
  
  .search-section {
    max-width: 400px;
  }
  
  .logo-text {
    font-size: 18px;
  }
  
  .search-input {
    padding: 12px 16px;
    font-size: 14px;
  }
  
  .search-btn {
    padding: 12px 16px;
  }
}

@media (max-width: 768px) {
  .navbar-top-left,
  .navbar-top-right {
    padding: 0 16px;
    gap: 12px;
  }
  
  .nav-link {
    font-size: 13px;
    padding: 6px 10px;
  }
  
  .navbar-container {
    flex-direction: column;
    gap: 12px;
    padding: 0 12px;
  }
  
  .search-section {
    max-width: 100%;
    width: 100%;
  }
  
  .logo {
    padding: 8px 14px;
  }
  
  .logo-text {
    font-size: 16px;
  }
  
  .logo-icon {
    font-size: 20px;
  }
  
  .search-input {
    padding: 10px 14px;
    font-size: 13px;
  }
  
  .search-btn {
    padding: 10px 14px;
  }
  
  .search-modal-content {
    width: 95vw;
    max-width: 95vw;
    padding: 24px 16px 16px 16px;
  }
}

@media (max-width: 480px) {
  .navbar-top-left,
  .navbar-top-right {
    padding: 0 8px;
    gap: 8px;
  }
  
  .nav-link {
    font-size: 11px;
    padding: 4px 6px;
  }
  
  .nav-icon {
    font-size: 11px;
  }
  
  .navbar-container {
    padding: 0 8px;
    gap: 8px;
  }
  
  .logo {
    padding: 6px 10px;
  }
  
  .logo-text {
    font-size: 14px;
  }
  
  .logo-icon {
    font-size: 18px;
  }
  
  .search-input {
    padding: 8px 12px;
    font-size: 12px;
  }
  
  .search-btn {
    padding: 8px 12px;
  }
  
  .search-modal-content {
    width: 98vw;
    max-width: 98vw;
    padding: 20px 12px 12px 12px;
  }
  
  .search-modal-header {
    font-size: 1rem;
  }
}

/* Tablet Landscape */
@media (min-width: 768px) and (max-width: 1024px) {
  .navbar-container {
    padding: 0 14px;
  }
  
  .search-section {
    max-width: 450px;
  }
}

/* Large Desktop */
@media (min-width: 1600px) {
  .navbar-container {
    max-width: 1400px;
  }
  
  .search-section {
    max-width: 600px;
  }
}

/* Extra Large Desktop */
@media (min-width: 1920px) {
  .navbar-container {
    max-width: 1600px;
  }
  
  .search-section {
    max-width: 700px;
  }
}
</style>