// main.js（UIはLanguageあり / OS通知はハードコード）
document.addEventListener("DOMContentLoaded", async () => {

  // ① UI用の Language 初期化（必要）
  try {
    await window.Language.init();
  } catch (e) {
    console.warn("Language init failed:", e);
  }

  // ② UI描画（これで MB2/MB3 は直る）
  window.UI.render();

  // ③ OS判定
  const noticeKey = window.OSDetect?.getNoticeKey();
  if (!noticeKey) return;

  // ④ OS注意はハードコード
  const footer = document.getElementById("osNotice");
  if (!footer) return;

  footer.textContent = "iOS / Android : Not supported";
  footer.classList.remove("hidden");
});
