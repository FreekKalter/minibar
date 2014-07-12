all: minify webapp/webapp

webapp/webapp: webapp/web.go
	go build -o webapp/webapp webapp/web.go

# target: minify - Minifies CSS and JS.
minify: minify-css minify-js

# ---------------- Yui settings --------------

# Command to run to execute the YUI Compressor.
ifeq ($(shell uname), Linux)
YUI_COMPRESSOR = /usr/bin/yui-compressor
else
YUI_COMPRESSOR = /usr/local/bin/yuicompressor
endif

# Flags to pass to the YUI Compressor for both CSS and JS.
YUI_COMPRESSOR_FLAGS = --charset utf-8 --verbose

# -----------------  Css minifying -------------
# Patterns matching CSS files that should be minified.
# Files with a .min.css suffix will be ignored.
CSS_FILES = $(filter-out %.min.css,$(wildcard \
	webapp/static/css/*.css \
))

CSS_MINIFIED = $(CSS_FILES:.css=.min.css)

%.min.css: %.css
	@echo '==> Minifying $<'
	$(YUI_COMPRESSOR) $(YUI_COMPRESSOR_FLAGS) --type css $< >$@

# target: minify-css - Minifies CSS.
minify-css: $(CSS_FILES) $(CSS_MINIFIED)

# -----------------  Javascript minifying -------------
js-loc = webapp/static/js
JS_FILES = $(filter-out %.min.js,$(wildcard \
	$(js-loc)/*.js \
))

# Combine all js files into one
$(js-loc)/master.js: $(JS_FILES)
	cat $(JS_FILES) > $(js-loc)/master.js

# minify the master js file
$(js-loc)/master.min.js: $(js-loc)/master.js
	 -$(YUI_COMPRESSOR) $(YUI_COMPRESSOR_FLAGS) --type js $(js-loc)/master.js \
	 > $(js-loc)/master.min.js
	 rm $(js-loc)/master.js

# target: minify-js - Minifies JS.
minify-js: webapp/static/js/master.min.js

.PHONY: clean
clean:
	rm -f $(CSS_MINIFIED)
	rm -f webapp/webapp
	rm -f $(js-loc)/master*
