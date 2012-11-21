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

from collections import Counter
from itertools import chain

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

def index(request):
	return

