<template>
    <nav class="navbar">
      <!-- Top Navigation Bar -->
      <div class="navbar-top">
        <div class="navbar-top-left">
          <router-link to="/" class="nav-link">
            <span class="nav-icon">🏠</span>
            หน้าหลัก
          </router-link>
          <a href="#" class="nav-link" @click.prevent="goToProfile">
            <span class="nav-icon">📞</span>
            ช่องทางติดต่อ
          </a>
        </div>
        <div class="navbar-top-right">
          <router-link to="/profile" class="nav-link">
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
                @input="handleLiveSearch"
                @keyup.enter="handleSearch"
              />
              <button class="search-btn" @click="handleSearch">
                <span class="search-icon">🔍</span>
              </button>
            </div>
            <!-- Inline Search Results Container -->
            <div v-if="searchQuery && searchResults.length > 0 && !showSearchModal" class="inline-search-results">
              <div v-for="product in searchResults.slice(0, 5)" :key="product._id" class="inline-result-item" @click="handleProductClick(product)">
                <img :src="product.images && product.images.length > 0 ? backendUrl + product.images[0] : '/placeholder-product.jpg'" class="inline-result-img" :alt="product.nameproduct" />
                <span class="inline-result-name">{{ product.nameproduct }}</span>
                <span class="inline-result-time">{{ formatTimeAgo(product.createdAt) }}</span>
              </div>
            </div>
          </div>       
        </div>
      </div>
    </nav>
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
  </template>
  
  <script>
  import axios from 'axios';
  import ProductCard from './ProductCard.vue';
  import ProductDetailModal from './ProductDetailModal.vue';
  export default {
    name: 'NavbarUser',
    components: { ProductCard, ProductDetailModal },
    data() {
      return {
        searchQuery: '',
        searchResults: [],
        showSearchModal: false,
        loadingSearch: false,
        selectedProduct: null,
        backendUrl: 'http://localhost:5000',
        categories: [],
        liveSearchTimeout: null
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
      async handleLiveSearch() {
        if (this.liveSearchTimeout) clearTimeout(this.liveSearchTimeout);
        if (!this.searchQuery.trim()) {
          this.searchResults = [];
          return;
        }
        this.liveSearchTimeout = setTimeout(async () => {
          try {
            const res = await axios.get(this.backendUrl + '/api/products?search=' + encodeURIComponent(this.searchQuery));
            this.searchResults = res.data;
          } catch (e) {
            this.searchResults = [];
          }
        }, 250);
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
      goToProfile() {
        this.$router.push('/profile');
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
    z-index: 1000;
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
    z-index: 3000;
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
  
  .inline-search-results {
    position: absolute;
    top: 90%;
    left: 50%;
    transform: translateX(-50%);
    width: 600px;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 4px 24px rgba(102, 126, 234, 0.18);
    z-index: 2000;
    padding: 8px 0;
    max-height: 320px;
    overflow-y: auto;
    margin-top: 4px;
  }
  .inline-result-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 18px;
    cursor: pointer;
    transition: background 0.2s;
    background: #fff;
    border-radius: 10px;
    box-shadow: 0 2px 12px rgba(102, 126, 234, 0.10);
    margin-bottom: 6px;
    width: 480px;
    max-width: 95vw;
  }
  .inline-result-item:hover {
    background: #f3f6fd;
  }
  .inline-result-img {
    width: 44px;
    height: 44px;
    object-fit: cover;
    border-radius: 8px;
    background: #f0f0f0;
    flex-shrink: 0;
  }
  .inline-result-name {
    font-size: 15px;
    color: #2c3e50;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 180px;
  }
  .inline-result-time {
    font-size: 12px;
    color: #888;
    margin-left: 12px;
    white-space: nowrap;
  }
  
  
  /* Responsive Design */
  @media (max-width: 1024px) {
    .navbar-container {
      gap: 20px;
    }
    
    .search-section {
      max-width: 400px;
    }
    
    .nav-links {
      gap: 4px;
    }
    
    .nav-item {
      padding: 10px 12px;
      min-width: 70px;
    }
  }
  
  @media (max-width: 768px) {
    .navbar-top-left,
    .navbar-top-right {
      padding: 0 20px;
      gap: 15px;
    }
    
    .navbar-container {
      flex-direction: column;
      gap: 16px;
      padding: 0 16px;
    }
    
    .search-section {
      max-width: 100%;
      width: 100%;
    }
    
    .nav-links {
      width: 100%;
      justify-content: space-around;
    }
    
    .nav-item {
      flex: 1;
      min-width: unset;
    }
    
    .logo {
      padding: 10px 16px;
    }
    
    .logo-text {
      font-size: 18px;
    }
  }
  
  @media (max-width: 480px) {
    .navbar-top-left,
    .navbar-top-right {
      padding: 0 10px;
      gap: 10px;
    }
    
    .nav-link {
      font-size: 12px;
      padding: 4px 8px;
    }
    
    .nav-icon {
      font-size: 12px;
    }
    
    .logo-icon {
      font-size: 20px;
    }
    
    .logo-text {
      font-size: 16px;
    }
  }
  </style>