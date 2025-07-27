<template>
  <div class="management-admin">
    <!-- Header Section -->
    <div class="header-section">
      <h1 class="page-title">จัดการสินค้า</h1>
      <button class="add-product-btn" @click="showAddForm = true">
        <span class="plus-icon">+</span>
        เพิ่มสินค้าใหม่
      </button>
    </div>

    <!-- Category Filter -->
    <div class="category-filter">
      <label>หมวดหมู่:</label>
      <select v-model="selectedCategory" @change="fetchProducts">
        <option value="">ทุกหมวดหมู่</option>
        <option v-for="category in categories" :key="category._id" :value="category._id">
          {{ category.name }}
        </option>
      </select>
    </div>

    <!-- Products Grid -->
    <div class="products-container">
      <div v-if="loading" class="loading">กำลังโหลด...</div>
      <div v-else-if="products.length === 0" class="no-products">
        ไม่มีสินค้าในหมวดหมู่นี้
      </div>
      <div v-else class="products-grid">
        <div v-for="product in products" :key="product._id" class="product-admin-card">
          <ProductCard
            :product="product"
            :categories="categories"
            :backend-url="backendUrl"
            :show-new-badge="false"
            :show-description="false"
            :show-time="false"
            :show-actions="false"
            :show-admin-actions="true"
            @card-click="editProduct"
            @edit="editProduct"
            @delete="deleteProduct"
          />
          <!-- Status Control -->
          <div class="status-control">
            <label class="status-label">สถานะ:</label>
            <select 
              :value="product.status || 'ปกติ'" 
              @change="updateProductStatus(product._id, $event.target.value)"
              class="status-select"
              :class="{ 'status-sold': product.status === 'ขาย' }"
            >
              <option value="ปกติ">ปกติ</option>
              <option value="ขาย">ขาย</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Product Modal -->
    <div v-if="showAddForm || editingProduct" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>{{ editingProduct ? 'แก้ไขสินค้า' : 'เพิ่มสินค้าใหม่' }}</h2>
          <button class="close-btn" @click="closeModal">×</button>
        </div>

        <form class="product-form" @submit.prevent="handleSubmit">
          <!-- Image Upload Section -->
          <div class="image-upload-section">
            <div class="image-preview-container">
              <div v-if="selectedImages.length === 0" class="no-image">
                <span>ยังไม่มีรูปภาพ</span>
              </div>
              <div v-else class="image-carousel">
                <div class="main-preview">
                  <img :src="selectedImages[currentPreviewIndex].preview" :alt="`รูปภาพ ${currentPreviewIndex + 1}`" />
                  <button 
                    v-if="selectedImages.length > 1" 
                    class="preview-nav prev" 
                    @click="previousPreview"
                  >
                    ‹
                  </button>
                  <button 
                    v-if="selectedImages.length > 1" 
                    class="preview-nav next" 
                    @click="nextPreview"
                  >
                    ›
                  </button>
                </div>
                
                <!-- Thumbnail Navigation -->
                <div v-if="selectedImages.length > 1" class="preview-thumbnails">
                  <div class="preview-thumbnail-container">
                    <button 
                      v-for="(image, index) in getVisiblePreviewThumbnails()" 
                      :key="index"
                      class="preview-thumbnail-btn"
                      :class="{ active: currentPreviewIndex === getPreviewThumbnailIndex(index) }"
                      @click="goToPreview(getPreviewThumbnailIndex(index))"
                    >
                      <img :src="image.preview" :alt="`รูปภาพ ${index + 1}`" />
                    </button>
                  </div>
                  <button 
                    v-if="shouldShowPreviewNav('prev')" 
                    class="preview-thumb-nav prev" 
                    @click="scrollPreviewThumbnails('prev')"
                  >
                    ‹
                  </button>
                  <button 
                    v-if="shouldShowPreviewNav('next')" 
                    class="preview-thumb-nav next" 
                    @click="scrollPreviewThumbnails('next')"
                  >
                    ›
                  </button>
                </div>
              </div>
            </div>
            
            <input 
              type="file" 
              ref="fileInput" 
              @change="handleImageSelect" 
              multiple 
              accept="image/*" 
              style="display: none;"
            />
            <button type="button" class="upload-btn" @click="$refs.fileInput.click()">
              เลือกไฟล์รูปภาพ
            </button>
          </div>

          <!-- Form Fields -->
          <div class="form-fields">
            <div class="form-row">
              <label>ชื่อสินค้า</label>
              <input type="text" v-model="formData.nameproduct" required />
            </div>
            
            <div class="form-row-flex">
              <div class="form-group">
                <label>ราคา</label>
                <input type="number" v-model="formData.price" required />
              </div>
              <div class="form-group">
                <label>หมวดหมู่</label>
                <select v-model="formData.category" required>
                  <option value="">เลือกหมวดหมู่</option>
                  <option v-for="category in categories" :key="category._id" :value="category._id">
                    {{ category.name }}
                  </option>
                </select>
              </div>
            </div>
            
            <div class="form-row">
              <label>หมวดย่อย</label>
              <input type="text" v-model="formData.subcategory" required />
            </div>
            
            <div class="form-row">
              <label>รายละเอียดสินค้า</label>
              <textarea rows="3" v-model="formData.description" required></textarea>
            </div>
            
            <div class="form-row">
              <label>เบอร์โทรติดต่อ</label>
              <input type="text" v-model="formData.phone" required />
            </div>
            
            <!-- Form Actions -->
            <div class="form-actions">
              <button type="button" class="cancel-btn" @click="closeModal">ยกเลิก</button>
              <button type="submit" class="submit-btn" :disabled="loading">
                {{ loading ? 'กำลังบันทึก...' : (editingProduct ? 'อัปเดต' : 'บันทึก') }}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import Navbar from '../../components/Navbar.vue';
