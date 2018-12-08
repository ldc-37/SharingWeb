/**
 * 弹窗相关
 */

 let g_longitude, g_latitude;

// =============发起借出部分==============
$('#share-require__btn').click(function () {
    if (AuthorizationText () == " ") {
        PromptLogin ();
        return;
    }
    $('.alert-box-lend').eq(0).show();
    //transition disappear if no setTimeout
    setTimeout(() => {
        $('.alert-box-lend').eq(0).css('transform', 'scale(1)');
    }, 0);
    $('#body-cover').one('click', function () {
        $('#lend-launch-close').click();
    }).show();
    $('.l-content, .l-sidebar').css('filter', 'blur(3px)');
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
    $('#lend-launch-close').click(function () {
        $('.l-content, .l-sidebar').css('filter', '')
        $('#body-cover').hide();
        $('#lend-map-position-txt').css('color', '');    
        $('.alert-box-lend').eq(0).css('transform', 'scale(0)');
        setTimeout(() => {
            $('.alert-box-lend').eq(0).hide();       
            map.destroy();
        }, 1000);
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
    parallelUploads: 5,
    sending: function (file, xhr, formData) {
        formData.append("item", uploadItemId);
    },
    // @异常，暂时取消
    // maxfilesreached: function () {
    // },
    maxfilesexceeded: function (file) {
        swal("图片数量超限", "有效图片不得多于3张", "warning");        
        this.removeFile(file);
    },
    // error: function (file, msg) {
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
                        $('#lend-launch-close').click();
                    }
                    else {
                        swal("图片上传失败", "错误代码：" + res.code, "error");
                    }
                },
                error: function (xhr) {
                    swal("发布失败", xhr.status + "错误", "error");
                    $('#lend-submit').text('提交');
                }
            });
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
    else if (imgDataObj.files.length == 0) {
        swal('没有图片', '真的不上传一张图片让大家看看？', 'info', {
            buttons: ['丑拒', '好吧']
        }).then((value) => {
            if (!value) LendRequest ();
        });
    }
    else {
        LendRequest ();
    }
});

function LendRequest ()
{
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
            uploadItemId = res.id;
            if (imgDataObj.files.length) {
                //上传图片
                imgDataObj.processQueue();
            }
            else {
                //没有图片
                $.ajax({
                    type: "POST",
                    url: apiBase + "/item/" + uploadItemId + "/publish",
                    headers: {
                        Authorization: AuthorizationText ()
                    },
                    success: function (res) {
                        if (res.code == 0) {
                            swal("完成", "借出请求已发布", "success");
                            $('#lend-launch-close').click();
                        }
                        else {
                            swal("publish失败", "错误代码：" + res.code, "error");
                        }
                    },
                    error: function (xhr) {
                        swal("发布失败", xhr.status + "错误", "error");
                        $('#lend-submit').text('提交');
                    }
                });
            }
            $('#lend-submit').text('提交');
        },
        error: function (xhr) {
            swal("提交失败", xhr.status + "错误", "error");
            $('#lend-submit').text('提交');
        }
    });
}

