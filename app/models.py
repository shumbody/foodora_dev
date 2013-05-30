from django.db import models
from itertools import chain

class TagManager(models.Manager):
	def get_by_natural_key(self, name):
		return self.get(name=name)

class Tag(models.Model):
	name = models.CharField(max_length=200)
	objects = TagManager()

	class Meta:
		abstract = True
	def __unicode__(self):
		return self.name
	def natural_key(self):
		return self.name

class Ingredient(Tag):
	pass

class MealType(Tag):
	pass

class Cuisine(Tag):
	pass

class Taste(Tag):
	pass

class Food(models.Model):
	cuisines = models.ManyToManyField(Cuisine)
	description = models.TextField()
	ingredients = models.ManyToManyField(Ingredient)
	meal_types = models.ManyToManyField(MealType)
	name = models.CharField(max_length=200)
	photo = models.URLField()
	tastes = models.ManyToManyField(Taste)
	url = models.URLField()

	def __unicode__(self):
		return self.name

	def get_cuisines(self):
		return self.cuisines.all()

	def get_ingredients(self):
		return self.ingredients.all()

	def get_meal_types(self):
		return self.meal_types.all()

	def get_tags(self):
		return list(chain(self.get_cuisines(), self.get_ingredients(), \
			self.get_meal_types()))

	def get_tastes(self):
		return self.tastes.all()

class Collection(models.Model):
	foods = models.ManyToManyField(Food, through='FoodInCollection')

	def get_disliked_foods(self):
		return Food.objects.get(
			foodincollection__is_liked=0,
			foodincollection__collection=self)

	def get_liked_foods(self):
		return Food.objects.get(
			foodincollection__is_liked=1,
			foodincollection__collection=self)

class FoodInCollection(models.Model):
	collection = models.ForeignKey(Collection)
	food = models.ForeignKey(Food)
	is_liked = models.BooleanField()
