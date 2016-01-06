/*
	Redactor Link Improvement Plugin
	by Jason Rosenbaum, the Action Network
	
	Version 2.0
	Released December 30, 2015
	
	
	Instructions:
	
	This plugin makes a small improvement to the link tooltip function of redactor, taking into account the link's height for where to display the tooltip. This helps make sure links that are more than one line aren't obstructed by the tooltip. This also adds help text to the link modal. And it allows for templated links to be used, instead of forcing them to start with http/https. For use with Redactor II.

	To use the plugin, simply install it and call it in Redactor's options.
	
	
	MIT license:
	
	Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
	
	The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
	
	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

$.Redactor.prototype.link_fix = function() {
	return {
		getTemplate: function()
        {
	        return String()
			+ '<div class="redactor-modal-tab" data-title="General">'
				+ '<section>'
					+ '<label>URL (usually should start with http://)</label>'
					+ '<input type="url" id="redactor-link-url" aria-label="URL" />'
					+ '<label class="checkbox"><input type="checkbox" id="redactor-link-blank"> ' + this.lang.get('link-in-new-tab') + '</label>'
				+ '</section>'
				+ '<section>'
					+ '<label>' + this.lang.get('text') + '</label>'
					+ '<input type="text" id="redactor-link-url-text" aria-label="' + this.lang.get('text') + '" />'
				+ '</section>'
				+ '<section>'
					+ '<button id="redactor-modal-button-action">Insert</button>'
					+ '<button id="redactor-modal-button-cancel">Cancel</button>'
				+ '</section>'
			+ '</div>'
            
        },
		init: function() {
			this.link.buildModal = $.proxy(function($el)
			{
				this.modal.addTemplate('link', this.link_fix.getTemplate());

				this.modal.load('link', this.lang.get(($el === false) ? 'link-insert' : 'link-edit'), 600);

				// button insert
				var $btn = this.modal.getActionButton();
				$btn.text(this.lang.get(($el === false) ? 'insert' : 'save')).on('click', $.proxy(this.link.callback, this));

			}, this);
			
			this.link.isUrl = $.proxy(function(url)
			{
/*
				var pattern = '((xn--)?[\\W\\w\\D\\d]+(-[\\W\\w\\D\\d]+)*\\.)+[\\W\\w]{2,}';
				var re1 = new RegExp('^(http|ftp|https)://' + pattern, 'i');
				var re2 = new RegExp('^' + pattern, 'i');
				var re3 = new RegExp('\.(html|php)$', 'i');
				var re4 = new RegExp('^/', 'i');

				// ad protocol
				if (url.search(re1) === -1 && url.search(re2) !== -1)
				{
					url = 'http://' + url;
				}


				if (url.search(re1) !== -1 || url.search(re3) !== -1 || url.search(re4) !== -1)
				{
					return url;
				}
*/

				return url;
			}, this);
		
			this.observe.getTooltipPosition = $.proxy(function($link)
			{
				//add height calculation here to take into account tall links
				var pos = $link.offset();
				pos.top = pos.top + $link.height() - 15;
				return pos;
			}, this);
		}
	}
}
