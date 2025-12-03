<script setup>
import { ref } from 'vue';

const colorInput = ref('');
const formattedOutput = ref(null);
const convertedColor = ref(null);
const isConverting = ref(false);
const copiedState = ref({
    hex: false,
    rgba: false,
    argb: false,
    hex32: false
});

// 核心转换逻辑
const convertColor = () => {
    isConverting.value = true;
    const input = colorInput.value.trim();

    // 重置状态
    formattedOutput.value = null;
    convertedColor.value = null;

    // 匹配不同格式
    const hexMatch = input.match(/^#?([0-9A-Fa-f]{6})$/);
    const rgbaMatch = input.match(/^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(?:,\s*([01]?\.\d+)\s*)?\)$/);
    const argbMatch = input.match(/^(?:#|0x)?([0-9A-Fa-f]{8})$/);

    try {
        if (hexMatch) {
            processHex(hexMatch[1]);
        } else if (rgbaMatch) {
            processRGBA(rgbaMatch);
        } else if (argbMatch) {
            processARGB(argbMatch[1]);
        } else {
            throw new Error('格式不支持');
        }
    } catch (error) {
        console.error('转换失败:', error);
    } finally {
        isConverting.value = false;
    }
};

// 处理 Hex 格式 (#RRGGBB)
const processHex = (hex) => {
    const fullHex = `#${hex}`;
    const { r, g, b } = hexToRgb(hex);

    formattedOutput.value = {
        inputType: 'Hex',
        formatted: fullHex,
        backgroundColor: fullHex,
        borderColor: '#ddd'
    };

    convertedColor.value = {
        hex: fullHex,
        rgba: `rgba(${r}, ${g}, ${b}, 1)`,
        argb: `#FF${hex}`,
        hex32: `0x${hex}FF`
    };
};

// 处理 RGBA 格式 (rgba(r,g,b,a))
const processRGBA = (match) => {
    const r = parseInt(match[1]);
    const g = parseInt(match[2]);
    const b = parseInt(match[3]);
    const a = match[4] ? parseFloat(match[4]) : 1;
    const hex = rgbToHex(r, g, b);

    formattedOutput.value = {
        inputType: 'RGBA',
        formatted: `rgba(${r}, ${g}, ${b}, ${a})`,
        backgroundColor: `rgba(${r}, ${g}, ${b}, ${a})`,
        borderColor: a < 1 ? 'transparent' : '#ddd'
    };

    convertedColor.value = {
        hex: `#${hex}`,
        rgba: `rgba(${r}, ${g}, ${b}, ${a})`,
        argb: `#${decimalToHex(a * 255)}${hex}`,
        hex32: `0x${decimalToHex(a * 255)}${hex}`
    };
};

// 处理 ARGB 格式 (#AARRGGBB)
const processARGB = (argb) => {
    const a = parseInt(argb.substring(0, 2), 16) / 255;
    const r = parseInt(argb.substring(2, 4), 16);
    const g = parseInt(argb.substring(4, 6), 16);
    const b = parseInt(argb.substring(6, 8), 16);
    const hex = argb.substring(2);

    formattedOutput.value = {
        inputType: 'ARGB',
        formatted: `#${argb}`,
        backgroundColor: `rgba(${r}, ${g}, ${b}, ${a})`,
        borderColor: a < 1 ? 'transparent' : '#ddd'
    };

    convertedColor.value = {
        hex: `#${hex}`,
        rgba: `rgba(${r}, ${g}, ${b}, ${a})`,
        argb: `#${argb}`,
        hex32: `0x${argb}`
    };
};

// 复制到剪贴板
const copyToClipboard = async (text, type) => {
    try {
        await navigator.clipboard.writeText(text);
        copiedState.value = { ...copiedState.value, [type]: true };
        setTimeout(() => {
            copiedState.value = { ...copiedState.value, [type]: false };
        }, 2000);
    } catch (err) {
        console.error('复制失败:', err);
    }
};

// 辅助函数
const hexToRgb = (hex) => {
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return { r, g, b };
};

const rgbToHex = (r, g, b) => {
    return [r, g, b].map(x => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }).join('');
};

const decimalToHex = (decimal) => {
    const hex = Math.round(decimal).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
};
</script>

<template>
    <div class="color-page">
        <div class="container">
            <h1>颜色格式转换</h1>
            <p class="description">支持 Hex、RGBA、ARGB 等格式互转</p>

            <div class="form-container">
                <form @submit.prevent="convertColor" class="color-form">
                    <div class="form-row">
                        <label for="colorInput">颜色值</label>
                        <div class="input-group">
                            <input
                                id="colorInput"
                                v-model="colorInput"
                                type="text"
                                placeholder="支持 Hex(#RRGGBB)、RGBA、ARGB(#AARRGGBB)"
                            />
                            <input type="color" v-model="colorInput" class="color-picker" />
                        </div>
                    </div>

                    <div class="form-actions">
                        <button type="submit" :disabled="isConverting" class="btn-primary">
                            {{ isConverting ? '转换中...' : '转换' }}
                        </button>
                    </div>
                </form>

                <!-- 输入格式显示 -->
                <div v-if="formattedOutput" class="info-section">
                    <h3>输入信息</h3>
                    <div class="color-display">
                        <div class="color-swatch" :style="{
                            backgroundColor: formattedOutput.backgroundColor,
                            borderColor: formattedOutput.borderColor
                        }" />
                        <div class="color-info">
                            <div class="info-row">
                                <span class="label">格式类型</span>
                                <span class="value">{{ formattedOutput.inputType }}</span>
                            </div>
                            <div class="info-row">
                                <span class="label">输入值</span>
                                <span class="value code">{{ formattedOutput.formatted }}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 转换结果 -->
                <div v-if="convertedColor" class="result-section">
                    <h3>转换结果</h3>
                    <div class="result-list">
                        <div class="result-item">
                            <div class="result-label">Hex</div>
                            <div class="result-value">{{ convertedColor.hex }}</div>
                            <button
                                @click="copyToClipboard(convertedColor.hex, 'hex')"
                                :class="['copy-btn', { 'copied': copiedState.hex }]"
                            >
                                {{ copiedState.hex ? '✓' : '复制' }}
                            </button>
                        </div>
                        <div class="result-item">
                            <div class="result-label">RGBA</div>
                            <div class="result-value">{{ convertedColor.rgba }}</div>
                            <button
                                @click="copyToClipboard(convertedColor.rgba, 'rgba')"
                                :class="['copy-btn', { 'copied': copiedState.rgba }]"
                            >
                                {{ copiedState.rgba ? '✓' : '复制' }}
                            </button>
                        </div>
                        <div class="result-item">
                            <div class="result-label">ARGB</div>
                            <div class="result-value">{{ convertedColor.argb }}</div>
                            <button
                                @click="copyToClipboard(convertedColor.argb, 'argb')"
                                :class="['copy-btn', { 'copied': copiedState.argb }]"
                            >
                                {{ copiedState.argb ? '✓' : '复制' }}
                            </button>
                        </div>
                        <div class="result-item">
                            <div class="result-label">Hex32</div>
                            <div class="result-value">{{ convertedColor.hex32 }}</div>
                            <button
                                @click="copyToClipboard(convertedColor.hex32, 'hex32')"
                                :class="['copy-btn', { 'copied': copiedState.hex32 }]"
                            >
                                {{ copiedState.hex32 ? '✓' : '复制' }}
                            </button>
                        </div>
                    </div>
                </div>

                <p v-if="!formattedOutput && !convertedColor" class="empty-hint">
                    请输入颜色值进行转换
                </p>
            </div>
        </div>
    </div>