import ProductCard from '../../components/ProductCard.vue';

export default {
  components: {
    Navbar,
    ProductCard
  },
  name: 'ManagementAdmin',
  data() {
    return {
      categories: [],
      products: [],
      selectedCategory: '',
      loading: false,
      showAddForm: false,
      editingProduct: null,
      currentImageIndex: {},
      currentPreviewIndex: 0,
      previewThumbnailStart: 0,
      thumbnailStart: {},
      formData: {
        nameproduct: '',
        price: '',
        category: '',
        subcategory: '',
        description: '',
        phone: ''
      },
      selectedImages: [],
      loading: false
    };
  },
  async mounted() {
    // ตรวจสอบสิทธิ์ก่อนเข้าหน้า
    const storedIsAdmin = localStorage.getItem('isAdmin');
    if (storedIsAdmin !== '1') {
      this.$router.replace('/');
      return;
    }
    await this.fetchCategories();
    await this.fetchProducts();
  },
  methods: {
    async fetchCategories() {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/categories', {
          headers: { Authorization: `Bearer ${token}` }
        });
        this.categories = response.data;
      } catch (error) {
        if (error.response && error.response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('isAdmin');
          this.$router.replace('/');
        } else {
          console.error('Error fetching categories:', error);
        }
      }
    },
    async fetchProducts() {
      this.loading = true;
      try {
        const token = localStorage.getItem('token');
        const url = this.selectedCategory 
          ? `http://localhost:5000/api/products/by-category?category=${this.selectedCategory}`
          : 'http://localhost:5000/api/products';
        const response = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` }
        });
        this.products = response.data;
      } catch (error) {
        if (error.response && error.response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('isAdmin');
          this.$router.replace('/');
        } else {
          console.error('Error fetching products:', error);
        }
      } finally {
        this.loading = false;
      }
    },
    getImageUrl(imagePath) {
      if (!imagePath) return '/placeholder-image.jpg';
      return `http://localhost:5000${imagePath}`;
    },
    handleImageError(event) {
      event.target.src = '/placeholder-image.jpg';
    },
    formatPrice(price) {
      return new Intl.NumberFormat('th-TH').format(price);
    },
    getCategoryName(categoryId) {
      const category = this.categories.find(cat => cat._id === categoryId);
      return category ? category.name : 'ไม่ระบุ';
    },
    // Image Navigation Methods
    getCurrentImageIndex(productId) {
      return this.currentImageIndex[productId] || 0;
    },
    previousImage(productId) {
      const currentIndex = this.getCurrentImageIndex(productId);
      const product = this.products.find(p => p._id === productId);
      if (product && product.images && product.images.length > 1) {
        const newIndex = currentIndex === 0 ? product.images.length - 1 : currentIndex - 1;
        this.$set(this.currentImageIndex, productId, newIndex);
      }
    },
    nextImage(productId) {
      const currentIndex = this.getCurrentImageIndex(productId);
      const product = this.products.find(p => p._id === productId);
      if (product && product.images && product.images.length > 1) {
        const newIndex = currentIndex === product.images.length - 1 ? 0 : currentIndex + 1;
        this.$set(this.currentImageIndex, productId, newIndex);
      }
    },
    goToImage(productId, index) {
      this.$set(this.currentImageIndex, productId, index);
    },
    getVisibleThumbnails(images, productId) {
      if (!images || images.length <= 5) return images;
      const start = this.thumbnailStart[productId] || 0;
      return images.slice(start, start + 5);
    },
    getThumbnailIndex(images, productId, displayIndex) {
      const start = this.thumbnailStart[productId] || 0;
      return start + displayIndex;
    },
    shouldShowThumbnailNav(images, productId, direction) {
      if (!images || images.length <= 5) return false;
      const start = this.thumbnailStart[productId] || 0;
      return direction === 'prev' ? start > 0 : start + 5 < images.length;
    },
    scrollThumbnails(productId, direction) {
      const images = this.products.find(p => p._id === productId)?.images;
      if (!images || images.length <= 5) return;
      
      const start = this.thumbnailStart[productId] || 0;
      let newStart = start;
      
      if (direction === 'prev') {
        newStart = Math.max(0, start - 1);
      } else {
        newStart = Math.min(images.length - 5, start + 1);
      }
      
      this.$set(this.thumbnailStart, productId, newStart);
    },
    // Preview Navigation Methods
    previousPreview() {
      if (this.selectedImages.length > 1) {
        this.currentPreviewIndex = this.currentPreviewIndex === 0 
          ? this.selectedImages.length - 1 
          : this.currentPreviewIndex - 1;
      }
    },
    nextPreview() {
      if (this.selectedImages.length > 1) {
        this.currentPreviewIndex = this.currentPreviewIndex === this.selectedImages.length - 1 
          ? 0 
          : this.currentPreviewIndex + 1;
      }
    },
    goToPreview(index) {
      this.currentPreviewIndex = index;
    },
    getVisiblePreviewThumbnails() {
      if (this.selectedImages.length <= 5) return this.selectedImages;
      return this.selectedImages.slice(this.previewThumbnailStart, this.previewThumbnailStart + 5);
    },
    getPreviewThumbnailIndex(displayIndex) {
      return this.previewThumbnailStart + displayIndex;
    },
    shouldShowPreviewNav(direction) {
      if (this.selectedImages.length <= 5) return false;
      return direction === 'prev' ? this.previewThumbnailStart > 0 : this.previewThumbnailStart + 5 < this.selectedImages.length;
    },
    scrollPreviewThumbnails(direction) {
      if (this.selectedImages.length <= 5) return;
      
      let newStart = this.previewThumbnailStart;
      if (direction === 'prev') {
        newStart = Math.max(0, this.previewThumbnailStart - 1);
      } else {
        newStart = Math.min(this.selectedImages.length - 5, this.previewThumbnailStart + 1);
      }
      this.previewThumbnailStart = newStart;
    },
    // Form Methods
    handleImageSelect(event) {
      const files = Array.from(event.target.files);
      files.forEach(file => {
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (e) => {
            this.selectedImages.push({
              file: file,
              preview: e.target.result
            });
          };
          reader.readAsDataURL(file);
        }
      });
    },
    editProduct(product) {
      this.editingProduct = product;
      this.formData = {
        nameproduct: product.nameproduct,
        price: product.price,
        category: product.category,
        subcategory: product.subcategory,
        description: product.description,
        phone: product.phone
      };
      this.selectedImages = product.images.map(image => ({
        file: null,
        preview: this.getImageUrl(image),
        isExisting: true
      }));
      this.currentPreviewIndex = 0;
      this.previewThumbnailStart = 0;
    },
    closeModal() {
      this.showAddForm = false;
      this.editingProduct = null;
      this.resetForm();
    },
    resetForm() {
      this.formData = {
        nameproduct: '',
        price: '',
        category: '',
        subcategory: '',
        description: '',
        phone: ''
      };
      this.selectedImages = [];
      this.currentPreviewIndex = 0;
      this.previewThumbnailStart = 0;
      if (this.$refs.fileInput) {
        this.$refs.fileInput.value = '';
      }
    },
    async handleSubmit() {
      if (this.selectedImages.length === 0) {
        alert('กรุณาเลือกรูปภาพอย่างน้อย 1 รูป');
        return;
      }

      this.loading = true;
      try {
        const formData = new FormData();
        formData.append('nameproduct', this.formData.nameproduct);
        formData.append('price', this.formData.price);
        formData.append('category', this.formData.category);
        formData.append('subcategory', this.formData.subcategory);
        formData.append('description', this.formData.description);
        formData.append('phone', this.formData.phone);

        // Append new images only
        this.selectedImages.forEach((image, index) => {
          if (image.file) {
            formData.append('images', image.file);
          }
        });

        const token = localStorage.getItem('token');
        if (this.editingProduct) {
          // Update existing product
          await axios.put(`http://localhost:5000/api/products/${this.editingProduct._id}`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: `Bearer ${token}`
            }
          });
          alert('อัปเดตสินค้าสำเร็จ!');
        } else {
          // Create new product
          await axios.post('http://localhost:5000/api/products', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: `Bearer ${token}`
            }
          });
          alert('บันทึกสินค้าสำเร็จ!');
        }

        this.closeModal();
        await this.fetchProducts();
      } catch (error) {
        if (error.response && error.response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('isAdmin');
          this.$router.replace('/');
        } else {
          console.error('Error saving product:', error);
          alert('เกิดข้อผิดพลาดในการบันทึกสินค้า');
        }
      } finally {
        this.loading = false;
      }
    },
    async deleteProduct(productId) {
      if (!confirm('คุณแน่ใจหรือไม่ที่จะลบสินค้านี้?')) return;
      
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:5000/api/products/${productId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('ลบสินค้าสำเร็จ!');
        await this.fetchProducts();
      } catch (error) {
        if (error.response && error.response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('isAdmin');
          this.$router.replace('/');
        } else {
          console.error('Error deleting product:', error);
          alert('เกิดข้อผิดพลาดในการลบสินค้า');
        }
      }
    },
    async updateProductStatus(productId, status) {
      try {
        const token = localStorage.getItem('token');
        await axios.patch(`http://localhost:5000/api/products/${productId}/status`, 
          { status },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        // อัปเดตสถานะใน local state
        const productIndex = this.products.findIndex(p => p._id === productId);
        if (productIndex !== -1) {
          this.products[productIndex].status = status;
        }
        
        const statusText = status === 'ขาย' ? 'ขายแล้ว' : 'ปกติ';
        alert(`อัปเดตสถานะสินค้าเป็น "${statusText}" สำเร็จ!`);
      } catch (error) {
        if (error.response && error.response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('isAdmin');
          this.$router.replace('/');
        } else {
          console.error('Error updating product status:', error);
          alert('เกิดข้อผิดพลาดในการอัปเดตสถานะสินค้า');
        }
      }
    }
  }
};
</script>

