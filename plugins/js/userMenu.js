/*
* Copyright Dimitar Georgiev 2016
* dimitar.georgiev.du@gmail.com
* */
plugins.userMenu = (function(){
    var configMap = {login_html : String() +
                    '<div id="login-form"><form method="post" id="loginForm">' +
                        '<ul>' +
                            '<li>' +
                                '<div class="flex-row" id="error-message"></div>' +
                            '</li>' +
                            '<li>' +
                                '<div class="flex-row">' +
                                    '<div class="row-label">' +
                                        '<label for="username"><span class="glyphicon glyphicon-user label-span"></span></label>' +
                                    '</div>' +
                                    '<div class="row-input">' +
                                        '<input id="username" name="username" class="plugin-input" type="email" placeholder="Username" required/>' +
                                    '</div>' +
                                '</div>' +
                            '</li>' +
                            '<li>' +
                                '<div class="flex-row">' +
                                    '<div class="row-label">' +
                                        '<label for="password"><span class="glyphicon glyphicon-lock label-span"></span></label>' +
                                    '</div>' +
                                    '<div class="row-input">' +
                                        '<input id="password" name="password" class="plugin-input" type="password" placeholder="Password" required/>' +
                                    '</div>' +
                                '</div>' +
                            '</li>' +
                            '<li>' +
                                '<div class="flex-row login-submit">' +
                                    '<button id="login-submit" type="submit"><i class="glyphicon glyphicon-log-in"></i>&nbsp;&nbsp;Login</button>' +
                                '</div>' +
                            '</li>' +
                        '</ul>' +
                    '</form></div>',
                     logged_html : '<div class="flex-row login-submit"><button id="account-button"><i class="glyphicon glyphicon-user"></i>&nbsp;&nbsp;My Account</button></div>' +
                                   '<div class="flex-row login-submit"><button id="logout-button"><i class="glyphicon glyphicon-log-out"></i>&nbsp;&nbsp;Logout</button></div>',
                     logout_html : '',
                     menu_extend_time : 800,
                     menu_retract_time : 500,
                     menu_ht_extended : 220,
                     menu_ht_retracted : 0,
                     menu_extended_label : 'Click to retract',
                     menu_retracted_label : 'Click to extend'
    };
    var stateMap = {$container : null,
                    button : null,
                    is_logged_in : null,
                    is_retracted : true,
                    error_message: false,
                    menu_ht_error_message: 0
    };
    var jqueryMap = {};

    var setJQueryMap = function(){
        var $container = stateMap.$container;
        var button = stateMap.button;
        jqueryMap = {$container : $container,
                     button : button
        };
    };
    var toggleMenu = function(do_extend){
        //if(stateMap.error_message){
            //stateMap.menu_ht_error_message = $("#error-message").height();
        //}
        var menu_ht_px = jqueryMap.$container.height();
        var is_menu_open = menu_ht_px === (configMap.menu_ht_extended - 2 + stateMap.menu_ht_error_message); //subtract 2 because of the border
        var is_menu_closed = menu_ht_px === configMap.menu_ht_retracted;
        var is_sliding = !is_menu_open && !is_menu_closed;

        if(is_sliding){
            return false;
        }
        if(do_extend){
            jqueryMap.$container.animate({height : configMap.menu_ht_extended}, configMap.menu_extend_time, function(){
                jqueryMap.button.attr('title', configMap.menu_extended_label);
                stateMap.is_retracted = false;
                if(stateMap.is_logged_in === 'Login'){
                    jqueryMap.$container.html(configMap.login_html);
                }else{
                    jqueryMap.$container.html(configMap.logged_html);
                }
            });
            return true;
        }
        jqueryMap.$container.animate({height : configMap.menu_ht_retracted}, configMap.menu_retract_time, function(){
            jqueryMap.button.attr('title', configMap.menu_retracted_label);
            stateMap.is_retracted = true;
            jqueryMap.$container.html('');
            stateMap.menu_ht_error_message = 0;
        });
        return true;
    };
    var onClick = function(event){
        toggleMenu(stateMap.is_retracted);
        return false;
    };
    var login = function(){
        $(document).on("submit", "#loginForm", function(){ //Event is attached to the document because form is loaded later on the page
            //Using done() instead of success: function(result){} because success is deprecated
            $.ajax({
                type: "POST",
                url: "../plugins/tempFunctionality/account.php",
                cache: false,
                data: {
                    username: $("#username").val(),
                    password: $("#password").val()
                    //id_correo_electronico: $("#id_correo_electronico").val(),
                    //id_password: $("#id_password").val()
                }}).done(function(msg){
                    //alert(msg);
                    if($.trim(msg) === "SuccessfulLogin"){ //Without trim() comparison fails
                        window.location.href = "index.php";
                    }else{
                        $("#loginForm").trigger("reset");

                        $("#error-message").show().html("Wrong Username / Password");
                        stateMap.menu_ht_error_message = $("#error-message").outerHeight(true);
                        var menu_ht_recalculated = configMap.menu_ht_extended + stateMap.menu_ht_error_message;
                        jqueryMap.$container.css("height", menu_ht_recalculated);
                        stateMap.error_message = true; //currently not in use
                        //alert($("#error-message").height());
                    }
            });
            return false;
        });
    };
    var logout = function(){
        $(document).on("click", "#logout-button", function(){
            $.ajax({
                type: "POST",
                url: "../plugins/tempFunctionality/account.php",
                cache: false,
                data: {action: "logout"}
            }).done(function(msg){
                if($.trim(msg) === "SuccessfulLogout"){
                    window.location.href = "index.php";
                }
            });
        });
    };
    var myAccount = function(){
        $(document).on("click", "#account-button", function(){
            window.location.href = "login.php";
        });
    };
    var initModule = function($container, button, is_logged_in){
        stateMap.$container = $container;
        stateMap.button = button;
        stateMap.is_logged_in = is_logged_in;
        //$container.html(configMap.main_html);
        setJQueryMap();
        //setTimeout(function(){toggleMenu(true)}, 3000);
        //setTimeout(function(){toggleMenu(false)}, 8000);
        stateMap.is_retracted = true;
        jqueryMap.button.attr('title', configMap.menu_retracted_label).click(onClick);
        login();
        logout();
        myAccount();
    };
    return {initModule : initModule};
}());