// load in the modules
const url           = require('url');
const cheerio       = require('cheerio');
const S             = require('string');
const async         = require('async');
const spellCheck    = require('../spellcheck')

/**
* Elements tags we will try to spellcheck
**/ 
var elementTags = [

  'body h1',
  'body h2',
  'body h3',
  'body h4',
  'body h5',
  'body h6',
  'body p',
  'body li',
  'body a'

];

/**
* expose our function
**/
module.exports = exports = function(payload, fn) {

  // get the data
  var data = payload.getData();

  // parse the url 
  var uri = url.parse(data.url)

  // go get our content
  payload.getPageContent(function(err, content) {

    // did we get a error ?
    if(err) {

      // debug
      payload.error('Got a error trying to get the Page Content', err);

      // done
      return fn(null);

    }

    // did we find content ?
    if(S(content || '').isEmpty() === true) return fn(null);

    // load html
    var $ = cheerio.load(content || '');

    // get the page titles and create one content
    var lang = $('html').attr('lang');

    // the language must be set
    if(S(lang).isEmpty() === true) return fn(null);

    // get tlines
    var lines = content.split('\n');

    // get the text lines
    var spellingTexts = []

    // loop it all
    $(elementTags.join(',')).each(function() {

      // push the item
      spellingTexts.push(

        $(this).first().contents().filter(function(){

          return this.type == "text";

        }).text())

    });

    // get the content
    spellCheck.check({

        content:  spellingTexts.join(' '),
        keywords: [ uri.hostname ],
        language: lang || 'en'

      }, function(err, mistakes) {

        // did we have any error ?
        if(err) {

          // debug
          payload.error('Something went wrong getting mistakes from ASPELL', err);

          // try again
          return fn(null);

        } 

        // add a rule if we have any
        if((mistakes || []).length === 0) return fn(null);

        // keep track of the last line
        var current_last_line       = -1
        var current_txt_last_line   = -1;

        // get the min counters for each mistake
        var minMistakes = {};

        // loop the mistakes
        for(var i = 0; i < mistakes.length; i++) {

          // local reference
          var mistake = mistakes[i];

          // get the code
          var build = payload.getSnippetManager().build(

            lines,
            minMistakes[mistake] || -1,
            function(line) {

              return line.toLowerCase().indexOf(mistake.toLowerCase()) != -1;

            }

          );

          // sanity check
          if(!build) continue;

          // set the line
          minMistakes[mistake] = build.subject;

          // build the message
          var instance_message = '$';
          var identifiers_strs = [ mistake ];

          // add it
          payload.addRule({

              key:      'body',
              message:  'Spelling mistake found in page body',
              type:      'notice'

            }, {

              code: build,
              display: 'code',
              message: instance_message,
              identifiers: identifiers_strs

            })

        }
        
        // loop all the titles .. ? YOu should actually only have one
        fn(null)

    });

  });

};