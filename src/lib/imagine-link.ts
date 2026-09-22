const URL_PROMPT_MAX = 3200;
const IMAGINE_AGENT = "https://grok.com/imagine/agent";

export function clipForUrl(text: string, max = URL_PROMPT_MAX) {
  const t = text.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max).trim()}\n\n（后文已截断，完整清单在剪贴板。）`;
}

/** Imagine 代理。页面会把 searchParams.q 交给 Agent。 */
export function grokImagineAgentUrl(prompt: string) {
  return `${IMAGINE_AGENT}?q=${encodeURIComponent(clipForUrl(prompt))}`;
}

export function grokChatUrl(prompt: string) {
  return grokImagineAgentUrl(prompt);
}

export function imagineUrl(prompt: string) {
  return grokImagineAgentUrl(
    `生成一张电影感写实静帧。不要字幕、水印或文字叠层。\n\n${prompt}`,
  );
}

export function imagineAgentUrl(prompt: string, ratioLabel: string) {
  return grokImagineAgentUrl(
    `生成一张 ${ratioLabel} 电影感写实静帧。不要字幕、水印或文字叠层。\n\n${prompt}`,
  );
}

export function imagineVideoAgentUrl(prompt: string, ratioLabel: string, seconds: number) {
  return grokImagineAgentUrl(
    `生成一段 ${seconds} 秒、${ratioLabel} 的电影感写实视频。不要字幕、水印或文字叠层。\n\n${prompt}`,
  );
}

export function copyPromptQuietly(text?: string) {
  if (!text) return;
  void copyToClipboard(text);
}

export async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    /* iframe / denied */
  }
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.top = "0";
    ta.style.left = "0";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    const ok = document.execCommand("copy");
    ta.remove();
    return ok;
  } catch {
    return false;
  }
}
