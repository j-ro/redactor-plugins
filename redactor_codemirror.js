(function($)
{
	$.Redactor.prototype.codemirror = function()
	{
		return {
			init: function()
			{
				var button = this.button.addFirst('html', 'HTML');
				this.button.addCallback(button, this.codemirror.toggle);

				this.codemirror.$textarea = $('<textarea />');
				this.codemirror.$textarea.hide();

				if (this.opts.type === 'textarea')
				{
					this.core.box().append(this.codemirror.$textarea);
				}
				else
				{
					this.core.box().after(this.codemirror.$textarea);
				}

				this.core.element().on('destroy.callback.redactor', $.proxy(function()
				{
					this.codemirror.$textarea.remove();

				}, this));

				var settings = (typeof this.opts.codemirror !== 'undefined') ? this.opts.codemirror : { lineNumbers: true };
				this.codemirror.editor = CodeMirror.fromTextArea(this.codemirror.$textarea[0], settings);

				this.codemirror.$textarea.next('.CodeMirror').hide();
				
				var code_mirror_instance = this.codemirror.editor
				
				code_mirror_instance.on('update', function() {
					//console.log('change');
					//if (navigator.appVersion.indexOf("MSIE 10") == -1) {
						//console.log('trigger');
						$(this).parents('form').trigger('checkform.areYouSure');
					//}
				});
			},
			toggle: function()
			{
				return (this.codemirror.$textarea.hasClass('open')) ? this.codemirror.hide() : this.codemirror.show();
			},
			setCaretOnShow: function()
			{
				this.codemirror.offset = this.offset.get();
				var scroll = $(window).scrollTop();

				var	width = this.core.editor().innerWidth();
				var height = this.core.editor().innerHeight();

				// caret position sync
				this.codemirror.start = 0;
				this.codemirror.end = 0;
				var $editorDiv = $("<div/>").append($.parseHTML(this.core.editor().html(), document, true));
				var $selectionMarkers = $editorDiv.find(".redactor-selection-marker");

				if ($selectionMarkers.length > 0)
				{
					var editorHtml = $editorDiv.html().replace(/&amp;/g, '&');

					if ($selectionMarkers.length === 1)
					{
						this.codemirror.start = this.utils.strpos(editorHtml, $editorDiv.find("#selection-marker-1").prop("outerHTML"));
						this.codemirror.end = this.codemirror.start;
					}
					else if ($selectionMarkers.length === 2)
					{
						this.codemirror.start = this.utils.strpos(editorHtml, $editorDiv.find("#selection-marker-1").prop("outerHTML"));
						this.codemirror.end = this.utils.strpos(editorHtml, $editorDiv.find("#selection-marker-2").prop("outerHTML")) - $editorDiv.find("#selection-marker-1").prop("outerHTML").toString().length;
					}
				}

			},
			setCaretOnHide: function()
			{
				this.codemirror.start = 0;
				this.codemirror.end = 0;

				var self = this;
				var html = '';
				this.codemirror.$textarea.next('.CodeMirror').each(function(i, el)
				{
					self.codemirror.selection = el.CodeMirror.listSelections();

					self.codemirror.start = el.CodeMirror.indexFromPos(self.codemirror.selection[0].anchor);
					self.codemirror.end = el.CodeMirror.indexFromPos(self.codemirror.selection[0].head);

					html = el.CodeMirror.getValue();
				});


				// if selection starts from end
				if (this.codemirror.start > this.codemirror.end && this.codemirror.end > 0)
				{
					var tempStart = this.codemirror.end;
					var tempEnd = this.codemirror.start;

					this.codemirror.start = tempStart;
					this.codemirror.end = tempEnd;
				}

				this.codemirror.start = this.codemirror.enlargeOffset(html, this.codemirror.start);
				this.codemirror.end = this.codemirror.enlargeOffset(html, this.codemirror.end);

				html = html.substr(0, this.codemirror.start) + this.marker.html(1) + html.substr(this.codemirror.start);

				if (this.codemirror.end > this.codemirror.start)
				{
					var markerLength = this.marker.html(1).toString().length;

					html = html.substr(0, this.codemirror.end + markerLength) + this.marker.html(2) + html.substr(this.codemirror.end + markerLength);
				}
				
				html = this.code.cleaned(html);

				return html;

			},
			hide: function()
			{
				//var scrollPercentage = 100 * $('.CodeMirror-scroll').scrollTop() / ($('.CodeMirror-sizer').height() - $('.CodeMirror-scroll').height());
				
				var code;
				this.codemirror.$textarea.removeClass('open').next('.CodeMirror').hide();
				this.codemirror.$textarea.next('.CodeMirror').off('.redactor-codemirror');

				code = this.codemirror.setCaretOnHide(code);
				code = this.paragraphize.load(code);

				this.code.start(code);
				this.button.enableAll();
				this.core.editor().show().focus();
				this.selection.restore();
				//console.log(this.code.get());
				if (this.code.get() != '') {
					this.placeholder.hide();
				} else {
					this.placeholder.show();
				}
				this.code.sync();
				
				//$.event.trigger({ type : 'keypress' }); // works cross-browser
				
				//$(window).scrollTop($(window.getSelection().anchorNode).offset().top - 200);
				
				//$(window).scrollTop(((($('.redactor-editor').height()) * scrollPercentage) / 100) + $('.redactor-editor').offset().top - 200);

			},
			show: function()
			{
				this.selection.save();
				this.codemirror.setCaretOnShow();

				var height = this.core.editor().innerHeight();
				var code = this.code.get();

				code = code.replace(/\n\n\n/g, "\n");
				code = code.replace(/\n\n/g, "\n");

				this.core.editor().hide();
				this.button.disableAll('html');
				this.marker.remove();

				this.codemirror.$textarea.val(code).height(height).addClass('open');
				this.codemirror.$textarea.next('.CodeMirror').on('keyup.redactor-codemirror', $.proxy(function()
				{
					if (this.opts.type === 'textarea')
					{
						this.codemirror.$textarea.next('.CodeMirror').each($.proxy(function(i, el)
						{
							this.core.textarea().val(el.CodeMirror.getValue());

						}, this));
					}

				}, this));

				var self = this;

				this.codemirror.$textarea.next('.CodeMirror').each(function(i, el)
				{
					$(el).show();
					el.CodeMirror.setValue(code);
					el.CodeMirror.setSize('100%', height);
					el.CodeMirror.refresh();
					
					var code_mirror_instance = self.codemirror.editor
				
					CodeMirror.commands["selectAll"](code_mirror_instance);
					
					function getSelectedRange() {
				        return { from: code_mirror_instance.getCursor(true), to: code_mirror_instance.getCursor(false) };
				    }
				    
				    function autoFormatSelection() {
				        var range = getSelectedRange();
				        code_mirror_instance.autoFormatRange(range.from, range.to);
				    }
				    
				    function autoIndentSelection() {
				        var range = getSelectedRange();
				        code_mirror_instance.autoIndentRange(range.from, range.to);
				    }
				    
				    autoFormatSelection();
				    CodeMirror.commands["indentAuto"](code_mirror_instance);

					if (self.codemirror.start === self.codemirror.end)
					{
						el.CodeMirror.setCursor(el.CodeMirror.posFromIndex(self.codemirror.start).line, el.CodeMirror.posFromIndex(self.codemirror.end).ch);
					}
					else
					{
						el.CodeMirror.setSelection({line: el.CodeMirror.posFromIndex(self.codemirror.start).line,
													ch: el.CodeMirror.posFromIndex(self.codemirror.start).ch},
												  {line: el.CodeMirror.posFromIndex(self.codemirror.end).line,
												   ch:  el.CodeMirror.posFromIndex(self.codemirror.end).ch});
					}

					el.CodeMirror.focus();
				});
				
				
				
				//code_mirror_instance.on('change', function() {
					//console.log('show');
/*
					CodeMirror.commands["selectAll"](code_mirror_instance);
					var range = getSelectedRange();
					code_mirror_instance.autoFormatRange(range.from, range.to);
					CodeMirror.commands["goDocStart"](code_mirror_instance);
*/
				//});


			},
			enlargeOffset: function(html, offset)
			{
				var htmlLength = html.length;
				var c = 0;

				if (html[offset] === '>')
				{
					c++;
				}
				else
				{
					for(var i = offset; i <= htmlLength; i++)
					{
						c++;

						if (html[i] === '>')
						{
							break;
						}
						else if (html[i] === '<' || i === htmlLength)
						{
							c = 0;
							break;
						}
					}
				}

				return offset + c;
			}
		};
	};
})(jQuery);
