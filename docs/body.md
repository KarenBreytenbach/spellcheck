The text contained in the `<body>` element of your document is visible to users and contains a spelling mistake. 

# How do I fix this?

First, **Passmarked** uses the language attribute to pick the language which to spell check against. Ensure that the correct language is set in this regard.

Then edit the source code that generates the HTML page containing the spelling error.

```
<html>
  <head>
    <title>My Webpage</title>
  </head>
  <body>
    <!-- <h1>My Headinf</h1> -->
    <!-- <h1>My Heading</h1> -->
  </body>
</html>
```

# Resources

* [Spellcheck.net](http://www.spellcheck.net/)