<style scoped>
.management-admin {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #e0e0e0;
}

.page-title {
  font-size: 28px;
  font-weight: bold;
  color: #2c3e50;
  margin: 0;
}

.add-product-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.add-product-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.plus-icon {
  font-size: 20px;
  font-weight: bold;
}

.category-filter {
  margin-bottom: 30px;
  display: flex;
  align-items: center;
  gap: 15px;
}

.category-filter label {
  font-weight: 600;
  color: #2c3e50;
}

.category-filter select {
  padding: 10px 15px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  background: white;
  min-width: 200px;
  transition: border-color 0.3s ease;
}

.category-filter select:focus {
  outline: none;
  border-color: #667eea;
}

.products-container {
  min-height: 400px;
}

.loading, .no-products {
  text-align: center;
  padding: 60px 20px;
  font-size: 18px;
  color: #7f8c8d;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 20px;
  max-width: 100%;
}

.product-admin-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.status-control {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.status-label {
  font-size: 12px;
  font-weight: 600;
  color: #495057;
  white-space: nowrap;
}

.status-select {
  flex: 1;
  padding: 6px 8px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 12px;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.status-select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
}

.status-select.status-sold {
  background: #fff5f5;
  border-color: #e74c3c;
  color: #e74c3c;
  font-weight: 600;
}

.product-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  border: 1px solid #e0e0e0;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
}

