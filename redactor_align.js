/*
	Redactor Align
	by Jason Rosenbaum, the Action Network
	
	Version 2.0
	Released December 30, 2015
	
	
	Instructions:
	
		This plugin adds an alignment dropdowm menu to choose alignments for block level elements. For Redactor II.
	
	
	MIT license:
	
	Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
	
	The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
	
	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

(function($)
{
	$.Redactor.prototype.align = function()
	{
		return {
			langs: {
				en: {
					"align": "Align"
				}
			},
			init: function()
			{
				var tags = {
					"left": {
						title: "Left",
						args: ['left']
					},
					"center": {
						title: "Center",
						args: ['center']
					},
					"right": {
						title: "Right",
						args: ['right']
					},
					"justicy": {
						title: "Justify",
						args: ['justify']
					}
				};


				var that = this;
				var dropdown = {};

				$.each(tags, function(i, s)
				{
					dropdown[i] = { title: s.title, func: 'align.align', args: [s.args] };
				});


				var button = this.button.addAfter('format', 'inline', this.lang.get('align'));
				this.button.addDropdown(button, dropdown);

			},
			align: function(args)
			{
				var $el = $(this.selection.blocks());
				//console.log(this.selection.blocks());
				
				if (args == 'left') {
					args = '';
				}
				
				$el.css('text-align',args);
			}


		};
	};
})(jQuery);
