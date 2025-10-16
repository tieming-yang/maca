import { toHiragana, toRomaji } from "wanakana";

import { FURIGANA_CLASS, FuriganaType } from "./constants";
import { type KanjiToken, toKanjiToken } from "./toKanjiToken";
import { initAsync, Tokenizer, TokenizerBuilder } from "./tokenize";

export interface KanjiMark extends KanjiToken {
  isFiltered: boolean;
}

/**
 * Append ruby tag to all text nodes of a batch of elements.
 * @remarks
 * The parent element of the text node will be added with the FURIGANA_CLASS.
 * Elements that have already been marked will be skipped.
 * Ruby tag is "\<ruby>original\<rp>(\</rp>\<rt>reading\</rt>\<rp>)\</rp>\</ruby>".
 */
export async function addFurigana(
  selectedFuriganas: FuriganaType[],
  ...elements: Element[]
) {
  const selectedSet = new Set(selectedFuriganas);
  const seen = new Set();
  for (const element of elements) {
    const rubies = element.querySelectorAll<HTMLElement>(
      `ruby.${FURIGANA_CLASS}`,
    );
    for (const ruby of rubies) {
      const existingRts = ruby.querySelectorAll<HTMLElement>(
        `rt[data-furigana-type]`,
      );

      existingRts.forEach((rt) => {
        const existingType = rt.dataset.furiganaType as FuriganaType;
        if (!existingType) return;

        if (!selectedSet.has(existingType)) {
          rt.previousElementSibling?.remove();
          rt.nextElementSibling?.remove();
          rt.remove();
        } else {
          seen.add(existingType);
        }
      });

      if (!ruby.querySelector("rt")) {
        console.log("no furigana");
        ruby.replaceWith(
          document.createTextNode(ruby.dataset.original ?? ""),
        );
      }
    }
  }

  const missingTypes = selectedFuriganas.filter((type) => !seen.has(type));

  const collectedTexts = elements.flatMap(collectTexts);
  const japaneseTexts = collectedTexts.filter((node) =>
    /\p{sc=Han}/u.test(node.textContent ?? "")
  );

  await Promise.all(
    missingTypes.map(async (type) => {
      for (const text of japaneseTexts) {
        const tokens = await tokenize(text.textContent ?? "");

        tokens.reverse().forEach((token) => {
          const ruby = createRuby(token, type);
          const range = document.createRange();

          if (
            !text.textContent?.length || token.start >= text.length ||
            token.end > text.length
          ) return;
          range.setStart(text, token.start);
          range.setEnd(text, token.end);
          range.deleteContents();
          range.insertNode(ruby);
        });
      }
    }),
  );
}

const exclusionParentTagSet = new Set([
  "SCRIPT",
  "STYLE",
  "NOSCRIPT",
  "TITLE",
]);

export const collectTexts = (element: Element): Text[] => {
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  const texts: Text[] = [];
  while (walker.nextNode()) {
    const node = walker.currentNode as Text;
    const parent = node.parentElement;
    if (!parent) {
      continue;
    }
    if (
      !exclusionParentTagSet.has(parent.tagName) &&
      !(parent.dataset.furiganaExcluded === "true")
    ) {
      texts.push(node);
    }
  }
  return texts;
};

let tokenizerPromise: Promise<Tokenizer> | null = null;

const getTokenizer = async () => {
  if (!tokenizerPromise) {
    tokenizerPromise = (async () => {
      await initAsync({ moduleOrPath: "lindera_wasm_bg.wasm" });
      const builder = new TokenizerBuilder();
      const tokenizer = builder.build();
      console.log("🤘 Tokenizer Initialized");
      return tokenizer;
    })().catch((err) => {
      console.error("😰 Tokenizer Initialized failed!");
      tokenizerPromise = null; // allow retry after a failure
      throw err;
    });
  }

  return tokenizerPromise;
};

const tokenize = async (text: string) => {
  // Performance Optimization: This will reduce the number of Service Worker requests by more than 50%.
  const hasKanji = /\p{sc=Han}/v.test(text);
  if (!hasKanji) {
    return [];
  }
  const tokenizer = await getTokenizer();
  const tokens = tokenizer.tokenize(text);

  return toKanjiToken(tokens, text);
};

export const createRuby = (
  token: KanjiMark | KanjiToken,
  furiganaType: FuriganaType,
): HTMLElement => {
  const ruby = document.createElement("ruby");
  ruby.classList.add(FURIGANA_CLASS);
  ruby.dataset.original = token.original;

  if ("isFiltered" in token && token.isFiltered) {
    ruby.classList.add("isFiltered");
  }
  const rightParenthesisRp = document.createElement("rp");
  rightParenthesisRp.textContent = ")";
  const leftParenthesisRp = document.createElement("rp");
  leftParenthesisRp.textContent = "(";
  const originalText = document.createTextNode(token.original);

  switch (furiganaType) {
    case FuriganaType.Hiragana:
      token.reading = toHiragana(token.reading);
      break;
    case FuriganaType.Romaji:
      token.reading = toRomaji(token.reading);
      break;
    case FuriganaType.Katakana:
      // token.reading default is katakana
      break;
  }

  const readingTextNode = document.createTextNode(token.reading);
  const rt = document.createElement("rt");
  rt.dataset.furiganaType = furiganaType;

  rt.appendChild(readingTextNode);
  ruby.appendChild(originalText);
  ruby.appendChild(leftParenthesisRp);
  ruby.appendChild(rt);
  ruby.appendChild(rightParenthesisRp);
  return ruby;
};

export async function annotateLyrics(text: string, type: FuriganaType) {
  if (!/\p{sc=Han}/u.test(text)) return text;

  const tokens = await tokenize(text);

  return tokens
    .slice()
    .sort((a, b) => b.start - a.start)
    .reduce((acc, token) => {
      let reading = token.reading;
      if (type === FuriganaType.Hiragana) reading = toHiragana(reading);
      else if (type === FuriganaType.Romaji) reading = toRomaji(reading);

      const rubyClass = "ruby";
      const ruby =
        `<ruby class="${rubyClass}">${token.original}<rp>(</rp><rt>${reading}</rt><rp>)</rp></ruby>`;
      return acc.slice(0, token.start) + ruby + acc.slice(token.end);
    }, text);
}
