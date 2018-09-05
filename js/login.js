"use strict";

let isLegalEmail = 0,isLegalPass = 0,isLegalName = 0;

//注册登录按钮
$('#reg-btn').click(function () {
        //no data-checking here
        const username = $('#reg-username').val();
        const password = $('#reg-pass').val();
        const email = $('#reg-email').val();
        Register (username, password, email);
});
$('#login-btn').click(function () {
        //no data-checking here
        const username = $('#login-account').val();
        const password = $('#login-pass').val();
        Login (username, password);
})

// 用户填写内容实时检查
$('#reg-username').blur(function () {
    if (this.value) {
        CheckUsername (this.value);
    }
    RegisterBtnUnlock ();
});
$('#reg-pass').blur(function () {
    CheckPassword (this.value);
    RegisterBtnUnlock ();
})
$('#reg-pass-2').blur(function () {
    if (this.value == $('#reg-pass').val()) {
        $('#reg-pass-2').css("border", "2px solid green");
        $('#reg-tips__password2').hide();
    }
    else {
        $('#reg-pass-2').css("border", "2px solid #b13e3c");
        $('#reg-tips__password2').html("密码不一致<br>");
        $('#reg-tips__password2').show();
    }
    RegisterBtnUnlock ();
})
$('#reg-email').blur(function () {
    if (this.value) {
        CheckEmail (this.value);
    }
    RegisterBtnUnlock ();
});

// 注册登录选择切换
$('#share-choose-login').click(function () {
    $('.share-account__register').hide();
    $('.share-account__login').show();
    $('#login-account').focus();
    $('#share-choose-login').addClass('share-choose-login-reg__span--act');
    $('#share-choose-register').removeClass('share-choose-login-reg__span--act');
})
$('#share-choose-register').click(function () {
    $('.share-account__register').show();
    $('.share-account__login').hide();
    $('#reg-username').focus();
    $('#share-choose-register').addClass('share-choose-login-reg__span--act');
    $('#share-choose-login').removeClass('share-choose-login-reg__span--act');
})

//确认键登录/注册
$('#login-pass').keypress(function (e) {
    if (e.keyCode == "13") 
        $('#login-btn').click();
});
$('#reg-pass-2').keypress(function (e) {
    if (e.keyCode == "13") 
        $('#reg-btn').click();
});

//登录提示文字消除
$('.share-account__login').click(function () {
    $('#login-tips').hide();
})


function CheckUsername (username)
{
    $('#reg-username').css("border", "2px solid #b13e3c");
    $.ajax ({
        type: "GET",
        url: apiBase + "/user/checkUsernameAvailability",
        data: {
            username: username
        },
        //@any problems above?
        dataType: "json",
        success: function (res) {
            console.log(res);
            if (res.code == 0) {
                isLegalName = 1;
                $('#reg-username').css("border", "2px solid green");
                $('#reg-tips__username').hide();
            }
            else {
                isLegalName = 0;
                $('#reg-tips__username').html(res.data.message + '<br>');
                $('#reg-tips__username').show();
            }
        },
        error: function (xhr) {
            if (xhr.status == 500) {
                isLegalName = 0;
                $('#reg-tips__username').html('长度限制3-15<br>');
                $('#reg-tips__username').show();
            }
            else {
                alert('其他错误，status:' + xhr.status)
            }
        }
    })
}

function CheckEmail (email)
{
	//!!当email为空的时候该接口认为*合法*
    $('#reg-email').css("border", "2px solid #b13e3c");
    $.ajax ({
        type: "GET",
        url: apiBase + "/user/checkEmailAvailability",
        data: {
            email: email
        },
        //@any problems above?
        dataType: "json",
        success: function (res) {
            console.log(res);
            if (res.code == 0) {
            	isLegalEmail = 1;
                $('#reg-email').css("border", "2px solid green");
                $('#reg-tips__email').hide();
            }
            else {
                isLegalEmail = 0;
                $('#reg-tips__email').html(res.data.message + '<br>');
                $('#reg-tips__email').show();
            }
        },
        error: function (xhr) {
        	if (xhr.status == 500) {
                isLegalEmail = 0;
                $('#reg-tips__email').html('邮箱地址格式有误<br>');
                debugger;
                $('#reg-tips__email').show();
        	}
        	else {
	        	alert('其他错误，status:' + xhr.status)
        	}
        }
    })
}

function CheckPassword (password)
{
    let errMsg;
    if (password.length < 3 || password.length > 15) {
        errMsg = "长度限制3-15";
    }
    //@other checks
    if (!errMsg) {
    	isLegalPass = 1;
        $('#reg-pass').css("border", "2px solid green");
        $('#reg-tips__password').hide();
    }
    else {
    	isLegalPass = 0;
        $('#reg-pass').css("border", "2px solid #b13e3c");
        $('#reg-tips__password').html(errMsg + '<br>');
        $('#reg-tips__password').show();
    }
}

function RegisterBtnUnlock ()
{
    if (isLegalName && isLegalPass && isLegalEmail && 
        $('#reg-pass').val() == $('#reg-pass-2').val()) {
            $('#reg-btn').attr("disabled",false);
    }
}

function Register (username, password, email)
{
    $('#reg-btn').text('注册中...');
    const regInfo = `{
        "username": "${username}",
        "password": "${password}", 
        "email": "${email}", 
        "details": {} 
    }`;
    $.ajax ({
        type: "POST",
        url: apiBase + "/auth/signup",
        contentType: "application/json",
        dataType: "json",
        // async: false,
        // processData: false,
        data: regInfo,
        success: function (res) {
            $('#reg-btn').text('注册');
            if (res.code == 0) {
                alert('注册成功！请牢记账号密码\n' + '账号：' + username + '\n密码：' + password);
                Login (username, password);
            }
            else {
                $('#reg-btn').text('注册');
                alert(res.data.reason);
            }
        },
        error: function (xhr) {alert('注册出现错误，status:' + xhr.status)}
    })
}

function Login (username, password)
{
    $('#login-btn').text('登录中...');
    $.ajax ({
        type: "POST",
        url: apiBase + "/auth/login",
        contentType: "application/json",
        dataType: "json",
        data: `{
            "usernameOrEmail": "${username}",
            "password": "${password}"
        }`,
        success: function (res) {
            $('#login-btn').text('登录');
            $('#login-tips').hide();
            alert('登陆成功');
            setCookie("accessToken", res.data.accessToken);
            setCookie("tokenType", res.data.tokenType);
            HideLoginSidebar ();
            $('#share-user-info__name').text(username);
        },
        error: function (xhr) {
            $('#login-btn').text('登录');
            if (xhr.status == 401) {
                $('#login-tips').html("密码错误<br>");
                $('#login-tips').show();
            }
            else if (xhr.status == 400) {
                $('#login-tips').html("账号密码未填写完整<br>");
                $('#login-tips').show();
            }
            else {
                $('#login-tips').html(xhr.status + "错误<br>");
                $('#login-tips').show();
            }
        }
    })
}

function Logout ()
{
    setCookie("accessToken", "");
    setCookie("tokenType", "");
    location.reload();
}

function ShowLoginSidebar () {
    $('.l-sidebar--nor').animate({left: '-100%'}, 300);
    $('.l-sidebar--account').show().animate({left: '0'}, 300, function () {
        $('#login-account').focus();
    });
}
function HideLoginSidebar () {
    $('.l-sidebar--nor').animate({left: '0'}, 300);
    $('.l-sidebar--account').animate({left: '100%'}, 300, function () {
        $('.l-sidebar--account').hide();
    });
}