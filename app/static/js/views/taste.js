var TasteView = Backbone.View.extend({
	model: null,

	initialize: function(){
    	var likes = this.model.get('likes');
    	var dislikes = this.model.get('dislikes');
    	var likesWrapper = this.model.get('likesWrapper');
    	var dislikesWrapper = this.model.get('dislikesWrapper');
    	var that = this;

    	var numCountLabel = this.model.get('countLabelView');

    	likes.on('add remove', function(){
    		that.render(likesWrapper, likes);
    		numCountLabel.render();
    	});
    	dislikes.on('add remove', function(){
    		that.render(dislikesWrapper, dislikes);
    		numCountLabel.render();
    	});
	},

	render: function(wrapper, collection){
		wrapper.html('');

		// Remove masonry functionality
        wrapper.masonry('destroy');

		for (var i=0; i<collection.length; i++){
			// Set up the view data:
			var food = collection.at(i);

			var viewData = {
		      	result_name: food.get('name'), 
		      	result_img: food.get('photo')
	      	}

	      	// Render the template:
	    	var template = _.template($('#food-thumb-html').html(), viewData);
	      	
	    	// Put the rendered HTML into the DOM:
	    	var el = $(template)
	    	wrapper.append(el);
	    }

        wrapper.imagesLoaded(function(){
          wrapper.masonry({
            itemSelector: '.result',
            columnWidth: 10,
            isAnimated: false,
          });
        });
	},
});

