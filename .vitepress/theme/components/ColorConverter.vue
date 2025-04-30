<template>
    <div class="color-converter">
        <h2 class="title">颜色格式转换</h2>

        <div class="input-container">
            <input v-model="colorInput" type="text" class="input-box"
                placeholder="支持 Hex(#RRGGBB)、RGBA、ARGB(#AARRGGBB)" />
            <input type="color" v-model="colorInput" />
        </div>

        <button class="convert-btn" @click="convertColor">
            <span v-if="!isConverting">转换</span>
            <span v-else class="loading-pulse">转换中...</span>
        </button>

        <!-- 输入格式显示 -->
        <div v-if="formattedOutput" class="result-container">
            <div class="output-wrapper is-input">
                <span>输入格式: {{ formattedOutput.inputType }}</span>
                <div class="color-preview" :style="{
                    backgroundColor: formattedOutput.backgroundColor,
                    borderColor: formattedOutput.borderColor
                }" />
            </div>
            <div class="output-wrapper is-input">
                <span>输入值: {{ formattedOutput.formatted }}</span>
            </div>
        </div>

        <p v-else class="info-text">请输入有效的颜色格式</p>

        <!-- 转换结果 -->
        <div v-if="convertedColor" class="converted-container">
            <div class="output-wrapper">
                <span>Hex: {{ convertedColor.hex }}</span>
                <button class="copy-btn" @click="copyToClipboard(convertedColor.hex, 'hex')"
                    :class="{ 'copied': copiedState.hex }">
                    {{ copiedState.hex ? '✓ 已复制' : '📋 复制' }}
                </button>
            </div>
            <div class="output-wrapper">
                <span>RGBA: {{ convertedColor.rgba }}</span>
                <button class="copy-btn" @click="copyToClipboard(convertedColor.rgba, 'rgba')"
                    :class="{ 'copied': copiedState.rgba }">
                    {{ copiedState.rgba ? '✓ 已复制' : '📋 复制' }}
                </button>
            </div>
            <div class="output-wrapper">
                <span>ARGB: {{ convertedColor.argb }}</span>
                <button class="copy-btn" @click="copyToClipboard(convertedColor.argb, 'argb')"
                    :class="{ 'copied': copiedState.argb }">
                    {{ copiedState.argb ? '✓ 已复制' : '📋 复制' }}
                </button>
            </div>
            <div class="output-wrapper">
                <span>Hex32: {{ convertedColor.hex32 }}</span>
                <button class="copy-btn" @click="copyToClipboard(convertedColor.hex32, 'hex32')"
                    :class="{ 'copied': copiedState.hex32 }">
                    {{ copiedState.hex32 ? '✓ 已复制' : '📋 复制' }}
                </button>
            </div>
        </div>
    </div>
</template>

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

<style scoped>
.color-converter {
    max-width: 500px;
    margin: 0 auto;
    padding: 1.5rem;
    border-radius: 8px;
    background-color: var(--vp-c-bg-soft);
    border: 1px solid var(--vp-c-divider);
    box-shadow: var(--vp-shadow-1);
}

.title {
    margin-top: 0;
    margin-bottom: 1.25rem;
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--vp-c-text-1);
}

.input-container {
    display: flex;
    gap: 0.75rem;
    margin-bottom: 1rem;
}

.input-box {
    flex: 1;
    padding: 0.5rem 0.75rem;
    border: 1px solid var(--vp-c-divider);
    border-radius: 6px;
    background-color: var(--vp-c-bg);
    color: var(--vp-c-text-1);
    font-family: var(--vp-font-family-base);
    transition: border-color 0.25s;
}

.input-box:focus {
    outline: none;
    border-color: var(--vp-c-brand);
}

input[type="color"] {
    width: 40px;
    height: 40px;
    padding: 2px;
    border-radius: 6px;
    border: 1px solid var(--vp-c-divider);
    background: var(--vp-c-bg);
    cursor: pointer;
}

input[type="color"]::-webkit-color-swatch {
    border-radius: 4px;
    border: none;
}

.convert-btn {
    width: 100%;
    padding: 0.5rem;
    margin-bottom: 1.5rem;
    border: none;
    border-radius: 6px;
    background-color: var(--vp-button-brand-bg);
    color: var(--vp-button-brand-text);
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.25s;
}

.convert-btn:hover {
    background-color: var(--vp-button-brand-hover-bg);
}

.result-container,
.converted-container {
    margin-top: 1rem;
    padding: 1rem;
    border-radius: 6px;
    background-color: var(--vp-c-bg-soft-up);
    border: 1px solid var(--vp-c-divider-light);
}

.output-wrapper {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.75rem;
    padding: 0.5rem;
    border-radius: 4px;
    background-color: var(--vp-c-bg);
}

.output-wrapper:last-child {
    margin-bottom: 0;
}

.output-wrapper.is-input {
    background-color: transparent;
    padding-left: 0;
    padding-right: 0;
}

.color-preview {
    width: 24px;
    height: 24px;
    border-radius: 4px;
    border-width: 1px;
    border-style: solid;
}

.copy-btn {
    padding: 0.25rem 0.5rem;
    margin-left: 0.5rem;
    border: none;
    border-radius: 4px;
    background-color: var(--vp-c-bg-alt);
    color: var(--vp-c-text-2);
    font-size: 0.8rem;
    cursor: pointer;
    transition: all 0.2s;
}

.copy-btn:hover {
    background-color: var(--vp-c-gray-light-4);
    color: var(--vp-c-text-1);
}

.copy-btn.copied {
    background-color: var(--vp-c-green-light);
    color: var(--vp-c-green-darker);
}

.info-text {
    margin: 1rem 0;
    color: var(--vp-c-text-2);
    text-align: center;
}

/* 加载动画 */
.loading-pulse {
    animation: pulse 1.5s infinite;
}

@keyframes pulse {
    0%, 100% {
        opacity: 1;
    }
    50% {
        opacity: 0.6;
    }
}
</style>