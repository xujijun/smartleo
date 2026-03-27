export interface HanziItem {
  id: number;
  character: string;
  pinyin: string;
  meaning: string;
  tip: string;
}

export const hanziList: HanziItem[] = [
  { id: 0, character: '一', pinyin: 'yi', meaning: '数字 1，一条横线', tip: '像一根平平的小木棍。' },
  { id: 1, character: '二', pinyin: 'er', meaning: '数字 2，两条横线', tip: '上短下长，更容易记住。' },
  { id: 2, character: '三', pinyin: 'san', meaning: '数字 3，三条横线', tip: '从上到下排整齐。' },
  { id: 3, character: '人', pinyin: 'ren', meaning: '人，小朋友和大人', tip: '像两条腿在走路。' },
  { id: 4, character: '口', pinyin: 'kou', meaning: '嘴巴，一个方框', tip: '像张开的嘴巴。' },
  { id: 5, character: '日', pinyin: 'ri', meaning: '太阳、白天', tip: '像有光亮的太阳。' },
  { id: 6, character: '月', pinyin: 'yue', meaning: '月亮、月份', tip: '右边像弯弯的月亮。' },
  { id: 7, character: '山', pinyin: 'shan', meaning: '高山', tip: '中间高、两边低，像山峰。' },
  { id: 8, character: '水', pinyin: 'shui', meaning: '水流', tip: '像水花向两边散开。' },
  { id: 9, character: '火', pinyin: 'huo', meaning: '火焰', tip: '像火苗在跳动。' },
  { id: 10, character: '木', pinyin: 'mu', meaning: '树木', tip: '像树干和树枝。' },
  { id: 11, character: '田', pinyin: 'tian', meaning: '田地', tip: '像划分整齐的小田格。' }
];
