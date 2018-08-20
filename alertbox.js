/**
 * 弹窗相关
 */

 let g_longitude, g_latitude;
////发起借出弹窗
$('#share-require__btn').click(function () {
    $('.alert-box-lend').eq(0).show();
    $('#body-cover').show();
    $('.l-content, .l-sidebar').css('filter', 'blur(5px)')
    var map = new AMap.Map('lend-map',{
        zoom:16,
    });
    AMapUI.loadUI(['misc/PositionPicker'], function(PositionPicker) {
        AMap.plugin(['AMap.Geolocation'], function(){
            map.addControl(new AMap.Geolocation());
        });
        var positionPicker = new PositionPicker({
            mode:'dragMap',
            map:map
        });
        positionPicker.start(map.getBounds().getSouthWest());
        map.on('complete', function () {
            console.log('地图加载完成');
        });
        positionPicker.on('success', function (positionResult) {
            g_longitude = positionResult.position.lng;
            g_latitude = positionResult.position.lat;
            $('#lend-map-position-txt').val(positionResult.address);
        });
    });
    $('#lend-launch__hd button').click(function () {
        $('.l-content, .l-sidebar').css('filter', '')
        $('#body-cover').hide();
        $('.alert-box-lend').eq(0).hide();
        map.destroy();
    })
})

// https://www.cnblogs.com/dj3839/p/6027417.html
// https://blog.csdn.net/tangxiujiang/article/details/78693890
$('#lend-img-unload').on('change',function(){
    let filePath = this.value,
    imgSrc = window.URL.createObjectURL(this.files[0]), //转成可以在本地预览的格式
    fileFormat = filePath.substring(filePath.lastIndexOf(".")).toLowerCase();
    // 检查是否是图片
    if( !fileFormat.match(/.png|.jpg|.jpeg|.gif/) ) {
        alert('上传错误,文件格式必须为：png/jpg/jpeg');
        return false;  
    }
    // 检查图片大小
    if (this.files[0].size > 1024 * 1024 * 2) {
        alert('图片大小不能超过 2MB!');
        return false;
    }
    $('.lend-img').eq(0).attr('src',imgSrc);
    // 使用下面这句可以在内存中释放对此 url 的伺服，跑了之后那个 URL 就无效了
    // URL.revokeObjectURL(imgSrc);
});

$('#lend-price-free').click(function () {
    $('#lend-price').attr("disabled", true);
    $('#lend-price').attr("placeholder", "");
})
$('#lend-price-charge').click(function () {
    $('#lend-price').attr("disabled", false);
    $('#lend-price').attr("placeholder", "请输入价格(纯数字)");
})

$('#lend-submit').click(function () {
    //TODO:数据合法性校验
    const itemName = $('#lend-item-name').val();
    const itemDescription = $('#lend-description').val();
    const locationText = $('#lend-map-position-txt').val();
    const itemPrice = $('#lend-price').attr('disabled') ? 0 : parseInt($('#lend-price').val());
    const lendLocationJson = `{
        "longitude": "${g_longitude}",
        "latitude": "${g_latitude}",
        "locationDescription": "${locationText}"
    }`;
    const lendItemJson = `{
        "name": "${itemName}",
        "description": "${itemDescription}",
        "price": ${itemPrice},
        "location": ${lendLocationJson}
    }`;
    const authorizationText = getCookie("tokenType") + " " + getCookie("accessToken");
    $.ajax({
        type: "POST",
        url: apiBase + "/item",
        headers: {
            Authorization: "Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiI5IiwiaWF0IjoxNTM0Nzc0ODQyLCJleHAiOjE1MzUzNzk2NDJ9.UGFQcswMn8Ng3U1gPK3iL2RHNzmMJZetKyjNs97DaPh5X2DymUFPpKsPsJz5VsM-_osAL9OBK663qctfo6vYig"
        },
        contentType: "application/json",
        data: lendItemJson
    })
})