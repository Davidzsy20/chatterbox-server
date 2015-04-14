var Message = Backbone.Model.extend({
  defaults: {
    username: '',
    text: '',
    roomname: '',
    objectId: ''
  },

  url: 'https://api.parse.com/1/classes/chatterbox'
});

var Messages = Backbone.Collection.extend({
  model: Message,
  url: 'https://api.parse.com/1/classes/chatterbox',

  loadMsgs: function() {
    this.fetch({
      data: {
        order: '-createdAt',
        limit: 30
      },
      success: function(response) {
        // console.log(response);
      }
    });
  },

  parse: function(response, options) {
    var results = [];
    for (var i = response.results.length-1; i >= 0; i--) {
      results.push(response.results[i]);
    }
    return results;
  }
});

var FormView = Backbone.View.extend({

  initialize: function() {
    console.log('formview!');
  },

  events: {
    'submit #send': 'handleSubmit'
  },

  handleSubmit: function(e) {
    e.preventDefault();

    console.log('submitted');

    var $text = this.$('#message');

    var message = {
      username: window.location.search.slice(10),
      text: $text.val()
    }

    $text.val('');

    // var message = new Message(message);
    // message.save();
    this.collection.create(message);
  }

});

var MessageView = Backbone.View.extend({

  template: _. template('<div class="chat" data-id="<%= objectId %>"> \
    <div class="username"><%- username %></div> \
    <div class="text"><%- text %></div> \
    </div>'),

  render: function() {
    this.$el.html(this.template(this.model.attributes));
    return this.$el;
  }

});

var MessagesView = Backbone.View.extend({

  initialize: function() {
    this.collection.on('sync', this.render, this);
    this.collection.on('add', this.render, this);
  },

  render: function() {
    this.collection.forEach(this.renderMessage, this);
  },

  renderMessage: function(message) {
    var messageView = new MessageView({model: message});
    var $html = messageView.render();
    this.$el.prepend($html);
  }
});