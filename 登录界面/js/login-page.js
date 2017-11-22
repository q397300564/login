
var login = {
    init: function(){
        this.$login = $('#login')
        this.$loginBtn = this.$login.find('#login-btn');　 
        this.$refresh = this.$login.find('.check-code>a>img');
        this.$showHide = this.$login.find('#show-hide');
        this.$password = this.$login.find('#login-password');
        this.$username = this.$login.find('#login-username');
        this.$checkcode = this.$login.find('#login-checkcode');

        this.$img = this.$login.find('#login_checkcode_image');
        this.$wrapBomb = this.$login.find('.bomb-block');
        this.$bomb = this.$login.find('.bomb-block>span');
        this.refresh_timer = null; // 刷新时间

        this.submiting_flag = false; // 提交标志
        this.form_data = {};  // 表单数据

        //  判断账户的正则表达式
        this.$isTel = /^\d{11}$/i;  // 手机
        this.$isCel = /^0\d{2,3}(\-)?\d{7,8}$/i;　　// 电话
        this.$isId = /^\d{14}(\d{3})?[0-9a-z]$/i;　　// 　身份证
        this.$isCheckcode = /^[0-9a-z]{4}$/i;    // 验证码

        this.login_errinfo = {
            '4100':'服务器繁忙，登录失败',
            '4101':'登录账户错误',
            '4102':'登录密码出错',
            '4103':'账户不存在',
            '4104':'账户已禁用',
            '4105':'验证码错误'
        }

        this.Event();
    },
    Event: function(){
        var _this = this;
        // 点击刷新验证码
        this.$refresh.on('click', function(){
            _this.refresh_checkcode_image();
        });
        // 点击提交数据
        this.$loginBtn.on('click', function(){
            //　第一步先判断是否提交
            if(_this.submiting_flag){
                return false;
            }
            // 拿到表单数据
            var form_data = _this.check_form_data(); // 表单数据
            console.log(form_data);
            // 发送 ajax 给服务器　判断返回值。
            
            if( form_data ){
                _this.submiting_flag = true; // 提交的时候
                $.ajax({
                    url: 'http://xman.ubody.net/basic/login',
                    method: 'post',
                    dataType: 'json',
                    data: form_data,
                    success: function(res){
                        _this.submiting_flag = false;
                        _this.platform_login_headler(res); // 平台登录处理
                    },
                    error: function(){
                        alert('请求错误');
                    }
                });
            }

        });
        // 点击显示密码和隐藏密码
        this.$showHide.on('click', function(){
            if($(this).attr('class').indexOf('icon-biyan') > -1){   // 如果没有这个类的话执行这个
                $(this).removeClass('icon-biyan');
                $(this).addClass('icon-eye-copy');
                _this.$password.attr('type', 'text');
            }else{
                $(this).removeClass('icon-eye-copy');
                $(this).addClass('icon-biyan');
                _this.$password.attr('type', 'password');
            }
        });
    },
    check_form_data: function(){
        var _this = this;
        // 如何查询表单数据
        // 1.判断是否正在提交数据
        if(this.submiting_flag){
            return false;
        }
        // 账户
        var username = $.trim(this.$username.val());
        if( String(username) === ''){
            this.$bomb.text('请输入登录账户');
            this.$wrapBomb.removeClass('bomb-hide');
            this.referesh_timer = setTimeout(function(){
                clearTimeout(_this.refresh_timer);
                _this.refresh_timer = null;
                _this.$wrapBomb.addClass('bomb-hide');
            }, 3000 );
            return false;
        }
        if( !this.$isTel.test(username) && !this.$isCel.test(username) && !this.$isId.test(username)){
            this.$bomb.text('登录账号为手机号码，座机号码或身份证号码');
            return false;
        }
        this.form_data['username'] = username;

        // 密码
        var password = $.trim(this.$password.val());
        if( String(password) === ''){
            this.$bomb.text('请输入登录密码');
            this.$wrapBomb.removeClass('bomb-hide');
            this.referesh_timer = setTimeout(function(){
                clearTimeout(_this.refresh_timer);
                _this.refresh_timer = null;
                _this.$wrapBomb.addClass('bomb-hide');
            }, 3000 );
            return false;
        }

        this.form_data['password'] = md5(password);

        // 验证码
        var checkcode = $.trim(this.$checkcode.val()); // 清除空格
        if(String(checkcode) === ''){
            this.$bomb.text('请输入验证码');
            this.$wrapBomb.removeClass('bomb-hide');
            this.referesh_timer = setTimeout(function(){
                clearTimeout(_this.refresh_timer);
                _this.refresh_timer = null;
                _this.$wrapBomb.addClass('bomb-hide');
            }, 3000 );
            return false;
        }

        if(!this.$isCheckcode.test(checkcode)){
            this.$bomb.text('验证码错误，请重新输入');
            this.$wrapBomb.removeClass('bomb-hide');
            this.referesh_timer = setTimeout(function(){
                clearTimeout(_this.refresh_timer);
                _this.refresh_timer = null;
                _this.$wrapBomb.addClass('bomb-hide');
            }, 3000 );
            return false;
        }

        this.form_data['checkcode'] = checkcode;

        return this.form_data;

    },

    platform_login_headler: function(res){
        // 判断如果成功
        if(String(res.errcode) === '0'){
            this.$bomb.text('登录成功，正在跳转');
            this.$wrapBomb.removeClass('bomb-hide');
            this.referesh_timer = setTimeout(function(){
                clearTimeout(_this.refresh_timer);
                _this.refresh_timer = null;
                _this.$wrapBomb.addClass('bomb-hide');
            }, 3000 );

            var username = res.data.username;
            var authkey = res.data.authkey;

            var date = new Date(); // 现在时间
            var expiresDays = 30;　// 30天后

            date.setTime = (date.getTime() + expiresDays*24*60*60*1000);
            $.fn.cookie('login_username', username, {'expires': data.toString(), 'path':'/'});
            // 跳转页面
            window.location.href = "http://m.ubody.net/Home/Index/login?authkey=" + authkey;
        }else if(String(res.errcode) === '4101' || String(res.errcode) === '4102' || String(res.errcode) === '4103' || String(res.errcode) === '4104'
            || String(res.errcode) === '4100' || String(res.errcode) === '4105'){
            // 调用刷新验证码
            this.$img.attr('src', 'http://img.ubody.nerverify.php?biztype=login&ts='+(new Date()).getTime());
            // 弹出框显示
            this.$bomb.text(this.login_errinfo[res.errcode]);
            this.$wrapBomb.removeClass('bomb-hide');
            this.referesh_timer = setTimeout(function(){
                clearTimeout(_this.refresh_timer);
                _this.refresh_timer = null;
                _this.$wrapBomb.addClass('bomb-hide');
            }, 3000 );
        }
    },
    refresh_checkcode_image: function(){
        var _this = this;
        if(this.refresh_timer != null){
            this.$wrapBomb.removeClass('bomb-hide');
            this.$bomb.text('刷新验证码太快，请３秒后重试');
            return false;
        }
        this.$img.attr('src', 'http://img.ubody.net/verify.php?biztype=login&ts='+(new Date()).getTime());
        // new Date() 获取事件字符串，getTime() 把字符转换成时间戳
        this.refresh_timer = setTimeout( function(){
            clearTimeout(_this.refresh_timer);
            _this.refresh_timer = null;
            _this.$wrapBomb.addClass('bomb-hide');
        }, 3000);
    }
}

login.init();