import unittest
import json
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.main import create_app

class TestAPI(unittest.TestCase):
	
	def setUp(self):
			self.app = create_app()
			self.app.config['TESTING'] = True
			self.client = self.app.test_client()
	
	def test_root_endpoint(self):
			response = self.client.get('/')
			self.assertEqual(response.status_code, 200)
			
			data = json.loads(response.data)
			self.assertEqual(data['service'], 'PETR4 ML Prediction Server')
			self.assertEqual(data['version'], '1.0.0')
			self.assertIn('endpoints', data)
	
	def test_health_endpoint(self):
			response = self.client.get('/health')
			self.assertIn(response.status_code, [200, 503])
			
			data = json.loads(response.data)
			self.assertIn('status', data)
			self.assertIn('health', data)
			self.assertIn('timestamp', data)
	
	def test_api_docs_endpoint(self):
			response = self.client.get('/api/docs')
			self.assertEqual(response.status_code, 200)
			
			data = json.loads(response.data)
			self.assertEqual(data['title'], 'PETR4 ML Prediction Server API')
			self.assertEqual(data['version'], '1.0.0')
			self.assertIn('endpoints', data)
	
	def test_predict_endpoint(self):
			response = self.client.get('/predict')
			self.assertIn(response.status_code, [200, 400])
			
			data = json.loads(response.data)
			if response.status_code == 200:
					self.assertEqual(data['status'], 'success')
					self.assertIn('prediction', data)
					self.assertIn('confidence', data)
					self.assertIn('recommendation', data)
			else:
					self.assertIn('error', data)
	
	def test_model_info_endpoint(self):
			response = self.client.get('/model/info')
			self.assertIn(response.status_code, [200, 400])
			
			data = json.loads(response.data)
			if response.status_code == 200:
					self.assertEqual(data['status'], 'success')
					self.assertIn('model', data)
					self.assertIn('features', data)
			else:
					self.assertIn('error', data)
	
	def test_404_handling(self):
			response = self.client.get('/nonexistent')
			self.assertEqual(response.status_code, 404)
			
			data = json.loads(response.data)
			self.assertEqual(data['error'], 'Endpoint not found')
			self.assertIn('available_endpoints', data)

if __name__ == '__main__':
	unittest.main()