<template>
  <div class="why-section" :style="gradientStyle">
    <div class="section-header">
      <h2 class="section-title">{{ title }}</h2>
      <p class="section-subtitle">{{ subtitle }}</p>
      <slot name="after-subtitle"></slot>
    </div>
    <div class="why-content">
      <div class="why-text">{{ description }}</div>
      <div class="why-features">
        <div class="feature-item" v-for="(feature, idx) in features" :key="idx">
          <span class="feature-icon">{{ feature.icon }}</span>
          <span class="feature-text">{{ feature.text }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'WhyContent',
  props: {
    title: {
      type: String,
      default: '💡 ทำไมต้องเลือกเรา?'
    },
    subtitle: {
      type: String,
      default: 'ข้อดีของการใช้ Website Card'
    },
    color: {
      type: String,
      default: '#f8f9fd'
    },
    color2: {
      type: String,
      default: ''
    },
    description: {
      type: String,
      default: 'ในยุคดิจิทัลทุกวันนี้ การขายของออนไลน์เป็นที่นิยมกว่าสมัยก่อน เพื่อช่วยให้เจ้าของสินค้าของร้านสามารถนำเสนอของที่ตนมีได้อย่างครบถ้วนและเป็นระบบ ไม่มีอะจะซ้ำกัน ลูกค้าก็สามารถดูรายละเอียดสินค้าได้ง่าย ๆ แค่สแกนหรือคลิก QR Code'
    },
    features: {
      type: Array,
      default: () => [
        { icon: '🎨', text: 'ปรับแต่งเนื้อหาและรูปแบบได้ตามใจ' },
        { icon: '💬', text: 'ลูกค้าสามารถติดต่อเจ้าของร้านได้ทันที' },
        { icon: '💰', text: 'ไม่เสียค่าแพลตฟอร์มหรือค่าธรรมเนียมใด ๆ' }
      ]
    }
  },
  computed: {
    gradientStyle() {
      if (this.color2) {
        return {
          background: `linear-gradient(135deg, ${this.color} 0%, ${this.color2} 100%)`
        }
      }
      return { background: this.color }
    }
  }
}
</script>

<style scoped>
.why-section {
  margin: 32px 0;
  border-radius: 18px;
  box-shadow: 0 2px 16px rgba(102, 126, 234, 0.08);
  padding: 0;
}
.section-header {
  margin-bottom: 18px;
  padding: 32px 28px 0 28px;
}
.section-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #667eea;
}
.section-subtitle {
  font-size: 1.1rem;
  color: #888;
}
.why-content {
  padding: 0 28px 32px 28px;
}
.why-text {
  font-size: 1.15rem;
  color: #4a4a4a;
  margin-bottom: 22px;
  font-weight: 500;
}
.why-features {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 32px;
}
.feature-item {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #fff;
  border-radius: 10px;
  padding: 12px 20px;
  box-shadow: 0 1px 6px rgba(102, 126, 234, 0.06);
  font-size: 1rem;
  color: #3a3a3a;
}
.feature-icon {
  font-size: 1.4rem;
}
.feature-text {
  font-size: 1rem;
}
</style> 