</template>

<style scoped>
.color-page {
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

.color-form {
    margin-bottom: 0;
    padding-bottom: 1.5rem;
}

.form-row {
    margin-bottom: 1rem;
}

.form-row label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: var(--vp-c-text-1);
}

.input-group {
    display: flex;
    gap: 0.75rem;
}

.input-group input[type="text"] {
    flex: 1;
    padding: 0.625rem 0.875rem;
    border: 1px solid var(--vp-c-divider);
    border-radius: 4px;
    background: var(--vp-c-bg);
    color: var(--vp-c-text-1);
    font-size: 0.875rem;
    transition: border-color 0.2s;
}

.input-group input[type="text"]:focus {
    outline: none;
    border-color: var(--vp-c-brand-1);
}

.input-group input[type="text"]::placeholder {
    color: var(--vp-c-text-3);
}

.color-picker {
    width: 48px;
    height: 40px;
    padding: 4px;
    border: 1px solid var(--vp-c-divider);
    border-radius: 4px;
    background: var(--vp-c-bg);
    cursor: pointer;
}

.color-picker::-webkit-color-swatch-wrapper {
    padding: 0;
}

.color-picker::-webkit-color-swatch {
    border: none;
    border-radius: 2px;
}

.form-actions {
    display: flex;
    gap: 0.75rem;
}

