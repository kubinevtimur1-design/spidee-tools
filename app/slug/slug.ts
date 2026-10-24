/**
 * Транслит для ЧПУ. Бытовой веб-вариант рядом с ГОСТ 7.79 (система B),
 * без диакритики: в адресе остаются латиница, цифры и дефисы.
 *
 * Карта (строчные; если включено «сохранять регистр», заглавной
 * становится первая буква латинской замены: Ж → Zh, Щ → Shch):
 * а a, б b, в v, г g, д d, е e, ё yo, ж zh, з z, и i,
 * й j, к k, л l, м m, н n, о o, п p, р r, с s, т t,
 * у u, ф f, х h, ц ts, ч ch, ш sh, щ shch, ы y, э e, ю yu, я ya.
 *
 * х → h, не kh: так короче URL.
 * й → j, не y: не сливается с ы → y.
 * ъ и ь выбрасываются и не оставляют дефис (подъезд → podezd).
 * і i, ї yi, є ye, ґ g, ў u — буквы, которые встречаются в заголовках.
 * Латиница и цифры остаются, знаки с латиницы снимаются (café → cafe).
 * Пробелы и прочий мусор → «-», повторы схлопываются, крайние дефисы срезаются.
 */

const MAP: Record<string, string> = {
  а: "a",
  б: "b",
  в: "v",
  г: "g",
  д: "d",
  е: "e",
  ё: "yo",
  ж: "zh",
  з: "z",
  и: "i",
  й: "j",
  к: "k",
  л: "l",
  м: "m",
  н: "n",
  о: "o",
  п: "p",
  р: "r",
  с: "s",
  т: "t",
  у: "u",
  ф: "f",
  х: "h",
  ц: "ts",
  ч: "ch",
  ш: "sh",
  щ: "shch",
  ы: "y",
  э: "e",
  ю: "yu",
  я: "ya",
  і: "i",
  ї: "yi",
  є: "ye",
  ґ: "g",
  ў: "u",
};

/** Не становятся дефисом: твёрдый/мягкий знак, апострофы, невидимые символы. */
const DROP = new Set([
  "ъ",
  "ь",
  "'",
  "’",
  "ʼ",
  "`",
  "´",
  "\u00ad",
  "\u200b",
  "\u200c",
  "\u200d",
  "\ufeff",
  "\u2060",
]);

/** Мягкий ориентир длины. Slug не обрезаем — в интерфейсе только подсказка. */
export const SLUG_SOFT_LIMIT = 80;

export const EXAMPLE_HEADLINE =
  "Съёмка хлеба: ёжик, йогурт и жизнь в объективе";

export const EXAMPLE_SLUG =
  "syomka-hleba-yozhik-jogurt-i-zhizn-v-obektive";

export type SlugOptions = {
  preserveCase?: boolean;
};

function applyCase(mapped: string, source: string, preserveCase: boolean): string {
  if (!preserveCase) return mapped;
  const lower = source.toLocaleLowerCase("ru");
  if (source === lower) return mapped;
  return mapped.charAt(0).toLocaleUpperCase("en") + mapped.slice(1);
}

function foldLatin(char: string): string | null {
  const stripped = char.normalize("NFD").replace(/\p{M}/gu, "");
  if (stripped.length === 1 && /[A-Za-z0-9]/.test(stripped)) return stripped;
  return null;
}

export function toSlug(input: string, options: SlugOptions = {}): string {
  const preserveCase = options.preserveCase ?? false;
  let out = "";

  for (const char of input) {
    if (/^\p{M}$/u.test(char)) continue;

    const lower = char.toLocaleLowerCase("ru");
    if (DROP.has(lower)) continue;

    const mapped = MAP[lower];
    if (mapped) {
      out += applyCase(mapped, char, preserveCase);
      continue;
    }

    const latin = foldLatin(char);
    if (latin) {
      out += preserveCase ? latin : latin.toLowerCase();
      continue;
    }

    out += "-";
  }

  return out.replace(/-+/g, "-").replace(/^-|-$/g, "");
}
