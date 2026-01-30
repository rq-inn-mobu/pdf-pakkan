// ui.js

// 出力モード設定（★デフォルトは view）
window.AppConfig = {
  outputMode: "view" // "view" | "print"
};

window.UI = {
  isRunning: false,

  render() {
    this.renderLanguageSelect();
    this.renderControls();
    this.renderStatus();
  },

  // --- Language Select ---
  renderLanguageSelect() {
    const area = document.getElementById("languageArea");
    area.innerHTML = "";

    const select = document.createElement("select");

    window.Language.languages.forEach(lang => {
      const option = document.createElement("option");
      option.value = lang.number;
      option.textContent = lang.name;
      if (lang.number === window.Language.current) option.selected = true;
      select.appendChild(option);
    });

    select.addEventListener("change", (e) => {
      window.Language.setLanguage(e.target.value);
      this.render(); // ★言語変更は全再描画
    });

    area.appendChild(select);
  },

  // --- Controls ---
  renderControls() {
    const controlArea = document.getElementById("controlArea");
    const leftArea = document.getElementById("pdfLeftArea");
    const rightArea = document.getElementById("pdfRightArea");

    // ★重要：controlAreaは消さない（器ごと消える）
    // controlArea.innerHTML = ""; ← 絶対にやらない

    // 左右は「中身だけ」消す
    leftArea.innerHTML = "";
    rightArea.innerHTML = "";

    // ===== modeArea（無ければ作る） =====
    let modeArea = document.getElementById("modeArea");
    if (!modeArea) {
      modeArea = document.createElement("div");
      modeArea.id = "modeArea";

      // pdfInputArea の「前」に挿入（表示位置を固定）
      const pdfInputArea = document.getElementById("pdfInputArea");
      if (pdfInputArea) {
        controlArea.insertBefore(modeArea, pdfInputArea);
      } else {
        controlArea.prepend(modeArea);
      }
    }
    modeArea.innerHTML = "";

    // ===== folderArea（無ければ作る） =====
    let folderArea = document.getElementById("folderArea");
    if (!folderArea) {
      folderArea = document.createElement("div");
      folderArea.id = "folderArea";
      controlArea.appendChild(folderArea);
    }
    folderArea.innerHTML = "";

    /* ===== 出力モード選択（MB13 / MB14） ===== */
    const modeBox = document.createElement("div");
    modeBox.className = "box";

    const labelView = document.createElement("label");
    const radioView = document.createElement("input");
    radioView.type = "radio";
    radioView.name = "outputMode";
    radioView.value = "view";
    radioView.checked = window.AppConfig.outputMode === "view";
    radioView.disabled = this.isRunning;
    radioView.addEventListener("change", () => {
      window.AppConfig.outputMode = "view";
    });
    labelView.appendChild(radioView);
    labelView.append(" " + window.Language.t("MB13"));

    const labelPrint = document.createElement("label");
    const radioPrint = document.createElement("input");
    radioPrint.type = "radio";
    radioPrint.name = "outputMode";
    radioPrint.value = "print";
    radioPrint.checked = window.AppConfig.outputMode === "print";
    radioPrint.disabled = this.isRunning;
    radioPrint.addEventListener("change", () => {
      window.AppConfig.outputMode = "print";
    });
    labelPrint.appendChild(radioPrint);
    labelPrint.append(" " + window.Language.t("MB14"));

    modeBox.appendChild(labelView);
    modeBox.appendChild(document.createElement("br"));
    modeBox.appendChild(labelPrint);
    modeArea.appendChild(modeBox);

    /* ===== 左右PDF選択 ===== */
    this.renderPdfSelector({
      area: leftArea,
      labelKey: "MB10",
      fileKey: "pdfLeftFiles"
    });

    this.renderPdfSelector({
      area: rightArea,
      labelKey: "MB11",
      fileKey: "pdfRightFiles"
    });

    /* ===== 保存先フォルダ ===== */
    const btnFolder = document.createElement("button");
    btnFolder.textContent = window.Language.t("MB3");
    btnFolder.disabled = this.isRunning;

    btnFolder.addEventListener("click", async () => {
      if (this.isRunning) return;
      try {
        const dir = await window.FileSelector.selectOutputFolder();
        await window.FolderOutput.setOutputDir(dir);
        this.renderControls();
        this.renderStatus();
      } catch (e) {
        if (e.name !== "AbortError") console.error(e);
      }
    });

    const folderBox = document.createElement("div");
    folderBox.className = "box";
    folderBox.appendChild(btnFolder);

    const folderName = document.createElement("div");
    folderName.className = "box-sub";
    if (window.FileSelector?.outputDir) {
      folderName.textContent =
        `${window.Language.t("MB7")} ${window.FileSelector.outputDir.name}`;
    } else {
      folderName.innerHTML = "&nbsp;";
    }

    folderBox.appendChild(folderName);
    folderArea.appendChild(folderBox);
  },

  renderPdfSelector({ area, labelKey, fileKey }) {
    const btn = document.createElement("button");
    btn.textContent = window.Language.t(labelKey);
    btn.disabled = this.isRunning;

    btn.addEventListener("click", async () => {
      if (this.isRunning) return;
      try {
        const files = await window.FileSelector.selectPDF();
        window.FileSelector[fileKey] = files;
        this.renderControls();
        this.renderStatus();
      } catch (e) {
        if (e.name !== "AbortError") console.error(e);
      }
    });

    const box = document.createElement("div");
    box.className = "box";
    box.appendChild(btn);

    const list = document.createElement("div");
    list.className = "box-sub";

    const files = window.FileSelector?.[fileKey];
    if (files?.length) {
      const sorted = [...files].sort((a, b) => a.name.localeCompare(b.name));
      sorted.forEach(f => {
        const line = document.createElement("div");
        line.textContent = f.name;
        list.appendChild(line);
      });
    } else {
      list.innerHTML = "&nbsp;";
    }

    box.appendChild(list);
    area.appendChild(box);
  },

  // --- Status ---
  renderStatus() {
    const area = document.getElementById("statusArea");
    area.innerHTML = "";

    if (this.isRunning) {
      const p = document.createElement("p");
      p.textContent = window.Language.t("MB5");
      area.appendChild(p);
      return;
    }

    const btnRun = document.createElement("button");
    btnRun.textContent = window.Language.t("MB4");

    const canStart =
      window.FileSelector?.pdfLeftFiles?.length &&
      window.FileSelector?.pdfRightFiles?.length &&
      window.FileSelector?.outputDir &&
      !this.isRunning;

    btnRun.disabled = !canStart;

    btnRun.addEventListener("click", async () => {
      if (!canStart) return;

      this.isRunning = true;
      this.renderControls();
      UI.renderProgress(0);

      try {
        await window.PDFLogic.joinPdfs(
          window.FileSelector.pdfLeftFiles,
          window.FileSelector.pdfRightFiles
        );
      } finally {
        this.isRunning = false;
        this.renderControls();
      }
    });

    area.appendChild(btnRun);
    // --- ミラーブック画像（スタート下） ---
    const img = document.createElement("img");
    img.src = "./images/mirror_book.png";
    img.alt = "Mirror Book";
    img.style.display = "block";
    img.style.margin = "16px auto";
    img.style.maxWidth = "90%";
    img.style.opacity = "0.9";

    area.appendChild(img);

  }
};

UI.renderProgress = function (percent) {
  const area = document.getElementById("progressArea");
  area.innerHTML = "";

  const p = Math.max(0, Math.min(100, Math.floor(percent)));
  const filled = Math.floor(p / 10);
  const empty = 10 - filled;

  const bar = "[" + "■".repeat(filled) + "□".repeat(empty) + `] ${p}%`;

  const line = document.createElement("div");
  line.textContent = bar;
  line.style.fontFamily = "monospace";

  area.appendChild(line);
};
