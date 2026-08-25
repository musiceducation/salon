"use client";

import { useState } from "react";
import { copyTextToClipboard } from "@/lib/contact-wechat";

const iconWechat = (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 0 .213.665l-.632 2.352 2.432-1.27a.59.59 0 0 1 .562.043c.94.548 2.013.84 3.114.84.096 0 .19-.003.283-.008-.062-.21-.096-.432-.096-.664 0-3.475 3.433-6.292 7.667-6.292.088 0 .174.002.26.006C15.812 4.767 12.463 2.188 8.691 2.188zm-2.93 5.53a.885.885 0 1 1 0-1.77.885.885 0 0 1 0 1.77zm5.86 0a.885.885 0 1 1 0-1.77.885.885 0 0 1 0 1.77zM24 14.314c0-3.213-3.141-5.815-7.015-5.815-3.874 0-7.015 2.602-7.015 5.815 0 3.214 3.141 5.816 7.015 5.816.816 0 1.599-.117 2.318-.334a.59.59 0 0 1 .562.043l2.432 1.27-.632-2.352a.59.59 0 0 0 .213-.665C22.83 16.517 24 15.526 24 14.314zm-9.015-1.323a.738.738 0 1 1 0-1.476.738.738 0 0 1 0 1.476zm3.708 0a.738.738 0 1 1 0-1.476.738.738 0 0 1 0 1.476z" />
  </svg>
);

const iconInstagram = (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9A5.5 5.5 0 0 1 16.5 22h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2zm0 1.5A4 4 0 0 0 3.5 7.5v9a4 4 0 0 0 4 4h9a4 4 0 0 0 4-4v-9a4 4 0 0 0-4-4h-9zm4.5 2.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9zm0 1.5a3 3 0 1 1 0 6 3 3 0 0 1 0-6zm4.5-2.25a.9.9 0 1 0 0 1.8.9.9 0 0 0 0-1.8z" />
  </svg>
);

const iconPhone = (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M6.6 3.2a1.5 1.5 0 0 1 1.5-.2l3.1 1.24a1.5 1.5 0 0 1 .9 1.66l-.4 2.4a1.5 1.5 0 0 1-.86 1.1l-1.3.56a11.2 11.2 0 0 0 5.2 5.2l.56-1.3a1.5 1.5 0 0 1 1.1-.86l2.4-.4a1.5 1.5 0 0 1 1.66.9L21 16.9a1.5 1.5 0 0 1-.2 1.5l-1.12 1.5a2.5 2.5 0 0 1-2.58.9C10.3 19.4 4.6 13.7 3.2 6.9a2.5 2.5 0 0 1 .9-2.58L6.6 3.2z" />
  </svg>
);

const cardClass =
  "flex w-full flex-col items-start gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-4 text-left transition hover:border-white/30 hover:bg-white/10";

type Props = {
  hoursLabel: string;
  hoursDetail: string;
  wechatLabel: string;
  wechatId: string;
  wechatHint: string;
  wechatCopied: string;
  instagramLabel: string;
  instagramUrl: string | null;
  phoneLabel: string;
  phoneDisplay: string;
  phoneTelHref: string;
};

function instagramHandleFromUrl(url: string | null): string | null {
  if (!url) return null;
  try {
    const path = new URL(url).pathname.replace(/\/+$/, "");
    const handle = path.split("/").filter(Boolean)[0];
    return handle ? `@${handle}` : null;
  } catch {
    return null;
  }
}

export function ContactCta(p: Props) {
  const [copied, setCopied] = useState(false);
  const instagramHandle = instagramHandleFromUrl(p.instagramUrl);

  async function copyWechat() {
    const ok = await copyTextToClipboard(p.wechatId);
    if (ok) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    }
  }

  return (
    <div className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,16rem)_1fr]">
      <div className="rounded-xl border border-white/15 bg-white/5 px-4 py-4">
        <p className="label-eyebrow text-emerald-300/90">{p.hoursLabel}</p>
        <ul className="mt-3 space-y-1.5 text-sm leading-cjk-tight text-zinc-200">
          {p.hoursDetail.split("\n").map((line, i) => (
            <li key={`${i}-${line}`}>{line}</li>
          ))}
        </ul>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <button
          type="button"
          className={`${cardClass} cursor-pointer`}
          onClick={() => void copyWechat()}
          aria-label={`${p.wechatLabel} ${p.wechatId}`}
        >
          <span className="flex items-center gap-2 text-emerald-300">{iconWechat}</span>
          <span className="label-eyebrow text-zinc-400">{p.wechatLabel}</span>
          <span className="font-medium text-white">{p.wechatId}</span>
          <span className="text-xs text-zinc-400">{copied ? p.wechatCopied : p.wechatHint}</span>
        </button>
        {p.instagramUrl ? (
          <a
            className={cardClass}
            href={p.instagramUrl}
            target="_blank"
            rel="noreferrer"
          >
            <span className="flex items-center gap-2 text-zinc-200">{iconInstagram}</span>
            <span className="label-eyebrow text-zinc-400">{p.instagramLabel}</span>
            <span className="font-medium text-white">{instagramHandle ?? "Instagram"}</span>
          </a>
        ) : null}
        <a className={cardClass} href={p.phoneTelHref}>
          <span className="flex items-center gap-2 text-zinc-200">{iconPhone}</span>
          <span className="label-eyebrow text-zinc-400">{p.phoneLabel}</span>
          <span className="font-medium text-white">{p.phoneDisplay}</span>
        </a>
      </div>
    </div>
  );
}
