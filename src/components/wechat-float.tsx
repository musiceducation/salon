"use client";

import { useState } from "react";
import { copyTextToClipboard } from "@/lib/contact-wechat";

const icon = (
  <svg className="h-7 w-7" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 0 .213.665l-.632 2.352 2.432-1.27a.59.59 0 0 1 .562.043c.94.548 2.013.84 3.114.84.096 0 .19-.003.283-.008-.062-.21-.096-.432-.096-.664 0-3.475 3.433-6.292 7.667-6.292.088 0 .174.002.26.006C15.812 4.767 12.463 2.188 8.691 2.188zm-2.93 5.53a.885.885 0 1 1 0-1.77.885.885 0 0 1 0 1.77zm5.86 0a.885.885 0 1 1 0-1.77.885.885 0 0 1 0 1.77zM24 14.314c0-3.213-3.141-5.815-7.015-5.815-3.874 0-7.015 2.602-7.015 5.815 0 3.214 3.141 5.816 7.015 5.816.816 0 1.599-.117 2.318-.334a.59.59 0 0 1 .562.043l2.432 1.27-.632-2.352a.59.59 0 0 0 .213-.665C22.83 16.517 24 15.526 24 14.314zm-9.015-1.323a.738.738 0 1 1 0-1.476.738.738 0 0 1 0 1.476zm3.708 0a.738.738 0 1 1 0-1.476.738.738 0 0 1 0 1.476z" />
  </svg>
);

type Props = {
  wechatId: string;
  title: string;
  body: string;
  copiedLabel: string;
};

export function WeChatFloat({ wechatId, title, body, copiedLabel }: Props) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const ok = await copyTextToClipboard(wechatId);
    if (ok) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    }
  }

  return (
    <div className="group fixed bottom-4 right-4 z-[60] flex max-w-md flex-row items-end justify-end gap-2 sm:bottom-6 sm:right-6">
      <div className="pointer-events-none order-1 mb-0.5 max-w-xs rounded-2xl border border-zinc-200/80 bg-white p-3.5 pr-2 text-left text-sm text-zinc-800 opacity-0 shadow-2xl transition-opacity duration-150 group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100 sm:p-4 [@media(hover:none)]:hidden">
        <p className="font-semibold text-zinc-900">{title}</p>
        <p className="mt-1 leading-cjk text-zinc-600">{body}</p>
        <p className="mt-2 font-medium text-zinc-900">WeChat: {wechatId}</p>
      </div>
      <button
        type="button"
        onClick={handleCopy}
        className="order-2 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#07C160] text-white shadow-lg transition hover:scale-105 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-white/95 focus-visible:ring-offset-2"
        aria-label={copied ? copiedLabel : `WeChat ${wechatId}`}
      >
        {icon}
      </button>
      {copied ? (
        <p
          role="status"
          className="pointer-events-none absolute bottom-14 right-0 rounded-lg bg-zinc-900 px-3 py-1.5 text-xs text-white shadow-lg sm:bottom-16"
        >
          {copiedLabel}
        </p>
      ) : null}
    </div>
  );
}
