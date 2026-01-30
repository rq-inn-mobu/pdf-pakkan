// os_detect.js

window.OSDetect = {
  getNoticeKey() {
    const ua = navigator.userAgent;

    if (/iPhone|iPad|iPod/i.test(ua)) {
      return "OS_IOS_NOTICE";
    }

    if (/Android/i.test(ua)) {
      return "OS_ANDROID_NOTICE";
    }

    return null;
  }
};
