import { useLive2d } from 'vitepress-theme-website'
import { onMounted } from 'vue'
export default async () => {
    // @ts-ignore-error
    if (!import.meta.env.SSR) {
        const { loadOml2d } = await import('oh-my-live2d');
        loadOml2d({
            primaryColor: 'pink',
            models: [
                {
                    path: 'https://model.hacxy.cn/HK416-1-normal/model.json',
                    position: [0, 60],
                    scale: 0.06,
                    stageStyle: {
                        height: 340
                    }
                },
                {
                    path: 'https://model.hacxy.cn/cat-black/model.json',
                    scale: 0.15,
                    position: [0, 20],
                    stageStyle: {
                        height: 350
                    }
                },
                {
                    path: 'https://model.hacxy.cn/shizuku_pajama/index.json',
                    scale: 0.2,
                    volume: 0,
                    position: [40, 10],
                    stageStyle: {
                        height: 350,
                        width: 330
                    }
                },
                {
                    path: 'https://model.hacxy.cn/shizuku/shizuku.model.json',
                    scale: 0.2,
                    volume: 0,
                    position: [70, 70],
                    stageStyle: {
                        height: 370,
                        width: 400
                    }
                },
                {
                    path: 'https://model.hacxy.cn/Senko_Normals/senko.model3.json',
                    position: [-10, 20]
                },
                {
                    path: 'https://model.hacxy.cn/Pio/model.json',
                    scale: 0.4,
                    position: [0, 50],
                    stageStyle: {
                        height: 300
                    }
                }
            ],

            tips: {
                idleTips: {
                    wordTheDay: (wordTheDayData) => {
                        return wordTheDayData.hitokoto;
                    }
                }
            }
        });
    }
}