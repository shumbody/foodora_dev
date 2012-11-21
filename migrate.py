#!/usr/bin/env python
from django.core.management import setup_environ
import foodora_dev.settings as settings
setup_environ(settings)

import _mysql as mysql
from app.models import Food

from django.db import connection, transaction
cursor = connection.cursor()

class Migrate:
	def migrate_food(self): 
		db = mysql.connect(host="localhost", user="root", db="foodora")

		for i in range(1,5000):
			db.query("insert into app_food (description, name, photo, url) select description, name, photo, link from oldsite_food where id =" + str(i))

	"""
	insert into app_ingredient (name)
	select distinct tag from oldsite_tags where `type` = 'ingredient';
	"""
	def migrate_ingredients(self):
		db = mysql.connect(host="localhost", user="root", db="foodora")
		db.query("insert into app_ingredient (name) select distinct tag from oldsite_tags where type = ingredient")
		r = db.use_result()
		db.close()

	def migrate_mealtypes(self):
		db = mysql.connect(host="localhost", user="root", db="foodora")
		db.query("insert into app_mealtype (name) select distinct tag from oldsite_tags where type = type")
		r = db.use_result()
		db.close()

	def migrate_cuisines(self):
		db = mysql.connect(host="localhost", user="root", db="foodora")
		db.query("insert into app_cuisine (name) select distinct tag from oldsite_tags where type = cuisine")
		r = db.use_result()
		db.close()

	def migrate_food_cuisines(self):
		cursor.execute("SELECT DISTINCT food_id, cuisine_id from oldsite_food_cuisines")
		rows = cursor.fetchall()
		for row in rows:
			cursor.execute("INSERT INTO app_food_cuisines (food_id, cuisine_id) VALUES (%s, %s)", [row[0], row[1]])
			transaction.commit_unless_managed()

	def migrate_food_ingredients(self):
		cursor.execute("SELECT DISTINCT food_id, ingredient_id from oldsite_food_ingredients")
		rows = cursor.fetchall()
		for row in rows:
			cursor.execute("INSERT INTO app_food_ingredients (food_id, ingredient_id) VALUES (%s, %s)", [row[0], row[1]])
			transaction.commit_unless_managed()

	def migrate_food_meal_types(self):
		cursor.execute("SELECT DISTINCT food_id, mealtype_id from oldsite_food_meal_types")
		rows = cursor.fetchall()
		for row in rows:
			cursor.execute("INSERT INTO app_food_meal_types (food_id, mealtype_id) VALUES (%s, %s)", [row[0], row[1]])
			transaction.commit_unless_managed()

if __name__ == '__main__':
	m = Migrate()