.btn-primary {
    padding: 0.625rem 1.25rem;
    border: 1px solid transparent;
    border-radius: 4px;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
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

.info-section,
.result-section {
    border-top: 1px solid var(--vp-c-divider);
    padding-top: 1.5rem;
    margin-bottom: 1.5rem;
}

.info-section:last-child,
.result-section:last-child {
    margin-bottom: 0;
}

h3 {
    font-size: 1rem;
    margin-bottom: 1rem;
    color: var(--vp-c-text-1);
    font-weight: 600;
}

.color-display {
    display: flex;
    gap: 1.5rem;
    padding: 1.25rem;
    background: var(--vp-c-bg);
    border: 1px solid var(--vp-c-divider);
    border-radius: 8px;
}

.color-swatch {
    width: 80px;
    height: 80px;
    min-width: 80px;
    border-radius: 8px;
    border: 1px solid;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.color-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.875rem;
    justify-content: center;
}

.info-row {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.info-row .label {
    color: var(--vp-c-text-2);
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-weight: 500;
}

.info-row .value {
    color: var(--vp-c-text-1);
    font-size: 0.9375rem;
    font-weight: 500;
}

.info-row .value.code {
    font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
    color: var(--vp-c-brand-1);
}

.result-list {
    display: flex;
    flex-direction: column;
    gap: 0.875rem;
}

.result-item {
    display: grid;
    grid-template-columns: 70px 1fr auto;
    gap: 1.25rem;
    align-items: center;
    padding: 1rem 1.25rem;
    background: var(--vp-c-bg);
    border: 1px solid var(--vp-c-divider);
    border-radius: 6px;
    transition: border-color 0.2s, box-shadow 0.2s;
}

.result-item:hover {
    border-color: var(--vp-c-brand-1);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.result-label {
    font-weight: 600;
    color: var(--vp-c-text-2);
    font-size: 0.8125rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.result-value {
    color: var(--vp-c-text-1);
    font-size: 0.875rem;
    font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
    word-break: break-all;
    line-height: 1.6;
}

.copy-btn {
    padding: 0.375rem 0.75rem;
    border: 1px solid var(--vp-c-divider);
    border-radius: 4px;
    background: var(--vp-c-bg);
    color: var(--vp-c-text-1);
    font-size: 0.75rem;
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;
}

.copy-btn:hover {
    border-color: var(--vp-c-brand-1);
    color: var(--vp-c-brand-1);
}

.copy-btn.copied {
    background: var(--vp-c-brand-1);
    border-color: var(--vp-c-brand-1);
    color: #fff;
}

.empty-hint {
    text-align: center;
    color: var(--vp-c-text-2);
    padding: 3rem 2rem;
    font-size: 0.9375rem;
    border-top: 1px solid var(--vp-c-divider);
    margin-top: 1.5rem;
}

@media (max-width: 768px) {
    .color-page {
        margin: 1rem auto;
    }

    .container h1 {
        font-size: 1.5rem;
    }

    .form-container {
        padding: 1.5rem;
    }

    .input-group {
        flex-direction: column;
    }

    .color-picker {
        width: 100%;
    }

    .color-display {
        flex-direction: column;
        align-items: center;
        gap: 1rem;
    }

    .color-swatch {
        width: 100%;
        height: 120px;
    }

    .color-info {
        width: 100%;
    }

    .result-item {
        grid-template-columns: 1fr;
        gap: 0.75rem;
        padding: 1rem;
    }

    .result-label {
        font-weight: 700;
    }

    .copy-btn {
        width: 100%;
        padding: 0.5rem;
    }
}
</style>
