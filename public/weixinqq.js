if (is_weixn_qq()) {
    window.location.href =
        "https://c.pc.qq.com/middle.html?pfurl=https://chat.moshuixin.xyz";
}
function is_weixn_qq() {
    var ua = navigator.userAgent.toLowerCase();
    if (ua.match(/MicroMessenger/i) == "micromessenger") {
        return "weixin";
    } else if (ua.match(/QQ/i) == "qq") {
        return "QQ";
    }
    return false;
}