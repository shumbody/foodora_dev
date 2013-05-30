var DetailView = Backbone.View.extend({
  // The detail view has no inherent model at first,
  // but it is given a Food object when it is to
  // be loaded:
  model: null,

  events: {
    'click #btn-like': 'likeFood',
    'click #btn-dislike': 'dislikeFood',
  },

  // Initialize the view and tie it to the DOM:
  initialize: function() {
    this.wrapper = $('#detail-container');
    this.slidePanel = $('#detail-wrapper');
    this.render();
  },

  // Renderer:
  render: function() {
    // Set up the view data:
    var food = this.model;
    var viewData = {
      detail_cuisines: food.get('cuisines'),
      detail_description: food.get('description'),
      detail_ingredients: food.get('ingredients'),
      detail_mealTypes: food.get('mealTypes'),
      detail_tastes: food.get('tastes'),
      detail_name: food.get('name'), 
      detail_img: food.get('photo'),
      detail_url: food.get('url'),
      detail_recreason: food.get('recReason'),
      detail_preference: food.get('preference'),
    }

    // Render the template:
    var template = _.template($('#detail-html').html(), viewData);

    this.slidePanel.hide();

    // Put the rendered HTML into the DOM:
    this.$el.html(template);
    this.wrapper.append(this.el);

    this.slidePanel.slideDown('fast', function(){
      foodora.resultWrapperView.updateHeight();
    });
    
  },

  likeButtonToggle: function(){
    var button = this.$el.find('#btn-like');

    this.$el.find('button').removeClass('active');
    button.addClass('active');
  },

  likeFood: function(){
    var food = this.model;

    var tasteModel = TasteModel.getInstance();
    var likes = tasteModel.get('likes');
    var dislikes = tasteModel.get('dislikes');
    
    if (likes.get(food) === undefined){
      likes.add(food);
      food.set('preference', 1); //update the food model
      this.likeButtonToggle();

      if (dislikes.get(food) !== undefined){
        dislikes.remove(food);
      }
    }
  },

  dislikeButtonToggle: function(){
    var button = this.$el.find('#btn-dislike');

    this.$el.find('button').removeClass('active');
    button.addClass('active');
  },

  dislikeFood: function() {
    var food = this.model;

    var tasteModel = TasteModel.getInstance();
    var likes = tasteModel.get('likes');
    var dislikes = tasteModel.get('dislikes');

    if (dislikes.get(food) === undefined){
      dislikes.add(food);
      food.set('preference', -1);
      this.dislikeButtonToggle();

      if (likes.get(food) !== undefined){
        likes.remove(food);
      }
    }
  }
});
