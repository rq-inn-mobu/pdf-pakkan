// select_file_folder.js
// PDFファイル複数選択・保存先指定のみ（ロジック禁止）

window.FileSelector = {
  pdfFiles: [],
  outputDir: null,

  async selectPDF() {
    const fileHandles = await window.showOpenFilePicker({
      multiple: true,
      types: [{
        description: "PDF files",
        accept: { "application/pdf": [".pdf"] }
      }]
    });

    const files = [];
    for (const h of fileHandles) {
      files.push(await h.getFile());
    }

    this.pdfFiles = files;
    return files;
  },

  async selectOutputFolder() {
    const dirHandle = await window.showDirectoryPicker();
    this.outputDir = dirHandle;

    if (window.FolderOutput) {
      await window.FolderOutput.setOutputDir(dirHandle);
    }

    return dirHandle;
  }
};
