/*
	Redactor Edit Image
	by Jason Rosenbaum, the Action Network
	
	Version 2.0
	Released December 29, 2015
	
	
	Instructions:
	
		This plugin edits how images are handled in redactor, adding width and source input boxes, stopping image resizing and selecting in IE, and fixing 100% and centered images and the editing popover. For Redactor II.
	
	
	MIT license:
	
	Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
	
	The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
	
	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

$.Redactor.prototype.edit_image = function() {
	return {
		getTemplate: function(template)
        {
	        if (template == 'edit_image') {
		        return String()	
				+ '<div class="redactor-modal-tab redactor-group" data-title="General">'
					+ '<div id="redactor-image-preview" class="redactor-modal-tab-side">'
					+ '</div>'
					+ '<div class="redactor-modal-tab-area">'
						+ '<section>'
							+ '<label>Source (usually should start with http://)</label>'
							+ '<input type="text" id="redactor_file_src" />'
						+ '</section>'
						+ '<section>'
							+ '<label>' + this.lang.get('title') + '</label>'
							+ '<input type="text" id="redactor-image-title" />'
						+ '</section>'
						+ '<section>'
							+ '<label>' + this.lang.get('link') + ' (usually should start with http://)' + '</label>'
							+ '<input type="text" id="redactor-image-link" aria-label="' + this.lang.get('link') + '" />'
							+ '<label class="checkbox"><input type="checkbox" id="redactor-image-link-blank" aria-label="' + this.lang.get('link-in-new-tab') + '"> ' + this.lang.get('link-in-new-tab') + '</label>'
						+ '</section>'
						+ '<section>'
							+ '<label>Position</label>'
							+ '<select id="redactor_form_image_align">'
								+ '<option value="none">None</option>'
								+ '<option value="left">Left</option>'
								+ '<option value="center">Center</option>'
								+ '<option value="right">Right</option>'
							+ '</select>'
						+ '</section>'
						+ '<section>'
							+ '<label>Width</label>'
							+ '<input type="text" id="redactor_image_width" />'
						+ '</section>'
						+ '<section>'
							+ '<button id="redactor-modal-button-action">Insert</button>'
							+ '<button id="redactor-modal-button-cancel">Cancel</button>'
							+ '<button id="redactor-modal-button-delete" class="redactor-modal-button-offset">Delete</button>'
						+ '</section>'
					+ '</div>'
				+ '</div>'
	        } else if (template == 'upload_image') {
		        return String()
				+ '<div class="redactor-modal-tab" data-title="Upload">'
				    + '<section>'
						+ '<div id="redactor-modal-image-droparea"></div>'
					+ '</section>'
					+ '<section>'
						+ '<label>Or Use Image Link (usually should start with http://)</label>'
						+ '<input type="text" id="redactor_image_upload_link" />'
					+ '</section>'
					+ '<section>'
						+ '<button id="redactor-modal-button-action">Save</button>'
						+ '<button id="redactor-modal-button-cancel">Cancel</button>'
					+ '</section>'
				+ '</div>'
	        }
            
        },
		init: function() {
			this.image.showEdit = $.proxy(
				function($image)
				{
					//console.log('show');
					if (this.events.imageEditing)
					{
						return;
					}
		
					this.observe.image = $image;
		
					var $link = $image.closest('a', this.$editor[0]);
					
					this.modal.addTemplate('edit_image', this.edit_image.getTemplate('edit_image'));
					this.modal.load('edit_image', 'Edit', 705);
		
					//this.modal.load('image-edit', this.lang.get('edit'), 705);
		
					this.image.buttonDelete = this.modal.getDeleteButton().text(this.lang.get('delete'));
					this.image.buttonSave = this.modal.getActionButton().text(this.lang.get('save'));
		
					this.image.buttonDelete.on('click', $.proxy(this.image.remove, this));
					this.image.buttonSave.on('click', $.proxy(this.image.update, this));
		
					if (this.opts.imageCaption === false)
					{
						$('#redactor-image-caption').val('').hide();
					}
					else
					{
						var $next = $image.next();
						if ($next.length !== 0 && $next[0].tagName === 'FIGCAPTION')
						{
							$('#redactor-image-caption').val($next.text()).show();
						}
					}
		
					$('#redactor-image-preview').html($('<img src="' + $image.attr('src') + '" style="max-width: 100%;">'));
					$('#redactor-image-title').val($image.attr('alt'));
		
					var $redactorImageLink = $('#redactor-image-link');
					$redactorImageLink.attr('href', $image.attr('src'));
					if ($link.length !== 0)
					{
						$redactorImageLink.val($link.attr('href'));
						if ($link.attr('target') === '_blank')
						{
							$('#redactor-image-link-blank').prop('checked', true);
						}
					}
					
					$('#redactor_file_src').val($image.attr('src'));
					
					if ($image.css('display') == 'block' && $image.css('float') == 'none' && $image.prop('style').margin == 'auto')
					{
						$('#redactor_form_image_align').val('center');
					}
					else if ($image.css('display') == 'block' && $image.css('float') == 'none') 
					{
						$('#redactor_form_image_align').val('none');
					}
					else
					{
						$('#redactor_form_image_align').val($image.css('float'));
					}
					
					if ($image.prop('style').width) {
						$('#redactor_image_width').val($image.prop('style').width);
					}
		
					// hide link's tooltip
					$('.redactor-link-tooltip').remove();
		
					this.modal.show();
		
					// focus
					if (this.detect.isDesktop())
					{
						$('#redactor-image-title').focus();
					}
					
					//don't make images selectable in IE
					if (this.detect.isIe()) {
						$image.removeAttr('unselectable');	
					}
		
				}, 
			this);
			
			this.image.update = $.proxy(
				function()
				{
					//console.log('update');
					var $image = this.observe.image;
					var $link = $image.closest('a', this.core.editor()[0]);
	
					var title = $('#redactor-image-title').val().replace(/(<([^>]+)>)/ig,"");
					$image.attr('alt', title).attr('title', title);
					
					$image.attr('src', $('#redactor_file_src').val());
	
					var floating = $('#redactor_form_image_align').val();
					var margin = '';
			
					if (floating === 'left')
					{
						margin = '0 10px 10px 0';
						$image.css({ 'float': 'left', 'margin': margin, 'width':  $('#redactor_image_width').val() });
					}
					else if (floating === 'right')
					{
						margin = '0 0 10px 10px';
						$image.css({ 'float': 'right', 'margin': margin, 'width':  $('#redactor_image_width').val() });
					}
					else if (floating === 'center')
					{
						$image.css({ 'float': '', 'display': 'block', 'margin': 'auto', 'width':  $('#redactor_image_width').val() });
					}
					else
					{
						$image.css({ 'float': '', 'display': '', 'margin': '', 'width':  $('#redactor_image_width').val() });
					}
					
					//if (navigator.appVersion.indexOf("MSIE") !== -1 || navigator.appVersion.indexOf("Trident") !== -1) {
						//$image.attr('unselectable','on');
					//}
					
					// as link
					var link = $.trim($('#redactor-image-link').val()).replace(/(<([^>]+)>)/ig,"");
					if (link !== '')
					{
						// test url (add protocol)
						var pattern = '((xn--)?[a-z0-9]+(-[a-z0-9]+)*\\.)+[a-z]{2,}';
						var re = new RegExp('^(http|ftp|https)://' + pattern, 'i');
						var re2 = new RegExp('^' + pattern, 'i');
	
						if (link.search(re) === -1 && link.search(re2) === 0 && this.opts.linkProtocol)
						{
							link = this.opts.linkProtocol + '://' + link;
						}
	
						var target = ($('#redactor-image-link-blank').prop('checked')) ? true : false;
	
						if ($link.length === 0)
						{
							var a = $('<a href="' + link + '">' + this.utils.getOuterHtml($image) + '</a>');
							if (target)
							{
								a.attr('target', '_blank');
							}
	
							$image.replaceWith(a);
						}
						else
						{
							$link.attr('href', link);
							if (target)
							{
								$link.attr('target', '_blank');
							}
							else
							{
								$link.removeAttr('target');
							}
						}
					}
					else if ($link.length !== 0)
					{
						$link.replaceWith(this.utils.getOuterHtml($image));
	
					}
	
	
					this.modal.close();
	
					// buffer
					this.buffer.set();
	
				},
			this);
			
			this.image.show = $.proxy(
				function()
				{
					// build modal
					this.modal.addTemplate('edit_image', this.edit_image.getTemplate('upload_image'));
					this.modal.load('edit_image', 'Image', 700);
					//this.modal.load('image', this.lang.get('image'), 700);

					// build upload
					this.upload.init('#redactor-modal-image-droparea', this.opts.imageUpload, this.image.insert);
					this.modal.show();
					
					this.image.buttonSave = this.modal.getActionButton();
					var that = this;
					this.image.buttonSave.on('click', function() {
						that.image.insert({ "url": $('#redactor_image_upload_link').val() })
					});
					
					if ($('#redactor_image_upload_link').val() == '') {
						that.image.buttonSave.attr('disabled',true);
						that.image.buttonSave.addClass('disabled');
					}
					
					$('#redactor_image_upload_link').on('change keyup focusout', function() {
						if ($(this).val() == '') {
							that.image.buttonSave.attr('disabled',true);
							that.image.buttonSave.addClass('disabled');
						} else {
							that.image.buttonSave.attr('disabled',false);
							that.image.buttonSave.removeClass('disabled');
						}
					});

				},
			this);
					
			this.image.insert = $.proxy(
				function(json, direct, e)
				{
					var $img;
					//console.log(json);

					// error callback
					if (typeof json.error !== 'undefined')
					{
						this.modal.close();
						this.events.dropImage = false;
						this.core.callback('imageUploadError', json, e);
						return;
					}

					// change image
					if (this.events.dropImage !== false)
					{
						$img = $(this.events.dropImage);

						this.core.callback('imageDelete', $img[0].src, $img);

						$img.attr('src', json.url);

						this.events.dropImage = false;
						this.core.callback('imageUpload', $img, json);
						return;
					}

					this.placeholder.hide();
					//var $figure = $('<figure>');

					$img = $('<img>');
					$img.attr('src', json.url);

					// set id
					var id = (typeof json.id === 'undefined') ? '' : json.id;
					var type = (typeof json.s3 === 'undefined') ? 'image' : 's3';
					//$img.attr('data-' + type, id);
					
					var theImage = new Image();
					theImage.src = $img.attr("src");
					
					//if (navigator.appVersion.indexOf("MSIE") !== -1 || navigator.appVersion.indexOf("Trident") !== -1) {
				    	//$img.attr('unselectable','on');
				    //}

					//$figure.append($img);

					var pre = this.utils.isTag(this.selection.current(), 'pre');

					if (direct)
					{
						this.air.collapsed();
						this.marker.remove();

						var node = this.insert.nodeToPoint(e, this.marker.get());
						var $next = $(node).next();

						this.selection.restore();

						// buffer
						this.buffer.set();

						// insert
						if (typeof $next !== 'undefined' && $next.length !== 0 && $next[0].tagName === 'IMG')
						{
							// delete callback
							this.core.callback('imageDelete', $next[0].src, $next);

							// replace
							$next.closest('p', this.core.editor()[0]).replaceWith($img);
							this.caret.after($img);
						}
						else
						{
							if (pre)
							{
								$(pre).after($img);
							}
							else
							{
								this.insert.node($img);
							}

							this.caret.after($img);
						}

					}
					else
					{
						this.modal.close();

						// buffer
						this.buffer.set();

						// insert
						this.air.collapsed();

						if (pre)
						{
							$(pre).after($img);
						}
						else
						{
							this.insert.node($img);
						}

						this.caret.after($img);
					}

					this.events.dropImage = false;

					this.storage.add({ type: type, node: $img[0], url: $img[0].src, id: id });

					if (direct !== null)
					{
						this.core.callback('imageUpload', $img, json);
					}
				},
			this);
			
			this.observe.images = $.proxy(
				function() {
					this.core.editor().find('img').each($.proxy(function(i, img)
					{
						var $img = $(img);
						
						
	
						// IE fix (when we clicked on an image and then press backspace IE does goes to image's url)
						$img.closest('a', this.$editor[0]).on('click', function(e) { e.preventDefault(); });
	
						this.image.setEditable($img);
						
						//don't make images selectable in IE
						if (this.detect.isIe()) {
							$img.off('mousedown.redactor_ie_image_fix').on('mousedown.redactor_ie_image_fix', function() {
								$img.attr('unselectable', 'on');
							});	
						}
	
	
					}, this));
				},
			this);
		}
	}
}
