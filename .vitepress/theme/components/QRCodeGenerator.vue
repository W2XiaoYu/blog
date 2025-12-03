<script setup lang="ts">
import { ref, computed } from 'vue'
import QRCode from 'qrcode'

interface ParkingInfo {
    name: string
    baseUrl: string
    tel: string
    plate: string
    barkCode: string
}

const parkingInfo = ref<ParkingInfo>({
    name: '停车二维码',
    baseUrl: 'http://117.72.94.131',
    tel: '',
    plate: '',
    barkCode: ''
})

const qrCodeUrl = ref<string>('')
const isGenerating = ref(false)
const showModal = ref(false)

// 计算完整的 URL
const fullUrl = computed(() => {
    const { baseUrl, tel, plate, barkCode } = parkingInfo.value
    if (!baseUrl) return ''

    const params = new URLSearchParams()
    if (tel) params.append('tel', tel)
    if (plate) params.append('plate', plate)
    if (barkCode) params.append('barkCode', barkCode)

    const queryString = params.toString()
    return queryString ? `${baseUrl}?${queryString}` : baseUrl
})

// 生成二维码并显示弹窗
const generateQRCode = async () => {
    if (!fullUrl.value) {
        alert('请输入基础URL')
        return
    }

    isGenerating.value = true
    try {
        const url = await QRCode.toDataURL(fullUrl.value, {
            width: 400,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            }
        })
        qrCodeUrl.value = url
        showModal.value = true
    } catch (error) {
        console.error('生成二维码失败:', error)
        alert('生成二维码失败，请重试')
    } finally {
        isGenerating.value = false
    }
}

// 下载二维码图片
const downloadQRCode = () => {
    if (!qrCodeUrl.value) {
        alert('请先生成二维码')
        return
    }

    const link = document.createElement('a')
    const fileName = parkingInfo.value.plate
        ? `停车码-${parkingInfo.value.plate}.png`
        : `${parkingInfo.value.name || 'qrcode'}.png`
    link.download = fileName
    link.href = qrCodeUrl.value
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
}

// 清空表单
const clearForm = () => {
    parkingInfo.value = {
        name: '停车二维码',
        baseUrl: 'http://117.72.94.131',
        tel: '',
        plate: '',
        barkCode: ''
    }
    qrCodeUrl.value = ''
}

// 填充示例数据
const fillExample = () => {
    parkingInfo.value = {
        name: '停车二维码',
        baseUrl: 'http://117.72.94.131',
        tel: '13221000001',
        plate: '浙A-H30000',
        barkCode: 'ot8yVWvjx8yZdgwegw3'
    }
}

// 关闭弹窗
const closeModal = () => {
    showModal.value = false
}

// 点击遮罩关闭
const handleOverlayClick = (e: MouseEvent) => {
    if (e.target === e.currentTarget) {
        closeModal()
    }
}
</script>

