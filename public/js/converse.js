/*
    Apologies in advance for the sloppiness and, perhaps more notably, the
    jQuery.  I haven't had time to wrap my head around how we'll do this in Maki
    with React just yet, but am hoping to tackle this soon.  As for now, I'm
    trying to stay as close to "javascriptless-HTML" as possible, so I'm using
    things like `data-bind` and proper form attribute names to preserve the
    ability to progressively enhance with something like React in the future.
    If anyone wants to help, tackle it in the Maki repo as a library feature.
                                                                          ~ Eric
*/

// TODO: not modify prototypes?  hueh.
String.prototype.hexEncode = function() {
  var hex, i;
  var result = '';
  for (i=0; i<this.length; i++) {
    hex = this.charCodeAt(i).toString(16);
    result += ('000'+hex).slice(-4);
  }
  return result;
};

$(window).load(function(e) {
  console.log('match:', window.location.hash.match(/^#comment$/));
  if (window.location.hash && window.location.hash.match(/^#comment$/)) {
    e.preventDefault();
    $('textarea').focus();
  }
});

$(document).on('click', '*[data-intent=comment]', function(e) {
  e.preventDefault();
  $('textarea').focus();
});

$(document).on('click', '*[data-intent=save]', function(e) {
  e.preventDefault();

  var $self = $(this);
  var post = $self.data('post');
  var user = $self.data('user');

  var data = {
    _post: post,
    _user: user
  };

  $.post('/saves', data, function(save, status, xhr) {
    console.log('save:', save);
  }, 'json');

});

$(document).on('click', '*[data-intent=upvote], *[data-intent=downvote]', function(e) {
  e.preventDefault();

  var $self = $(this);
  var target = $self.data('id');
  var intent = $self.data('intent');
  var sentiment = (intent === 'upvote') ? 1 : -1;

  var data = {
    context: $self.data('context'),
    _target: target,
    _user: $self.data('for'),
    sentiment: sentiment
  };

  $('*[data-bind=user-balance]').each(function(i) {
    var value = $(this).html();
    $(this).html( (parseInt(value) - 1).toFixed(2) );
  });

  $('*[data-bind='+target+']').each(function(i) {
    var originally = parseInt( $(this).html() );
    $(this).data('originally', originally);
    $(this).html( originally + sentiment );
  });

  $.post('/votes', data, function(vote, status, xhr) {
    console.log('voting request completed');
    console.log(vote);
  }, 'json').error(function(xhr, text, error) {
    var vote = JSON.parse(xhr.responseText);
    if (vote.error) return alert(vote.error);
  });

});

$(document).on('click', '*[data-intent=gild]', function(e) {
  e.preventDefault();

  var $self = $(this);
  var target = $self.data('target');

  var AMOUNT = 50;

  var data = {
    _user: $self.data('user'),
    _target: target,
    context: $self.data('context'),
    amount: AMOUNT
  };

  $('*[data-bind='+target+'][data-for=gildings]').each(function(i) {
    var value = $(this).html();
    $(this).html( parseInt(value) + 1 );
  });

  $('*[data-bind=user-balance]').each(function(i) {
    var value = $(this).html();
    $(this).html( (parseInt(value) - AMOUNT).toFixed(2) );
  });

  $.post('/gildings', data, function(gilding, status, xhr) {
    console.log('gilded!', gilding);
  }, 'json').error(function(xhr, text, error) {
    var gilding = JSON.parse(xhr.responseText);
    if (gilding.error) return alert(gilding.error);
  });

});

// Block the form until the link information has been retrieved, and make sure
// that we attach all relevant data that comes back from the server to the form
// attributes.  Javascript is later used to read these attributes and wrap them
// in an XHR to progressively upgrade the form experience.  It works without JS!
// TODO: don't rely on the server to retrive document information; DOM parse.
function getDocumentData(e) {
  e.preventDefault();
  var $self = $('form[action="/posts"][method=post]');
  var url = $self.find('*[name=link]').val();

  if ($self.data('link') === url) return;

  $self.addClass('loading');
  $self.data('link', url);

  var rg = /^(http|https):\/\/(([a-zA-Z0-9$\-_.+!*'(),;:&=]|%[0-9a-fA-F]{2})+@)?(((25[0-5]|2[0-4][0-9]|[0-1][0-9][0-9]|[1-9][0-9]|[0-9])(\.(25[0-5]|2[0-4][0-9]|[0-1][0-9][0-9]|[1-9][0-9]|[0-9])){3})|localhost|([a-zA-Z0-9\-\u00C0-\u017F]+\.)+([a-zA-Z]{2,}))(:[0-9]+)?(\/(([a-zA-Z0-9$\-_.+!*'(),;:@&=]|%[0-9a-fA-F]{2})*(\/([a-zA-Z0-9$\-_.+!*'(),;:@&=]|%[0-9a-fA-F]{2})*)*)?(\?([a-zA-Z0-9$\-_.+!*'(),;:@&=\/?]|%[0-9a-fA-F]{2})*)?(\#([a-zA-Z0-9$\-_.+!*'(),;:@&=\/?]|%[0-9a-fA-F]{2})*)?)?$/;
  if (!url.match(rg)) {
    $('form[action="/posts"][method=post]').removeClass('loading');
    return;
  }

  $.post('/documents', {
    url: url
  }, function(doc, status, xhr) {
    console.log(doc);

    $self.find('*[data-bind=preview]').removeClass('hidden');

    if (!$self.data('name-touched')) {
      $self.find('*[name="document[name]"]').val(doc.title);
      $self.find('*[data-bind=document-name]').html(doc.title);
    }
    if (!$self.data('description-touched')) {
      $self.find('*[name="document[description]"]').val(doc.description);
      $self.find('*[data-bind=document-description]').html(doc.description);
    }

    if (doc.image && doc.image.url) {
      $self.find('*[data-bind=document-image]').attr('src', doc.image.url);
    }

    $('form[action="/posts"][method=post]').removeClass('loading');
  }, 'json');
}
// prevent it from being called on every keypress, in case the URL is handtyped!
var getDocData = _.debounce(getDocumentData,250);

// if the user edits the `contenteditable` visual guides, prevent furthur
// automation _and_ set the hidden field attributes so normal HTML works without
// any Javascript.
$('form[action="/posts"][method=post] *[data-bind=document-name]').on('keyup', function(e) {
  var $form = $('form[action="/posts"][method=post]');
  $form.data('name-touched', true);
  var name = $(this).html();
  $form.find('*[name="document[name]"]').val( name );
});
$('form[action="/posts"][method=post] *[data-bind=document-description]').on('keyup', function(e) {
  var $form = $('form[action="/posts"][method=post]');
  $form.data('description-touched', true);
  var description = $(this).html();
  $form.find('*[name="document[description]"]').val( description );
});

// when the "link" field changes, get the document's data.  works on paste!
$('form[action="/posts"][method=post] input[name=link]').on('change keyup mouseup', getDocData);

$('form[action="/posts"][method=post]').submit(function(e) {
  e.preventDefault();

  $('form[action="/posts"][method=post]').addClass('loading');
  $('form[action="/posts"][method=post] .submit').html('working...');

  var data = $(self).form('get values');
  var cash = $('form[action="/posts"][method=post] input[name=hashcash]');
  var name = $('form[action="/posts"][method=post] input[name=name]');
  var input = name.val().hexEncode();

  var worker = new Worker('/js/worker.js');
  worker.onmessage = function(e) {
    console.log('work result:', e.data);
    var hash = e.data;
    cash.val(hash);

    data.hashcash = hash;
    data._author     = $('form[action="/posts"][method=post] input[name=_author]').val();
    data.link        = $('form[action="/posts"][method=post] input[name=link]').val();
    data.name        = $('form[action="/posts"][method=post] input[name=name]').val();
    data.description = $('form[action="/posts"][method=post] textarea[name=description]').val();

    data.document = {
      name: $('form[action="/posts"][method=post] input[name="document[name]"]').val(),
      description: $('form[action="/posts"][method=post] input[name="document[description]"]').val()
    };

    $.post('/posts', data, function(post, status, xhr) {
      document.location.href = '/posts/' + post._id;
    }, 'json');
  }

  var difficulty = 2;
  worker.postMessage([ input , difficulty ]);

  return false;
});

$('form[action="/comments"][method=post]').submit(function(e) {
  e.preventDefault();

  $('form[action="/comments"][method=post]').addClass('loading');
  $('form[action="/comments"][method=post] .submit').html('working...');

  var data = $(self).form('get values');
  var cash = $('form[action="/comments"][method=post] input[name=hashcash]');
  var name = $('form[action="/comments"][method=post] textarea[name=content]');
  var input = name.val().hexEncode();

  var worker = new Worker('/js/worker.js');
  worker.onmessage = function(e) {
    console.log('work result:', e.data);
    var hash = e.data;
    cash.val(hash);

    data.hashcash = hash;
    data._author     = $('form[action="/comments"][method=post] input[name=_author]').val();
    data.link        = $('form[action="/comments"][method=post] input[name=link]').val();
    data._post       = $('form[action="/comments"][method=post] input[name=_post]').val();
    data._parent     = $('form[action="/comments"][method=post] input[name=_parent]').val();
    data.content     = $('form[action="/comments"][method=post] textarea[name=content]').val();

    $.post('/comments', data, function(post, status, xhr) {
      // TODO: redirect/highlight specific comment that was created
      document.location.href = '/posts/' + data._post;
    });
  }

  var difficulty = 2;
  worker.postMessage([ input , difficulty ]);

  return false;
});
