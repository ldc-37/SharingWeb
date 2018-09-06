/**
 * 弹窗相关
 */

 let g_longitude, g_latitude;

////发起借出弹窗
$('#share-require__btn').click(function () {
    if (AuthorizationText () == " ") {
        PromptLogin ();
        return;
    }
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

//description剩余字数更新
$('#lend-description').keyup(function () {
    $('#lend-left-char-num').text(100 - $('#lend-description').val().length);
});

//图片上传相关 @弃用
// https://www.cnblogs.com/dj3839/p/6027417.html
// https://blog.csdn.net/tangxiujiang/article/details/78693890
/*$('#lend-img-upload').on('change',function(){
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
}); */

//图片上传
let imgDataObj, uploadItemId;
Dropzone.options.lendPicDropzone = {
    autoProcessQueue: false,
    init: function () {
        imgDataObj = this;
    },
    url: apiBase + '/image',
    headers: {
        Authorization: AuthorizationText ()
    },
    maxFilesize: 1,
    maxFiles: 3,
    acceptedFiles: 'image/*',
    addRemoveLinks: true,
    dictDefaultMessage: '点击空白处上传图片',
    dictCancelUpload: '删除该图片',
    sending: function (file, xhr, formData) {
        formData.append("item", uploadItemId);
    },
    // maxfilesreached: function () {
    // },
    maxfilesexceeded: function (file) {
        swal("图片数量超限", "有效图片不得多于3张", "warning");        
        this.removeFile(file);
    },
    // error: function (file, msg) {
        //
        // alert('图片上传错误：' + msg);
    // },
    queuecomplete: function () {
        //避免首张图片不被accept也算作全部完成
        if (this.files[0].accepted) {
            $.ajax({
                type: "POST",
                url: apiBase + "/item/" + uploadItemId + "/publish",
                headers: {
                    Authorization: AuthorizationText ()
                },
                success: function (res) {
                    if (res.code == 0) {
                        swal("完成", "借出请求已发布", "success");
                        $('#lend-launch__hd button').click();
                    }
                    else {
                        swal("图片上传失败", "错误代码：" + res.code, "error");
                    }
                },
                error: function (xhr) {
                    swal("发布失败", xhr.status + "错误", "error");
                    $('#lend-submit').text('提交');
                }
            })
        }
    }
}

//提交借出请求
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
    else if (imgDataObj.files) {
        swal('没有图片', '真的不上传一张图片让大家看看？', 'info', {
            buttons: ['丑拒', '好吧']
        }).then((value) => {
            if (!value) {
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
                $('#lend-submit').text('发布中...');
                $.ajax({
                    type: "POST",
                    url: apiBase + "/item",
                    headers: {
                        Authorization: AuthorizationText ()
                    },
                    contentType: "application/json",
                    data: lendItemJson,
                    success: function (res) {
                        //上传图片
                        uploadItemId = res.id;
                        imgDataObj.processQueue();
                    },
                    error: function (xhr) {
                        swal("提交失败", xhr.status + "错误", "error");
                        $('#lend-submit').text('提交');
                    }
                })
            }
        });
    }
});