<template>
    <div class="qrcode-page">
        <div class="container">
            <p class="description">生成专属挪车二维码</p>

            <div class="form-container">
                <form @submit.prevent="generateQRCode" class="qr-form">

                    <div class="form-row">
                        <label for="baseUrl">
                            基础URL <span class="required">*</span>
                        </label>
                        <input
                            id="baseUrl"
                            v-model="parkingInfo.baseUrl"
                            type="url"
                            placeholder="http://117.72.94.131"
                            required
                        />
                    </div>

                    <div class="form-row">
                        <label for="tel">挪车电话</label>
                        <input
                            id="tel"
                            v-model="parkingInfo.tel"
                            type="tel"
                            placeholder="13221000001"
                        />
                    </div>

                    <div class="form-row">
                        <label for="plate">车牌号码</label>
                        <input
                            id="plate"
                            v-model="parkingInfo.plate"
                            type="text"
                            placeholder="浙A-H30000"
                        />
                    </div>

                    <div class="form-row">
                        <label for="barkCode">Bark推送码</label>
                        <input
                            id="barkCode"
                            v-model="parkingInfo.barkCode"
                            type="text"
                            placeholder="ot8yVWvjx8yZdgwegw3"
                        />
                    </div>

                    <div class="form-actions">
                        <button type="submit" :disabled="isGenerating" class="btn-primary">
                            {{ isGenerating ? '生成中...' : '生成二维码' }}
                        </button>
                        <button type="button" @click="fillExample" class="btn-secondary">
                            填充示例
                        </button>
                        <button type="button" @click="clearForm" class="btn-secondary">
                            清空表单
                        </button>
                    </div>
                </form>

                <div class="info-section" v-if="fullUrl">
                    <h3>预览信息</h3>
                    <div class="info-list">
                        <div class="info-item" v-if="parkingInfo.tel">
                            <span class="label">挪车电话：</span>
                            <span class="value">{{ parkingInfo.tel }}</span>
                        </div>
                        <div class="info-item" v-if="parkingInfo.plate">
                            <span class="label">车牌号码：</span>
                            <span class="value">{{ parkingInfo.plate }}</span>
                        </div>
                        <div class="info-item" v-if="parkingInfo.barkCode">
                            <span class="label">推送码：</span>
                            <span class="value">{{ parkingInfo.barkCode }}</span>
                        </div>
                        <div class="info-item">
                            <span class="label">完整链接：</span>
                            <span class="value url">{{ fullUrl }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 二维码弹窗 -->
        <Teleport to="body">
            <Transition name="modal">
                <div v-if="showModal" class="modal-overlay" @click="handleOverlayClick">
                    <div class="modal-content">
                        <button class="modal-close" @click="closeModal" aria-label="关闭">×</button>

                        <h2>{{ parkingInfo.name }}</h2>

                        <div class="qrcode-display">
                            <img :src="qrCodeUrl" alt="QR Code" />
                        </div>

                        <div class="url-box">
                            <div class="url-content">{{ fullUrl }}</div>
                        </div>

                        <div class="modal-info" v-if="parkingInfo.tel || parkingInfo.plate">
                            <p v-if="parkingInfo.plate" class="plate-info">{{ parkingInfo.plate }}</p>
                            <p v-if="parkingInfo.tel" class="tel-info">挪车电话：{{ parkingInfo.tel }}</p>
                        </div>

                        <div class="modal-actions">
                            <button @click="downloadQRCode" class="btn-download">下载二维码</button>
                        </div>
                    </div>
                </div>
            </Transition>
        </Teleport>
    </div>
</template>

<style scoped>
.qrcode-page {
    max-width: 800px;
    margin: 2rem auto;
    padding: 0 1rem;
}

.container h1 {
    font-size: 2rem;
    margin-bottom: 0.5rem;
    color: var(--vp-c-text-1);
}

.description {
    color: var(--vp-c-text-2);
    margin-bottom: 2rem;
}

.form-container {
    background: var(--vp-c-bg-soft);
    border: 1px solid var(--vp-c-divider);
    border-radius: 8px;
    padding: 2rem;
}

.qr-form {
    margin-bottom: 2rem;
}

.form-row {
    margin-bottom: 1.5rem;
}

.form-row label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: var(--vp-c-text-1);
}

.required {
    color: var(--vp-c-danger-1);
}

.form-row input {
    width: 100%;
    padding: 0.625rem 0.875rem;
    border: 1px solid var(--vp-c-divider);
    border-radius: 4px;
    background: var(--vp-c-bg);
    color: var(--vp-c-text-1);
    font-size: 0.875rem;
    transition: border-color 0.2s;
}

.form-row input:focus {
    outline: none;
    border-color: var(--vp-c-brand-1);
}

.form-row input::placeholder {
    color: var(--vp-c-text-3);
}

.form-actions {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
}

.btn-primary,
.btn-secondary {
    padding: 0.625rem 1.25rem;
    border: 1px solid transparent;
    border-radius: 4px;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
}

.btn-primary {
    background: var(--vp-c-brand-1);
    color: #fff;
}

.btn-primary:hover:not(:disabled) {
    background: var(--vp-c-brand-2);
}

