import _initAsync, {
  type InitInput,
  type Tokenizer as _Tokenizer,
  TokenizerBuilder as _TokenizerBuilder,
} from "lindera-wasm-ipadic";

export type LinderaToken = Map<string, unknown>;

export const IPADIC_DETAILS_KEYS = [
  "partOfSpeech",
  "partOfSpeechSubcategory1",
  "partOfSpeechSubcategory2",
  "partOfSpeechSubcategory3",
  "conjugationForm",
  "conjugationType",
  "baseForm",
  "reading",
  "pronunciation",
] as const;

export type IpadicDetailsKeys = (typeof IPADIC_DETAILS_KEYS)[number];

export type IpadicDetailsObject = {
  [K in (typeof IPADIC_DETAILS_KEYS)[number]]: string;
};

export type FormattedToken = {
  byteEnd: number;
  byteStart: number;
  text: string;
  wordId: {
    id: number;
    isSystem: boolean;
  };
  details?: IpadicDetailsObject | undefined;
  reading?: string;
};

const typeSafeObjectFromEntries = <
  const T extends ReadonlyArray<readonly [PropertyKey, unknown]>,
>(
  entries: T,
): { [K in T[number] as K[0]]: K[1] } => {
  return Object.fromEntries(entries) as { [K in T[number] as K[0]]: K[1] };
};

function detailsArrayToObject(details: string[]): IpadicDetailsObject {
  return typeSafeObjectFromEntries(
    IPADIC_DETAILS_KEYS.map((key, i) => [key, details[i]!]),
  );
}

type RawToken = Map<string, unknown> | Record<string, unknown>;
function read<T = unknown>(token: RawToken, key: string) {
  if (token instanceof Map) return token.get(key) as T;
  if (key in token) return (token as Record<string, unknown>)[key] as T;

  const getter = (token as Record<string, unknown>)[`get_${key}`];
  if (typeof getter === "function") return getter.call(token) as T;
}

export class Tokenizer {
  #superTokenizer: _Tokenizer;
  #tokensFormatter(tokens: LinderaToken[]): FormattedToken[] {
    return tokens.map((token) => {
      const originalDetails = read<string[] | undefined>(token, "details");

      const formattedDetails = originalDetails &&
        detailsArrayToObject(originalDetails);
      return {
        byteEnd: read<number>(token, "byteEnd") ?? 0,
        byteStart: read<number>(token, "byteStart") ?? 0,
        text: read<string>(token, "surface") ?? "",
        wordId: {
          id: read<number>(token, "wordId") ?? -1,
          isSystem: read<boolean>(token, "isSystem") ?? false,
        },
        details: formattedDetails,
        reading: read<string>(token, "reading"),
      };
    });
  }
  constructor(tokenizer: _Tokenizer) {
    this.#superTokenizer = tokenizer;
  }
  tokenize(inputText: string): FormattedToken[] {
    const originalTokens = this.#superTokenizer.tokenize(inputText);
    return this.#tokensFormatter(originalTokens);
  }
}
export class TokenizerBuilder {
  #superTokenizerBuilder: _TokenizerBuilder;
  constructor() {
    this.#superTokenizerBuilder = new _TokenizerBuilder();
  }
  build(): Tokenizer {
    this.#superTokenizerBuilder.setDictionary("embedded://ipadic");
    this.#superTokenizerBuilder.setMode("normal");
    this.#superTokenizerBuilder.appendCharacterFilter("unicode_normalize", {
      kind: "nfkc",
    });
    this.#superTokenizerBuilder.appendTokenFilter("lowercase", {});
    this.#superTokenizerBuilder.appendTokenFilter("japanese_compound_word", {
      kind: "ipadic",
      tags: ["名詞,数"],
      new_tag: "名詞,数",
    });
    const superTokenizer = this.#superTokenizerBuilder.build();
    return new Tokenizer(superTokenizer);
  }
}

export async function initAsync(
  options?: { moduleOrPath: InitInput },
): Promise<void> {
  await _initAsync(options);
}
