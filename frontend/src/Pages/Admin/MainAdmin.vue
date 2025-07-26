<template>
  <div class="admin-container">
    <!-- Banner Section -->
    <div class="banner-section">
      <div v-if="!banner || !banner.imageUrl" class="banner-upload-area" @click="triggerFileInput">
        <div class="upload-content">
          <div class="upload-icon">📷</div>
          <div class="upload-text">คลิกเพื่อเพิ่มรูปภาพแบนเนอร์</div>
          <div class="upload-subtitle">รองรับไฟล์ JPG, PNG ขนาดไม่เกิน 5MB</div>
        </div>
        <input ref="fileInput" type="file" accept="image/*" @change="onFileChange" style="display:none" />
      </div>
      <div v-else class="banner-display">
        <img v-if="banner && banner.imageUrl" :src="getBannerImageUrl(banner)" class="banner-image" />
        <div class="banner-overlay">
          <button class="edit-banner-btn" @click="triggerFileInput">
            <span class="btn-icon">📷</span>
            แก้ไขแบนเนอร์
          </button>
        </div>
      </div>
    </div>
    
    <!-- Category Section -->

      <div class="section-header">
        <h2 class="section-title">📦 หมวดหมู่สินค้า</h2>
        <p class="section-subtitle">จัดการหมวดหมู่สินค้าของร้านค้า</p>
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
            :to="`/admin/shop/${category._id}`" 
            class="category-card"
          >
            <div class="category-image-container">
              <img :src="getCategoryImageUrl(category)" :alt="category.name" class="category-image" />
              <div class="category-overlay">
                <button class="delete-category-btn" @click.stop="deleteCategory(category._id)" title="ลบรายการ">
                  🗑️
                </button>
              </div>
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
      
      <!-- Pagination Info -->
      <div v-if="categories.length > 8" class="pagination-info">
        <div class="pagination-text">
          <span class="current-page">หน้า {{ currentPage + 1 }}</span>
          <span class="separator">จาก</span>
          <span class="total-pages">{{ totalPages }}</span>
        </div>
        <div class="total-items">(ทั้งหมด {{ categories.length }} รายการ)</div>
      </div>
      
      <!-- Add Category Button -->
      <div class="add-category-section">
        <button class="add-category-btn" @click="showAddCategoryModal">
          <span class="add-icon">➕</span>
          เพิ่มหมวดหมู่ใหม่
        </button>
      </div>
    

    <!-- Latest Products Section -->
    <div class="latest-section">
      <div class="section-header">
        <h2 class="section-title">🆕 สินค้าล่าสุด</h2>
        <p class="section-subtitle">สินค้าใหม่ที่เพิ่มเข้ามาใน 7 วันที่ผ่านมา</p>
      </div>
      
      <!-- Loading State -->
      <div v-if="loadingProducts" class="loading-container">
        <div class="loading-spinner"></div>
        <p class="loading-text">กำลังโหลดสินค้าล่าสุด...</p>
      </div>
      
      <!-- No New Products -->
      <div v-else-if="latestProducts.length === 0" class="no-products-container">
        <div class="no-products-icon">📦</div>
        <h3 class="no-products-title">ยังไม่มีสินค้าใหม่</h3>
        <p class="no-products-description">ยังไม่มีสินค้าใหม่ที่เพิ่มเข้ามาใน 7 วันที่ผ่านมา</p>
      </div>
      
      <!-- Latest Products Grid -->
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
    >
      <template #after-subtitle>
        <button class="edit-why-btn" @click="showWhyEdit = true">แก้ไข</button>
      </template>
    </WhyContent>

    <!-- WhyContent Edit Modal -->
    <div v-if="showWhyEdit" class="modal-overlay" @click.self="showWhyEdit = false">
      <div class="modal-content why-edit-modal">
        <div class="modal-header">
          <h3 class="modal-title">แก้ไข WhyContent</h3>
          <button class="modal-close" @click="showWhyEdit = false">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>หัวเรื่องหลัก</label>
            <input v-model="whyTitle" class="form-input" />
          </div>
          <div class="form-group">
            <label>หัวเรื่องย่อย</label>
            <input v-model="whySubtitle" class="form-input" />
          </div>
          <div class="form-group">
            <label>รายละเอียด</label>
            <textarea v-model="whyContentEdit.description" class="form-input" rows="3"></textarea>
          </div>
          <div class="form-group">
            <label>สีพื้นหลัง1</label>
            <input v-model="whyContentEdit.color" class="form-input" type="color" style="width: 60px; height: 40px; padding: 0; border: none;" />
          </div>
          <div class="form-group">
            <label>สีพื้นหลัง2</label>
            <input v-model="whyContentEdit.color2" class="form-input" type="color" style="width: 60px; height: 40px; padding: 0; border: none;" />
          </div>
          <div class="form-group">
            <label>ฟีเจอร์ (container เล็ก)</label>
            <div v-for="(feature, idx) in whyContentEdit.features" :key="idx" class="feature-edit-row">
              <input v-model="feature.icon" class="form-input" style="width: 60px;" placeholder="icon" />
              <input v-model="feature.text" class="form-input" placeholder="รายละเอียดฟีเจอร์" />
              <button @click="removeFeature(idx)" class="remove-feature-btn">ลบ</button>
            </div>
            <button @click="addFeature" class="add-feature-btn">+ เพิ่มฟีเจอร์</button>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="showWhyEdit = false">ยกเลิก</button>
          <button class="btn-primary" @click="saveWhyContent">บันทึก</button>
        </div>
      </div>
    </div>

    <!-- Add Category Modal -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">➕ เพิ่มหมวดหมู่ใหม่</h3>
          <button class="modal-close" @click="closeModal">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">ชื่อหมวดหมู่</label>
            <input 
              v-model="newCategory.name" 
              type="text" 
              placeholder="ใส่ชื่อหมวดหมู่"
              maxlength="50"
              class="form-input"
            />
          </div>
          
          <div class="form-group">
            <label class="form-label">รูปภาพ</label>
            <div class="image-upload-area" @click="triggerCategoryImageInput">
              <div v-if="!newCategory.imagePreview" class="upload-placeholder">
                <div class="upload-icon-large">📷</div>
                <div class="upload-text-large">คลิกเพื่อเลือกรูปภาพ</div>
                <div class="upload-hint">รองรับไฟล์ JPG, PNG ขนาดไม่เกิน 5MB</div>
              </div>
              <img v-else :src="newCategory.imagePreview" class="image-preview" />
              <input 
                ref="categoryImageInput" 
                type="file" 
                accept="image/*" 
                @change="onCategoryImageChange" 
                style="display:none" 
              />
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button class="btn-secondary" @click="closeModal">ยกเลิก</button>
          <button class="btn-primary" @click="addCategory" :disabled="!isFormValid">
            เพิ่มหมวดหมู่
          </button>
        </div>
      </div>
    </div>

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
import Navbar from '../../components/Navbar.vue';
import ProductCard from '../../components/ProductCard.vue';
import ProductDetailModal from '../../components/ProductDetailModal.vue';
import WhyContent from '../../components/WhyContent.vue';

