// https://www.cnblogs.com/dj3839/p/6027417.html
function FileChange (event) {
    let files = event.target.files;
    if (files && files.length > 0) {
        // 获取目前上传的文件
        let file = files[0];// 文件大小校验的动作
        if(file.size > 1024 * 1024 * 5) {
            alert('图片大小不能超过 5MB!');
            return false;
        }
        // 获取 window 的 URL 工具
        var URL = window.URL || window.webkitURL;
        // 通过 file 生成目标 url
        var imgURL = URL.createObjectURL(file);
        //用attr将img的src属性改成获得的url
        $("#img-change").attr("src",imgURL);
        // 使用下面这句可以在内存中释放对此 url 的伺服，跑了之后那个 URL 就无效了
        // URL.revokeObjectURL(imgURL);
    }
};


// https://blog.csdn.net/tangxiujiang/article/details/78693890
$('#lend-img-unload').on('change',function(){
    console.log($(this)[0].files);
    let filePath = $(this).val(), //获取到input的value，里面是文件的路径
        fileFormat = filePath.substring(filePath.lastIndexOf(".")).toLowerCase(),
        src = window.URL.createObjectURL(this.files[0]); //转成可以在本地预览的格式
    // 检查是否是图片
    if( !fileFormat.match(/.png|.jpg|.jpeg/) ) {
        error_prompt_alert('上传错误,文件格式必须为：png/jpg/jpeg');
        return;  
    }
    $('#lend-img').attr('src',src);
});