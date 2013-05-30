// The search view handles the functionality for the search box:
var searchTimeout; // used to detect typing
var SearchView = Backbone.View.extend({
  // Tell Backbone which element to use:
  id: 'search-bar',

  // Initialize the element and render it:
  initialize: function () {
    this.$el = $('#search-bar');
    this.render();
  },

  // Only one event handler: keypress:
  events: {
    'keypress #search-input' : 'searchEnter'
  },

  // Callback for keypress event handler:
  searchEnter: function (e) {
    // First thing, switch to explore pane
    foodora.exploreButtonView.togglePane();

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
      foodora.appRouter.navigate('search/' + encodeURI(q));
    }, 250);
  },

  // Search handler, performs a search:
  search: function (query) {
    // Clean search term
    var q = $.trim(query.toLowerCase()).split(' ');
    var that = this;

    // Call search controller
    $.get('search', {'query[]': q}, function(data){
      if (data !== undefined && data.length > 0) {
        // Empty current results
        $('#search-results-container').html('');

        // Remove masonry functionality
        $('#search-results-container').masonry('destroy');

        // Render the new results:
        for (each in data){
          var datum = data[each]

          var foodModelData = that.getFoodObject(datum);

          var foodModel = new FoodModel(foodModelData);
          var foodResultView = new ResultView({model: foodModel});

          that.model.get('searchedFoods').add(foodModel);
        }

        reloadMasonry()
      }
      else {
        $('#search-results-container').masonry('destroy');
        $('#search-results-container').html('No results found.');
      }
    });
  },

  random: function(numItems){
    var that = this;
    $.get('random', {'numItems': numItems}, function(data){
        if (data !== undefined && data.length > 0) {
          // Empty current results
          $('#search-results-container').html('');

          // Remove masonry functionality
          $('#search-results-container').masonry('destroy');

          // Render the new results:
          for (each in data){
            var datum = data[each]

            var foodModelData = that.getFoodObject(datum);

            var foodModel = new FoodModel(foodModelData);
            var foodResultView = new ResultView({model: foodModel});

            that.model.get('searchedFoods').add(foodModel);
          }

          reloadMasonry();
        }
    });
  },

  getFoodObject: function(food){
    var foodModelData = {};
    var datum = food;
    foodModelData.id = datum.pk;
    foodModelData.description = datum.fields.description;
    foodModelData.name = datum.fields.name;
    foodModelData.cuisines = datum.fields.cuisines;
    foodModelData.ingredients = datum.fields.ingredients;
    foodModelData.mealTypes = datum.fields.meal_types;
    foodModelData.tastes = datum.fields.tastes;
    foodModelData.url = datum.fields.url;
    foodModelData.photo = datum.fields.photo;
    return foodModelData;
  },

  // Update the searchbox (used in event handlers):
  updateSearchDisplay: function (searchTerm) {
    this.$el.find($('#search-input')).val(searchTerm);
  }
});