.product-images {
  position: relative;
  height: 250px;
  overflow: hidden;
}

.main-image {
  position: relative;
  width: 100%;
  height: 100%;
}

.main-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.product-card:hover .main-image img {
  transform: scale(1.05);
}

.nav-arrow {
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

.nav-arrow:hover {
  background: rgba(0, 0, 0, 0.8);
  transform: translateY(-50%) scale(1.1);
}

.nav-arrow.prev {
  left: 10px;
}

.nav-arrow.next {
  right: 10px;
}

.thumbnail-nav {
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 5px;
}

.thumbnail-container {
  display: flex;
  gap: 5px;
  max-width: 200px;
  overflow: hidden;
}

.thumbnail-btn {
  width: 40px;
  height: 40px;
  border: 2px solid transparent;
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  background: none;
  padding: 0;
}

.thumbnail-btn img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.thumbnail-btn.active {
  border-color: #667eea;
  transform: scale(1.1);
}

.thumbnail-btn:not(.active) {
  opacity: 0.6;
}

.thumb-nav-arrow {
  background: rgba(0, 0, 0, 0.6);
  color: white;
  border: none;
  width: 25px;
  height: 25px;
  border-radius: 50%;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.thumb-nav-arrow:hover {
  background: rgba(0, 0, 0, 0.8);
}

.product-info {
  padding: 20px;
}

.product-name {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 10px 0;
  line-height: 1.3;
}

.product-price {
  font-size: 20px;
  font-weight: bold;
  color: #e74c3c;
  margin: 0 0 8px 0;
}

.product-category {
  font-size: 14px;
  color: #667eea;
  font-weight: 600;
  margin: 0 0 5px 0;
}

.product-subcategory {
  font-size: 14px;
  color: #7f8c8d;
  margin: 0;
}

.product-actions {
  padding: 0 20px 20px 20px;
  display: flex;
  gap: 10px;
}

.edit-btn, .delete-btn {
  flex: 1;
  padding: 10px 15px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
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
}

.delete-btn {
  background: #e74c3c;
  color: white;
}

.delete-btn:hover {
  background: #c0392b;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 12px;
  max-width: 900px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 30px;
  border-bottom: 1px solid #e0e0e0;
}

.modal-header h2 {
  margin: 0;
  color: #2c3e50;
  font-size: 24px;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
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

.product-form {
  padding: 30px;
  display: flex;
  gap: 30px;
}

.image-upload-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.image-preview-container {
  width: 300px;
  min-height: 300px;
  border: 2px dashed #e0e0e0;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
}

.no-image {
  color: #7f8c8d;
  font-size: 16px;
}

.image-carousel {
  width: 100%;
  height: 100%;
}

.main-preview {
  position: relative;
  width: 100%;
  height: 250px;
}

.main-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.preview-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.6);
  color: white;
  border: none;
  width: 35px;
  height: 35px;
  border-radius: 50%;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-nav:hover {
  background: rgba(0, 0, 0, 0.8);
}

.preview-nav.prev {
  left: 10px;
}

.preview-nav.next {
  right: 10px;
}

.preview-thumbnails {
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 5px;
}

.preview-thumbnail-container {
  display: flex;
  gap: 5px;
  max-width: 200px;
  overflow: hidden;
}

.preview-thumbnail-btn {
  width: 35px;
  height: 35px;
  border: 2px solid transparent;
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  background: none;
  padding: 0;
}

.preview-thumbnail-btn img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.preview-thumbnail-btn.active {
  border-color: #667eea;
  transform: scale(1.1);
}

.preview-thumbnail-btn:not(.active) {
  opacity: 0.6;
}

.preview-thumb-nav {
  background: rgba(0, 0, 0, 0.6);
  color: white;
  border: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.preview-thumb-nav:hover {
  background: rgba(0, 0, 0, 0.8);
}

.upload-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.upload-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.form-fields {
  flex: 2;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-row, .form-row-flex {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-row-flex {
  flex-direction: row;
  gap: 20px;
}

.form-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-fields label {
  font-weight: 600;
  color: #2c3e50;
  font-size: 14px;
}

.form-fields input,
.form-fields select,
.form-fields textarea {
  padding: 12px 15px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  background: white;
  transition: border-color 0.3s ease;
}

.form-fields input:focus,
.form-fields select:focus,
.form-fields textarea:focus {
  outline: none;
  border-color: #667eea;
}

.form-fields textarea {
  resize: vertical;
  min-height: 100px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #e0e0e0;
}

.cancel-btn {
  background: #95a5a6;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.cancel-btn:hover {
  background: #7f8c8d;
}

.submit-btn {
  background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(46, 204, 113, 0.3);
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(46, 204, 113, 0.4);
}

.submit-btn:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* Responsive Design */
@media (max-width: 1400px) {
  .management-admin {
    max-width: 1200px;
  }
  
  .products-grid {
    grid-template-columns: repeat(5, 1fr);
  }
}

@media (max-width: 1200px) {
  .management-admin {
    max-width: 100%;
    padding: 16px;
  }
  
  .products-grid {
    grid-template-columns: repeat(4, 1fr);
  }
  
  .header-section {
    margin-bottom: 24px;
  }
  
  .page-title {
    font-size: 24px;
  }
}

@media (max-width: 992px) {
  .management-admin {
    padding: 14px;
  }
  
  .products-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .page-title {
    font-size: 22px;
  }
  
  .filter-section {
    flex-direction: column;
    gap: 12px;
  }
  
  .category-filter {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .management-admin {
    padding: 12px;
  }
  
  .header-section {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
    margin-bottom: 20px;
  }
  
  .page-title {
    font-size: 20px;
  }
  
  .products-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
  
  .status-control {
    padding: 6px 8px;
    gap: 6px;
  }
  
  .status-label {
    font-size: 11px;
  }
  
  .status-select {
    padding: 4px 6px;
    font-size: 11px;
  }
  
  .product-form {
    flex-direction: column;
  }
  
  .image-upload-section {
    order: 2;
  }
  
  .form-fields {
    order: 1;
  }
  
  .form-row-flex {
    flex-direction: column;
  }
  
  .form-group {
    margin-bottom: 16px;
  }
  
  .form-group label {
    font-size: 14px;
  }
  
  .form-group input,
  .form-group textarea,
  .form-group select {
    padding: 10px 12px;
    font-size: 14px;
  }
  
  .add-product-btn {
    padding: 10px 20px;
    font-size: 14px;
  }
  
  .modal-content {
    width: 95vw;
    max-width: 95vw;
  }
  
  .form-actions {
    gap: 12px;
    margin-top: 20px;
  }
  
  .cancel-btn,
  .submit-btn {
    padding: 10px 20px;
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .management-admin {
    padding: 8px;
  }
  
  .header-section {
    gap: 12px;
    margin-bottom: 16px;
  }
  
  .page-title {
    font-size: 18px;
  }
  
  .products-grid {
    grid-template-columns: 1fr;
    gap: 10px;
  }
  
  .status-control {
    padding: 4px 6px;
    gap: 4px;
  }
  
  .status-label {
    font-size: 10px;
  }
  
  .status-select {
    padding: 3px 4px;
    font-size: 10px;
  }
  
  .filter-section {
    gap: 8px;
  }
  
  .category-filter {
    padding: 8px 10px;
    font-size: 13px;
  }
  
  .add-product-btn {
    padding: 8px 16px;
    font-size: 13px;
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
  
  .form-group {
    margin-bottom: 12px;
  }
  
  .form-group label {
    font-size: 13px;
  }
  
  .form-group input,
  .form-group textarea,
  .form-group select {
    padding: 8px 10px;
    font-size: 13px;
  }
  
  .form-actions {
    gap: 8px;
    margin-top: 16px;
  }
  
  .cancel-btn,
  .submit-btn {
    padding: 8px 16px;
    font-size: 13px;
  }
}

/* Tablet Landscape */
@media (min-width: 768px) and (max-width: 1024px) {
  .management-admin {
    padding: 14px;
  }
  
  .products-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* Large Desktop */
@media (min-width: 1600px) {
  .management-admin {
    max-width: 1400px;
  }
  
  .products-grid {
    grid-template-columns: repeat(6, 1fr);
  }
}

/* Extra Large Desktop */
@media (min-width: 1920px) {
  .management-admin {
    max-width: 1600px;
  }
  
  .products-grid {
    grid-template-columns: repeat(7, 1fr);
  }
}
</style>