.btn-primary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.btn-secondary {
    background: var(--vp-c-bg);
    border-color: var(--vp-c-divider);
    color: var(--vp-c-text-1);
}

.btn-secondary:hover {
    border-color: var(--vp-c-brand-1);
    color: var(--vp-c-brand-1);
}

.info-section {
    border-top: 1px solid var(--vp-c-divider);
    padding-top: 1.5rem;
}

.info-section h3 {
    font-size: 1rem;
    margin-bottom: 1rem;
    color: var(--vp-c-text-1);
}

.info-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.info-item {
    display: flex;
    gap: 0.5rem;
}

.info-item .label {
    color: var(--vp-c-text-2);
    font-size: 0.875rem;
}

.info-item .value {
    color: var(--vp-c-text-1);
    font-size: 0.875rem;
    font-weight: 500;
}

.info-item .value.url {
    word-break: break-all;
    color: var(--vp-c-brand-1);
    font-family: monospace;
}

/* 弹窗样式 */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    padding: 1rem;
}

.modal-content {
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 12px;
    padding: 2rem;
    max-width: 500px;
    width: 100%;
    position: relative;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
}

.dark .modal-content {
    background: rgba(30, 30, 30, 0.85);
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-close {
    position: absolute;
    top: 1rem;
    right: 1rem;
    width: 32px;
    height: 32px;
    border: none;
    background: var(--vp-c-bg-soft);
    border-radius: 4px;
    font-size: 1.5rem;
    line-height: 1;
    cursor: pointer;
    color: var(--vp-c-text-2);
    transition: all 0.2s;
}

.modal-close:hover {
    background: var(--vp-c-bg-mute);
    color: var(--vp-c-text-1);
}

.modal-content h2 {
    font-size: 1.5rem;
    margin-bottom: 1.5rem;
    color: var(--vp-c-text-1);
    text-align: center;
}

.qrcode-display {
    display: flex;
    justify-content: center;
    margin-bottom: 1.5rem;
    padding: 1.5rem;
    background: var(--vp-c-bg-soft);
    border-radius: 8px;
}

.qrcode-display img {
    max-width: 100%;
    height: auto;
    border-radius: 4px;
}

.url-box {
    margin-bottom: 1.5rem;
    padding: 1rem;
    background: var(--vp-c-bg-soft);
    border: 1px solid var(--vp-c-divider);
    border-radius: 4px;
}

.url-content {
    word-break: break-all;
    font-size: 0.875rem;
    color: var(--vp-c-brand-1);
    font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
    line-height: 1.6;
}

.modal-info {
    text-align: center;
    margin-bottom: 1.5rem;
    padding: 1rem;
    background: var(--vp-c-bg-soft);
    border-radius: 4px;
}

.modal-info p {
    margin: 0.5rem 0;
    color: var(--vp-c-text-1);
}

.plate-info {
    font-size: 1.25rem;
    font-weight: 600;
}

.tel-info {
    font-size: 0.875rem;
    color: var(--vp-c-text-2);
}

.modal-actions {
    display: flex;
    justify-content: center;
}

.btn-download {
    padding: 0.75rem 2rem;
    background: var(--vp-c-brand-1);
    color: #fff;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s;
}

.btn-download:hover {
    background: var(--vp-c-brand-2);
}

/* 弹窗动画 */
.modal-enter-active,
.modal-leave-active {
    transition: opacity 0.3s ease;
}

.modal-enter-active .modal-content,
.modal-leave-active .modal-content {
    transition: transform 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
    opacity: 0;
}

.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
    transform: scale(0.9);
}

/* 响应式 */
@media (max-width: 768px) {
    .qrcode-page {
        margin: 1rem auto;
    }

    .container h1 {
        font-size: 1.5rem;
    }

    .form-container {
        padding: 1.5rem;
    }

    .form-actions {
        flex-direction: column;
    }

    .btn-primary,
    .btn-secondary {
        width: 100%;
    }

    .modal-content {
        padding: 1.5rem;
    }
}
</style>