// =============物品详情部分==============
function ItemAlertInit (itemId, uid)
{
    const itemInfo = GetItemInfo(itemId);

    if (itemInfo.images.length) {
        $('#popupItemImg').attr('src', apiBase + '/image/' + itemInfo.images[0]);
        for (let i = 0; i < itemInfo.images.length; i++) {
            const $li = $('<li>').addClass('pop-item-pics');
            if (i == 0) $li.addClass('pop-item-pics--focus');
            const $img = $('<img>').attr('src', apiBase + '/image/' + itemInfo.images[i]);
            $li.append($img);
            $li.click(function () {
                $('.pop-item-pics--focus').removeClass('pop-item-pics--focus');
                $(this).addClass('pop-item-pics--focus');
                $('#popupItemImg').attr('src', $(this).children('img').attr('src'));
            })
            $('.pop-item-image-thumb').append($li);
        }
    }
    else {
        $('#popupItemImg').attr('src', '../images/no-picture.jpg');
        const $li = $('<li>').addClass('pop-item-pics').addClass('pop-item-pics--focus');
        const $img = $('<img>').attr('src', '../images/no-picture.jpg');
        $li.append($img);
        $('.pop-item-image-thumb').append($li);
    }
    $('#popupItemImg').click(function () {
        // $('#body-cover').fadeIn(300);
        // $('#body-cover').one('click', function () {
        //     $('#body-cover').fadeOut(300).empty();
        // });
        // const $newImgContainer = $('<div class="full-screen-container"></div>')
        // const $newImg = $('<img>');
        // $newImg.attr('src', this.src);
        // $newImgContainer.append($newImg);
        // $('#body-cover').append($newImgContainer);
    })
    $('#panelName').text(itemInfo.name);
    $('#panelDescription').text(itemInfo.description);
    $('#panelPrice').text(itemInfo.price == 0 ? '免费' : '¥' + itemInfo.price);
    $('#panelDuration').text(itemInfo.duration / 86400 + '天');
    $('#panelOwner').text(GetUserInfo(itemInfo.owner_id).nickName);
    $('#panelLocation').text(itemInfo.location.locationDescription);

    //按钮
    $('#panelChat').click(() => {
        swal('', '打个招呼吧？例如：用途、自我介绍等等', {
            content: {
                element: "input",
                attributes: {
                  type: "text",
                },
            },
        }).then((value) => {
            if (value) {
                if (client.connected) {
                    let chatBody = {
                        to: uid,
                        message: value,
                        associatedItemId: itemId
                    };
                    client.send('/chat/send', {}, JSON.stringify(chatBody));
                    //@此处暂时不申请，只交流
                    // LaunchBorrow (itemId);
                    layer.msg('已发送消息，请等待对方回复', {
                        time: 2500
                    });
                }
                else {
                    swal('发送失败', '聊天连接异常断开，请刷新重试', 'error');
                }
            }
        })
    })
    $('#panelApply').click(() => {
        swal('确认直接申请？', '', 'info', {
            buttons: ['先交流', '确认']
        }).then((value) => {
            if (value) LaunchBorrow (itemId);
        })
    });


    //处理地图
    const lon = itemInfo.location.longitude;
    const lat = itemInfo.location.latitude;
    var mapObj = new AMap.Map('panel-map-container', {
        zoom: 16,
        center: [lon, lat],
        dragEnable: false,
        scrollWheel: false
    });
    //地图坐标标记
    var marker = new AMap.Marker({
        position: [lon, lat]
    })
    mapObj.add(marker);
    //地图控制条
    mapObj.plugin(["AMap.ToolBar"],function(){
        var tool = new AMap.ToolBar({
            liteStyle: true,
            // locate: true,
        });
        mapObj.addControl(tool);    
    });
    mapObj.on('complete', function () {
        console.log('itemAlert地图加载完成');
        $('.popup-shade').hide();
    });

    //加载评论
    LoadRemark (itemId);
}

