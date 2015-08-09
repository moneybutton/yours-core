$ ->
  $('a[href*=#]:not([href=#])').click ->
    if location.pathname.replace(/^\//, '') == @pathname.replace(/^\//, '') and location.hostname == @hostname
      target = $(@hash)
      target = if target.length then target else $('[name=' + @hash.slice(1) + ']')
      if target.length
        $('html,body').animate { scrollTop: target.offset().top }, { duration: 1000, queue: false}
        return false
    return
  return

$(document).ready ->
  $('.screen').css 'min-height', $(window).outerHeight()
  $('.cell').css 'opacity', 1

  $('.question span').click ->
    wow = $(this).parent().find('p').outerHeight()
    $('.answer').css 'height', 0
    if $(this).parent().find('.answer').outerHeight() == 0
      $(this).parent().find('.answer').css 'height', wow
    else
      $(this).parent().find('.answer').css 'height', 0

$(window).scroll ->
  if $(window).width() > 600
    $('.screen.hero').css 'background-position', 'center ' + ($(window).scrollTop()/4)*-1 + 'px'


$(window).resize ->
  $('.screen').css 'min-height', $(window).outerHeight()
  $('.answer').css 'height', 0
