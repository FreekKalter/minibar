webapp/webapp: webapp/web.go
	go build -o webapp/webapp webapp/web.go

# -----------------  Javascript minifying -------------
# Patterns matching CSS files that should be minified. Files with a .min.css
# suffix will be ignored.
CSS_FILES = $(filter-out %.min.css,$(wildcard \
	webapp/static/css/*.css \
))

# Command to run to execute the YUI Compressor.
ifeq ($(shell uname), Linux)
	YUI_COMPRESSOR = /usr/bin/yui-compressor
else
	YUI_COMPRESSOR = /usr/local/bin/yuicompressor
endif

# Flags to pass to the YUI Compressor for both CSS and JS.
YUI_COMPRESSOR_FLAGS = --charset utf-8 --verbose

CSS_MINIFIED = $(CSS_FILES:.css=.min.css)

%.min.css: %.css
	@echo '==> Minifying $<'
	$(YUI_COMPRESSOR) $(YUI_COMPRESSOR_FLAGS) --type css $< >$@

# target: minify-css - Minifies CSS.
minify-css: $(CSS_FILES) $(CSS_MINIFIED)

# -----------------  Javascript minifying -------------
js-loc = webapp/static/js
# target: minify-js - Minifies JS.

$(js-loc)/master.js: $(js-loc)/bars.js $(js-loc)/heatmap.js
	cat $(js-loc)/bars.js\
		$(js-loc)/heatmap.js\
		> $(js-loc)/master.js

$(js-loc)/master.min.js: $(js-loc)/master.js
	 -$(YUI_COMPRESSOR) $(YUI_COMPRESSOR_FLAGS) --type js $(js-loc)/master.js \
	 > $(js-loc)/master.min.js

minify-js: webapp/static/js/master.min.js
# target: minify - Minifies CSS and JS.
minify: minify-css minify-js

all: minify webapp/webapp
