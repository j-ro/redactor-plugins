/*
	Redactor General Fix Plugin
	by Jason Rosenbaum, the Action Network
	
	Version 2.0
	Released December 30, 2015
	
	
	Instructions:
	
	This plugin stops Redactor from stripping b, i, span, and font tags, from removing styles when deleting, fixes dropdownb open/close issues, and fixes weird behavior with shift-enter. For use with Redactor II.

	To use the plugin, simply install it and call it in Redactor's options.
	
	
	MIT license:
	
	Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
	
	The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
	
	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

$.Redactor.prototype.clean = function()
{
	return {
		onSet: function(html)
		{
			
			
			html = this.clean.savePreCode(html);
			html = this.clean.saveFormTags(html);
			
			
	
			// convert script tag
			if (this.opts.script)
			{
				html = html.replace(/<script(.*?[^>]?)>([\w\W]*?)<\/script>/gi, '<pre class="redactor-script-tag" $1>$2</pre>');
			}
	
			// converting entity
			html = html.replace(/\$/g, '&#36;');
			html = html.replace(/&amp;/g, '&');
	
			// replace special characters in links
			html = html.replace(/<a href="(.*?[^>]?)®(.*?[^>]?)">/gi, '<a href="$1&reg$2">');
			
			
	
			// save markers
			//old was
			//html = html.replace(/<span(.*?[^>]?)id="selection-marker-1"(.*?[^>]?)>​<\/span>/gi, '[[[marker1]]]');
			//html = html.replace(/<span(.*?[^>]?)id="selection-marker-2"(.*?[^>]?)>​<\/span>/gi, '[[[marker2]]]');
			html = html.replace(/<span id="selection-marker-1"(.*?[^>]?)>​<\/span>/gi, '[[[marker1]]]');
			html = html.replace(/<span id="selection-marker-2"(.*?[^>]?)>​<\/span>/gi, '[[[marker2]]]');
			html = html.replace(/<span id="selection-marker-1"(.*?[^>]?)><\/span>/gi, '[[[marker1]]]');
			html = html.replace(/<span id="selection-marker-2"(.*?[^>]?)><\/span>/gi, '[[[marker2]]]');
			
			//console.log(html);
	
			// replace tags
			var self = this;
			var $div = $("<div/>").html($.parseHTML(html, document, true));
			var replacement = {
				'b': 'strong',
				'i': 'em',
				'strike': 'del'
			};
			
			// removed return keyword here, too many returns were making this fail
			$div.find('b, i, strike').replaceWith(function()
			{
				self.utils.replaceToTag(this, replacement[this.tagName.toLowerCase()]);
			});
	
			html = $div.html();
	
			// remove tags
			var tags = ['html', 'head', 'body', 'meta', 'applet'];
			if (!this.opts.script)
			{
				tags.push('script');
			}
	
			html = this.clean.stripTags(html, tags);
	
			// remove html comments
			html = html.replace(/<!--[\s\S]*?-->/gi, '');
	
			// paragraphize
			html = this.paragraphize.load(html);
	
			// restore markers
			html = html.replace('[[[marker1]]]', '<span id="selection-marker-1" class="redactor-selection-marker">​</span>');
			html = html.replace('[[[marker2]]]', '<span id="selection-marker-2" class="redactor-selection-marker">​</span>');
	
			// empty
			if (html.search(/^(||\s||<br\s?\/?>||&nbsp;)$/i) !== -1)
			{
				return this.opts.emptyHtml;
			}
	
			return html;
		},
		onGet: function(html)
		{
			return this.clean.onSync(html);
		},
		onSync: function(html)
		{
			// remove invisible spaces
			html = html.replace(/\u200B/g, '');
			html = html.replace(/&#x200b;/gi, '');
			//html = html.replace(/&nbsp;&nbsp;/gi, '&nbsp;');

			if (html.search(/^<p>(||\s||<br\s?\/?>||&nbsp;)<\/p>$/i) !== -1)
			{
				return '';
			}

			var $div = $("<div/>").html($.parseHTML(html, document, true));

			// remove empty atributes
			$div.find('*[style=""]').removeAttr('style');
			$div.find('*[class=""]').removeAttr('class');
			$div.find('*[rel=""]').removeAttr('rel');

			// remove markers
			$div.find('.redactor-invisible-space').each(function()
			{
				$(this).contents().unwrap();
			});

			// remove span
/*
			$div.find('span').each(function()
			{
				$(this).contents().unwrap();
			});
*/

			$div.find('.redactor-selection-marker, #redactor-insert-marker').remove();

			html = $div.html();

			// reconvert script tag
			if (this.opts.script)
			{
				html = html.replace(/<pre class="redactor-script-tag"(.*?[^>]?)>([\w\W]*?)<\/pre>/gi, '<script$1>$2</script>');
			}

			// restore form tag
			html = this.clean.restoreFormTags(html);

			// remove br in|of li/header tags
			html = html.replace(new RegExp('<br\\s?/?></h', 'gi'), '</h');
			html = html.replace(new RegExp('<br\\s?/?></li>', 'gi'), '</li>');
			html = html.replace(new RegExp('</li><br\\s?/?>', 'gi'), '</li>');

			// pre class
			html = html.replace(/<pre>/gi, "<pre>\n");
			if (this.opts.preClass)
			{
				html = html.replace(/<pre>/gi, '<pre class="' + this.opts.preClass + '">');
			}

			// link nofollow
			if (this.opts.linkNofollow)
			{
				html = html.replace(/<a(.*?)rel="nofollow"(.*?[^>])>/gi, '<a$1$2>');
				html = html.replace(/<a(.*?[^>])>/gi, '<a$1 rel="nofollow">');
			}

			// replace special characters
			var chars = {
				'\u2122': '&trade;',
				'\u00a9': '&copy;',
				'\u2026': '&hellip;',
				'\u2014': '&mdash;',
				'\u2010': '&dash;'
			};

			$.each(chars, function(i,s)
			{
				html = html.replace(new RegExp(i, 'g'), s);
			});

			html = html.replace(/&amp;/g, '&');

			// remove empty paragpraphs
			html = html.replace(/<p><\/p>/gi, "");

			return html;
		},
		onPaste: function(html, data, insert)
		{
			// if paste event
			if (insert !== true)
			{
				var msword = this.clean.isHtmlMsWord(html);
				if (msword)
				{
					html = this.clean.cleanMsWord(html);
				}
			}

			html = $.trim(html);

			if (data.pre)
			{
				if (this.opts.preSpaces)
				{
					html = html.replace(/\t/g, new Array(this.opts.preSpaces + 1).join(' '));
				}
			}
			else
			{
				html = this.clean.replaceBrToNl(html);
				html = this.clean.removeTagsInsidePre(html);
			}

			// if paste event
			if (insert !== true)
			{
				html = this.clean.removeSpans(html);
				html = this.clean.removeEmptyInlineTags(html);

				if (data.encode === false)
				{
					html = html.replace(/&/g, '&amp;');
					html = this.clean.convertTags(html, data);
					html = this.clean.getPlainText(html);
					html = this.clean.reconvertTags(html, data);
				}

			}

			if (data.text)
			{
				html = this.clean.replaceNbspToSpaces(html);
				html = this.clean.getPlainText(html);
			}

			if (data.encode)
			{
				html = this.clean.encodeHtml(html);
			}

			if (data.paragraphize)
			{

				html = this.paragraphize.load(html);
			}

			return html;

		},
		getCurrentType: function(html, insert)
		{
			var blocks = this.selection.blocks();

			var data = {
				text: false,
				encode: false,
				paragraphize: true,
				line: this.clean.isHtmlLine(html),
				blocks: this.clean.isHtmlBlocked(html),
				pre: false,
				lists: false,
				block: true,
				inline: true,
				links: true,
				images: true
			};

			if (blocks.length === 1 && this.utils.isCurrentOrParent(['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'a', 'figcaption']))
			{
				data.text = true;
				data.paragraphize = false;
				data.inline = false;
				data.images = false;
				data.links = false;
				data.line = true;
			}
			else if (this.opts.type === 'inline' || this.opts.enterKey === false)
			{
				data.paragraphize = false;
				data.block = false;
				data.line = true;
			}
			else if (blocks.length === 1 && this.utils.isCurrentOrParent(['li']))
			{
				data.lists = true;
				data.block = false;
				data.paragraphize = false;
				data.images = false;
			}
			else if (blocks.length === 1 && this.utils.isCurrentOrParent(['th', 'td', 'blockquote']))
			{
				data.block = false;
				data.paragraphize = false;

			}
			else if (this.opts.type === 'pre' || (blocks.length === 1 && this.utils.isCurrentOrParent('pre')))
			{
				data.inline = false;
				data.block = false;
				data.encode = true;
				data.pre = true;
				data.paragraphize = false;
				data.images = false;
				data.links = false;
			}

			if (data.line === true)
			{
				data.paragraphize = false;
			}

			if (insert === true)
			{
				data.text = false;
			}

			return data;

		},
		isHtmlBlocked: function(html)
		{
			var match1 = html.match(new RegExp('</(' + this.opts.blockTags.join('|' ).toUpperCase() + ')>', 'gi'));
			var match2 = html.match(new RegExp('<hr(.*?[^>])>', 'gi'));

			return (match1 === null && match2 === null) ? false : true;
		},
		isHtmlLine: function(html)
		{
			if (this.clean.isHtmlBlocked(html))
			{
				return false;
			}

			var matchBR = html.match(/<br\s?\/?>/gi);
			var matchNL = html.match(/\n/gi);

			return (!matchBR && !matchNL) ? true : false;
		},
		isHtmlMsWord: function(html)
		{
			return html.match(/class="?Mso|style="[^"]*\bmso-|style='[^'']*\bmso-|w:WordDocument/i);
		},
		removeEmptyInlineTags: function(html)
		{
			var tags = this.opts.inlineTags;
			var len = tags.length;
			for (var i = 0; i < len; i++)
			{
				html = html.replace(new RegExp('<' + tags[i] + '[^>]*>(\s\n|\t)?</' + tags[i] + '>', 'gi'), '');
			}

			return html;
		},
		removeSpans: function(html)
		{
			//html = html.replace(/<\/span>/gi, '');
			//html = html.replace(/<span[^>]*>/gi, '');

			return html;
		},
		cleanMsWord: function(html)
		{
			html = html.replace(/\n/g, " ");
			html = html.replace(/<br\s?\/?>|<\/p>|<\/div>|<\/li>|<\/td>/gi, '\n\n');

			return html;
		},
		replaceNbspToSpaces: function(html)
		{
			return html.replace('&nbsp;', ' ');
		},
		replaceBrToNl: function(html)
		{
			return html.replace(/<br\s?\/?>/gi, '\n');
		},
		replaceNlToBr: function(html)
		{
			return html.replace(/\n/g, '<br />');
		},
		convertTags: function(html, data)
		{
			// links & images
			if (data.links && this.opts.pasteLinks)
			{
				html = html.replace(/<a(.*?)href="(.*?)"(.*?)>(.*?)<\/a>/gi, '###a href="$2"###$4###/a###');
			}

			if (data.images && this.opts.pasteImages)
			{
				html = html.replace(/<img src="(.*?)"(.*?[^>])>/gi, '###img src="$1"###');
			}

			// plain text
			if (this.opts.pastePlainText)
			{
				return html;
			}

			// all tags
			var blockTags = (data.lists) ? ['ul', 'ol', 'li'] : this.opts.pasteBlockTags;

			var tags;
			if (data.block)
			{
				tags = (data.inline) ? blockTags.concat(this.opts.pasteInlineTags) : blockTags;
			}
			else
			{
				tags = (data.inline) ? this.opts.pasteInlineTags : [];
			}

			var len = tags.length;
			for (var i = 0; i < len; i++)
			{
				html = html.replace(new RegExp('</' + tags[i] + '>', 'gi'), '###/' + tags[i] + '###');

				if (tags[i] === 'td' || tags[i] === 'th')
				{
					html = html.replace(new RegExp('<' + tags[i] + '(.*?[^>])((colspan|rowspan)="(.*?[^>])")?(.*?[^>])>', 'gi'), '###' + tags[i] + ' $2###');
				}
				else
				{
					html = html.replace(new RegExp('<' + tags[i] + '[^>]*>', 'gi'), '###' + tags[i] + '###');
				}
			}


			return html;

		},
		reconvertTags: function(html, data)
		{
			// links & images
			if (data.links && this.opts.pasteLinks)
			{
				html = html.replace(/###a href="(.*?)"###(.*?)###\/a###/gi, '<a href="$1">$2</a>');
			}

			if (data.images && this.opts.pasteImages)
			{
				html = html.replace(/###img src="(.*?)"###/gi, '<img src="$1">');
			}

			// plain text
			if (this.opts.pastePlainText)
			{
				return html;
			}

			var blockTags = (data.lists) ? ['ul', 'ol', 'li'] : this.opts.pasteBlockTags;

			var tags;
			if (data.block)
			{
				tags = (data.inline) ? blockTags.concat(this.opts.pasteInlineTags) : blockTags;
			}
			else
			{
				tags = (data.inline) ? this.opts.pasteInlineTags : [];
			}

			var len = tags.length;
			for (var i = 0; i < len; i++)
			{
				html = html.replace(new RegExp('###/' + tags[i] + '###', 'gi'), '</' + tags[i] + '>');

				if (tags[i] === 'td' || tags[i] === 'th')
				{
					html = html.replace(new RegExp('###' + tags[i] + ' (.*?[^#])###', 'gi'), '<' + tags[i] + '$1>');
				}
				else
				{
					html = html.replace(new RegExp('###' + tags[i] + '###', 'gi'), '<' + tags[i] + '>');
				}
			}

			return html;

		},
		cleanPre: function(block)
		{
			block = (typeof block === 'undefined') ? $(this.selection.block()).closest('pre', this.core.editor()[0]) : block;

			$(block).find('br').replaceWith(function()
			{
				return document.createTextNode('\n');
			});

			$(block).find('p').replaceWith(function()
			{
				return $(this).contents();
			});

		},
		removeTagsInsidePre: function(html)
		{
			var $div = $('<div />').append(html);
			$div.find('pre').replaceWith(function()
			{
				var str = $(this).html();
				str = str.replace(/<br\s?\/?>|<\/p>|<\/div>|<\/li>|<\/td>/gi, '\n');
				str = str.replace(/(<([^>]+)>)/gi, '');

				return $('<pre />').append(str);
			});

			html = $div.html();
			$div.remove();

			return html;

		},
		getPlainText: function(html)
		{
			html = html.replace(/<!--[\s\S]*?-->/gi, '');
			html = html.replace(/<style[\s\S]*?style>/gi, '');
			html = html.replace(/<\/p>|<\/div>|<\/li>|<\/td>/gi, '\n');
			html = html.replace(/<\/H[1-6]>/gi, '\n\n');

			var tmp = document.createElement('div');
			tmp.innerHTML = html;
			html = tmp.textContent || tmp.innerText;

			return $.trim(html);
		},
		savePreCode: function(html)
		{
			html = this.clean.savePreFormatting(html);
			html = this.clean.saveCodeFormatting(html);
			html = this.clean.restoreSelectionMarkers(html);

			return html;
		},
		savePreFormatting: function(html)
		{
			var pre = html.match(/<pre(.*?)>([\w\W]*?)<\/pre>/gi);
			if (pre === null)
			{
				return html;
			}

			$.each(pre, $.proxy(function(i,s)
			{
				var arr = s.match(/<pre(.*?)>([\w\W]*?)<\/pre>/i);

				arr[2] = arr[2].replace(/<br\s?\/?>/g, '\n');
				arr[2] = arr[2].replace(/&nbsp;/g, ' ');

				if (this.opts.preSpaces)
				{
					arr[2] = arr[2].replace(/\t/g, new Array(this.opts.preSpaces + 1).join(' '));
				}

				arr[2] = this.clean.encodeEntities(arr[2]);

				// $ fix
				arr[2] = arr[2].replace(/\$/g, '&#36;');

				html = html.replace(s, '<pre' + arr[1] + '>' + arr[2] + '</pre>');

			}, this));

			return html;
		},
		saveCodeFormatting: function(html)
		{
			var code = html.match(/<code(.*?)>([\w\W]*?)<\/code>/gi);
			if (code === null)
			{
				return html;
			}

			$.each(code, $.proxy(function(i,s)
			{
				var arr = s.match(/<code(.*?)>([\w\W]*?)<\/code>/i);

				arr[2] = arr[2].replace(/&nbsp;/g, ' ');
				arr[2] = this.clean.encodeEntities(arr[2]);
				arr[2] = arr[2].replace(/\$/g, '&#36;');

				html = html.replace(s, '<code' + arr[1] + '>' + arr[2] + '</code>');

			}, this));

			return html;
		},
		restoreSelectionMarkers: function(html)
		{
			html = html.replace(/&lt;span id=&quot;selection-marker-([0-9])&quot; class=&quot;redactor-selection-marker&quot;&gt;​&lt;\/span&gt;/g, '<span id="selection-marker-$1" class="redactor-selection-marker">​</span>');

			return html;
		},
		saveFormTags: function(html)
		{
			return html.replace(/<form(.*?)>([\w\W]*?)<\/form>/gi, '<section$1 rel="redactor-form-tag">$2</section>');
		},
		restoreFormTags: function(html)
		{
			return html.replace(/<section(.*?) rel="redactor-form-tag"(.*?)>([\w\W]*?)<\/section>/gi, '<form$1$2>$3</form>');
		},
		encodeHtml: function(html)
		{
			html = html.replace(/”/g, '"');
			html = html.replace(/“/g, '"');
			html = html.replace(/‘/g, '\'');
			html = html.replace(/’/g, '\'');
			html = this.clean.encodeEntities(html);

			return html;
		},
		encodeEntities: function(str)
		{
			str = String(str).replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"');
			str = str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

			return str;
		},
		stripTags: function(input, denied)
		{
			//console.log(input);
			//console.log(denied);
			if (typeof denied === 'undefined')
			{
				return input.replace(/(<([^>]+)>)/gi, '');
			}

		    var tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi;

		    return input.replace(tags, function ($0, $1)
		    {
		        return denied.indexOf($1.toLowerCase()) === -1 ? $0 : '';
		    });
		},
		removeMarkers: function(html)
		{
			//console.log('remove markers');
			return html.replace(/<span(.*?[^>]?)class="redactor-selection-marker"(.*?[^>]?)>([\w\W]*?)<\/span>/gi, '');
		},
		removeSpaces: function(html)
		{
			html = $.trim(html);
			html = html.replace(/\n/g, '');
			html = html.replace(/[\t]*/g, '');
			html = html.replace(/\n\s*\n/g, "\n");
			html = html.replace(/^[\s\n]*/g, ' ');
			html = html.replace(/[\s\n]*$/g, ' ');
			html = html.replace( />\s{2,}</g, '> <'); // between inline tags can be only one space
			html = html.replace(/\n\n/g, "\n");
			html = html.replace(/\u200B/g, '');

			return html;
		},
		removeSpacesHard: function(html)
		{
			html = $.trim(html);
			html = html.replace(/\n/g, '');
			html = html.replace(/[\t]*/g, '');
			html = html.replace(/\n\s*\n/g, "\n");
			html = html.replace(/^[\s\n]*/g, '');
			html = html.replace(/[\s\n]*$/g, '');
			html = html.replace( />\s{2,}</g, '><');
			html = html.replace(/\n\n/g, "\n");
			html = html.replace(/\u200B/g, '');

			return html;
		},
		normalizeCurrentHeading: function()
		{
			var heading = this.selection.block();
			if (this.utils.isCurrentOrParentHeader() && heading)
			{
				heading.normalize();
			}
		}
	};
}

$.Redactor.prototype.general_fixes = function() {
	return {
		init: function() {
			this.dropdown.show = $.proxy(
				function(e, key) {
			
					if (this.detect.isDesktop())
					{
						this.core.editor().focus();
					}
		
					this.dropdown.hideAll(false, key);
		
					this.dropdown.key = key;
					this.dropdown.button = this.button.get(this.dropdown.key);
					
					// re append
					//moved this above the if statement
					this.dropdown.active = this.dropdown.button.data('dropdown').appendTo(document.body);
					
					if (this.dropdown.button.hasClass('dropact'))
					{
						this.dropdown.hide();
						return;
					}
		
					// callback
					this.core.callback('dropdownShow', { dropdown: this.dropdown.active, key: this.dropdown.key, button: this.dropdown.button });
		
					// set button
					this.button.setActive(this.dropdown.key);
					this.dropdown.button.addClass('dropact');
		
					// position
					this.dropdown.getButtonPosition();
		
					// show
					if (this.button.toolbar().hasClass('toolbar-fixed-box') && this.detect.isDesktop())
					{
						this.dropdown.showIsFixedToolbar();
					}
					else
					{
						this.dropdown.showIsUnFixedToolbar();
					}
		
					// disable scroll whan dropdown scroll
					if (this.detect.isDesktop())
					{
						this.dropdown.active.on('mouseover.redactor-dropdown', $.proxy(this.utils.disableBodyScroll, this));
						this.dropdown.active.on('mouseout.redactor-dropdown', $.proxy(this.utils.enableBodyScroll, this));
					}
		
					e.stopPropagation();
		
				}, 
			this);
			
			this.dropdown.hideAll = $.proxy( 
				function(e, key) {
					
					if (this.detect.isDesktop())
					{
						this.utils.enableBodyScroll();
					}
		
					if (e !== false && $(e.target).closest('.redactor-dropdown').length !== 0)
					{
						return;
					}
		
					var $buttons = (typeof key === 'undefined') ? this.button.toolbar().find('a.dropact') : this.button.toolbar().find('a.dropact').not('.re-' + key);
					var $elements = (typeof key === 'undefined') ? $('.redactor-dropdown-' + this.uuid) : $('.redactor-dropdown-' + this.uuid).not('.redactor-dropdown-box-' + key);
		
					if ($elements.length !== 0)
					{
		
						$(document).off('.redactor-dropdown');
						this.core.editor().off('.redactor-dropdown');
		
		
						$.each($elements, $.proxy(function(i,s)
						{
							var $el = $(s);
		
							this.core.callback('dropdownHide', $el);
		
							$el.hide();
							$el.off('mouseover mouseout').off('.redactor-dropdown');
		
						}, this));
		
						//fixed typo here
						$buttons.removeClass('redactor-act dropact');
		
						this.dropdown.button = false;
						this.dropdown.key = false;
						this.dropdown.active = false;
					}
		
		
				},
			this);
			
			this.keydown.onBackspaceAndDeleteAfter = $.proxy( 
				function(e) {
					// remove style tag
					setTimeout($.proxy(function()
					{
						this.code.syncFire = false;
						this.keydown.removeEmptyLists();
		
						//this.core.editor().find('*[style]').not('#redactor-image-box, #redactor-image-editter').removeAttr('style');
		
						this.keydown.formatEmpty(e);
						this.code.syncFire = true;
		
					}, this), 1);
				},
			this);
			
			this.insert.raw = $.proxy(
				function(html){
					this.placeholder.hide();

					var sel = this.selection.get();

					var range = this.selection.range(sel);
					range.deleteContents();

		            var el = document.createElement("div");
					
					//add a marker with some content, from here http://stackoverflow.com/questions/4834793/set-caret-position-right-after-the-inserted-element-in-a-contenteditable-div
		            var id = "marker_" + ("" + Math.random()).slice(2);
			        html += '<span id="' + id + '">placeholder</span>';
		            el.innerHTML = html;
		            //el.appendChild(empty_text_node);

		            var frag = document.createDocumentFragment(), node, lastNode;
		            //console.log(node);
		            while ((node = el.firstChild))
		            {
		                lastNode = frag.appendChild(node);
		            }

		            range.insertNode(frag);

					if (lastNode)
					{
						range = range.cloneRange();
						range.setStartAfter(lastNode);
						range.collapse(true);
						sel.removeAllRanges();
						sel.addRange(range);
						
						//kill the marker
						var markerSpan = document.getElementById(id);
						markerSpan.parentNode.removeChild(markerSpan);
					}
				},
			this);
		}
	}
}
