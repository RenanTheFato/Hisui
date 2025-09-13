import os
import logging
import numpy as np
from datetime import datetime
from ..models.predictor import PETR4Predictor

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class PredictionService:

	def __init__(self):
			self.predictor = PETR4Predictor()
			self.model_loaded = False
			self.model_path = os.path.join('data', 'petr4_model.pkl')
			
			self._load_existing_model()
	
	def _load_existing_model(self):
			try:
					if os.path.exists(self.model_path):
							success = self.predictor.load_model(self.model_path)
							if success:
									self.model_loaded = True
									logger.info("Existing model loaded successfully")
							else:
									logger.warning("Failed to load existing model")
					else:
							logger.info("No existing model found")
			except Exception as e:
					logger.error(f"Error loading existing model: {e}")
	
	def ensure_model_trained(self):
			if not self.model_loaded:
					logger.info("Training new model...")
					try:
							results = self.predictor.train(period='3y')
							if results and results.get('model_saved', False):
									self.model_loaded = True
									logger.info("Model trained and saved successfully")
									return True
							else:
									logger.error("Model training failed or performance too low")
									return False
					except Exception as e:
							logger.error(f"Error training model: {e}")
							return False
			return True
	
	def get_prediction(self):
			try:
					if not self.ensure_model_trained():
							return {
									"error": "Model training failed",
									"message": "Unable to train model for predictions"
							}
					
					prediction_result = self.predictor.predict()
					
					formatted_result = {
							"status": "success",
							"timestamp": datetime.now().isoformat(),
							"prediction": {
									"current_price": round(prediction_result['current_price'], 2),
									"predicted_price": round(prediction_result['prediction'], 2),
									"change_absolute": round(prediction_result['change_absolute'], 2),
									"change_percentage": round(prediction_result['change_percentage'], 2),
									"movement_direction": prediction_result['movement_direction'],
									"next_trading_date": prediction_result['next_date']
							},
							"confidence": {
									"model_confidence": round(prediction_result['model_confidence'], 3),
									"confidence_intervals": {
											"95_percent": {
													"lower": round(prediction_result['confidence_intervals']['95%']['lower'], 2),
													"upper": round(prediction_result['confidence_intervals']['95%']['upper'], 2)
											},
											"68_percent": {
													"lower": round(prediction_result['confidence_intervals']['68%']['lower'], 2),
													"upper": round(prediction_result['confidence_intervals']['68%']['upper'], 2)
											}
									}
							},
							"recommendation": {
									"action": prediction_result['recommendation'],
									"risk_level": prediction_result['risk_level']
							},
							"model_info": {
									"model_name": prediction_result['model_name'],
									"prediction_timestamp": prediction_result['timestamp']
							}
					}
					
					return formatted_result
					
			except Exception as e:
					logger.error(f"Error getting prediction: {e}")
					return {
							"error": "Prediction failed",
							"message": str(e),
							"timestamp": datetime.now().isoformat()
					}
	
	def get_model_info(self):
			try:
					if not self.model_loaded:
							return {
									"error": "Model not loaded",
									"message": "No trained model available"
							}
					
					model_info = self.predictor.get_model_info()

					formatted_info = {
							"status": "success",
							"timestamp": datetime.now().isoformat(),
							"model": {
									"name": model_info.get('model_name', 'Unknown'),
									"type": model_info.get('model_type', 'Unknown'),
									"training_date": model_info.get('training_date'),
									"feature_count": model_info.get('feature_count', 0),
									"adaptive_weight": round(model_info.get('adaptive_weight', 0), 3)
							},
							"performance": {
									"total_predictions": model_info.get('performance_metrics', {}).get('total_predictions', 0),
									"directional_accuracy": round(model_info.get('performance_metrics', {}).get('directional_accuracy', 0), 3),
									"average_mae": round(model_info.get('performance_metrics', {}).get('average_mae', 0), 4),
									"error_history_size": model_info.get('error_history_size', 0)
							},
							"features": {
									"total_features": model_info.get('feature_info', {}).get('total_features', 0),
									"categories": model_info.get('feature_info', {}).get('category_counts', {}),
									"feature_list": model_info.get('feature_columns', [])
							},
							"data_quality": {
									"total_records": model_info.get('data_quality', {}).get('total_records', 0),
									"quality_score": model_info.get('data_quality', {}).get('quality_score', 0),
									"quality_level": model_info.get('data_quality', {}).get('quality_level', 'Unknown'),
									"missing_data_pct": round(model_info.get('data_quality', {}).get('missing_data_pct', 0), 2)
							}
					}
					
					return formatted_info
					
			except Exception as e:
					logger.error(f"Error getting model info: {e}")
					return {
							"error": "Failed to get model info",
							"message": str(e),
							"timestamp": datetime.now().isoformat()
					}
	
	def get_model_metrics(self):
			try:
					if not self.model_loaded:
							return {
									"error": "Model not loaded",
									"message": "No trained model available"
							}
					
					model_info = self.predictor.get_model_info()
					performance = model_info.get('performance_metrics', {})

					recent_errors = performance.get('recent_errors', [])
					recent_mae = sum(recent_errors) / len(recent_errors) if recent_errors else 0

					if len(recent_errors) >= 10:
							first_half = recent_errors[:len(recent_errors)//2]
							second_half = recent_errors[len(recent_errors)//2:]
							first_avg = sum(first_half) / len(first_half)
							second_avg = sum(second_half) / len(second_half)
							error_trend = "IMPROVING" if second_avg < first_avg else "WORSENING"
					else:
							error_trend = "INSUFFICIENT_DATA"
					
					formatted_metrics = {
							"status": "success",
							"timestamp": datetime.now().isoformat(),
							"performance_summary": {
									"model_name": model_info.get('model_name', 'Unknown'),
									"total_predictions": performance.get('total_predictions', 0),
									"directional_accuracy": round(performance.get('directional_accuracy', 0), 3),
									"average_mae": round(performance.get('average_mae', 0), 4),
									"recent_mae": round(recent_mae, 4),
									"error_trend": error_trend
							},
							"error_statistics": {
									"recent_errors": recent_errors,
									"min_error": round(min(recent_errors), 4) if recent_errors else 0,
									"max_error": round(max(recent_errors), 4) if recent_errors else 0,
									"error_std": round(np.std(recent_errors), 4) if recent_errors else 0
							},
							"model_confidence": {
									"adaptive_weight": round(model_info.get('adaptive_weight', 0), 3),
									"confidence_level": self._get_confidence_level(model_info.get('adaptive_weight', 0)),
									"error_history_size": model_info.get('error_history_size', 0)
							},
							"cross_validation": model_info.get('cv_config', {}),
							"data_info": {
									"feature_count": model_info.get('feature_count', 0),
									"data_quality_score": model_info.get('data_quality', {}).get('quality_score', 0),
									"data_records": model_info.get('data_quality', {}).get('total_records', 0)
							}
					}
					
					return formatted_metrics
					
			except Exception as e:
					logger.error(f"Error getting model metrics: {e}")
					return {
							"error": "Failed to get model metrics",
							"message": str(e),
							"timestamp": datetime.now().isoformat()
					}
	
	def _get_confidence_level(self, adaptive_weight):
			if adaptive_weight >= 0.8:
					return "VERY_HIGH"
			elif adaptive_weight >= 0.6:
					return "HIGH"
			elif adaptive_weight >= 0.4:
					return "MEDIUM"
			elif adaptive_weight >= 0.2:
					return "LOW"
			else:
					return "VERY_LOW"
	
	def retrain_model(self, period='3y'):
			try:
					logger.info(f"Starting model retraining with period: {period}")
					
					self.predictor = PETR4Predictor()
					
					results = self.predictor.train(period=period)
					
					if results and results.get('model_saved', False):
							self.model_loaded = True
							logger.info("Model retrained successfully")
							
							return {
									"status": "success",
									"message": "Model retrained successfully",
									"timestamp": datetime.now().isoformat(),
									"training_results": {
											"final_r2": round(results['training_results']['final_metrics']['r2'], 4),
											"final_rmse": round(results['training_results']['final_metrics']['rmse'], 4),
											"final_mae": round(results['training_results']['final_metrics']['mae'], 4),
											"directional_accuracy": round(results['training_results']['final_metrics']['dir_acc'], 4),
											"best_model": results['training_results']['best_model_name']
									},
									"data_quality": results.get('data_quality', {}),
									"feature_info": results.get('feature_info', {})
							}
					else:
							logger.error("Model retraining failed")
							return {
									"error": "Training failed",
									"message": "Model performance too low or training error",
									"timestamp": datetime.now().isoformat()
							}
							
			except Exception as e:
					logger.error(f"Error retraining model: {e}")
					return {
							"error": "Retraining failed",
							"message": str(e),
							"timestamp": datetime.now().isoformat()
					}
	
	def health_check(self):
			try:
					model_status = "loaded" if self.model_loaded else "not_loaded"
					
					try:
							latest_price = self.predictor.data_collector.get_latest_price()
							data_access = "available" if latest_price else "unavailable"
					except:
							data_access = "error"
					
					overall_health = "healthy" if (self.model_loaded and data_access == "available") else "degraded"
					
					return {
							"status": "success",
							"timestamp": datetime.now().isoformat(),
							"health": {
									"overall": overall_health,
									"model_status": model_status,
									"data_access": data_access,
									"service_uptime": "running"
							},
							"version": "1.0.0",
							"service": "PETR4 ML Prediction Server"
					}
					
			except Exception as e:
					logger.error(f"Health check error: {e}")
					return {
							"status": "error",
							"timestamp": datetime.now().isoformat(),
							"health": {
									"overall": "unhealthy",
									"error": str(e)
							}
					}