<template>
    <div class="color-converter">
        <h2 class="title">颜色格式转换</h2>

        <div class="input-container" style="height: 45px;display: flex;">
            <input v-model="colorInput" type="text" class="input-box" placeholder="请输入 Hex 或 RGBA 颜色"
                @blur="updateColor" />

            <input type="color" v-model="colorInput" style="height: 100%;" />
        </div>
        <!-- 输入框，失去焦点时展示颜色 -->


        <button class="convert-btn" @click="convertColor">转换</button>

        <!-- 显示输入颜色 -->
        <div v-if="formattedOutput !== null" class="result-container">
            <div class="color-preview" :style="{ backgroundColor: formattedOutput.hexColor }"></div>
            <div class="output-wrapper">
                <span>{{ formattedOutput.formatted }}</span>
                <button class="copy-btn" @click="copyToClipboard(formattedOutput.formatted)">复制</button>
            </div>
        </div>

        <p v-else class="info-text">请输入有效的颜色格式（Hex 或 RGBA）</p>

        <!-- 显示转换后的其他格式 -->
        <div v-if="convertedColor" class="converted-container">
            <div v-if="convertedColor.hex" class="output-wrapper">
                <span>Hex: {{ convertedColor.hex }}</span>
                <button class="copy-btn" @click="copyToClipboard(convertedColor.hex)">复制</button>
            </div>
            <div v-if="convertedColor.rgba" class="output-wrapper">
                <span>RGBA: {{ convertedColor.rgba }}</span>
                <button class="copy-btn" @click="copyToClipboard(convertedColor.rgba)">复制</button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { hexToRgba, rgbaToHex } from '../utils/colorUtils';

const colorInput = ref('');
const formattedOutput = ref(null);
const convertedColor = ref(null);

// 更新输入框失去焦点时展示颜色
const updateColor = () => {
    if (formattedOutput.value) {
        formattedOutput.value.backgroundColor = formattedOutput.value.hexColor;
    }
};

// 转换颜色格式
const convertColor = () => {
    const hexPattern = /^#?([0-9A-Fa-f]{6})$/;
    const rgbaPattern = /^rgba?\(\s*(\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3}),\s*(\d(\.\d+)?)\s*\)$/;

    if (hexPattern.test(colorInput.value)) {
        // 如果是 Hex 格式，转换成 RGBA
        const hex = colorInput.value.startsWith('#') ? colorInput.value : `#${colorInput.value}`;
        const rgba = hexToRgba(hex);
        formattedOutput.value = {
            formatted: `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${rgba.a})`,
            hexColor: hex,
            backgroundColor: `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${rgba.a})`
        };
        convertedColor.value = {
            rgba: formattedOutput.value.formatted,
            hex: hex
        };
    } else if (rgbaPattern.test(colorInput.value)) {
        // 如果是 RGBA 格式，转换成 Hex
        const rgbaMatch = rgbaPattern.exec(colorInput.value);
        if (rgbaMatch) {
            const r = parseInt(rgbaMatch[1]);
            const g = parseInt(rgbaMatch[2]);
            const b = parseInt(rgbaMatch[3]);
            const a = parseFloat(rgbaMatch[4]);
            const hex = rgbaToHex(r, g, b, a);
            formattedOutput.value = {
                formatted: hex,
                hexColor: hex,
                backgroundColor: hex
            };
            convertedColor.value = {
                rgba: `rgba(${r}, ${g}, ${b}, ${a})`,
                hex: hex
            };
        }
    } else {
        formattedOutput.value = null; // 输入格式不匹配时清空结果
    }
};

// 复制颜色值到剪贴板
const copyToClipboard = async (color) => {
    try {
        await navigator.clipboard.writeText(color);
        alert('已复制到剪贴板');
    } catch (err) {
        console.error('复制失败: ', err);
    }
};
</script>

<style scoped>
.color-converter {
    max-width: 500px;
    margin: 40px auto;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.title {
    text-align: center;
    font-size: 1.5em;
    margin-bottom: 20px;
    color: #333;
}

.input-box {
    height: 100%;
    width: 100%;
    padding: 10px;
    font-size: 1em;
    border: 1px solid #ddd;
    border-radius: 4px;
    margin-bottom: 20px;
    transition: border-color 0.3s;
}

.input-box:focus {
    border-color: #007BFF;
    outline: none;
}

.convert-btn {
    width: 100%;
    padding: 12px;
    font-size: 1em;
    background-color: #007BFF;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s;
}

.convert-btn:hover {
    background-color: #0056b3;
}

.result-container,
.converted-container {
    display: flex;
    align-items: center;
    margin-top: 20px;
}

.color-preview {
    width: 30px;
    height: 30px;
    margin-right: 15px;
    border: 1px solid #ddd;
    border-radius: 4px;
}

.output-wrapper {
    display: flex;
    align-items: center;
}

.output-wrapper span {
    font-size: 1em;
    color: #333;
    margin-right: 15px;
}

.copy-btn {
    padding: 6px 12px;
    font-size: 0.9em;
    background-color: #28a745;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s;
}

.copy-btn:hover {
    background-color: #218838;
}

.info-text {
    color: #777;
    text-align: center;
}

button {
    transition: transform 0.2s;
}

button:active {
    transform: scale(0.98);
}
</style>
