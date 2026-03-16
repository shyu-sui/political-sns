const NG_WORDS = [
  "死ね",
  "殺す",
  "殺せ",
  "氏ね",
  "消えろ",
  "クズ",
  "ゴミ",
  "キモい",
  "うざい",
  "バカ野郎",
  "アホ",
];

export function containsNgWord(text: string): boolean {
  return NG_WORDS.some((word) => text.includes(word));
}
