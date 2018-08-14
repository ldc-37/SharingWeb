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