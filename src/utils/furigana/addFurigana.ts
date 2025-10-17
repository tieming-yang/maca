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
  const types = Array.from(new Set(selectedFuriganas));
  for (const element of elements) {
    ensureOriginalText(element);
    const source = (element as HTMLElement).dataset.furiganaSource ??
      element.textContent ?? "";
    element.textContent = source; // wipe every previous ruby
  }

  if (!types.length) return; // nothing to render

  const texts = elements
    .flatMap(collectTexts)
    .filter((node) => /\p{sc=Han}/u.test(node.textContent ?? ""));

  for (const text of texts) {
    const tokens = await tokenize(text.textContent ?? "");
    for (const token of tokens.reverse()) {
      const ruby = createRuby(token, types); // all selected readings at once
      const range = document.createRange();
      range.setStart(text, token.start);
      range.setEnd(text, token.end);
      range.deleteContents();
      range.insertNode(ruby);
    }
  }
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
  // console.log("3. in tokenize", tokens);
  return toKanjiToken(tokens, text);
};

const readingFor = (base: string, type: FuriganaType) => {
  switch (type) {
    case FuriganaType.Hiragana:
      return toHiragana(base);
    case FuriganaType.Romaji:
      return toRomaji(base);
    case FuriganaType.Katakana:
    default:
      return base; // incoming token.reading is already katakana
  }
};

export const createRuby = (
  token: KanjiMark | KanjiToken,
  types: FuriganaType[],
): HTMLElement => {
  const ruby = document.createElement("ruby");
  ruby.classList.add(FURIGANA_CLASS);
  const originalText = document.createTextNode(token.original);
  ruby.appendChild(originalText);

  for (const type of types) {
    const left = document.createElement("rp");
    left.textContent = "(";
    const rt = document.createElement("rt");
    rt.dataset.furiganaType = type;
    rt.textContent = readingFor(token.reading, type);
    rt.classList.add("--rt--")
    const right = document.createElement("rp");
    right.textContent = ")";
    ruby.appendChild(left);
    ruby.appendChild(rt);
    ruby.appendChild(right);
  }
  return ruby;
};

function ensureOriginalText(element: Element) {
  const el = element as HTMLElement;
  if (!el.dataset.furiganaSource) {
    el.dataset.furiganaSource = el.textContent ?? "";
  }
}

function removeAllFurigana(element: HTMLElement) {
  const original = element.dataset.furiganaSource;
  if (!original) return; // nothing cached; bail or recompute

  element.textContent = original; // restore the full sentence
  delete element.dataset.furiganaSource; // optional: clear the cache
}
