// TODO: clean this shit up
var TabButtonView = Backbone.View.extend({
	model: null,

	events: {
    	'click': 'togglePane',
  	},

  	togglePane: function(){
  		var model = this.model;
  		var that = this;

		if (!model.get('paneView').is(':visible')){
			// Toggle tabs
			$('.top-bar-navigation li').removeClass('active');
			that.$el.parent().addClass('active');

			// Toggle panes
			$('.pane').hide();
			model.get('paneView').show();

			// Change url
			var url = model.get('urlKeyword');
			foodora.appRouter.navigate(url);

			// Reload the masonry grid
			reloadMasonry();
		}		
  	},
});

var MyFoodsTabButtonView = Backbone.View.extend({
	model: null,

	events: {
		'click': 'togglePane',
	},

	togglePane: function(){
		var that = this
		var paneView = this.model.get('paneView');

		if (!paneView.is(':visible')){
			// Toggle tabs
			$('.likes-toggle li').removeClass('active');
			that.$el.parent().addClass('active');

			// Toggle panes
			$('.like-pane').hide();
			paneView.show();

			// Reload the masonry grid
			reloadMasonry();
		}	
	}
});

var MyFoodsNumCountView = Backbone.View.extend({
	model: null,
	initialize: function(){
		this.render();
	},

	render: function(){
		var tasteModel = this.model;
		var numLikes = tasteModel.get('likes').length;
		var numDislikes = tasteModel.get('dislikes').length;

		this.$el.html(numDislikes + numLikes);
	}
});

var RecommendButtonView = Backbone.View.extend({
	events: {
		'click': 'recommend'
	},

	recommend: function(){
		// First thing, switch to explore pane
    	foodora.exploreButtonView.togglePane();

    	// Block detail view
    	$('#detail-wrapper').block();

		var likes = foodora.tasteModel.get('likes');
		var dislikes = foodora.tasteModel.get('dislikes');
		var numVoted = likes.length + dislikes.length;
		
		var likesJSON = likes
			.toJSON()
			.map(function(each){
				return each['id'];
			});
		var dislikesJSON = dislikes
			.toJSON()
			.map(function(each){
				return each['id'];
			});

		var votedFoodsId = likesJSON.concat(dislikesJSON);

		if (votedFoodsId.length === 0){
			this.getRandom();
		} else {
			var obj = {};
			var H = boost.boost(likes, dislikes).compactify();
			obj.classifier = JSON.stringify(H);
			obj.votedFoodsId = votedFoodsId;

			this.getRecommendation(obj)
		}
	},

	getRecommendation: function(query_object){
		var that = this;
		$.get('recommend', 
		{
			'classifier': query_object.classifier, 
			'votedFoodsId[]' : query_object.votedFoodsId
		}, 
		function(data){
			var datum = data[0];
			var foodModelData = {};
			foodModelData.id = datum.pk;
			foodModelData.description = datum.fields.description;
			foodModelData.name = datum.fields.name;
			foodModelData.cuisines = datum.fields.cuisines;
			foodModelData.ingredients = datum.fields.ingredients;
			foodModelData.mealTypes = datum.fields.meal_types;
			foodModelData.tastes = datum.fields.tastes;
			foodModelData.url = datum.fields.url;
			foodModelData.photo = datum.fields.photo;

			var recReasonText = 
				'We chose this for you because it has the following feature';

			var matched = data[1];
			recReasonText += matched.length === 1 ? ': ' : 's: ';
			for (var i = 0; i < matched.length; i++){
				if (matched.length === 1){
					recReasonText += matched[i] + '.';
				} else {
					if (i === matched.length-1){
						recReasonText += 'and ' + matched[i] + '. ';
					} else {
						recReasonText += matched[i] + ', ';
					}					
				}
			}

			foodModelData.recReason = recReasonText;

          	var foodModel = new FoodModel(foodModelData);

          	$('#detail-wrapper').unblock();
          	that.insertAsDetail(foodModel);
		});
	},

	getRandom: function(){
		var that = this;
		$.get('random', 
		{
			'numItems': 1, 
			'votedFoodsId[]': [], 
		}, function(data){
			var datum = data[0];
			var foodModelData = {};
			foodModelData.id = datum.pk;
			foodModelData.description = datum.fields.description;
			foodModelData.name = datum.fields.name;
			foodModelData.cuisines = datum.fields.cuisines;
			foodModelData.ingredients = datum.fields.ingredients;
			foodModelData.mealTypes = datum.fields.meal_types;
			foodModelData.tastes = datum.fields.tastes;
			foodModelData.url = datum.fields.url;
			foodModelData.photo = datum.fields.photo;

			var recReasonText = 
				'We chose this for you completely by random. Vote on more foods to get better recommendations!';

			foodModelData.recReason = recReasonText;

          	var foodModel = new FoodModel(foodModelData);

          	$('#detail-wrapper').unblock();
          	that.insertAsDetail(foodModel);
		});
	},

	insertAsDetail: function(food){
		$('#detail-container').html('');
		var detailView = new DetailView({model: food});
	}
})

var reloadMasonry = function(){
	// Should be at most one visible masonry grid at a time
	var currentContainer = $('.masonry-container').filter(':visible').first();

	// Don't want to masonrize empty container
	if (currentContainer.has('.result').length !== 0){
		currentContainer.imagesLoaded(function(){
	      currentContainer.masonry({
	        itemSelector: '.result',
	        columnWidth: 10,
	        isFitWidth: true,
	        isAnimated: true,
	      });
	    });				
	}
}