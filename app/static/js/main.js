// This global object holds our application's settings, etc.
var foodora = {};

// Initialize the variables our application will need on startup:
foodora.init = function(){
	// Initialize BB views, models, and a router:
	foodora.searchModel = new SearchModel()
	foodora.searchView = new SearchView({model: foodora.searchModel});
	foodora.appRouter = new AppRouter();
	foodora.resultWrapperView = new ResultWrapperView({el: $('#results-wrapper')});

	foodora.tasteModel = TasteModel.getInstance();

	// Count for number of foods in My Foods
	foodora.myFoodsNumCountView = new MyFoodsNumCountView({
		model: foodora.tasteModel,
		el:$('#label-myfoodscount')
	});

	// Need to set the wrapper elts before inserting taste view 
	foodora.tasteModel.set('likesWrapper', $('#likes-container'));
	foodora.tasteModel.set('dislikesWrapper', $('#dislikes-container'));
	foodora.tasteModel.set('countLabelView', foodora.myFoodsNumCountView);

	foodora.tasteView = new TasteView({model: foodora.tasteModel});

	// Tab button models
	foodora.exploreButtonModel = new TabButtonModel({
		urlKeyword: '', 
		paneView: $('#pane-explore'),
	});
	foodora.myfoodsButtonModel = new TabButtonModel({
		urlKeyword: 'myfoods', 
		paneView: $('#pane-myfoods'),
	});
	foodora.aboutButtonModel = new TabButtonModel({
		urlKeyword: 'about', 
		paneView: $('#pane-about'),
	});

	foodora.likeToggleButtonModel = new TabButtonModel({paneView: $('#likes-container')});
	foodora.dislikeToggleButtonModel = new TabButtonModel({paneView: $('#dislikes-container')});

	// Tab button views
	foodora.exploreButtonView = new TabButtonView({
		el: $('#btn-explore'), 
		model: foodora.exploreButtonModel,
	});
	foodora.myfoodsButtonView = new TabButtonView({
		el: $('#btn-myfoods'),
		model: foodora.myfoodsButtonModel,
	});
	foodora.aboutButtonView = new TabButtonView({
		el: $('#btn-about'),
		model: foodora.aboutButtonModel
	});

	foodora.likeToggleButtonView = new MyFoodsTabButtonView({el: $('#btn-like-panetoggle'),
		model: foodora.likeToggleButtonModel});
	foodora.dislikeToggleButtonView = new MyFoodsTabButtonView({el: $('#btn-dislike-panetoggle'),
		model: foodora.dislikeToggleButtonModel});

	// Recommend button
	foodora.recommendButtonView = new RecommendButtonView({el: $('#btn-recommend')});
};

// Define the application's router and routes:
var AppRouter = Backbone.Router.extend({
	routes: {
		'': 'explore',
		'search/:query': 'search',
		'detail/:code': 'detail',
		'about': 'about',
		'myfoods': 'myfoods',
	},
	// Super simple functionality for both:
	search: function(query) {
		q = decodeURIComponent(query);
		foodora.searchView.search(q);
		foodora.searchView.updateSearchDisplay(q);
		return;
	},
	detail: function(code) {
		foodora.detailView.displayDetail(codeToId(code));
		return;
	},
	about: function() {
		foodora.aboutButtonView.togglePane();
		return;
	},
	myfoods: function() {
		foodora.myfoodsButtonView.togglePane();
		return;
	},
	explore: function() {
		return;
	}
});

// ...and, finally, on document ready:
$(document).ready(function(){
	// Start the app up!
	foodora.init();
	Backbone.history.start();

	// Deal with window resizing
	$(window).resize(function(){
		foodora.resultWrapperView.updateHeight();
	})
	foodora.resultWrapperView.updateHeight();
	foodora.searchView.random(25);
});
