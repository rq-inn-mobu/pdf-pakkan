// folder_output.js
// 出力専用：保存のみ（UI禁止）

window.FolderOutput = {
  dirHandle: null,

  async setOutputDir(dirHandle) {
    this.dirHandle = dirHandle;

    const perm = await dirHandle.requestPermission({ mode: "readwrite" });
    if (perm !== "granted") {
      throw new Error("FOLDER_PERMISSION_DENIED");
    }
  },

  // ===== PDFちょき用（分割） =====
  async savePdf(bytes, index) {
    const baseName =
      window.FileSelector.pdfFile?.name.replace(/\.pdf$/i, "") || "output";

    const filename = `${String(index).padStart(2, "0")}_${baseName}.pdf`;

    const fileHandle = await this.dirHandle.getFileHandle(filename, {
      create: true
    });

    const writable = await fileHandle.createWritable();
    await writable.write(bytes);
    await writable.close();
  },

  // ===== PDFぐうう用（結合） =====
  async saveJoinedPdf(bytes, firstFileName) {
    // 1) 念のため文字列化
    let base = String(firstFileName || "");

    // 2) 先頭の連番（01_ など）を除去
    base = base.replace(/^\d+_/, "");

    // 3) 最初に現れる ".pdf" 以降をすべて削除
    //    EN_xxx.pdf            → EN_xxx
    //    EN_xxx.pdf_output     → EN_xxx
    //    EN_xxx.pdf_output.pdf → EN_xxx
    base = base.replace(/\.pdf.*$/i, "");

    // 4) フォールバック
    if (!base) base = "joined";

    // 5) 拡張子はここで1回だけ付ける
    const filename = `join_${base}.pdf`;

    const fileHandle = await this.dirHandle.getFileHandle(filename, {
      create: true
    });

    const writable = await fileHandle.createWritable();
    await writable.write(bytes);
    await writable.close();
  }
};
