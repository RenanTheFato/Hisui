from flask import Blueprint, jsonify, request
from ..models.petr4.src.services.prediction_service import PredictionService
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

api_bp = Blueprint('api', __name__)

prediction_service = PredictionService()


@api_bp.route('/health', methods=['GET'])
def health_check():
	try:
			result = prediction_service.health_check()
			status_code = 200 if result.get('status') == 'success' else 503
			return jsonify(result), status_code
	except Exception as e:
			logger.error(f"Health check error: {e}")
			return jsonify({
					"error": "Health check failed",
					"message": str(e)
			}), 500


@api_bp.route('/petr4/predict', methods=['GET'])
def get_prediction():
	try:
			result = prediction_service.get_prediction()
			status_code = 200 if result.get('status') == 'success' else 400
			return jsonify(result), status_code
	except Exception as e:
			logger.error(f"Prediction error: {e}")
			return jsonify({
					"error": "Prediction failed",
					"message": str(e)
			}), 500


@api_bp.route('/petr4/predict', methods=['POST'])
def predict_with_params():
	try:
			data = request.get_json() or {}
			
			if data.get('retrain', False):
					period = data.get('period', '3y')
					retrain_result = prediction_service.retrain_model(period)
					
					if retrain_result.get('status') != 'success':
							return jsonify(retrain_result), 400
			
			result = prediction_service.get_prediction()
			status_code = 200 if result.get('status') == 'success' else 400
			
			if data.get('retrain', False):
					result['retrain_info'] = {
							"retrained": True,
							"period_used": data.get('period', '3y')
					}
			
			return jsonify(result), status_code
			
	except Exception as e:
			logger.error(f"Prediction with params error: {e}")
			return jsonify({
					"error": "Prediction with parameters failed",
					"message": str(e)
			}), 500


@api_bp.route('/petr4/info', methods=['GET'])
def get_model_info():
	try:
			result = prediction_service.get_model_info()
			status_code = 200 if result.get('status') == 'success' else 400
			return jsonify(result), status_code
	except Exception as e:
			logger.error(f"Model info error: {e}")
			return jsonify({
					"error": "Failed to get model info",
					"message": str(e)
			}), 500


@api_bp.route('/petr4/metrics', methods=['GET'])
def get_model_metrics():
	try:
			result = prediction_service.get_model_metrics()
			status_code = 200 if result.get('status') == 'success' else 400
			return jsonify(result), status_code
	except Exception as e:
			logger.error(f"Model metrics error: {e}")
			return jsonify({
					"error": "Failed to get model metrics",
					"message": str(e)
			}), 500


@api_bp.route('/petr4/retrain', methods=['POST'])
def retrain_model():
	try:
			data = request.get_json() or {}
			period = data.get('period', '3y')
			
			result = prediction_service.retrain_model(period)
			status_code = 200 if result.get('status') == 'success' else 400
			return jsonify(result), status_code
			
	except Exception as e:
			logger.error(f"Model retrain error: {e}")
			return jsonify({
					"error": "Model retraining failed",
					"message": str(e)
			}), 500

@api_bp.errorhandler(404)
def not_found(error):
	return jsonify({
			"error": "Endpoint not found",
			"message": "The requested endpoint does not exist",
	}), 404

@api_bp.errorhandler(405)
def method_not_allowed(error):
	return jsonify({
			"error": "Method not allowed",
			"message": "The HTTP method is not allowed for this endpoint"
	}), 405


@api_bp.errorhandler(500)
def internal_error(error):
	return jsonify({
			"error": "Internal server error",
			"message": "An unexpected error occurred"
	}), 500