export default {
  name: 'MainAdmin',
  components: {
    Navbar,
    ProductCard,
    ProductDetailModal,
    WhyContent
  },
  data() {
    return {
      banner: null,
      backendUrl: 'http://localhost:5000',
      categories: [],
      currentPage: 0,
      itemsPerPage: 8,
      showModal: false,
      newCategory: {
        name: '',
        imageFile: null,
        imagePreview: null
      },
      latestProducts: [],
      loadingProducts: true,
      selectedProduct: null,
      whyContent: { color: '#f8f9fd', description: '', features: [] },
      whyContentEdit: { color: '#f8f9fd', description: '', features: [] },
      whyTitle: '💡 ทำไมต้องเลือกเรา?',
      whySubtitle: 'ข้อดีของการใช้ Website Card',
      showWhyEdit: false,
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
    },
    isFormValid() {
      return this.newCategory.name.trim() && this.newCategory.imageFile;
    }
  },
  methods: {
    async fetchBanner() {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(this.backendUrl + '/api/banner', {
          headers: { Authorization: `Bearer ${token}` }
        });
        this.banner = res.data;
      } catch (error) {
        if (error.response && error.response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('isAdmin');
          this.$router.replace('/');
        }
      }
    },
    async fetchCategories() {
      try {
        const res = await axios.get(this.backendUrl + '/api/categories');
        this.categories = res.data;
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    },
    async fetchLatestProducts() {
      try {
        this.loadingProducts = true;
        // Calculate date 7 days ago
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        // Fetch all products and filter by creation date
        const response = await axios.get(`${this.backendUrl}/api/products`);
        const allProducts = response.data;
        
        // Filter products created within last 7 days
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
        this.whyContentEdit = JSON.parse(JSON.stringify(res.data));
        if (res.data.title) this.whyTitle = res.data.title;
        if (res.data.subtitle) this.whySubtitle = res.data.subtitle;
      } catch (e) {
        this.whyContent = { color: '#f8f9fd', description: '', features: [] };
        this.whyContentEdit = { color: '#f8f9fd', description: '', features: [] };
      }
    },
    addFeature() {
      this.whyContentEdit.features.push({ icon: '', text: '' });
    },
    removeFeature(idx) {
      this.whyContentEdit.features.splice(idx, 1);
    },
    async saveWhyContent() {
      try {
        const payload = {
          ...this.whyContentEdit,
          title: this.whyTitle,
          subtitle: this.whySubtitle
        };
        const token = localStorage.getItem('token');
        await axios.put(this.backendUrl + '/api/whycontent', payload, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        await this.fetchWhyContent();
        this.showWhyEdit = false;
      } catch (e) {
        alert('เกิดข้อผิดพลาดในการบันทึก');
      }
    },
    triggerFileInput() {
      this.$refs.fileInput.click();
    },
    async onFileChange(e) {
      const file = e.target.files[0];
      if (!file) return;
      const formData = new FormData();
      formData.append('image', file);
      try {
        const token = localStorage.getItem('token');
        if (this.banner && this.banner._id) {
          await axios.put(this.backendUrl + `/api/banner/${this.banner._id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` }
          });
        } else {
          await axios.post(this.backendUrl + '/api/banner', formData, {
            headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` }
          });
        }
        this.fetchBanner();
      } catch (error) {
        console.error('Error updating banner:', error);
      }
    },
    showAddCategoryModal() {
      this.showModal = true;
      this.resetNewCategory();
    },
    closeModal() {
      this.showModal = false;
      this.resetNewCategory();
    },
    resetNewCategory() {
      this.newCategory = {
        name: '',
        imageFile: null,
        imagePreview: null
      };
    },
    triggerCategoryImageInput() {
      this.$refs.categoryImageInput.click();
    },
    onCategoryImageChange(e) {
      const file = e.target.files[0];
      if (file) {
        this.newCategory.imageFile = file;
        this.newCategory.imagePreview = URL.createObjectURL(file);
      }
    },
    async addCategory() {
      if (!this.isFormValid) return;
      try {
        const formData = new FormData();
        formData.append('name', this.newCategory.name.trim());
        formData.append('image', this.newCategory.imageFile);
        const token = localStorage.getItem('token');
        console.log('token ที่จะส่ง:', token); // debug token
        await axios.post(this.backendUrl + '/api/categories', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
          }
        });
        this.closeModal();
        await this.fetchCategories();
        if (this.categories.length > this.itemsPerPage) {
          this.currentPage = this.totalPages - 1;
        }
      } catch (error) {
        console.error('Error adding category:', error);
        alert('เกิดข้อผิดพลาดในการเพิ่มรายการ');
      }
    },
    async deleteCategory(categoryId) {
      if (!confirm('คุณต้องการลบรายการนี้หรือไม่?')) return;
      try {
        const token = localStorage.getItem('token');
        await axios.delete(this.backendUrl + `/api/categories/${categoryId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        await this.fetchCategories();
        if (this.displayedCategories.length === 0 && this.currentPage > 0) {
          this.currentPage = 0;
        }
        if (this.currentPage >= this.totalPages && this.currentPage > 0) {
          this.currentPage = this.totalPages - 1;
        }
      } catch (error) {
        console.error('Error deleting category:', error);
        alert('เกิดข้อผิดพลาดในการลบรายการ');
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
    getProductImage(product) {
      if (product.images && product.images.length > 0) {
        return this.backendUrl + product.images[0];
      }
      return '/placeholder-product.jpg';
    },
    handleImageError(event) {
      event.target.src = '/placeholder-product.jpg';
    },
    formatPrice(price) {
      return new Intl.NumberFormat('th-TH').format(price);
    },
    getCategoryName(categoryId) {
      const category = this.categories.find(cat => cat._id === categoryId);
      return category ? category.name : 'ไม่ระบุ';
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
      return '/placeholder-banner.jpg'; // Fallback for banner image
    }
  },
  mounted() {
    // ตรวจสอบสิทธิ์ก่อนเข้าหน้า
    const storedIsAdmin = localStorage.getItem('isAdmin');
    if (storedIsAdmin !== '1') {
      this.$router.replace('/');
      return;
    }
    this.fetchBanner();
    this.fetchCategories();
    this.fetchLatestProducts();
    this.fetchWhyContent();
  }
}
</script>
<style scoped>
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
  position: relative;
  z-index: 1;
  overflow-x: hidden;
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
  position: relative;
  z-index: 1;
  overflow-x: hidden;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 20px;
  flex: 1;
  position: relative;
  z-index: 1;
  grid-template-rows: 1fr;
  grid-auto-rows: 1fr;
  overflow: hidden;
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
  width: 100%;
  min-height: 120px;
  text-decoration: none !important;
  color: #2c3e50 !important;
  z-index: 1;
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
  z-index: 1;
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
  z-index: 10;
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
  z-index: 15;
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
  z-index: 5;
  position: relative;
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
  position: relative;
  z-index: 1;
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
  z-index: 9999;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: white;
  border-radius: 16px;
  width: 900px;
  max-width: 90vw;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: modalSlideIn 0.3s ease;
  position: relative;
  z-index: 10000;
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
@media (max-width: 1400px) {
  .admin-container {
    max-width: 1200px;
  }
  
  .product-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 1200px) {
  .admin-container {
    max-width: 100%;
    padding: 16px;
  }
  
  .product-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .category-grid {
    grid-template-columns: repeat(8, 1fr);
  }
  
  .category-container {
    gap: 16px;
  }
  
  .nav-arrow {
    width: 40px;
    height: 40px;
    font-size: 18px;
  }
}

@media (max-width: 992px) {
  .admin-container {
    padding: 12px;
  }
  
  .section-title {
    font-size: 24px;
  }
  
  .section-subtitle {
    font-size: 14px;
  }
  
  .product-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
  
  .category-grid {
    grid-template-columns: repeat(8, 1fr);
    gap: 12px;
  }
  
  .category-container {
    gap: 12px;
  }
  
  .nav-arrow {
    width: 36px;
    height: 36px;
    font-size: 16px;
  }
  
  .banner-image {
    height: 300px;
  }
  
  .why-features {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .admin-container {
    padding: 10px;
    overflow-x: hidden;
  }
  
  .section-title {
    font-size: 22px;
  }
  
  .category-container {
    gap: 8px;
  }
  
  .category-grid {
    grid-template-columns: repeat(8, 1fr);
    gap: 8px;
  }
  
  .category-card {
    width: 100%;
    min-height: 100px;
    padding: 12px;
    position: relative;
    z-index: 1;
  }
  
  .category-image {
    width: 60px;
    height: 60px;
  }
  
  .category-name {
    font-size: 12px;
  }
  
  .nav-arrow {
    width: 32px;
    height: 32px;
    font-size: 14px;
  }
  
  .delete-category-btn {
    width: 24px;
    height: 24px;
    font-size: 12px;
  }
  
  .product-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
  
  .product-card {
    width: 100%;
    height: 280px;
    position: relative;
    z-index: 1;
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
    max-width: 95vw;
    position: relative;
    z-index: 10000;
  }
  
  .banner-image {
    height: 250px;
  }
  
  .banner-upload-area {
    padding: 40px 16px;
  }
  
  .upload-text {
    font-size: 18px;
  }
  
  .upload-subtitle {
    font-size: 12px;
  }
}

@media (max-width: 480px) {
  .admin-container {
    padding: 8px;
  }
  
  .section-title {
    font-size: 20px;
  }
  
  .section-subtitle {
    font-size: 13px;
  }
  
  .category-container {
    gap: 6px;
  }
  
  .category-grid {
    grid-template-columns: repeat(8, 1fr);
    gap: 6px;
  }
  
  .category-card {
    min-height: 80px;
    padding: 8px;
  }
  
  .category-image {
    width: 50px;
    height: 50px;
  }
  
  .category-name {
    font-size: 11px;
  }
  
  .nav-arrow {
    width: 28px;
    height: 28px;
    font-size: 12px;
  }
  
  .delete-category-btn {
    width: 20px;
    height: 20px;
    font-size: 10px;
  }
  
  .product-grid {
    grid-template-columns: 1fr;
    gap: 10px;
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
  
  .banner-image {
    height: 200px;
  }
  
  .banner-upload-area {
    padding: 30px 12px;
  }
  
  .upload-text {
    font-size: 16px;
  }
  
  .upload-subtitle {
    font-size: 11px;
  }
  
  .modal-content {
    width: 98vw;
    max-width: 98vw;
    padding: 16px;
  }
  
  .modal-header {
    padding: 16px 16px 0 16px;
  }
  
  .modal-body {
    padding: 0 16px;
  }
  
  .modal-footer {
    padding: 16px;
  }
}

/* Tablet Landscape */
@media (min-width: 768px) and (max-width: 1024px) {
  .admin-container {
    padding: 14px;
  }
  
  .product-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .category-grid {
    grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
  }
}

/* Large Desktop */
@media (min-width: 1600px) {
  .admin-container {
    max-width: 1600px;
  }
  
  .product-grid {
    grid-template-columns: repeat(6, 1fr);
  }
}

/* Extra Large Desktop */
@media (min-width: 1920px) {
  .admin-container {
    max-width: 1800px;
  }
  
  .product-grid {
    grid-template-columns: repeat(7, 1fr);
  }
}
.edit-why-btn {
  margin-left: 16px;
  background: #fffbe6;
  color: #b8860b;
  border: 1px solid #ffe58f;
  border-radius: 6px;
  padding: 4px 16px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;
}
.edit-why-btn:hover {
  background: #fff1b8;
}
.why-edit-modal {
  min-width: 400px;
  max-width: 95vw;
}
.feature-edit-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}
.remove-feature-btn {
  background: #ffeded;
  color: #d4380d;
  border: 1px solid #ffa39e;
  border-radius: 6px;
  padding: 2px 10px;
  font-size: 0.95rem;
  cursor: pointer;
  transition: background 0.2s;
}
.remove-feature-btn:hover {
  background: #ffd6d6;
}
.add-feature-btn {
  background: #e6f7ff;
  color: #1890ff;
  border: 1px solid #91d5ff;
  border-radius: 6px;
  padding: 2px 10px;
  font-size: 0.95rem;
  cursor: pointer;
  margin-top: 6px;
  transition: background 0.2s;
}
.add-feature-btn:hover {
  background: #bae7ff;
}
</style> 