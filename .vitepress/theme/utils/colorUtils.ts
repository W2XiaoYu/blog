// utils/colorUtils.js

export const hexToRgba = (hex) => {
    let r = 0, g = 0, b = 0, a = 1;
    // 处理 Hex 颜色，去掉 #
    if (hex.length === 4) {
        // #RGB 格式 (expand to #RRGGBB)
        r = parseInt(hex[1] + hex[1], 16);
        g = parseInt(hex[2] + hex[2], 16);
        b = parseInt(hex[3] + hex[3], 16);
    } else if (hex.length === 7) {
        // #RRGGBB 格式
        r = parseInt(hex.slice(1, 3), 16);
        g = parseInt(hex.slice(3, 5), 16);
        b = parseInt(hex.slice(5, 7), 16);
    }
    return { r, g, b, a };
};

export const rgbaToHex = (r, g, b, a = 1) => {
    // 如果透明度不为 1，则转换为 RGBA 格式
    const toHex = (x) => x.toString(16).padStart(2, '0');
    const hex = `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    return a === 1 ? hex : hex + Math.round(a * 255).toString(16).padStart(2, '0');
};