function LoadRemark (itemId)
{
    $('#panelSendRemark').click(() => {
        if ($('#panelAddRemark').val().trim() != '')
            SendRemark($('#panelAddRemark').val());
    });
    $.ajax({
        type: 'GET',
        url: apiBase + '/item/' + itemId + '/comment?page=0&num=100',
        headers: {
            Authorization: AuthorizationText ()
        },
        success: function (res) {
            FillRemark (res);
        },
        error: function (xhr) {
            swal('获取评论失败', xhr.status + '错误', 'error');
        }
    });

    function FillRemark (data)
    {
        if (data.length == 0) {
            $('.popup-item-panel__ft').append('<span class="remark-none">没有评论</span>')
            return;
        }
        let myUid;
        if (AuthorizationText () != ' ') 
            myUid = GetUserInfo().user_id;
        const remarkHTML = `
        <div class="panel-remark__hd">
            <img src="" alt="">
            <span class="remark-username"></span>
            <i class="fa fa-thumbs-o-up" aria-hidden="true"></i>
        </div>
        <p class="remark-body"></p>
        <div class="remark-op">
            <span class="remark-op__item remark-report">举报</span>
        </div>`;

        function AddRemark (i) {
            const $li = $('<li>').addClass('panel-remark');
            $li.html(remarkHTML);
            $li.data('rid', data[i].id);
            $li.find('.remark-username').text(GetUserInfo(data[i].userId).nickName);
            $li.find('.remark-body').text(data[i].content);
            if (data[i].userId == myUid) {
                const $deleteBtn = $('<span class="remark-op__item remark-delete">删除</span>').click(function () {
                    DeleteRemark (itemId, $(this.parentNode.parentNode));
                });
                $li.addClass('panel-remark--me');
                $li.find('.remark-op').empty().html($deleteBtn);
            }
            $li.find('.remark-report').click(function () {
                localStorage.setItem('reportRemark',  $(this.parentNode.parentNode).data('rid'));
                alert('举报成功');//@玩梗
            })
            $('.popup-item-panel__ft').append($li);
        }

        function ExpandRemarkBox () {
            $(this).remove();
            $('.popup-item-panel__ft').addClass('popup-item-panel__ft--open');
            for (let i = 2; i < data.length; i++) {
                AddRemark (i);
            }
            //close button
            const $close = $('<span>[x]</span>');
            $close.css({'position': 'absolute', 'right': '15px', 'cursor': 'pointer'})
                .click(function () {
                    $(this).remove();
                    $('.popup-item-panel__ft--open').removeClass('popup-item-panel__ft--open');
                    $('.panel-remark').remove();
                    AddRemark (0);AddRemark (1);
                    $('.popup-item-panel__ft').append('<a class="remark-more">查看更多</a>');
                    $('.remark-more').click(ExpandRemarkBox);
                });
            $('.remark-title').append($close);
        }

        for (let i = 0; i < (data.length < 2 ? data.length : 2); i++) {
            AddRemark (i);
        }
        if (data.length >= 2) {
            $('.popup-item-panel__ft').append('<a class="remark-more">查看更多</a>');
            $('.remark-more').click(ExpandRemarkBox);
        }
    }
    
    function DeleteRemark (itemId, $remarkEle)
    {
        const rid = $remarkEle.data('rid');
        console.log(rid)
        $.ajax({
            type: 'DELETE',
            url: `${apiBase}/item/${itemId}/comment/${rid}`,
            headers: {
                Authorization: AuthorizationText ()
            },
            success: function (res) {
                if (res.code == 0) {
                    $remarkEle.remove();
                    layer.msg('删除评论成功', {
                        time: 2000
                    });
                }
                else {
                    swal('删除评论失败', '服务器内部错误', 'error');
                }
            },
            error: function (xhr) {
                swal('删除评论失败', xhr.status + '错误', 'error');
            }
        })
    }

    function SendRemark (remark)
    {
        $.ajax({
            type: 'POST',
            url: `${apiBase}/item/${itemId}/comment/`,
            headers: {
                Authorization: AuthorizationText ()
            },
            contentType: 'application/json',
            data: JSON.stringify({content: remark}),
            success: function (res) {
                if (res.code == 0) {
                    layer.msg('发布评论成功', {
                        time: 1500
                    });
                    $('.panel-remark').remove();
                    $('popup-item-panel__ft').append($('.remark-more'));
                    LoadRemark (itemId);
                    $('#panelAddRemark').val('');
                }
                else {
                    swal('发布评论失败', '服务器内部错误', 'error');
                }
            },
            error: function (xhr) {
                if (xhr.status == 401)
                    PromptLogin ();
                else
                    swal('发布评论失败', xhr.status + '错误', 'error');
            }
        })
    }
}

// =============实名认证部分==============
function CheckCertification ()
{
    $.ajax({
        type: "GET",
        url: apiBase + "/user/identity/" + userInfo.uid,
        headers: {
            Authorization: AuthorizationText ()
        },
        success: (res) => {
            if (res.fzuVerified)
                $('#certificationState').text('已实名认证');
            else {
                $('#certificationState').text('未实名认证！')
                    .css('text-decoration', 'underline').click(CertAlertInit);
                CertAlertInit ();
            }
        },
        error: (xhr) => {
            console.log('获取实名认证失败：' + xhr.status);
        }
    })
}

function CertAlertInit ()
{
    const itemHTML = `
    <div id="certAlert">
        <p class="cert-title">请输入福大教务处账号密码<br>以完成实名认证</p>
        <div class="cert-input-group">
            <span>账号</span> 
            <input type="text" id="certAccount">
        </div>
        <div class="cert-input-group">
            <span>密码</span> 
            <input type="password" id="certPass">
        </div>
        <input type="button" value="提交" id="certBtn">
    </div>`;
    layer.open({
        type: 1,
        area: ['400px', '300px'],
        title: '实名认证',
        content: itemHTML,
        zIndex: 5,
        success: function () {
            $('#certBtn').click(() => {
                $.ajax({
                    type: 'POST',
                    url: apiBase + '/user/identity/verifyFzu',
                    headers: {
                        Authorization: AuthorizationText ()
                    },
                    data: {
                        "fzuNumber": $('#certAccount').val(),
                        "fzuPassword": $('#certPass').val()
                    },
                    success: (res) => {
                        if (res.data == 0) {
                            swal('实名认证通过！', '欢迎你，' + res.data.fzuName + '同学', 'success')
                            $('#certificationState').text('已完成认证');
                        }
                        else
                            swal('实名认证失败', '错误码：' + res.code, 'warning');
                    },
                    error: (xhr) => {
                        swal('实名认证失败', xhr.status + '错误', 'error');
                    }
                })
            })
        }
    })
}