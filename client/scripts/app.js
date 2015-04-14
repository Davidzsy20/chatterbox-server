// YOUR CODE HERE:
$(document).ready(function () {

  var app = {

    //server: 'https://api.parse.com/1/classes/chatterbox',
    server: 'http://localhost:3000',
    friends: [],

    rooms: [],

    roomname: 'lobby',

    init: function () {

      $('#submit').click(function (ev) {
        ev.preventDefault();

        var text = $('#message').val();
        $('#message').val("");

        app.handleSubmit(text);
      });

      $('.get-latest-messages').on("click", function () {
        app.fetch();
      });

      $('.all-rooms').on("click", function () {
        app.fetch();
      });
    },


  renewClickHandlers: function () {
      $('.username').on("click", function () {
        var username = this.innerHTML;
        username = app.escapeHtml(username);
        app.addFriend(username);
      });

      $('.room-submit').on("click", function () {
        var room = $('.room-create').val();
        $('.room-create').val('');
        app.addRoom(room);
        app.roomname = room;
      });

      $('.roomname').on("click", function () {
        var roomname = this.innerHTML;
        roomname = app.escapeHtml(roomname);
        app.enterRoom(roomname);
        app.roomname = roomname;
      });
    },

    send: function (message) {
      $.ajax({
        url: app.server,
        type: 'POST',
        data: JSON.stringify(message),
        contentType: 'application/json',
        success: function (data) {
          console.log('chatterbox: Message sent');
          app.clearMessages();
          app.fetch();
        },
        error: function (data) {
          // see: https://developer.mozilla.org/en-US/docs/Web/API/console.error
          console.error('chatterbox: Failed to send message');
        }
      });
    },

    fetch: function () {

      $.ajax({
        // always use this url
        url: app.server + "/classes/messages",
        type: 'GET',
        // data: {
        //   // order: '-createdAt',
        //   // limit: 30
        // },
        contentType: 'application/json',
        success: function (data) {
          console.log('chatterbox: Messages received');
          app.clearMessages();
          _.each(data.results, function (message) {
            app.addMessage(message);
            app.addRoom(message.roomname);
          });
          app.renewClickHandlers();
        },
        error: function (data) {
          // see: https://developer.mozilla.org/en-US/docs/Web/API/console.error
          console.error('chatterbox: Failed to receive messages');
        }
      });
    },

    clearMessages: function () {
      $('#chats').html('');
    },

    addMessage: function (message) {

      message.text = app.escapeHtml(message.text);

      if (_.contains(app.friends, message.username)) {
        message.text = '<strong>' + message.text + '</strong>';
      }

      $('#chats').append('<div class="chat"><span class="username">' + message.username + '</span>: ' + message.text + ' | ' + message.roomname + '</div>');
    },

    addRoom: function (roomname) {
      if (!_.contains(app.rooms, roomname)&& roomname !== undefined) {
        app.rooms.push(roomname);
        $('#roomSelect').append('<div class="roomname">' + roomname + '</div>');
      }
    },

    enterRoom: function(roomname){
      $.ajax({
        // always use this url
        url: app.server,
        type: 'GET',
        data: {
          order: '-createdAt',
          limit: 10
        },
        contentType: 'application/json',
        success: function (data) {
          console.log('chatterbox: Messages received');
          app.clearMessages();
          $('#roomSelect').html('');
          app.rooms = [];
          _.each(data.results, function (message) {
            if(message.roomname === roomname) {
              app.addMessage(message);
            }
            app.addRoom(message.roomname);
          });
          app.renewClickHandlers();
        },
        error: function (data) {
          // see: https://developer.mozilla.org/en-US/docs/Web/API/console.error
          console.error('chatterbox: Failed to receive messages');
        }
      });

    },

    addFriend: function (friend) {
      if (!_.contains(app.friends, friend)) {
        app.friends.push(friend);
        $('#friends').append('<div>' + friend + '</div>');
        app.fetch();
      }
    },

    handleSubmit: function (text) {
      var roomname = "lobby";
      var username = window.location.search.slice(10);
      var message = {
        username: username,
        text: text,
        roomname: app.roomname
      };
      app.send(message);
    },

    escapeHtml: function (string) {
      var entityMap = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': '&quot;',
        "'": '&#39;',
        "/": '&#x2F;'
      };
      return String(string).replace(/[&<>"'\/]/g, function (s) {
        return entityMap[s];
      });
    }
  };

  app.init();
  app.fetch();
});
