/**
 * 发起弹窗相关
 */

$('#share-require__btn').click(function () {
    $('.l-alert-box-lend').eq(0).show();
    $('#l-body-cover').show();
    $('.l-content, .l-sidebar').css('filter', 'blur(5px)')
    //加载地图
    var map = new AMap.Map('lend-map',{
        zoom:16,
    });
    AMapUI.loadUI(['misc/PositionPicker'], function(PositionPicker) {
        AMap.plugin(['AMap.Geolocation'], function(){
            // 在图面添加定位控件，用来获取和展示用户主机所在的经纬度位置
            map.addControl(new AMap.Geolocation());
        });
        var positionPicker = new PositionPicker({
            mode:'dragMap',//设定为拖拽地图模式，可选'dragMap'、'dragMarker'，默认为'dragMap'
            map:map//依赖地图对象
        });
        positionPicker.start(map.getBounds().getSouthWest());
        map.on('complete', function () {
            console.log('地图加载完成');
        });
        positionPicker.on('success', function (positionResult) {
            console.log(positionResult.position);
            $('#lend-map-position-txt').text("【" + positionResult.address + "】");
        });
    });
    $('#lend-launch__hd button').click(function () {
        $('.l-content, .l-sidebar').css('filter', '')
        $('#l-body-cover').hide();
        $('.l-alert-box-lend').eq(0).hide();
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
    
})