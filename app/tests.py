"""
This file demonstrates writing tests using the unittest module. These will pass
when you run "manage.py test".

Replace this with more appropriate tests for your application.
"""

from django.test import TestCase
from app.models import Food

class SimpleTest(TestCase):
    def test_search(self):
        self.assertEqual(1 + 1, 2)
