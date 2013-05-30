// The result view provides event handlers for each search result:
var ResultView = Backbone.View.extend({
  // Event handlers for the different buttons:
  events: {
    'click': 'viewDetail',
    'mouseover': 'mouseOver',
    'mouseout': 'mouseOut'
  },

  // Set up the wrapper and render the result:
  initialize: function() {
    this.wrapper = $('#search-results-container');
    this.render();
  },

  // Renderer:
  render: function() {
    // Set up the view data:
    var food = this.model;
    var viewData = {
      result_name: food.get('name'), 
      result_img: food.get('photo')
    }

    // Render the template:
    var template = _.template($('#food-thumb-html').html(), viewData);

    // Put the rendered HTML into the DOM:
    this.$el.html(template);
    this.wrapper.append(this.el);
  },

  mouseOver: function(){
    this.$el.find('img').addClass('transparent');
  },

  mouseOut: function(){
    this.$el.find('img').removeClass('transparent');
  },

  // Callback for viewing food detail
  viewDetail: function () {
    // Empty current detail view
    $('#detail-container').html('');

    var food = this.model;
    var detailView = new DetailView({model: food});
  },
});

var ResultWrapperView = Backbone.View.extend({
  initialize: function() {
    this.aboveDiv = $('#detail-wrapper');
  },

  updateHeight: function(){
    var aboveDiv = this.aboveDiv;
    var offset = 0;
    if (aboveDiv.height() > 0) {
      offset = 40;
    }
    this.$el.css('height', ($(window).height() - aboveDiv.height() - offset) + 'px');
  }
});