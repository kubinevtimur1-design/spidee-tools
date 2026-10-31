"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { track } from "@/lib/metrika";
import { useToolUse } from "@/lib/use-tool-use";
import {
  ADVERTISER_KINDS,
  DISCLAIMER,
  FAQ,
  PAGE_H1,
  PAGE_LEAD,
  PLACEMENT_FORMATS,
  SAMPLE_LINK,
  SAMPLE_MARKING,
  SAMPLE_POST,
  appendErid,
  buildMarking,
  checkPost,
  eridError,
  formatAdvertiser,
  innError,
  isShortenerUrl,
  isValidErid,
  markingReady,
  placementLine,
  type AdvertiserKind,
  type PlacementFormat,
} from "./erid";

const fieldClass =
  "h-12 w-full rounded-xl border border-black/[0.1] bg-transparent px-4 text-sm text-[#242424] outline-none transition-all placeholder:text-[#AAAAAA] focus:border-black/[0.3] focus:shadow-[0_0_0_3px_rgba(0,0,0,0.025)]";

const KOAP_URL =
  "http://www.consultant.ru/document/cons_doc_LAW_382690/2d50fc1c4013ea9ab20b8b2666c1650b1dc4c982/";

export default function EridTool() {
  const [kind, setKind] = useState<AdvertiserKind>("ooo");
  const [name, setName] = useState("");
  const [inn, setInn] = useState("");
  const [markErid, setMarkErid] = useState("");
  const [markTouched, setMarkTouched] = useState(false);
  const [markCopied, setMarkCopied] = useState(false);

  const [linkUrl, setLinkUrl] = useState("");
  const [linkErid, setLinkErid] = useState("");
  const [linkCopied, setLinkCopied] = useState(false);

  const [postText, setPostText] = useState("");
  const [postLink, setPostLink] = useState("");

  const [format, setFormat] = useState<PlacementFormat>("post");
  const [copyError, setCopyError] = useState("");
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const markingInput = { kind, name, inn, erid: markErid };
  const markValid = markingReady(markingInput);
  const marking = markValid ? buildMarking(markingInput) : "";
  const markDirty = Boolean(name.trim() || inn.trim() || markErid.trim());
  const nameMissing =
    (markTouched || markDirty) && !formatAdvertiser(kind, name);
  const innMessage =
    inn.trim() || markTouched ? innError(kind, inn) : null;
  const markEridMessage =
    markErid.trim() || markTouched ? eridError(markErid) : null;

  const linkToken = linkErid.trim();
  const linkEridMessage = linkToken ? eridError(linkErid) : null;
  const linkReady = Boolean(linkUrl.trim() && linkToken && isValidErid(linkToken));
  const linked = linkReady ? appendErid(linkUrl, linkToken) : "";
  const linkShort = isShortenerUrl(linkUrl);

  const postEmpty = !postText.trim() && !postLink.trim();
  const post = useMemo(
    () => checkPost(postText, postLink),
    [postText, postLink],
  );

  useToolUse("erid-mark", marking);
  useToolUse("erid-link", linked);
  useToolUse("erid-post", postEmpty ? "" : JSON.stringify(post));

  const hasLink = Boolean(linkUrl.trim() || postLink.trim());
  const hint = placementLine(format, hasLink);

  const fillMarking = () => {
    setKind(SAMPLE_MARKING.kind);
    setName(SAMPLE_MARKING.name);
    setInn(SAMPLE_MARKING.inn);
    setMarkErid(SAMPLE_MARKING.erid);
    setMarkTouched(false);
    setMarkCopied(false);
    setCopyError("");
  };

  const resetMarking = () => {
    setKind("ooo");
    setName("");
    setInn("");
    setMarkErid("");
    setMarkTouched(false);
    setMarkCopied(false);
    setCopyError("");
  };

  const fillLink = () => {
    setLinkUrl(SAMPLE_LINK.url);
    setLinkErid(SAMPLE_LINK.erid);
    setLinkCopied(false);
    setCopyError("");
  };

  const fillPost = () => {
    setPostText(SAMPLE_POST.text);
    setPostLink(SAMPLE_POST.link);
  };

  const copyText = async (value: string, which: "mark" | "link") => {
    if (!value) {
      if (which === "mark") setMarkTouched(true);
      return;
    }

    try {
      await navigator.clipboard.writeText(value);
      track("copy_result");
      setCopyError("");

      if (copyTimer.current) clearTimeout(copyTimer.current);

      if (which === "mark") {
        setMarkCopied(true);
        setLinkCopied(false);
      } else {
        setLinkCopied(true);
        setMarkCopied(false);
      }

      copyTimer.current = setTimeout(() => {
        setMarkCopied(false);
        setLinkCopied(false);
      }, 2000);
    } catch {
      setCopyError("Не вышло скопировать. Выдели текст и скопируй вручную.");
    }
  };

  return (
    <main className="min-h-screen bg-[#F7F5F2] text-[#242424]">
      <section className="relative overflow-hidden border-b border-black/[0.08]">
        <EridHeroPattern />

        <div className="relative z-10 mx-auto max-w-6xl px-4 pb-12 pt-10 sm:px-6 sm:pb-16 sm:pt-14">
          <nav
            aria-label="Хлебные крошки"
            className="mb-8 flex flex-wrap items-center gap-2 text-xs font-medium text-[#999999]"
          >
            <Link href="/" className="transition-colors hover:text-[#0B0B0B]">
              Главная
            </Link>
            <span>/</span>
            <span>Инструменты</span>
            <span>/</span>
            <span className="text-[#555555]">Маркировка erid</span>
          </nav>

          <h1 className="max-w-4xl text-[40px] font-bold leading-[0.92] tracking-[-0.055em] text-[#242424] sm:text-5xl lg:text-[64px]">
            {PAGE_H1}
          </h1>

          <p className="mt-7 max-w-2xl text-base font-normal leading-6 text-[#777777] sm:text-lg">
            {PAGE_LEAD}
          </p>

          <Link
            href="/utm-generator/"
            className="mt-4 inline-block text-xs font-medium text-[#999999] transition-colors hover:text-[#0B0B0B]"
          >
            Нужны UTM-метки? → UTM-генератор
          </Link>

          <div className="mt-8 max-w-2xl">
            <div
              role="radiogroup"
              aria-label="Формат"
              className="flex flex-wrap gap-2"
            >
              {PLACEMENT_FORMATS.map((item) => {
                const active = format === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setFormat(item.id)}
                    className={[
                      "h-10 shrink-0 rounded-xl px-4 text-xs font-medium transition-all duration-200 active:scale-[0.97]",
                      active
                        ? "bg-[#0B0B0B] text-white"
                        : "border border-black/[0.08] text-[#555555] hover:border-black/[0.18] hover:text-[#0B0B0B]",
                    ].join(" ")}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>

            <p className="mt-3 text-sm leading-5 text-[#242424]">{hint}</p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-5 px-4 py-10 sm:px-6 sm:py-12">
        <section
          aria-labelledby="marking-title"
          className="rounded-[18px] border border-black/[0.08] p-5 sm:p-6"
        >
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <h2
              id="marking-title"
              className="text-sm font-bold tracking-[-0.02em] text-[#0B0B0B]"
            >
              Конструктор пометки
            </h2>
            <span className="text-xs text-[#999999]">01</span>
          </div>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="advertiser-kind"
                className="mb-2 block text-sm font-bold tracking-[-0.02em] text-[#0B0B0B]"
              >
                Кто рекламодатель
              </label>
              <select
                id="advertiser-kind"
                value={kind}
                onChange={(event) => {
                  setKind(event.target.value as AdvertiserKind);
                  setMarkCopied(false);
                }}
                className={fieldClass}
              >
                {ADVERTISER_KINDS.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="advertiser-name"
                className="mb-2 block text-sm font-bold tracking-[-0.02em] text-[#0B0B0B]"
              >
                {kind === "ooo" ? "Название" : "ФИО"}
              </label>
              <input
                id="advertiser-name"
                value={name}
                onChange={(event) => {
                  setName(event.target.value);
                  setMarkCopied(false);
                }}
                placeholder={
                  kind === "ooo" ? "Ромашка" : "Иванов Иван Иванович"
                }
                className={fieldClass}
              />
              {nameMissing && (
                <FieldError>
                  {kind === "ooo" ? "Впиши название." : "Впиши ФИО."}
                </FieldError>
              )}
            </div>

            <div>
              <label
                htmlFor="advertiser-inn"
                className="mb-2 block text-sm font-bold tracking-[-0.02em] text-[#0B0B0B]"
              >
                ИНН
              </label>
              <input
                id="advertiser-inn"
                inputMode="numeric"
                value={inn}
                onChange={(event) => {
                  setInn(event.target.value);
                  setMarkCopied(false);
                }}
                placeholder={kind === "ooo" ? "7707083893" : "500100732259"}
                className={fieldClass}
              />
              {innMessage && <FieldError>{innMessage}</FieldError>}
            </div>

            <div>
              <label
                htmlFor="mark-erid"
                className="mb-2 block text-sm font-bold tracking-[-0.02em] text-[#0B0B0B]"
              >
                erid
              </label>
              <input
                id="mark-erid"
                value={markErid}
                onChange={(event) => {
                  setMarkErid(event.target.value);
                  setMarkCopied(false);
                }}
                placeholder="2VtzqvXXXXX"
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
                className={fieldClass}
              />
              {markEridMessage && <FieldError>{markEridMessage}</FieldError>}
            </div>
          </div>

          <ResultBox
            label="Пометка"
            value={marking}
            empty={
              markDirty
                ? "Заполни название, ИНН и erid — пометка соберётся здесь."
                : "Например: Реклама. ООО «Ромашка», ИНН 7707083893. erid: 2VtzqvXXXXX"
            }
          />

          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={() => void copyText(marking, "mark")}
              className="flex-1 rounded-xl bg-[#0B0B0B] px-5 py-3.5 text-sm font-medium text-white transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_25px_rgba(0,0,0,0.12)] active:translate-y-0 active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-black/[0.08] disabled:text-[#AAAAAA] disabled:hover:translate-y-0 disabled:hover:shadow-none"
              disabled={!marking && !markDirty}
            >
              {markCopied ? "Скопировано" : "Скопировать"}
            </button>
            <button
              type="button"
              onClick={fillMarking}
              className="rounded-xl border border-black/[0.1] px-5 py-3.5 text-sm font-medium text-[#444444] transition-all hover:border-black/[0.2] hover:text-[#0B0B0B]"
            >
              Подставить пример
            </button>
            {markDirty && (
              <button
                type="button"
                onClick={resetMarking}
                className="rounded-xl border border-black/[0.1] px-5 py-3.5 text-sm font-medium text-[#666666] transition-all hover:border-black/[0.2] hover:text-[#0B0B0B]"
              >
                Сбросить
              </button>
            )}
          </div>
        </section>

        <section
          aria-labelledby="link-title"
          className="rounded-[18px] border border-black/[0.08] p-5 sm:p-6"
        >
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <h2
              id="link-title"
              className="text-sm font-bold tracking-[-0.02em] text-[#0B0B0B]"
            >
              Ссылка с erid
            </h2>
            <span className="text-xs text-[#999999]">02</span>
          </div>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="target-url"
                className="mb-2 block text-sm font-bold tracking-[-0.02em] text-[#0B0B0B]"
              >
                Ссылка
              </label>
              <input
                id="target-url"
                type="url"
                value={linkUrl}
                onChange={(event) => {
                  setLinkUrl(event.target.value);
                  setLinkCopied(false);
                }}
                placeholder="https://example.ru/sale"
                className={fieldClass}
              />
            </div>

            <div>
              <label
                htmlFor="link-erid"
                className="mb-2 block text-sm font-bold tracking-[-0.02em] text-[#0B0B0B]"
              >
                erid
              </label>
              <input
                id="link-erid"
                value={linkErid}
                onChange={(event) => {
                  setLinkErid(event.target.value);
                  setLinkCopied(false);
                }}
                placeholder="2VtzqvXXXXX"
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
                className={fieldClass}
              />
              {linkEridMessage && <FieldError>{linkEridMessage}</FieldError>}
            </div>
          </div>

          {linkShort && (
            <p className="mt-4 rounded-xl bg-[#D7FF00]/60 px-4 py-3 text-sm leading-5 text-[#0B0B0B]">
              Это сокращалка: erid в ней не видно. Вставь полную ссылку.
            </p>
          )}

          <ResultBox
            label="Готовая ссылка"
            value={linked}
            empty={
              linkUrl.trim() || linkToken
                ? "Нужны и ссылка, и erid из латиницы и цифр."
                : "Например: https://example.ru/sale?erid=2VtzqvXXXXX#reviews"
            }
          />

          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={() => void copyText(linked, "link")}
              disabled={!linked}
              className="flex-1 rounded-xl bg-[#0B0B0B] px-5 py-3.5 text-sm font-medium text-white transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_25px_rgba(0,0,0,0.12)] active:translate-y-0 active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-black/[0.08] disabled:text-[#AAAAAA] disabled:hover:translate-y-0 disabled:hover:shadow-none"
            >
              {linkCopied ? "Скопировано" : "Скопировать"}
            </button>
            <button
              type="button"
              onClick={fillLink}
              className="rounded-xl border border-black/[0.1] px-5 py-3.5 text-sm font-medium text-[#444444] transition-all hover:border-black/[0.2] hover:text-[#0B0B0B]"
            >
              Подставить пример
            </button>
          </div>
        </section>

        <section
          id="post-check"
          aria-labelledby="post-title"
          className="rounded-[18px] border border-black/[0.08] p-5 sm:p-6"
        >
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <h2
              id="post-title"
              className="text-sm font-bold tracking-[-0.02em] text-[#0B0B0B]"
            >
              Проверка поста
            </h2>
            <span className="text-xs text-[#999999]">03</span>
          </div>

          <label
            htmlFor="post-text"
            className="mb-2 block text-sm font-bold tracking-[-0.02em] text-[#0B0B0B]"
          >
            Текст поста
          </label>
          <textarea
            id="post-text"
            value={postText}
            onChange={(event) => setPostText(event.target.value)}
            rows={6}
            placeholder={"Реклама. ООО «Ромашка», ИНН 7707083893.\nerid: 2VtzqvXXXXX"}
            className="w-full resize-y rounded-xl border border-black/[0.1] bg-transparent px-4 py-3 text-sm leading-6 text-[#242424] outline-none transition-all placeholder:text-[#AAAAAA] focus:border-black/[0.3]"
          />

          <label
            htmlFor="post-link"
            className="mb-2 mt-4 block text-sm font-bold tracking-[-0.02em] text-[#0B0B0B]"
          >
            Ссылка в посте
            <span className="ml-2 font-medium text-[#0B0B0B]/40">
              необязательно
            </span>
          </label>
          <input
            id="post-link"
            type="url"
            value={postLink}
            onChange={(event) => setPostLink(event.target.value)}
            placeholder="https://example.ru/sale?erid=2VtzqvXXXXX"
            className={fieldClass}
          />

          {postEmpty ? (
            <div className="mt-5 rounded-xl border border-dashed border-black/[0.12] px-4 py-4">
              <p className="text-sm text-[#777777]">
                Вставь текст — чеклист скажет, чего не хватает. Например:
              </p>
              <p className="mt-2 whitespace-pre-line break-words font-mono text-[13px] leading-6 text-[#555555]">
                {SAMPLE_POST.text}
                {"\n"}
                {SAMPLE_POST.link}
              </p>
              <button
                type="button"
                onClick={fillPost}
                className="mt-3 rounded-xl border border-black/[0.1] px-4 py-2.5 text-xs font-medium text-[#444444] transition-all hover:border-black/[0.2] hover:text-[#0B0B0B]"
              >
                Подставить пример
              </button>
            </div>
          ) : (
            <ul className="mt-5 space-y-2">
              <CheckItem
                ok={post.hasAdMarker}
                text={
                  post.hasAdMarker
                    ? "Слово «Реклама» на месте."
                    : "Добавь слово «Реклама»."
                }
              />
              <CheckItem
                ok={post.hasAdvertiser}
                text={
                  post.hasAdvertiser
                    ? "Рекламодатель указан."
                    : "Добавь название или ИНН."
                }
              />
              <CheckItem
                ok={post.hasErid}
                text={
                  post.hasErid
                    ? "erid на месте."
                    : "Добавь erid в текст («erid: …») или в ссылку (?erid=)."
                }
              />
              <CheckItem
                ok={post.caseState === "match" || post.caseState === "single"}
                text={
                  post.caseState === "match"
                    ? "Регистр erid в тексте и в ссылке совпадает."
                    : post.caseState === "mismatch"
                      ? "Регистр erid разный — оставь токен как выдал ОРД."
                      : post.caseState === "single"
                        ? "Регистр сверяется, когда erid есть и в тексте, и в ссылке."
                        : "erid пока нет — регистр проверять рано."
                }
              />
              <CheckItem
                ok={!post.hasShortener}
                text={
                  post.hasShortener
                    ? "Сокращалка прячет erid. Вставь полную ссылку."
                    : "Сокращалок нет."
                }
              />
            </ul>
          )}
        </section>

        {copyError && (
          <p
            role="alert"
            className="rounded-xl border border-[#FF3830]/20 bg-[#FF3830]/[0.055] px-4 py-3 text-sm text-[#D52D27]"
          >
            {copyError}
          </p>
        )}

        <section
          aria-labelledby="help-title"
          className="rounded-[18px] border border-black/[0.08] p-5 sm:p-6"
        >
          <h2
            id="help-title"
            className="text-sm font-bold tracking-[-0.02em] text-[#0B0B0B]"
          >
            Справка
          </h2>

          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-black/[0.06] p-4">
              <h3 className="text-sm font-bold text-[#0B0B0B]">
                Что передать в ОРД
              </h3>
              <ol className="mt-3 space-y-2 text-sm leading-5 text-[#444444]">
                <li>1. Договор</li>
                <li>2. Креатив</li>
                <li>3. Площадка</li>
              </ol>
              <p className="mt-3 text-sm leading-5 text-[#777777]">
                Потом — акты и статистика.
              </p>
            </div>

            <div className="rounded-xl border border-black/[0.06] p-4">
              <h3 className="text-sm font-bold text-[#0B0B0B]">Штрафы</h3>
              <p className="mt-2 text-xs leading-5 text-[#777777]">
                <a
                  href={KOAP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline decoration-black/20 underline-offset-2 hover:text-[#0B0B0B]"
                >
                  ст. 14.3 КоАП РФ, ред. от 23.03.2026
                </a>
              </p>
              <ul className="mt-3 space-y-3 text-sm leading-5 text-[#444444]">
                <li>
                  ч. 16, реклама в интернете без erid или с нарушением правил
                  его размещения: гражданам 30–100 тыс. ₽, должностным лицам
                  100–200 тыс. ₽, юрлицам 200–500 тыс. ₽.
                </li>
                <li>
                  ч. 1, общее нарушение закона о рекламе (в т.ч. нет пометки):
                  гражданам 2–2,5 тыс. ₽, должностным лицам 4–20 тыс. ₽,
                  юрлицам 100–500 тыс. ₽.
                </li>
              </ul>
              <p className="mt-3 flex flex-col gap-1 text-xs leading-5 text-[#777777] sm:flex-row sm:flex-wrap sm:gap-x-4">
                <a
                  href="https://www.consultant.ru/legalnews/23872/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline decoration-black/20 underline-offset-2 hover:text-[#0B0B0B]"
                >
                  разъяснения РКН
                </a>
                <a
                  href="https://interactivead.ru/wp-content/uploads/2022/11/arir22_ads_id_recommendations.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline decoration-black/20 underline-offset-2 hover:text-[#0B0B0B]"
                >
                  рекомендации АРИР
                </a>
              </p>
            </div>
          </div>

          <p className="mt-4 text-sm leading-6 text-[#777777]">{DISCLAIMER}</p>
        </section>

        <section aria-labelledby="faq-title" className="pt-4">
          <h2
            id="faq-title"
            className="text-[22px] font-semibold tracking-[-0.045em] text-[#0B0B0B] sm:text-[25px]"
          >
            Вопросы
          </h2>

          <div className="mt-5 grid gap-3 lg:grid-cols-2">
            {FAQ.map((item) => (
              <article
                key={item.q}
                className="rounded-[18px] border border-black/[0.08] p-5"
              >
                <h3 className="text-sm font-bold leading-5 tracking-[-0.02em] text-[#0B0B0B]">
                  {item.q}
                </h3>
                <p className="mt-2 text-sm leading-6 text-[#666666]">{item.a}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

function FieldError({ children }: { children: string }) {
  return (
    <p role="alert" className="mt-2 text-sm text-[#D52D27]">
      {children}
    </p>
  );
}

function ResultBox({
  label,
  value,
  empty,
}: {
  label: string;
  value: string;
  empty: string;
}) {
  return (
    <div className="mt-5 rounded-xl bg-black/[0.03] px-4 py-3">
      <div className="mb-1 text-xs font-bold text-[#999999]">{label}</div>
      <p
        className={[
          "break-words text-sm leading-6",
          value ? "font-mono text-[#242424]" : "text-[#999999]",
        ].join(" ")}
      >
        {value || empty}
      </p>
    </div>
  );
}

function CheckItem({ ok, text }: { ok: boolean; text: string }) {
  return (
    <li
      className={[
        "flex items-start gap-3 rounded-xl px-3 py-2.5 text-sm leading-5",
        ok ? "bg-[#D7FF00]/45 text-[#0B0B0B]" : "bg-[#FF3830]/[0.08] text-[#9E2A24]",
      ].join(" ")}
    >
      <span aria-hidden="true" className="mt-0.5 font-bold">
        {ok ? "✓" : "!"}
      </span>
      <span>{text}</span>
    </li>
  );
}

function EridHeroPattern() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 hidden overflow-hidden md:block"
    >
      <div className="absolute left-[48%] top-[8%] whitespace-nowrap font-mono text-[22px] font-medium tracking-[-0.04em] text-black/[0.03] lg:text-[28px]">
        Реклама. ООО «Ромашка»
      </div>
      <div className="absolute left-[58%] top-[32%] rotate-[-2deg] whitespace-nowrap font-mono text-[24px] font-semibold tracking-[-0.045em] text-black/[0.035] lg:text-[32px]">
        erid: 2VtzqvXXXXX
      </div>
      <div className="absolute left-[46%] top-[58%] rotate-[1deg] whitespace-nowrap font-mono text-[22px] font-semibold tracking-[-0.045em] text-black/[0.028] lg:text-[28px]">
        ?erid=
      </div>
      <div className="absolute left-[62%] top-[78%] rotate-[-1deg] whitespace-nowrap font-mono text-[20px] font-medium tracking-[-0.04em] text-black/[0.03] lg:text-[26px]">
        ИНН 7707083893
      </div>
    </div>
  );
}
