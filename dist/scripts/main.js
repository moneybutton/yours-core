(function(){$(function(){$("a[href*=#]:not([href=#])").click(function(){var e;return location.pathname.replace(/^\//,"")===this.pathname.replace(/^\//,"")&&location.hostname===this.hostname&&(e=$(this.hash),e=e.length?e:$("[name="+this.hash.slice(1)+"]"),e.length)?($("html,body").animate({scrollTop:e.offset().top},{duration:1e3,queue:!1}),!1):void 0})}),$(document).ready(function(){return $(".screen").css("min-height",$(window).outerHeight()),$(".cell").css("opacity",1),$(".question span").click(function(){var e;return e=$(this).parent().find("p").outerHeight(),$(".answer").css("height",0),0===$(this).parent().find(".answer").outerHeight()?$(this).parent().find(".answer").css("height",e):$(this).parent().find(".answer").css("height",0)})}),$(window).scroll(function(){return $(window).width()>600?$(".screen.hero").css("background-position","center "+$(window).scrollTop()/4*-1+"px"):void 0}),$(window).resize(function(){return $(".screen").css("min-height",$(window).outerHeight()),$(".answer").css("height",0)})}).call(this);