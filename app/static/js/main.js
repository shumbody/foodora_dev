// This global object holds our application's settings, etc.
var foodora = {};

// Initialize the variables our application will need on startup:
foodora.init = function(){
	// Initialize BB views, models, and a router:
	foodora.detailView = new DetailView();
	foodora.searchModel = new SearchModel({detailView: foodora.detailView})
	foodora.searchView = new SearchView({model: foodora.searchModel});
	foodora.appRouter = new AppRouter();

	// Fetch information about the current member:
	// TODO: make this asynchronous somehow?
	/*
	$.ajax('current_member', {
	  success: function (data) {
	    foodora.currentMember = new MemberModel();
	    foodora.currentMember.id = data.id;
	    foodora.currentMember.fetch();
	  },
	  async: false,
	  type: 'GET',
	  dataType: 'json'
	});
	*/

};

// Define the application's router and routes:
var AppRouter = Backbone.Router.extend({
	routes: {
		'search/:query': 'search',
		'delivery/:code': 'delivery'
	},
	// Super simple functionality for both:
	search: function(query) {
		foodora.searchView.search(query);
		foodora.searchView.updateSearchDisplay(query);
		return;
	},
	detail: function(code) {
		foodora.detailView.displayDetail(codeToId(code));
		return;
	}
});

// ...and, finally, on document ready:
$(document).ready(function(){
	// Start the app up!
	foodora.init();
	Backbone.history.start();
});
