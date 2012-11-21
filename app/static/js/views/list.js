// The result view provides event handlers for each search result:
var ListView = Backbone.View.extend({
  // Tell Backbone how to make the DOM element:
  className: 'result',

  // Event handlers for the different buttons:
  events: {
    'click': 'viewDetail',
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
      result_name : restaurant.get('name'), 
      result_food_items: truncateString(restaurant.get('food_items').join(', ')),
      result_cuisines : restaurant.get('cuisine').join(', '),
      result_address_city: restaurant.get('address_city'),
      result_deliveries: restaurant.get('deliveries')
    }

    // Render the template:
    var template = _.template($('#result-html').html(), viewData);

    // Put the rendered HTML into the DOM:
    this.$el.html(template);
    this.wrapper.append(this.el);
  },

  // Callback for create delivery event handler:
  viewDetail: function () {
    // TODO: shouldn't store the ID in the ID field.
    var deliveryId = this.model.get('id');
    this.model.get('deliveryView').createDelivery(deliveryId);

    // Tell the router where we're going:
    hungr.appRouter.navigate('delivery/' + idToCode(deliveryId));
  }
});
