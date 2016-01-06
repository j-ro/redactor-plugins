/*
	Redactor Link Tooltip Improvement Plugin
	by Jason Rosenbaum, the Action Network
	
	Version 1.0
	Released April 4, 2014
	
	
	Instructions:
	
	This plugin makes a small improvement to the link tooltip function of redactor, taking into account the link's height for where to display the tooltip. This helps make sure links that are more than one line aren't obstructed by the tooltip.

	To use the plugin, simply install it and call it in Redactor's options.
	
	
	MIT license:
	
	Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
	
	The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
	
	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

if (typeof RedactorPlugins === 'undefined') var RedactorPlugins = {};

RedactorPlugins.link_tooltip = {

	show_link_modal:	function(title, content, width, callback)	
	{	
		//	modal	call	
		this.modalInit(
			title,	
			'<section id="redactor-modal-link-insert">'
				+ '<select id="redactor-predefined-links" style="width: 99.5%; display: none;"></select>'
				+ '<label>URL (usually should start with http://)</label>'
				+ '<input type="text" class="redactor_input" id="redactor_link_url" />'
				+ '<label>' + this.opts.curLang.text + '</label>'
				+ '<input type="text" class="redactor_input" id="redactor_link_url_text" />'
				+ '<label><input type="checkbox" id="redactor_link_blank"> ' + this.opts.curLang.link_new_tab + '</label>'
			+ '</section>'
			+ '<footer>'
				+ '<button class="redactor_modal_btn redactor_btn_modal_close">' + this.opts.curLang.cancel + '</button>'
				+ '<button id="redactor_insert_link_btn" class="redactor_modal_btn redactor_modal_action_btn">' + this.opts.curLang.insert + '</button>'
			+ '</footer>',	
			width,
			callback
		);	
	},

	// new link show function that adds real templating abilities to link rewrites
	linkObserver: function(e)
	{
		var $link = $(e.target);
		$global_link = $link[0];

		if ($link.size() == 0 || $link[0].tagName !== 'A') return;
		
		var pos = $link.offset();
		
		//add height calculation here to take into account tall links
		pos.top = pos.top + $link.height() - 15;
		
		if (this.opts.iframe)
		{
			var posFrame = this.$frame.offset();
			pos.top = posFrame.top + (pos.top - $(this.document).scrollTop());
			pos.left += posFrame.left;
		}

		var tooltip = $('<span class="redactor-link-tooltip"></span>');

		var href = $link.attr('href');
		if (href.length > 24) href = href.substring(0,24) + '...';

		var aLink = $('<a href="' + $link.attr('href') + '" target="_blank">' + href + '</a>').on('click', $.proxy(function(e)
		{
			this.linkObserverTooltipClose(false);
		}, this));

		var aEdit = $('<a href="#">' + this.opts.curLang.edit + '</a>').on('click', $.proxy(function(e)
		{
			e.preventDefault();
			this.linkShow();
			this.linkObserverTooltipClose(false);

		}, this));

		var aUnlink = $('<a href="#">' + this.opts.curLang.unlink + '</a>').on('click', $.proxy(function(e)
		{
			e.preventDefault();
			this.execCommand('unlink');
			this.linkObserverTooltipClose(false);

		}, this));


		tooltip.append(aLink);
		tooltip.append(' | ');
		tooltip.append(aEdit);
		tooltip.append(' | ');
		tooltip.append(aUnlink);
		tooltip.css({
			top: (pos.top + 20) + 'px',
			left: pos.left + 'px'
		});

		$('.redactor-link-tooltip').remove();
		$('body').append(tooltip);
	},
	linkShow: function()
	{
		//needed to fix link bug
		this.selectionRemoveMarkers();
		this.selectionSave();

		var callback = $.proxy(function()
		{
			// Predefined links
			if (this.opts.predefinedLinks !== false)
			{
				this.predefinedLinksStorage = {};
				var that = this;
				$.getJSON(this.opts.predefinedLinks, function(data)
				{
					var $select = $('#redactor-predefined-links');
					$select .html('');
					$.each(data, function(key, val)
					{
						that.predefinedLinksStorage[key] = val;
						$select.append($('<option>').val(key).html(val.name));
					});

					$select.on('change', function()
					{
						var key = $(this).val();
						var name = '', url = '';
						if (key != 0)
						{
							name = that.predefinedLinksStorage[key].name;
							url = that.predefinedLinksStorage[key].url;
						}

						$('#redactor_link_url').val(url);
						$('#redactor_link_url_text').val(name);

					});

					$select.show();
				});
			}

			this.insert_link_node = false;

			var sel = this.getSelection();
			
			var url = '', text = '', target = '';

			//var elem = $global_link
			var elem = this.getParent();
			//console.log(this);
			//console.log(elem);
			var par = $(elem).parent().get(0);
			if (par && par.tagName === 'A')
			{
				elem = par;
			}
			//console.log(elem);
			if (elem && elem.tagName === 'A')
			{
				//get jquery href that's not encoded
				url = $(elem).attr('href');
				text = $(elem).text();
				target = elem.target;

				this.insert_link_node = elem;
			}
			else text = sel.toString();

			$('#redactor_link_url_text').val(text);

			var thref = self.location.href.replace(/\/$/i, '');
			url = url.replace(thref, '');
			url = url.replace(/^\/#/, '#');
			url = url.replace('mailto:', '');

			// deal with templated links
			if (this.opts.linkProtocol === 'templated')
			{	
				var pathname_cut = self.location.pathname.replace(/\/write/, '');
				var re = new RegExp('^(http|ftp|https)://' + self.location.host + pathname_cut + '/', 'i');
				url = url.replace(re, '');
			}

			// set url
			$('#redactor_link_url').val(url);

			if (target === '_blank')
			{
				$('#redactor_link_blank').prop('checked', true);
			}

			this.linkInsertPressed = false;
			$('#redactor_insert_link_btn').on('click', $.proxy(this.linkProcess, this));


			setTimeout(function()
			{
				$('#redactor_link_url').focus();

			}, 200);

		}, this);

		this.show_link_modal(this.opts.curLang.link, this.opts.modal_link, 460, callback);

	}
}
