"use strict";

let isLegalEmail = 0,isLegalPass = 0,isLegalName = 0;

//退出登录按钮
$('#share-btn-logout').click(() => {
    swal('确认退出？', '退出了你在本网站啥也干不了呢', 'info', {
        buttons: ['留下', '退出'],
        dangerMode: true
    }).then((value) => {
        if (value) {
            setCookie("accessToken", "");
            setCookie("tokenType", "");
            location.reload();
        }
    })
})

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

//忘记密码
$('.account-forget').click(function () {
    swal('请联系开发者', 'qq791551236', 'info');
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
        $('#reg-pass-2').css("background", "#98ff98");
        $('#reg-tips__password2').hide();
    }
    else {
        $('#reg-pass-2').css("background", "#ffd3d3");
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
    $('.share-account__register').fadeOut(200, () => {
        $('.share-account__login').fadeIn(200);
        $('#login-account').focus();
    });
    $('#share-choose-login').addClass('share-choose-login-reg__item--act');
    $('#share-choose-register').removeClass('share-choose-login-reg__item--act');
})
$('#share-choose-register').click(function () {
    $('.share-account__login').fadeOut(200, () => {
        $('.share-account__register').fadeIn(200);
        $('#reg-username').focus();
    });
    $('#share-choose-register').addClass('share-choose-login-reg__item--act');
    $('#share-choose-login').removeClass('share-choose-login-reg__item--act');
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
    $('#reg-username').css("background", "#ffd3d3");
    $.ajax ({
        type: "GET",
        url: apiBase + "/user/checkUsernameAvailability",
        data: {
            username: username
        },
        dataType: "json",
        success: function (res) {
            if (res.code == 0) {
                isLegalName = 1;
                $('#reg-username').css("background", "#98ff98");
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
                $('#reg-tips__username').html('长度限制为3-15<br>');
                $('#reg-tips__username').show();
            }
            else {
                swal("网络错误", xhr.status+ "错误", "error");
            }
        }
    })
}

function CheckEmail (email)
{
	//!!当email为空的时候该接口认为*合法*
    $('#reg-email').css("background", "#ffd3d3");
    $.ajax ({
        type: "GET",
        url: apiBase + "/user/checkEmailAvailability",
        data: {
            email: email
        },
        dataType: "json",
        success: function (res) {
            if (res.code == 0) {
            	isLegalEmail = 1;
                $('#reg-email').css("background", "#98ff98");
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
                $('#reg-tips__email').show();
        	}
        	else {
                swal("网络错误", xhr.status+ "错误", "error");                
        	}
        }
    })
}

function CheckPassword (password)
{
    let errMsg;
    if (password.length < 6 || password.length > 20) {
        errMsg = "长度限制6-20";
    }
    if (!errMsg) {
    	isLegalPass = 1;
        $('#reg-pass').css("background", "#98ff98");
        $('#reg-tips__password').hide();
    }
    else {
    	isLegalPass = 0;
        $('#reg-pass').css("background", "#ffd3d3");
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
        data: regInfo,
        success: function (res) {
            $('#reg-btn').text('注册');
            if (res.code == 0) {
                swal("注册成功", `账号:${username}\n密码:${password}\n请牢记`, "success").then(() => {
                    Login (username, password);
                })
            }
            else {
                $('#reg-btn').text('注册');
                swal("出现错误", res.data.reason, "error");
            }
        },
        error: function (xhr) {
            swal("注册失败", xhr.status + "错误", "error");            
        }
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
            swal("登陆成功", "欢迎" + username, "success", {
                timer: 1800,
                buttons: false
            });
            $('#login-btn').text('登录');
            $('#login-tips').hide();
            setCookie("accessToken", res.data.accessToken);
            setCookie("tokenType", res.data.tokenType);
            userInfo.uid = GetUserInfo().user_id;
            HideLoginSidebar ();
            //检查实名认证
            CheckCertification ();
            $('#share-user-info__name').text(username)
                .attr('title', '查看/修改用户信息')
                .unbind('click')
                .click(function () {
                    $('.l-sidebar--info').fadeIn(500);
                    $('.l-sidebar--nor').css('filter', 'blur(3px)');
                    LoadUserInfoEdit ();
                });
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

let logoCycle;
function ShowLoginSidebar () {
    $('.l-sidebar--nor').animate({left: '-100%'}, 300);
    $('.l-sidebar--account').show().animate({left: '0'}, 300, function () {
        $('#login-account').focus();
    });
    let i = 0;
    logoCycle = setInterval(() => {
        $('#share-logo__img').css('transform', 'rotate3d(0, 1, 0, ' + i++ + 'deg)');
    }, 30);
}
function HideLoginSidebar () {
    $('.l-sidebar--nor').animate({left: '0'}, 300);
    $('.l-sidebar--account').animate({left: '100%'}, 300, function () {
        $('.l-sidebar--account').hide();
    });
    clearInterval(logoCycle);
}

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
    });
}