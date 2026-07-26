export const DEFAULT_WECHAT_ID = "+853 66509780";

/** Public WeChat ID shown in footer, float, and static shop orders. */
export function getWeChatId(): string {
  const fromEnv = process.env.NEXT_PUBLIC_WECHAT_ID?.trim();
  return fromEnv || DEFAULT_WECHAT_ID;
}

export async function copyTextToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fall through */
  }
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}
