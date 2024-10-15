type Lyric = {
  artist: string;
  title: string;
  lyricist: string;
  composer: string;
  lines: Line[];
};

export type Line = {
  timeStamp: number;
  text: string;
};

export const lyric: Lyric = {
  artist: "DREAMS COME TRUE",
  title: "大阪LOVER",
  lyricist: "吉田美和",
  composer: "吉田美和",
  lines: [
    { timeStamp: 0.7, text: "好きだけど 好きなのに 好きだから 好きなんだ" },
    { timeStamp: 8, text: "好きだけど 好きなのに 好きだから 好きやんか" },
    { timeStamp: 19.7, text: "One for one, two for us, three for" },
    { timeStamp: 24.5, text: "最終に間に合ったよ 0時ちょい前にそっちに着くよ" },
    { timeStamp: 31, text: "メール短すぎたかな? わたしもそっけないけど" },
    { timeStamp: 39, text: "新大阪駅まで迎えに来てくれたあなたを見たら" },
    { timeStamp: 46, text: "いつもはいてるスウェット" },
    { timeStamp: 50, text: "今日も家へ直行か" },
    { timeStamp: 54, text: "万博公園の太陽の塔  ひさびさ見たいなぁ!" },
    { timeStamp: 61, text: "明日さんたまにはいいじゃん" },
    { timeStamp: 65, text: "「そやなぁ‥」って行くの? 行かないの?" },
    { timeStamp: 69, text: "何度ここへ来てたって" },
    { timeStamp: 72, text: "大阪弁は上手になれへんし" },
    { timeStamp: 77, text: "楽しそうにしてたって" },
    { timeStamp: 79.9, text: "あなた以外に連れはおれへんのよ" },
    { timeStamp: 83.7, text: "近そうでまだ遠い大阪" },
    { timeStamp: 92, text: "One for one, two for us, three for" },
    { timeStamp: 96.7, text: "言いたいこと言えなくて" },
    { timeStamp: 99, text: "黙ってしまうのも良くないよね" },
    { timeStamp: 104, text: "毎週は会えないから" },
    { timeStamp: 108, text: "けんかだけは避けたいし" },
    { timeStamp: 111, text: "通い慣れた道が いつもより長く感じるこの空気" },
    { timeStamp: 119, text: "御堂筋はこんな日も" },
    { timeStamp: 122.7, text: "一車線しか動かない" },
    { timeStamp: 127.2, text: "家に着く前に 何か飲むもの買ってこようか?" },
    { timeStamp: 134, text: "気分変えようとしてるんじゃん!" },
    { timeStamp: 137.7, text: "「そやなぁ‥」っているの?!! いらないの?!" },
    { timeStamp: 141.7, text: "何度ここへ来てたって" },
    { timeStamp: 145, text: "「一緒に住まへんか?」とは言わないし" },
    { timeStamp: 149, text: "楽しそうにしてたって" },
    { timeStamp: 152, text: "そこは内心 めっちゃさびしいんよ" },
    { timeStamp: 156, text: "近そうでまだ遠い大阪" },
    { timeStamp: 164, text: "好きだけど 好きなのに 好きだから 好きなんだ" },
    { timeStamp: 171, text: "好きだけど 好きなのに 好きだから 好きやんか" },
    { timeStamp: 178.7, text: "覚悟はもうしてるって" },
    { timeStamp: 181.8, text: "大阪のおばちゃんと呼ばれたいんよ" },
    { timeStamp: 186, text: "家族と離れてたって" },
    { timeStamp: 189, text: "あなたとここで生きていきたいんよ" },
    { timeStamp: 193, text: "東京タワーだって" },
    { timeStamp: 196, text: "あなたと見る通天閣にはかなわへんよ" },
    { timeStamp: 201, text: "なんで そんなに笑って!" },
    { timeStamp: 204, text: "一生に一度の告白やんか!" },
    { timeStamp: 208, text: "恋しくて憎らしい大阪" },
    { timeStamp: 216, text: "何度ここへ来てたって" },
    { timeStamp: 219, text: "また来るのはあなたがおるからやもん" },
    { timeStamp: 223, text: "楽しそうにしてたって" },
    { timeStamp: 226, text: "それはあなたがここにおるからやもん" },
    { timeStamp: 230.7, text: "どんだけけんかしたって" },
    { timeStamp: 233.8, text: "あなただけほんまに大切やもん" },
    { timeStamp: 237.8, text: "「もうこっち来いや」って言って" },
    { timeStamp: 241.3, text: "あぁ!!! 催促してしもたやないの" },
    { timeStamp: 245.2, text: "近そうでまだ遠いか? 大阪" },
    { timeStamp: 253, text: "恋しくて憎らしい大阪" },
  ],
};
