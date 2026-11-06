"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { track } from "@/lib/metrika";
import { useToolUse } from "@/lib/use-tool-use";
import {
  ARTICLE_TYPES,
  COPY_FAIL,
  COPY_OK,
  DATE_NOTE,
  IMAGE_HINT,
  NEWS_NOTE,
  TIMEZONES,
  VALIDATORS,
  buildArticleSchema,
  copyOutcome,
  emptyAuthor,
  type ArticleType,
  type AuthorInput,
  type AuthorKind,
} from "./article-schema";

const SPIDY_RED = "#FF3830";
const DEEP_BLACK = "#0B0B0B";

const inputClass =
  "w-full min-w-0 rounded-xl border border-black/[0.1] bg-white/50 px-4 py-3 text-sm font-medium text-[#3A3A3A] outline-none transition-all duration-200 placeholder:text-[#AAAAAA] focus:border-black/[0.25] focus:bg-white";

type AuthorRow = AuthorInput & { id: number };

async function writeClipboard(value: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    try {
      const area = document.createElement("textarea");
      area.value = value;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.top = "0";
      area.style.left = "0";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.focus();
      area.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(area);
      return ok;
    } catch {
      return false;
    }
  }
}

export default function ArticleTool() {
  const [type, setType] = useState<ArticleType>("Article");
  const [headline, setHeadline] = useState("");
  const [authors, setAuthors] = useState<AuthorRow[]>([
    { ...emptyAuthor(), id: 1 },
  ]);
  const [datePublished, setDatePublished] = useState("");
  const [dateModified, setDateModified] = useState("");
  const [timePublished, setTimePublished] = useState("");
  const [timeModified, setTimeModified] = useState("");
  const [timezone, setTimezone] = useState("");
  const [image, setImage] = useState("");
  const [extraImages, setExtraImages] = useState("");
  const [articleUrl, setArticleUrl] = useState("");
  const [description, setDescription] = useState("");
  const [inLanguage, setInLanguage] = useState("");
  const [articleSection, setArticleSection] = useState("");
  const [keywords, setKeywords] = useState("");
  const [wordCount, setWordCount] = useState("");
  const [publisherName, setPublisherName] = useState("");
  const [publisherLogo, setPublisherLogo] = useState("");
  const [copied, setCopied] = useState<"script" | "json" | null>(null);
  const [copyError, setCopyError] = useState(false);
  const nextAuthorId = useRef(2);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dirty = () => {
    setCopied(null);
    setCopyError(false);
  };

  const result = useMemo(
    () =>
      buildArticleSchema({
        type,
        headline,
        authors,
        datePublished,
        dateModified,
        timePublished,
        timeModified,
        timezone,
        images: [image, ...extraImages.split(/\r?\n/)],
        articleUrl,
        description,
        inLanguage,
        articleSection,
        keywords,
        wordCount,
        publisherName,
        publisherLogo,
      }),
    [
      type,
      headline,
      authors,
      datePublished,
      dateModified,
      timePublished,
      timeModified,
      timezone,
      image,
      extraImages,
      articleUrl,
      description,
      inLanguage,
      articleSection,
      keywords,
      wordCount,
      publisherName,
      publisherLogo,
    ],
  );

  useToolUse("article-schema", result.script ?? "");

  const updateAuthor = (id: number, patch: Partial<AuthorInput>) => {
    setAuthors((current) =>
      current.map((author) => {
        if (author.id !== id) return author;
        const next = { ...author, ...patch };
        if (next.type === "Organization") next.jobTitle = "";
        return next;
      }),
    );
    dirty();
  };

  const copy = async (mode: "script" | "json") => {
    const value = mode === "script" ? result.script : result.json;
    if (!value) return;

    const outcome = copyOutcome(await writeClipboard(value));
    if (outcome.trackCopy) track("copy_result");
    setCopied(outcome.copied ? mode : null);
    setCopyError(outcome.copyError);

    if (copyTimer.current) clearTimeout(copyTimer.current);
    if (outcome.copied) {
      copyTimer.current = setTimeout(() => setCopied(null), 1800);
    }
  };

  const clearAll = () => {
    setType("Article");
    setHeadline("");
    setAuthors([{ ...emptyAuthor(), id: nextAuthorId.current++ }]);
    setDatePublished("");
    setDateModified("");
    setTimePublished("");
    setTimeModified("");
    setTimezone("");
    setImage("");
    setExtraImages("");
    setArticleUrl("");
    setDescription("");
    setInLanguage("");
    setArticleSection("");
    setKeywords("");
    setWordCount("");
    setPublisherName("");
    setPublisherLogo("");
    setCopied(null);
    setCopyError(false);
  };

  const primary = authors[0];
  const headlineLength = [...headline.trim()].length;

  return (
    <main className="min-h-screen overflow-x-clip bg-[#F7F5F2] text-[#3A3A3A]">
      <section className="relative overflow-hidden border-b border-[#D1D1D1]">
        <div
          className="pointer-events-none absolute -right-10 top-0 hidden h-full w-[58%] select-none overflow-hidden lg:block"
          aria-hidden="true"
        >
          <pre
            className="rotate-[-5deg] whitespace-pre font-mono font-bold leading-[1.35]"
            style={{ color: DEEP_BLACK, opacity: 0.04, fontSize: "clamp(11px, 1.15vw, 17px)" }}
          >{`{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Заголовок",
  "datePublished": "2024-01-05",
  "author": [{
    "@type": "Person",
    "name": "Имя"
  }]
}`}</pre>
        </div>

        <div className="relative z-10 mx-auto max-w-6xl px-4 pb-10 pt-10 sm:px-6 sm:pt-14">
          <nav
            aria-label="Хлебные крошки"
            className="mb-8 flex flex-wrap items-center gap-2 text-xs font-medium text-[#999999]"
          >
            <Link href="/" className="transition-colors duration-200 hover:text-[#0B0B0B]">
              Главная
            </Link>
            <span aria-hidden="true">/</span>
            <span className="text-[#555555]">Article Schema</span>
          </nav>

          <h1 className="max-w-4xl text-[1.75rem] font-bold leading-[1.08] tracking-[-0.04em] text-[#3A3A3A] min-[390px]:text-[2rem] sm:text-5xl lg:text-6xl">
            Генератор микроразметки статьи{" "}
            <span className="whitespace-nowrap">(Article Schema)</span>
          </h1>

          <p className="mt-7 max-w-xl text-base font-normal leading-6 text-[#777777] sm:text-lg">
            JSON-LD для статьи, блога или новости. Пустые поля в код не попадают.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="grid min-w-0 gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <section className="min-w-0">
            <div className="mb-5">
              <span className="text-xs font-medium uppercase tracking-[0.16em] text-[#777777]">
                01 / Article
              </span>
              <h2 className="mt-1 text-2xl font-bold uppercase tracking-tight text-[#0B0B0B]">
                Поля
              </h2>
              <p className="mt-2 text-xs leading-5 text-[#999999]">
                Обязательных полей нет.
              </p>
            </div>

            <div className="space-y-4">
              <div
                role="radiogroup"
                aria-label="Тип разметки"
                className="grid grid-cols-1 gap-2 sm:grid-cols-3"
              >
                {ARTICLE_TYPES.map((item) => {
                  const active = type === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() => {
                        setType(item.id);
                        dirty();
                      }}
                      className={[
                        "min-w-0 rounded-xl px-3 py-2 text-left transition-all duration-200 active:scale-[0.98]",
                        active
                          ? "bg-[#0B0B0B] text-white"
                          : "border border-black/[0.08] text-[#555555] hover:border-black/[0.18]",
                      ].join(" ")}
                    >
                      <span className="block truncate text-sm font-bold">{item.id}</span>
                      <span
                        className={`mt-0.5 block text-[11px] font-medium leading-4 ${
                          active ? "text-white/70" : "text-[#888888]"
                        }`}
                      >
                        {item.description}
                      </span>
                    </button>
                  );
                })}
              </div>

              {type === "NewsArticle" && (
                <p className="text-xs leading-5 text-[#777777]">{NEWS_NOTE}</p>
              )}

              <div>
                <div className="mb-2 flex items-baseline justify-between gap-3">
                  <label
                    htmlFor="article-headline"
                    className="text-xs font-bold uppercase tracking-wide text-[#555555]"
                  >
                    Заголовок
                  </label>
                  {headlineLength > 0 && (
                    <span className="text-[11px] font-medium text-[#999999]">
                      {headlineLength}
                    </span>
                  )}
                </div>
                <input
                  id="article-headline"
                  value={headline}
                  onChange={(event) => {
                    setHeadline(event.target.value);
                    dirty();
                  }}
                  placeholder="Заголовок статьи"
                  className={inputClass}
                />
                {result.warning && (
                  <p className="mt-2 text-xs leading-5 text-[#8A5A00]">{result.warning}</p>
                )}
              </div>

              <Field id="article-author" label="Автор">
                <input
                  id="article-author"
                  value={primary?.name ?? ""}
                  onChange={(event) =>
                    primary && updateAuthor(primary.id, { name: event.target.value })
                  }
                  placeholder="Имя или название"
                  className={inputClass}
                />
              </Field>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field id="date-published" label="Дата публикации">
                  <input
                    id="date-published"
                    type="date"
                    value={datePublished}
                    onChange={(event) => {
                      setDatePublished(event.target.value);
                      dirty();
                    }}
                    className={inputClass}
                  />
                </Field>
                <Field id="date-modified" label="Дата изменения">
                  <input
                    id="date-modified"
                    type="date"
                    value={dateModified}
                    onChange={(event) => {
                      setDateModified(event.target.value);
                      dirty();
                    }}
                    className={inputClass}
                  />
                </Field>
              </div>

              <Field id="article-image" label="Изображение" hint={IMAGE_HINT}>
                <input
                  id="article-image"
                  type="url"
                  inputMode="url"
                  spellCheck={false}
                  value={image}
                  onChange={(event) => {
                    setImage(event.target.value);
                    dirty();
                  }}
                  placeholder="https://example.com/cover.jpg"
                  className={inputClass}
                />
              </Field>

              <Field id="article-url" label="URL статьи">
                <input
                  id="article-url"
                  type="url"
                  inputMode="url"
                  spellCheck={false}
                  value={articleUrl}
                  onChange={(event) => {
                    setArticleUrl(event.target.value);
                    dirty();
                  }}
                  placeholder="https://example.com/article"
                  className={inputClass}
                />
              </Field>

              <details className="group rounded-[18px] border border-black/[0.08] bg-[#F7F5F2] p-4 sm:p-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-bold uppercase tracking-tight text-[#0B0B0B] [&::-webkit-details-marker]:hidden">
                  Дополнительно
                  <span className="text-lg font-normal transition-transform duration-200 group-open:rotate-45">
                    +
                  </span>
                </summary>

                <div className="mt-5 space-y-4">
                  <Field id="timezone" label="Часовой пояс" hint={DATE_NOTE}>
                    <select
                      id="timezone"
                      value={timezone}
                      onChange={(event) => {
                        setTimezone(event.target.value);
                        dirty();
                      }}
                      className={inputClass}
                    >
                      <option value="">Не выбран</option>
                      {TIMEZONES.map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field id="time-published" label="Время публикации">
                      <input
                        id="time-published"
                        type="time"
                        step={60}
                        value={timePublished}
                        onChange={(event) => {
                          setTimePublished(event.target.value);
                          dirty();
                        }}
                        className={inputClass}
                      />
                    </Field>
                    <Field id="time-modified" label="Время изменения">
                      <input
                        id="time-modified"
                        type="time"
                        step={60}
                        value={timeModified}
                        onChange={(event) => {
                          setTimeModified(event.target.value);
                          dirty();
                        }}
                        className={inputClass}
                      />
                    </Field>
                  </div>

                  {primary && (
                    <AuthorFields
                      author={primary}
                      title="Автор из поля выше"
                      onChange={(patch) => updateAuthor(primary.id, patch)}
                    />
                  )}

                  {authors.slice(1).map((author, index) => (
                    <AuthorFields
                      key={author.id}
                      author={author}
                      title={`Автор ${index + 2}`}
                      onChange={(patch) => updateAuthor(author.id, patch)}
                      onRemove={() => {
                        setAuthors((current) =>
                          current.filter((item) => item.id !== author.id),
                        );
                        dirty();
                      }}
                    />
                  ))}

                  <button
                    type="button"
                    onClick={() => {
                      setAuthors((current) => [
                        ...current,
                        { ...emptyAuthor(), id: nextAuthorId.current++ },
                      ]);
                      dirty();
                    }}
                    className="flex w-full items-center justify-center rounded-[14px] border border-dashed border-black/[0.2] px-4 py-3 text-xs font-bold uppercase text-[#555555] transition-all duration-200 hover:border-black hover:bg-[#0B0B0B] hover:text-white"
                  >
                    Ещё автор
                  </button>

                  <Field id="extra-images" label="Ещё изображения">
                    <textarea
                      id="extra-images"
                      value={extraImages}
                      onChange={(event) => {
                        setExtraImages(event.target.value);
                        dirty();
                      }}
                      rows={3}
                      spellCheck={false}
                      placeholder="По одному URL в строке"
                      className={`${inputClass} resize-y`}
                    />
                  </Field>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field id="publisher-name" label="Издатель">
                      <input
                        id="publisher-name"
                        value={publisherName}
                        onChange={(event) => {
                          setPublisherName(event.target.value);
                          dirty();
                        }}
                        placeholder="Название издания"
                        className={inputClass}
                      />
                    </Field>
                    <Field id="publisher-logo" label="Логотип">
                      <input
                        id="publisher-logo"
                        type="url"
                        inputMode="url"
                        spellCheck={false}
                        value={publisherLogo}
                        onChange={(event) => {
                          setPublisherLogo(event.target.value);
                          dirty();
                        }}
                        placeholder="https://example.com/logo.png"
                        className={inputClass}
                      />
                    </Field>
                  </div>

                  <Field id="description" label="Описание">
                    <textarea
                      id="description"
                      value={description}
                      onChange={(event) => {
                        setDescription(event.target.value);
                        dirty();
                      }}
                      rows={3}
                      placeholder="Краткое описание"
                      className={`${inputClass} resize-y`}
                    />
                  </Field>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field id="in-language" label="Язык">
                      <input
                        id="in-language"
                        value={inLanguage}
                        onChange={(event) => {
                          setInLanguage(event.target.value);
                          dirty();
                        }}
                        placeholder="ru-RU"
                        className={inputClass}
                      />
                    </Field>
                    <Field id="article-section" label="Рубрика">
                      <input
                        id="article-section"
                        value={articleSection}
                        onChange={(event) => {
                          setArticleSection(event.target.value);
                          dirty();
                        }}
                        placeholder="Новости"
                        className={inputClass}
                      />
                    </Field>
                    <Field id="keywords" label="Ключевые слова">
                      <input
                        id="keywords"
                        value={keywords}
                        onChange={(event) => {
                          setKeywords(event.target.value);
                          dirty();
                        }}
                        placeholder="через запятую"
                        className={inputClass}
                      />
                    </Field>
                    <Field id="word-count" label="Число слов">
                      <input
                        id="word-count"
                        inputMode="numeric"
                        value={wordCount}
                        onChange={(event) => {
                          setWordCount(event.target.value);
                          dirty();
                        }}
                        placeholder="1200"
                        className={inputClass}
                      />
                    </Field>
                  </div>
                </div>
              </details>
            </div>
          </section>

          <section className="min-w-0 lg:sticky lg:top-20 lg:self-start">
            <div className="mb-5">
              <span className="text-xs font-medium uppercase tracking-[0.16em] text-[#777777]">
                02 / Result
              </span>
              <h2 className="mt-1 text-2xl font-bold uppercase tracking-tight text-[#0B0B0B]">
                Готовая разметка
              </h2>
            </div>

            <div className="overflow-hidden rounded-[18px] border border-black/[0.1] bg-[#0B0B0B] shadow-[0_16px_35px_rgba(0,0,0,0.07)]">
              <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: SPIDY_RED }} />
                  <span className="truncate text-xs font-bold uppercase tracking-wider text-white">
                    JSON-LD
                  </span>
                </div>
                <span className="shrink-0 text-[11px] font-medium text-white/40">{type}</span>
              </div>

              <div className="max-h-[520px] overflow-auto p-4 sm:p-5">
                {result.errors.length > 0 ? (
                  <ul className="space-y-2 text-sm leading-5 text-white" role="alert">
                    {result.errors.map((error) => (
                      <li key={error} className="break-words">
                        {error}
                      </li>
                    ))}
                  </ul>
                ) : result.script ? (
                  <pre className="whitespace-pre-wrap break-all font-mono text-[11px] leading-5 text-white/80 sm:text-xs">
                    {result.script}
                  </pre>
                ) : (
                  <div className="flex min-h-64 flex-col items-center justify-center text-center">
                    <div className="mb-3 text-6xl font-bold" style={{ color: SPIDY_RED }}>
                      *
                    </div>
                    <p className="text-sm font-bold text-white">Пока пусто</p>
                    <p className="mt-1 max-w-xs text-xs leading-5 text-white/40">
                      Заполни любое поле — JSON-LD появится здесь.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2 border-t border-white/10 p-3">
                <button
                  type="button"
                  onClick={() => copy("script")}
                  disabled={!result.script}
                  className="w-full rounded-xl px-4 py-3 text-center text-sm font-bold uppercase leading-5 transition-all duration-200 hover:brightness-95 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-30"
                  style={{ background: SPIDY_RED, color: DEEP_BLACK }}
                >
                  {copied === "script" ? `✓ ${COPY_OK}` : "Копировать с тегом"}
                </button>
                <button
                  type="button"
                  onClick={() => copy("json")}
                  disabled={!result.json}
                  className="w-full rounded-xl border border-white/15 px-4 py-3 text-center text-sm font-bold uppercase leading-5 text-white transition-all duration-200 hover:bg-white/10 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-30"
                >
                  {copied === "json" ? `✓ ${COPY_OK}` : "Копировать JSON"}
                </button>
                {copyError && (
                  <p className="break-words text-center text-xs leading-5 text-white/70" role="status">
                    {COPY_FAIL}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6 rounded-[18px] border border-black/[0.08] bg-[#F7F5F2] p-5">
              <div className="flex gap-4">
                <div className="text-4xl font-bold leading-none" style={{ color: SPIDY_RED }}>
                  !
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold uppercase text-[#0B0B0B]">Как использовать</h3>
                  <p className="mt-2 text-xs leading-5 text-[#777777]">
                    Скопируй код и вставь его в HTML страницы статьи. Расширенный сниппет не
                    гарантирован.
                  </p>
                  <p className="mt-3 text-xs leading-5 text-[#777777]">
                    Проверить:{" "}
                    {VALIDATORS.map((item, index) => (
                      <span key={item.href}>
                        {index > 0 ? ", " : null}
                        <a
                          href={item.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline decoration-1 underline-offset-4 transition-colors hover:text-[#0B0B0B]"
                        >
                          {item.label}
                          {"note" in item && item.note ? ` (${item.note})` : ""}
                        </a>
                      </span>
                    ))}
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={clearAll}
              className="mt-4 text-xs font-medium uppercase text-[#999999] underline decoration-1 underline-offset-4 transition hover:text-[#0B0B0B]"
            >
              Очистить всё
            </button>
          </section>
        </div>
      </div>
    </main>
  );
}

function Field({
  id,
  label,
  hint,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0">
      <label
        htmlFor={id}
        className="mb-2 block text-xs font-bold uppercase tracking-wide text-[#555555]"
      >
        {label}
      </label>
      {children}
      {hint ? <p className="mt-2 text-xs leading-5 text-[#8A8A8A]">{hint}</p> : null}
    </div>
  );
}

function AuthorFields({
  author,
  title,
  onChange,
  onRemove,
}: {
  author: AuthorRow;
  title: string;
  onChange: (patch: Partial<AuthorInput>) => void;
  onRemove?: () => void;
}) {
  const nameId = `author-name-${author.id}`;

  return (
    <div className="space-y-3 rounded-xl border border-black/[0.08] p-3">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-bold uppercase tracking-wide text-[#555555]">{title}</span>
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="text-xs font-medium text-[#999999] underline decoration-1 underline-offset-4 hover:text-[#0B0B0B]"
          >
            Убрать
          </button>
        )}
      </div>

      {onRemove && (
        <Field id={nameId} label="Имя">
          <input
            id={nameId}
            value={author.name}
            onChange={(event) => onChange({ name: event.target.value })}
            placeholder="Имя или название"
            className={inputClass}
          />
        </Field>
      )}

      <Field id={`author-type-${author.id}`} label="Тип">
        <select
          id={`author-type-${author.id}`}
          value={author.type}
          onChange={(event) => onChange({ type: event.target.value as AuthorKind })}
          className={inputClass}
        >
          <option value="Person">Person — человек</option>
          <option value="Organization">Organization — организация</option>
        </select>
      </Field>

      <Field id={`author-url-${author.id}`} label="Ссылка">
        <input
          id={`author-url-${author.id}`}
          type="url"
          inputMode="url"
          spellCheck={false}
          value={author.url}
          onChange={(event) => onChange({ url: event.target.value })}
          placeholder="https://example.com/author"
          className={inputClass}
        />
      </Field>

      {author.type === "Person" && (
        <Field id={`author-job-${author.id}`} label="Должность">
          <input
            id={`author-job-${author.id}`}
            value={author.jobTitle}
            onChange={(event) => onChange({ jobTitle: event.target.value })}
            placeholder="Редактор"
            className={inputClass}
          />
        </Field>
      )}

      <Field id={`author-sameas-${author.id}`} label="sameAs">
        <input
          id={`author-sameas-${author.id}`}
          type="url"
          inputMode="url"
          spellCheck={false}
          value={author.sameAs}
          onChange={(event) => onChange({ sameAs: event.target.value })}
          placeholder="https://example.com/profile"
          className={inputClass}
        />
      </Field>
    </div>
  );
}
