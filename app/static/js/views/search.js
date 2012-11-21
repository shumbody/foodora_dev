// The search view handles the functionality for the search box:
var searchTimeout; // used to detect typing
var SearchView = Backbone.View.extend({
  // Tell Backbone which element to use:
  id: 'search-wrapper',

  // Initialize the element and render it:
  initialize: function () {
    this.$el = $('#search-wrapper');
    this.render();
  },

  // Renderer:
  /*
  render: function () {
    // Compile the template using underscore
    var template = _.template($('#search-html').html(), {});

    // Load the compiled HTML into the wrapper
    this.$el.html(template);
    return this;
  },
  */

  // Only one event handler: keypress:
  events: {
    'keypress #search-input' : 'searchEnter'
  },

  // Callback for keypress event handler:
  searchEnter: function (e) {
    // If that timer is already set, then clear it:
    if (searchTimeout != undefined) clearTimeout(searchTimeout);
    var that = this;

    // Set a timer to detect if the user has stopped typing
    // (no keypress in 250ms):
    searchTimeout = setTimeout(function () {
      // If they have stopped...
      var q = $('#search-input').val();

      // ...call the search method:
      that.search(q);
      foodora.appRouter.navigate('search/' + q);
    }, 250);
  },

  // Search handler, performs a search:
  search: function (query) {
    // Clean search term
    var q = $.trim(query.toLowerCase());
    var that = this;

    // Call search controller
    $.get('search', {'query': q}, function(data){
      if (data.results !== undefined && data.results.length > 0) {
        var results_list = [];

        // Empty current results list
        $('#search-results-container').html('');

        // Render the new results:
        for (each in data.results){
          var foodModelData = data.results[each];

          var food_model = new FoodModel(restaurantModelData);
          var food_list_view = new ListView({model: food_model});
          results_list.push(food_mo);
        }

        // Create the result collection
        var result_collection = new ResultCollection(results_list);
      }
    });
  },

  // Update the searchbox (used in event handlers):
  updateSearchDisplay: function (searchTerm) {
    this.$el.find($('#search-input')).val(searchTerm);
  }
});
