/**
 * TimWolla.WCF.Chat
 * 
 * @author	Tim Düsterhus
 * @copyright	2010-2011 Tim Düsterhus
 * @license	Creative Commons Attribution-NonCommercial-ShareAlike <http://creativecommons.org/licenses/by-nc-sa/3.0/legalcode>
 * @package	timwolla.wcf.chat
 */
if (typeof TimWolla == 'undefined') var TimWolla = {};
if (typeof TimWolla.WCF == 'undefined') TimWolla.WCF = {};
	

(function ($, document) {
	TimWolla.WCF.Chat = {
		titleTemplate: null,
		messageTemplate: null,
		init: function(roomID, messageID) {
			this.bindEvents();
			// calculate the width for the chatRoomContent, 'cause the styles width isn't fixed.
			$('#chatRoomContent').width($('#chatBox').width() - 400);
			// add toRight1.svg to WCF.Icon-storage
			WCF.Icon.add('wcf.icon.toRight1', $('#chatForm .inputImage').attr('src'));
			$('#chatInput').focus();
		},
		/**
		 * Binds all the events needed for Tims Chat.
		 */
		bindEvents: function () {
			$('.smiley').click($.proxy(function (event) {
				this.insertText($(event.target).attr('alt'));
			}, this));

			// recalculate the width of chatRoomContent on resize
			var chatRoomContent = $('#chatRoomContent');
			var chatBox = $('#chatBox');
			$(window).resize(function() {
				chatRoomContent.width(chatBox.width() - 400);
			});
			
			// $(window).bind('beforeunload', function() {
				// return false;
			// });
			
			$('.chatRoom').click($.proxy(function (event) {
				if (typeof window.history.replaceState != 'undefined') {
					event.preventDefault();
					this.changeRoom($(event.target));
				}
			}, this));
			
			$('.chatUser .chatUserLink').click($.proxy(function (event) {
				event.preventDefault();
				this.toggleUserMenu($(event.target));
			}, this));
			
			$('#chatForm').submit($.proxy(function (event) {
				// check the input, if not empty send it.
				if ($('#chatInput').val().trim().length === 0) return false;
				
				event.preventDefault();
				textInput = $(event.target).find('#chatInput');
				submitButton = $(event.target).find('input[type=image]');
				
				$.ajax('index.php/Chat/Send/', {
					dataType: 'json',
					data: { ajax: 1,
							text: textInput.val()
						  },
					type: 'POST',
					beforeSend: $.proxy(function (jqXHR) {
						submitButton.attr('src', WCF.Icon.get('wcf.icon.loading'));
					}),
					success: $.proxy(function (data, textStatus, jqXHR) {
						this.getMessages();
						textInput.val('').focus();
					}, this),
					error: function() {
						// TODO: find a nicer solution.
						alert('Error while sending message');
					},
					complete: function() {
						submitButton.attr('src', WCF.Icon.get('wcf.icon.toRight1'));
					}
				});
			}, this));
		},
		/**
		 * Changes the chat-room.
		 * 
		 * @param	object	target
		 */
		changeRoom: function (target) {
			window.history.replaceState({}, '', target.attr('href'));
			
			// actually change the room
			$.ajax(target.attr('href'), {
				dataType: 'json',
				data: { ajax: 1 },
				type: 'POST',
				success: $.proxy(function (data, textStatus, jqXHR) {
					this.loading = false;
					
					target.parent().removeClass('ajaxLoad');
					
					// mark as active;
					$('.activeMenuItem .chatRoom').parent().removeClass('activeMenuItem');
					target.parent().addClass('activeMenuItem');
					
					// set new topic
					if (data.topic == '') {
						if (data.topic == '' && $('#topic').text().trim() == '') return;
						
						$('#topic').wcfBlindOut('vertical', function () {
							$(this).text('');
						});
					}
					else {
						if ($('#topic').text().trim() != '') $('#topic').text(data.topic);
						else {
							$('#topic').text(data.topic);
							$('#topic').wcfBlindIn();
						}
					}
					
					// set page-title
					$('title').text(this.titleTemplate.fetch(data));
				}, this),
				error: function() {
					// reload page to change the room the old fashion-way
					// inclusive the error-message :)
					window.location.reload(true);
				},
				beforeSend: $.proxy(function () {
					if (this.loading || target.parent().hasClass('activeMenuItem')) return false;
					
					this.loading = true;

					target.parent().addClass('ajaxLoad');
				}, this)
			});
		},
		getMessages: function (id) {
		
		},
		/**
		 * Appends the messages.
		 * 
		 * @param	array<object>	messages
		 */
		handleMessages: function (messages) {
			for (message in messages) {
				message = messages[message];
				output = this.messageTemplate.fetch(message);
				
				li = $('<li></li>');
				li.addClass('chatMessage chatMessage'+message.type);
				if (message.sender == WCF.User.userID) li.addClass('ownMessage');
				li.append(output);
				
				$('.chatMessageContainer ul').append(li);
			}
			$('.chatMessageContainer').animate({scrollTop: $('.chatMessageContainer ul').height()}, 10000);
		},
		/**
		 * Inserts text into the chat-input.
		 * 
		 * @param	string	text
		 * @param	object	options
		 */
		insertText: function (text, options) {
			options = $.extend({
				append: true,
				submit: false
			}, options || {});
				
			if (options.append) {
				text = $('#chatInput').val() + text;
			}
			$('#chatInput').val(text);
			
			if (options.submit) $('#chatForm').submit();
			else $('#chatInput').focus();
		},
		toggleUserMenu: function (target) {
			liUserID = '#' + target.parent().parent().attr('id');
			if ($(liUserID).hasClass('activeMenuItem')) {
				$(liUserID + ' .chatUserMenu').wcfBlindOut('vertical', function () {
					$(liUserID).removeClass('activeMenuItem');
				});
			}
			else {
				$(liUserID).addClass('activeMenuItem');
				$(liUserID + ' .chatUserMenu').wcfBlindIn();
			}
		}
	};
})(jQuery, document);