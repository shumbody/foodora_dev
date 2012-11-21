/**
 * Backbone models
 *
 * SearchModel, FoodModel, InventoryModel, FoodCollection 
 *
 */

// The search model stores information about a given search:
var SearchModel = Backbone.Model.extend({
  defaults: {
    model: null,
  }
});

// The food model stores information about each food:
var FoodModel = Backbone.Model.extend({
  defaults: {
    id: null,
    description: '',
    name: '',
    cuisine: [],
    ingredients: [],
    mealTypes: [],
    tastes: [],
    detailView: null,
    listView: null,
  },
});

/**
 * A user owns a single inventory of foods, which is divided into foods
 * the user likes and foods the user dislikes
 */
var InventoryModel = Backbone.RelationalModel.extend({
  defaults: {
    id: null,
    name: "",
    like_foods: new FoodCollection([]),
    dislike_foods: new FoodCollection([]),
  },

  // Defining relations to other models:
  relations: [
  {
    type: Backbone.HasMany,
    key: 'like_foods',
    relatedModel: 'FoodModel',
    collectionType: 'FoodCollection',
  }, 
  {
    type: Backbone.HasMany,
    key: 'dislike_foods',
    relatedModel: 'FoodModel',
    collectionType: 'FoodCollection',
  }, 
  ]
});


// The delivery model stores information about a given delivery:
var DeliveryModel = Backbone.RelationalModel.extend({
  defaults: {
    id: null,
    member: null, // the creator
    restaurant: null,
    order_time: null,
    delivery_location: null,
    orders: new OrderCollection([]),
  },

  // Accessed in Flask at /delivery/X:
  urlRoot: 'delivery',

  // A few relations for restaurant, orders, and the creator:
  relations: [{
    type: Backbone.HasOne,
    key: 'member',
    relatedModel: 'MemberModel',
  }, {
    type: Backbone.HasOne,
    key: 'restaurant',
    relatedModel: 'RestaurantModel',
  }, {
    type: Backbone.HasMany,
    key: 'orders',
    relatedModel: 'OrderModel',
    collectionType: 'OrderCollection',
  }]
});

// The member model stores information about a user; currently just used for name:
var MemberModel = Backbone.RelationalModel.extend({
  defaults: {
    id: null,
    name: "Anonymous"
  },

  relations: [{
    type: Backbone.HasOne,
    key: 'id',
    relatedModel: 'CollectionModel',
  }
});

// This model is a stopgap solution to pairing (food item, quantity) tuples in orders:
var FoodItemAndQuantityModel = Backbone.RelationalModel.extend({
  // Since food items are shared (one for each menu item),
  // if two users add the same food item to their order, we need
  // to keep track of the metadata (quantity) in a separate model.
  defaults: {
    id: null,
    food_item: null,
    quantity: 1,
  },
  relations: [{
    type: Backbone.HasOne,
    key: 'food_item',
    relatedModel: 'FoodItemModel',
  }]
});

// Again, used for orders (read above comments in model definition of FoodItemAndQuantityModel):
var FoodItemAndQuantityCollection = Backbone.Collection.extend({
  model: FoodItemAndQuantityModel
});

// Used in the search results:
var ResultCollection = Backbone.Collection.extend({
  model: ResultModel
});
