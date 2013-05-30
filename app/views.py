from app.models import Collection
from app.models import Cuisine
from app.models import Food
from app.models import FoodInCollection
from app.models import Ingredient
from app.models import MealType
from app.models import Taste
from app.models import Tag

from django.core import serializers
from django.db.models import Q
from django.http import HttpResponse, Http404
from django.shortcuts import render_to_response
from django.utils import simplejson

from collections import Counter
from itertools import chain
import operator, random

# For serializing python objects to JSON objects
json_serializer = serializers.get_serializer("json")()

def search(request):
	if (request.method == "GET" and len(request.GET.getlist("query[]")) > 0):

		query = request.GET.getlist("query[]")

		# Place upperbound on number of search terms
		query = query[0:min(len(query), 7)]

		foods_found = []

		# Every term should be found in either the food name or
		# a name of a tag. If not, return empty result.
		for term in query:
			term_filter = Q()
			term_filter.add(Q(cuisines__name__contains=term), Q.OR)
			term_filter.add(Q(ingredients__name__contains=term), Q.OR)
			term_filter.add(Q(meal_types__name__contains=term), Q.OR)
			term_filter.add(Q(tastes__name__contains=term), Q.OR)
			term_filter.add(Q(name__contains=term), Q.OR)

			q = Food.objects.filter(term_filter).distinct()
			if (q.count()==0):
				return HttpResponse('')
			else:
				foods_found.extend(q)

		display_num = min(len(foods_found), 25)
		foods_found_top = [food for food, freq in Counter(foods_found).most_common(display_num)]

		data_out = json_serializer.serialize(foods_found_top, indent=2, use_natural_keys=True)
		return HttpResponse(data_out, mimetype='application/json')
	else:
		raise Http404

# get a random number of foods
def get_random(request):
	if request.method == "GET":
		num_items = int(request.GET.get('numItems'))
		voted_foods_ids = [int(id) for id in set(request.GET.getlist('votedFoodsId[]'))]

		q = Food.objects.all()
		numFoods = len(q)

		foods = []
		while len(foods) != num_items:
			pick_index = int(random.random()*numFoods)
			pick_food = q[pick_index]

			if pick_food.id not in voted_foods_ids:
				foods.append(pick_food)

		data_out = json_serializer.serialize(foods, indent=2, use_natural_keys=True)
		return HttpResponse(data_out, mimetype='application/json')
	else:
		raise Http404

def recommend(request):
	if request.method == "GET":
		classifier_dict = simplejson.loads(request.GET.get('classifier'))
		voted_foods_ids = [int(id) for id in set(request.GET.getlist('votedFoodsId[]'))]

		# TODO: make this block a function
		foods_found = []
		features = classifier_dict.keys()
		for feature in features:
			# Get all foods that has the feature
			filter = Q()
			filter.add(Q(cuisines__name__contains=feature), Q.OR)
			filter.add(Q(ingredients__name__contains=feature), Q.OR)
			filter.add(Q(meal_types__name__contains=feature), Q.OR)

			q = Food.objects.filter(filter).distinct()
			foods_found.extend(q)

		# Filter out foods the user has voted on already
		foods_found_filtered = [food for food in foods_found if food.id not in voted_foods_ids]

		# We first pick the top three that score highest with positive classification (if has then +1)
		display_num = min(len(foods_found), 3)
		top_three = [food for food, freq in Counter(foods_found_filtered).most_common(display_num)]

		# Randomly pick one of the three (allows exploration of solution space)
		recommendation = top_three[int(random.random()*3)]

		# Record which classifiers were influential 
		matched_features = []
		for feature in features:
			food_features = [tag.natural_key() for tag in recommendation.get_tags()]
			if feature in food_features:
				matched_features.append(feature)

		# TODO: Fix this shit
		rec_json = json_serializer.serialize([recommendation], indent=2, use_natural_keys=True)
		data_out = simplejson.dumps([simplejson.loads(rec_json)[0], matched_features])
		return HttpResponse(data_out, mimetype='application/json')
	else:
		raise Http404
	return

def index(request):
	return

