// join_logic.js
window.PDFLogic = {

  /**
   * 見開き対訳PDFを生成する
   * @param {File[]} leftFiles
   * @param {File[]} rightFiles
   */
  async joinPdfs(leftFiles, rightFiles) {

    // ===== 0. 入力チェック =====
    if (!leftFiles?.length || !rightFiles?.length) {
      throw new Error("PDF_FILES_NOT_SELECTED");
    }

    // ===== 1. ファイル名昇順ソート =====
    const leftSorted = [...leftFiles].sort((a, b) =>
      a.name.localeCompare(b.name)
    );
    const rightSorted = [...rightFiles].sort((a, b) =>
      a.name.localeCompare(b.name)
    );

    // ===== 2. 出力PDF作成 =====
    const mergedPdf = await PDFLib.PDFDocument.create();

    // ===== 3. 表紙PDF（印刷用のみ） =====
    if (window.AppConfig?.outputMode === "print") {
      try {
        const coverRes = await fetch("./pdf/mirror_book_cover.pdf");
        const coverBuf = await coverRes.arrayBuffer();
        const coverPdf = await PDFLib.PDFDocument.load(coverBuf);
        const [coverPage] = await mergedPdf.copyPages(
          coverPdf,
          [0]
        );
        mergedPdf.addPage(coverPage);
      } catch (e) {
        console.warn("Cover PDF not added:", e);
      }
    }

    // ===== 4. 左右PDFをページ配列に展開 =====
    const leftPages = [];
    for (const file of leftSorted) {
      const buf = await file.arrayBuffer();
      const pdf = await PDFLib.PDFDocument.load(buf);
      const pages = await mergedPdf.copyPages(
        pdf,
        pdf.getPageIndices()
      );
      leftPages.push(...pages);
    }

    const rightPages = [];
    for (const file of rightSorted) {
      const buf = await file.arrayBuffer();
      const pdf = await PDFLib.PDFDocument.load(buf);
      const pages = await mergedPdf.copyPages(
        pdf,
        pdf.getPageIndices()
      );
      rightPages.push(...pages);
    }

    // ===== 5. 最小ページ数で処理 =====
    const max = Math.min(leftPages.length, rightPages.length);
    if (max === 0) {
      throw new Error("NO_PAGES_TO_JOIN");
    }

    // ===== 6. 左右交互にページ追加 =====
    for (let i = 0; i < max; i++) {
      mergedPdf.addPage(leftPages[i]);
      mergedPdf.addPage(rightPages[i]);

      const percent = Math.floor(((i + 1) / max) * 100);
      window.UI?.renderProgress(percent);
    }

    // ===== 7. 保存 =====
    const bytes = await mergedPdf.save();

    await window.FolderOutput.saveJoinedPdf(
      bytes,
      leftSorted[0].name
    );
  }
};
