/**
 * 弹窗相关
 */

 let g_longitude, g_latitude;

////发起借出弹窗
$('#share-require__btn').click(function () {
    $('.alert-box-lend').eq(0).show();
    $('#body-cover').show();
    $('.l-content, .l-sidebar').css('filter', 'blur(5px)');
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
            console.log('lend地图加载完成');
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
        $('#lend-map-position-txt').css('color', '');    
        $('.alert-box-lend').eq(0).hide();
        map.destroy();
    })
})

//图片上传相关
// https://www.cnblogs.com/dj3839/p/6027417.html
// https://blog.csdn.net/tangxiujiang/article/details/78693890
$('#lend-img-upload').on('change',function(){
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

$('#lend-map-position-txt').click(function () {
    $('#lend-map-position-txt').css('color', 'black');
})

// 有偿/无偿切换
$('#lend-price-free').click(function () {
    $('#lend-price').attr("disabled", true);
    $('#lend-price').attr("placeholder", "");
    $('#lend-price').val("");
    $('#lend-price').css('borderBottomColor', '#aaa');
    $('.lend-launch__item .share-rmb').css('color', '#aaa');
    
})
$('#lend-price-charge').click(function () {
    $('#lend-price').attr("disabled", false);
    $('#lend-price').attr("placeholder", "请输入价格(0.01-999.99)");
    $('#lend-price').css('borderBottomColor', '#555');
    $('#lend-price').focus();
    $('.lend-launch__item .share-rmb').css('color', '#555');
})

//剩余字数更新
$('#lend-description').keyup(function () {
    $('#lend-left-char-num').text(80 - $('#lend-description').val().length);
});

//提交请求
$('#lend-submit').click(function () {
    $('.lend-tips').hide();
    $('.lend-tips').eq(0).text('');
    if (!$('#lend-item-name').val()) {
        $('.lend-tips').show();
        $('.lend-tips').eq(0).text('名称不能为空');
        return;
    }
    else if (!$('#lend-time').val()) {
        $('.lend-tips').show();
        $('.lend-tips').eq(0).text('时长不能为空');
        return;
    }
    else if (isNaN($('#lend-time').val()) || parseInt($('#lend-time').val()) > 30 || parseInt($('#lend-time').val()) < 1) {
        $('.lend-tips').show();
        $('.lend-tips').eq(0).text('时长只能为1-30的数字');
        return;
    }
    else if (!$('#lend-price').attr('disabled') && !$('#lend-price').val()) {
        $('.lend-tips').show();
        $('.lend-tips').eq(0).text('选择有偿则价格不能为空');
        return;
    }
    else if (!$('#lend-description').val()) {
        $('.lend-tips').show();
        $('.lend-tips').eq(0).text('描述不能为空');
        return;
    }
    else if ($('.lend-img').eq(0).attr('src') == "./images/plus-square.png") {
        if (confirm('真的不上传一张图片让大家看看？\n【点确认返回上传图片，点取消继续】')) {
            return;
        }
    }

    const itemName = $('#lend-item-name').val();
    const itemTime = $('#lend-time').val() * 60 * 60 * 24;
    const itemDescription = $('#lend-description').val();
    const locationText = $('#lend-map-position-txt').val();
    const itemPrice = $('#lend-price').attr('disabled') ? 0 : parseFloat($('#lend-price').val());
    const lendLocationJson = `{
        "longitude": "${g_longitude}",
        "latitude": "${g_latitude}",
        "locationDescription": "${locationText}"
    }`;
    const lendItemJson = `{
        "name": "${itemName}",
        "duration": ${itemTime},
        "description": "${itemDescription}",
        "price": ${itemPrice},
        "location": ${lendLocationJson}
    }`;
    const authorizationText = getCookie("tokenType") + " " + getCookie("accessToken");
    $.ajax({
        type: "POST",
        url: apiBase + "/item",
        headers: {//TODO:Test account:test13
            Authorization: "Bearer " + tempToken
            // Authorization: authorizationText
        },
        contentType: "application/json",
        data: lendItemJson,
        success: function (res) {
            console.log (res);
            alert('提交成功');
            //TODO:for... 多张图片
            let formData = new FormData();
            formData.append("item", res.id);
            formData.append("file", $("#lend-img-upload")[0].files[0]);
            $.ajax({
                type: 'POST',
                url: apiBase + '/image',
                headers: {//TODO:Test account:test13
                    Authorization: "Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiI5IiwiaWF0IjoxNTM0Nzc0ODQyLCJleHAiOjE1MzUzNzk2NDJ9.UGFQcswMn8Ng3U1gPK3iL2RHNzmMJZetKyjNs97DaPh5X2DymUFPpKsPsJz5VsM-_osAL9OBK663qctfo6vYig"
                    // Authorization: authorizationText
                },
                processData: false,
                contentType: false,
                data: formData,
                success: function (imgRes) {
                    console.log(imgRes);
                    if (imgRes.code == 0) {
                        // console.log(imgRes.data.image_id);
                        $('#lend-launch__hd button').click();
                    }
                    else {
                        alert("图片上传错误，错误码" + imgRes.code);
                    }
                }
            }); 
        },
        error: function (xhr) {
            alert(xhr.status + "错误");
        }
    })
});

