(function() {
  const TIE_BASE = "https://theintellectualexchange.com";

  // Create floating button
  const btn = document.createElement("button");
  btn.innerHTML = "💡 Ask TIE";
  btn.style.cssText = "position:fixed;bottom:20px;right:20px;z-index:9999;padding:10px 20px;background:#b8461f;color:#fff;border:none;border-radius:8px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:14px;font-weight:600;cursor:pointer;box-shadow:0 4px 12px rgba(0,0,0,0.15);transition:transform 0.2s";
  btn.onmouseenter = () => btn.style.transform = "scale(1.05)";
  btn.onmouseleave = () => btn.style.transform = "scale(1)";

  // Create modal backdrop
  const backdrop = document.createElement("div");
  backdrop.style.cssText = "display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:10000;justify-content:center;align-items:center";

  // Create iframe container
  const container = document.createElement("div");
  container.style.cssText = "background:#fff;border-radius:12px;width:90%;max-width:560px;height:70vh;max-height:600px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.3);position:relative";

  // Close button
  const closeBtn = document.createElement("button");
  closeBtn.innerHTML = "✕";
  closeBtn.style.cssText = "position:absolute;top:12px;right:12px;z-index:10001;background:none;border:none;font-size:20px;cursor:pointer;color:#666;padding:4px 8px";
  closeBtn.onclick = () => backdrop.style.display = "none";

  // Iframe
  const iframe = document.createElement("iframe");
  iframe.style.cssText = "width:100%;height:100%;border:none";

  container.appendChild(closeBtn);
  container.appendChild(iframe);
  backdrop.appendChild(container);

  btn.onclick = () => {
    iframe.src = TIE_BASE + "/widget/ask";
    backdrop.style.display = "flex";
  };

  backdrop.onclick = (e) => {
    if (e.target === backdrop) backdrop.style.display = "none";
  };

  document.body.appendChild(btn);
  document.body.appendChild(backdrop);

  // Listen for messages from iframe
  window.addEventListener("message", (e) => {
    if (e.origin !== TIE_BASE) return;
    if (e.data.type === "tie-question-posted") {
      backdrop.style.display = "none";
      // Optional: show success toast
    }
  });
})();
