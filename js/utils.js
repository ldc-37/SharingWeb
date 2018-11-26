"use strict";
/* Resource from internet */
function isMobile() {   
    var sUserAgent = navigator.userAgent.toLowerCase();  
    var bIsIpad = sUserAgent.match(/ipad/i) == "ipad";  
    var bIsIphoneOs = sUserAgent.match(/iphone os/i) == "iphone os";  
    var bIsMidp = sUserAgent.match(/midp/i) == "midp";  
    var bIsUc7 = sUserAgent.match(/rv:1.2.3.4/i) == "rv:1.2.3.4";  
    var bIsUc = sUserAgent.match(/ucweb/i) == "ucweb";  
    var bIsAndroid = sUserAgent.match(/android/i) == "android";  
    var bIsCE = sUserAgent.match(/windows ce/i) == "windows ce";  
    var bIsWM = sUserAgent.match(/windows mobile/i) == "windows mobile";  
    return bIsIpad || bIsIphoneOs || bIsMidp || bIsUc7 || bIsUc || bIsAndroid || bIsCE || bIsWM;
}

/**
 * Resource: https://blog.csdn.net/renfufei/article/details/50478856
 * 读写cookie函数
 */
function setCookie(cookieName, cookieValue, expiredays, domain){
    // 0 比较特殊
    if(0 === cookieValue){
        cookieValue = 0;
    } else if(!cookieValue){
        cookieValue = "";
    }
    // 编码
    cookieValue = encodeURIComponent(cookieValue);
    //获取cookie字符串
    var cookieStr= cookieName + "=" + cookieValue;
    // 过期时间
    if(expiredays && !isNaN(expiredays)){
        var exdate=new Date();
        exdate.setDate(exdate.getDate()+expiredays);
        cookieStr += "; expires="+exdate.toGMTString();
    }
    // 域名
    //domain = domain || document.domain;
    if(domain){
        cookieStr += "; path=" + "/";
        cookieStr += "; domain="+domain;
    }
    // 保存本地 cookie
    document.cookie = cookieStr;
    // 返回设置后的值
    return cookieValue;
};

function getCookie(cookieName){
    var strCookie=document.cookie;
    var arrCookie=strCookie.split("; ");
    var cookieValue = null;
    for(var i=0;i<arrCookie.length;i++){
        var arr=arrCookie[i].split("=");
        if(cookieName==arr[0]){
            cookieValue=(arr[1]);
            break;
        }
    }
    if(!cookieValue){
        cookieValue = "";
    }
    cookieValue = decodeURIComponent(cookieValue);
    return cookieValue;
};

// 检查fzu账号合法性
function checkFzuID (id, pass)
{
    $.post("http://59.77.134.232/fzuapp/UserHandler.ashx",
    `methodType=stulogin&xh=${id}&pwd=${pass}`,
    function(data){
        console.log(JSON.parse(data));
    });
}

//二进制流文件形式的图片处理
//https://www.cnblogs.com/cdemo/p/5225848.html#!comments #44
function ParseBinPic () 
{
    var url = "https://api.hs.rtxux.xyz/image/1";
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = "blob";
    // xhr.setRequestHeader("Authorization", "Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiI5IiwiaWF0IjoxNTM0Nzc0ODQyLCJleHAiOjE1MzUzNzk2NDJ9.UGFQcswMn8Ng3U1gPK3iL2RHNzmMJZetKyjNs97DaPh5X2DymUFPpKsPsJz5VsM-_osAL9OBK663qctfo6vYig");
    xhr.onload = function() {
            if (this.status == 200) {
                var img = document.createElement("img");
                var blob = this.response;
                var filereader = new FileReader();
                filereader.readAsDataURL(blob);
                filereader.onload=function(oFREvent){
                    img.src = oFREvent.target.result;
                }
            };
            $("#test").html(img);   
        }
    xhr.send();
}

//读取网址参数
// http://www.runoob.com/w3cnote/js-get-url-param.html
function GetQueryVariable(variable)
{
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split("=");
        if (pair[0] == variable) {
            return pair[1];
        }
    }
    return false;
}

//处理位集
function ParseBitSet (bitSet, bit)
{
    const mask = Math.pow(2, bit);
    return (bitSet & mask);
}

//获取timestamp对应时间，格式yyyy-mm-dd hh:mm:ss
//如果auto == 1，则当日的时间隐藏日期，其他时间完整显示
function FormatTime(timeStamp = undefined, auto = 0) {
    let now;
    if (timeStamp) {
        now = new Date(timeStamp);
    }
    else {
        now = new Date();
    }
    let y = now.getFullYear(),
        m = ("0" + (now.getMonth() + 1)).slice(-2),
        d = ("0" + now.getDate()).slice(-2);
    function SameDay(compDate) {
        let today = new Date();
        return today.toDateString() == compDate.toDateString();
    }
    return !auto || !SameDay(now) 
        ? m + "-" + d + " " + now.toTimeString().substr(0, 8)
        : now.toTimeString().substr(0, 8);
}