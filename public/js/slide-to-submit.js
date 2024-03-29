// slide-to-submit.js version 0.1.1

(function($) {
	$.fn.extend({
		slideToSubmit: function(options) {
			var defaults = {
				graceZone: 100,
				successText: 'Sending...',
				errorText: 'Check Required Fields',
				submitDelay: 500
			}
			var options = $.extend(defaults, options);

			// Runs after you've dragged and released
			function releaseSlideSubmit() {
				// If draggable item exitst
				if($('.slide-submit-dragging').length){

					var newpos_x = $('.slide-submit-dragging').position().left,
						max_x = $('.slide-submit-dragging').parent().outerWidth(),
						accepted_x = max_x - options.graceZone;

					if(newpos_x == '0'){
						// You clicked instead of dragged. Lets give you a hint.
						$('.slide-submit-dragging').animate({'left':'10px'},150);
						$('.slide-submit-dragging').animate({'left':'0px'},100);
						$('.slide-submit-dragging').animate({'left':'10px'},150);
						$('.slide-submit-dragging').animate({'left':'0px'},100);

					} else if (newpos_x >= accepted_x) {
						// Dragged all the way! Lets check validity

						$('.slide-submit-dragging').parent().find('.slide-submit-text').text(options.successText);
						$('.slide-submit-dragging').addClass('slide-submit-delay').animate({
							'left': max_x - $('.slide-submit-dragging').outerWidth()
						}, 150);
						  $('.slide-submit-dragging').parent().addClass('slide-success');
						setTimeout(function(){
							$('.slide-submit-delay').parents('form').find('input[type=submit]').click();
							$('.slide-submit-delay').removeClass('slide-submit-delay');
						}, options.submitDelay);
					} else {
						// Didn't drag enough, reset.
						$('.slide-submit-dragging').animate({
							'left': '0'
						}, 150);
					}
					// Remove class from dragged item
					$('.slide-submit-dragging').removeClass('slide-submit-dragging');
				}
			}
			function releaseSlideSubmitPortrait() { //Not Using this function.
				// If draggable item exitst
				if($('.slide-submit-dragging').length){

					var newpos_y = $('.slide-submit-dragging').position().top,
						max_y = $('.slide-submit-dragging').parent().outerHeight(),
						accepted_y = max_y - options.graceZone;

					if(newpos_y == '0'){
						// You clicked instead of dragged. Lets give you a hint.
						$('.slide-submit-dragging').animate({'top':'10px'},150);
						$('.slide-submit-dragging').animate({'top':'0px'},100);
						$('.slide-submit-dragging').animate({'top':'10px'},150);
						$('.slide-submit-dragging').animate({'top':'0px'},100);

					} else if (newpos_y >= accepted_y) {
						// Dragged all the way! Lets check validity

						$('.slide-submit-dragging').parent().find('.slide-submit-text').text(options.successText);
						$('.slide-submit-dragging').addClass('slide-submit-delay').animate({
							'top': max_y - $('.slide-submit-dragging').outerHeight()
						}, 150);
						$('.slide-submit-dragging').parent().addClass('slide-success');
						setTimeout(function(){
							$('.slide-submit-delay').parents('form').find('input[type=submit]').click();
							$('.slide-submit-delay').removeClass('slide-submit-delay');
						}, options.submitDelay);
					} else {
						// Didn't drag enough, reset.
						$('.slide-submit-dragging').animate({
							'top': '0'
						}, 150);
					}
					// Remove class from dragged item
					$('.slide-submit-dragging').removeClass('slide-submit-dragging');
				}
			}
		// Mouse dragging
		(function($) {
			$.fn.slideSubmit = function(opt) {

				opt = $.extend({
					cursor: "move"
				}, opt);

				var $el = this;

				return $el.on("mousedown", function(e) {
					var $drag = $(this).addClass('slide-submit-dragging');
					var drg_h = $drag.outerHeight(),
						drg_w = $drag.outerWidth(),
						pos_x = $drag.offset().left + drg_w - e.pageX,
						max_x = $('.slide-submit-dragging').parent().outerWidth();
					$drag.parents().on("mousemove", function(e) {			
						$('.slide-submit-dragging').offset({
							left: e.pageX + pos_x - drg_w
						});
					});
					e.preventDefault(); // disable selection
				}).on("mouseup", function(e) {
					//releaseSlideSubmit();
				});
			}
		})(jQuery);
		$('.slide-submit-thumb').slideSubmit();

		window.addEventListener("mouseup", function(event) {;
			$('.slide-submit-dragging').parents().off('mousemove');
			releaseSlideSubmit();
		})

		// Touch dragging
		$.fn.draggable = function() {
			var offset = null;
			var start = function(e) {
				var orig = e.originalEvent;
				var pos = $(this).position();
				/*if (isPortrait()) {
					offset = {
						x: orig.changedTouches[0].pageX - pos.left,
						y: orig.changedTouches[0].pageY - pos.top
					};
				}else {
					offset = {
						x: orig.changedTouches[0].pageX - pos.left,
						y: orig.changedTouches[0].pageY - pos.top
					};
				}*/
				offset = {
					x: orig.changedTouches[0].pageX - pos.left,
					y: orig.changedTouches[0].pageY - pos.top
				};
			};
			var moveItem = function(e) {
				e.preventDefault();
				var orig = e.originalEvent;
				/*if (isPortrait()) {
					$(this).addClass('slide-submit-dragging').css({
						top: orig.changedTouches[0].pageY - offset.y
					});
				}else {
					$(this).addClass('slide-submit-dragging').css({
						left: orig.changedTouches[0].pageX - offset.x
					});
				}*/

				$(this).addClass('slide-submit-dragging').css({
					left: orig.changedTouches[0].pageX - offset.x
				});
			};
			var releaseItem = function(e){
				/*if (isPortrait()) {
					releaseSlideSubmitPortrait();
				}else{
					releaseSlideSubmit();
				}*/
				releaseSlideSubmit();
				e.preventDefault();
			};

			const isPortrait = function () {
				return window.innerHeight > window.innerWidth;
			};
			this.bind("touchstart", start);
			this.bind("touchmove", moveItem);
			this.bind("touchend", releaseItem);
		};
		$('.slide-submit-thumb').draggable();

		}
	});
})(jQuery);