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

validateEmail = (email) ->
  filter = /^([\w-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([\w-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/
  if filter.test(email)
    true
  else
    false

$(document).ready ->
  $('.screen').css 'height', $(window).outerHeight()
  $('.cell').css 'opacity', 1

  $('.question span').click ->
    wow = $(this).parent().find('p').outerHeight()
    $('.answer').css 'height', 0
    if $(this).parent().find('.answer').outerHeight() == 0
      $(this).parent().find('.answer').css 'height', wow
    else
      $(this).parent().find('.answer').css 'height', 0
    return

  $contactForm = $('#contact-form')
  $contactForm.submit (e) ->
    e.preventDefault()

    email = $('#email').val()

    if $.trim(email).length == 0
      $('.contact-form-message').html 'Please enter valid email address'

    if validateEmail(email)
      console.log 'succes'
    else
      $('.contact-form-message').html 'Invalid Email Address'
    return

$(window).scroll ->
  if $(window).width() > 600
    $('.screen.hero').css 'background-position', 'center ' + ($(window).scrollTop()/4)*-1 + 'px'


$(window).resize ->
  $('.screen').css 'height', $(window).outerHeight()
  $('.answer').css 'height', 0
