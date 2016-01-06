(function($)
{
	$.Redactor.prototype.clips = function()
	{
		return {
			init: function()
			{
				redactor_clips_plugin = this;
				
				this.modal.addTemplate('clips', '<div class="modal-section">' + this.utils.getOuterHtml($('#clipsmodal #redactor_modal_content')) + '</div>');

				var button = this.button.add('clips', 'Clips');

				this.button.addCallback(button, this.clips.show);

			},
			show: function()
			{
				this.modal.load('clips', 'Insert Clips', 1000);

				$('#redactor-modal-body').find('.redactor_clip_link').each($.proxy(this.clips.load, this));

				this.modal.show();
			},
			load: function(i,s)
			{
				$(s).on('click', $.proxy(function(e)
				{
					e.preventDefault();
					if ($(s).hasClass('page_target_clip')) {
						var $clip = $(s).next();
						regex = new RegExp($(s).data('regex'));
						if (regex.test(redactor_clips_plugin.code.get())) {
							$clip.html($clip.data('match'));
						} else {
							$clip.html($clip.data('nomatch'));
						}
					}
					this.clips.insert($(s).next().html());

				}, this));
			},
			insert: function(html)
			{
				this.buffer.set();
				this.air.collapsedEnd();
				this.insert.html(html);
				this.modal.close();
			}
		};
	};
})(jQuery);

