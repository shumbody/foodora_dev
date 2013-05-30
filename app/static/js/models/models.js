/**
 * Backbone models
 *
 */

// The food model stores information about each food:
var FoodModel = Backbone.Model.extend({
  defaults: {
    id: null,
    description: '',
    name: '',
    cuisines: [],
    ingredients: [],
    mealTypes: [],
    tastes: [],
    url: null,
    photo: null,
    detailView: null,
    resultView: null,
    preference: null,
    recReason: null,
  },
});

var FoodCollection = Backbone.Collection.extend({
    model: FoodModel
});

// The search model stores information about a given search:
var SearchModel = Backbone.Model.extend({
  defaults: {
    model: null,
    searchedFoods: new FoodCollection(),
  }
});

// The taste model stores information about user's likes / dislikes
var TasteModel = Backbone.Model.extend({
  defaults: {
    countLabelView: null,
    likesWrapper: null,
    dislikesWrapper: null,
    likes: new FoodCollection(),
    dislikes: new FoodCollection(),
  }
});

_.extend(TasteModel, Backbone.Singleton);

// Tab buttons and panes
var TabButtonModel = Backbone.Model.extend({
  defaults: {
    urlKeyword: null,
    paneView: null,
  }
});
