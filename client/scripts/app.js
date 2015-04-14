// YOUR CODE HERE:
$(document).ready(function () {

  var app = {

    //server: 'https://api.parse.com/1/classes/chatterbox',
    server: 'http://localhost:3000',
    friends: [],

    rooms: [],

    roomname: 'LOBBY',
    username: "",

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
        app.roomname = 'all';
        app.fetch();
      });

      $('.room-submit').on("click", function () {
        var room = $('.room-create').val();
        $('.room-create').val('');
        app.addRoom(room);
        app.roomname = room;
      });

      $('#room-select').on('click', 'div', function() {
        var roomname = this.innerHTML;
        roomname = app.escapeHtml(roomname);
        app.enterRoom(roomname);
        app.roomname = roomname;
      });

      $('#chats').on('click', '.username', function() {
        var username = this.innerHTML;
        username = app.escapeHtml(username);
        app.addFriend(username);
      });

      console.log(localStorage.getItem("username"));
      app.username = localStorage.getItem("username") || "";
      $('.username-select').val(app.escapeHtml(app.username));

      app.fetchRooms();
    },


  // renewClickHandlers: function () {
  //     $('.username').on("click", function () {
  //       var username = this.innerHTML;
  //       username = app.escapeHtml(username);
  //       app.addFriend(username);
  //     });

  //     $('.roomname').on("click", function () {
  //       var roomname = this.innerHTML;
  //       roomname = app.escapeHtml(roomname);
  //       app.enterRoom(roomname);
  //       app.roomname = roomname;
  //     });
  //   },

    send: function (message) {

      $.ajax({
        url: app.server + "/classes/messages",
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
          // localStorage.setItem("data", data);
          // console.log(localStorage.getItem("data"));
          data = JSON.parse(data);

          app.clearMessages();
          _.each(data.results, function (message) {
            if (message.roomname === app.roomname || app.roomname === 'all') {
              app.addMessage(message);
            }
          });
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
      $('#chats').prepend('<div class="chat"><span class="username">' + message.username + '</span>: ' + message.text + ' | ' + message.roomname + '</div>');
    },

    addRoom: function (roomname) {
      if(roomname === undefined || roomname === ""){
        console.log("addRoom: WARNING: no room name");
        return;
      }

      $.ajax({
        url: app.server + "/classes/room",
        type: 'POST', 
        data: JSON.stringify({roomname: roomname}),
        contentType: 'application/json',
        success: function (data) {
          app.roomname = roomname;
          app.displayRooms(JSON.parse(data).results);
        },
        error: function (data) {
          // see: https://developer.mozilla.org/en-US/docs/Web/API/console.error
          console.error('chatterbox: Failed to add message');
        }
      });
    },

    fetchRooms: function(){
       $.ajax({
        // always use this url
        url: app.server + "/classes/room",
        type: 'GET',
        // data: {
        //   // order: '-createdAt',
        //   // limit: 30
        // },
        contentType: 'application/json',
        success: function (data) {
          console.log('chatterbox: rooms received');
          data = JSON.parse(data).results;
          app.displayRooms(data);
        },
        error: function (data) {
          // see: https://developer.mozilla.org/en-US/docs/Web/API/console.error
          console.error('chatterbox: Failed to receive messages');
        }
      });
    },

    displayRooms: function(rooms){
      var roomHolder = $('#room-select');
      roomHolder.html("");
      _.each(rooms, function(room){
        roomHolder.append("<div>" + room.roomname + "</div>");
      });

    },

    enterRoom: function(roomname){
      $.ajax({
        // always use this url
        url: app.server + '/classes/messages',
        type: 'GET',
        contentType: 'application/json',
        success: function (data) {
          console.log('chatterbox: Messages received');
          app.clearMessages();
          _.each(JSON.parse(data).results, function (message) {
            if(message.roomname === roomname) {
              app.addMessage(message);
            }

          });
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
      console.log("app.roomname ", app.roomname);
      var username = $('.username-select').val();
      app.username = username;
      localStorage.setItem('username', username);
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
