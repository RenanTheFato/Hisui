import numpy as np
import pandas as pd
from datetime import datetime
from collections import deque
import joblib
import warnings

from sklearn.model_selection import TimeSeriesSplit
from sklearn.preprocessing import StandardScaler, RobustScaler
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import Ridge, ElasticNet
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
import xgboost as xgb
import lightgbm as lgb

from ..utils.data_collector import DataCollector
from ..utils.feature_engineer import FeatureEngineer

warnings.filterwarnings('ignore')


class PETR4Predictor:
	def __init__(self):
			self.scalers = {}
			self.models = {}
			self.feature_columns = None
			self.data = None
			self.best_model = None
			self.best_model_name = None
			
			self.error_history = deque(maxlen=100)
			self.prediction_history = deque(maxlen=50)
			self.performance_tracker = {}
			self.adaptive_weights = {}
			
			# CV configuration
			self.cv_config = {
					'min_train_size': 252,  # 1 year minimum
					'test_size': 21,        # 1 month test
					'step_size': 5,         # Retrain every 5 days
					'purged_gap': 2,        # Gap to avoid data leakage
					'max_splits': 20        # Maximum splits
			}
			
			self.data_collector = DataCollector()
			self.feature_engineer = FeatureEngineer()
	
	def train(self, period, include_intraday=False):
			print("=== PETR4 ENHANCED MODEL - TRAINING PIPELINE ===")
			
			try:
					df = self.data_collector.collect_data(period, include_intraday)
					self.data = df
					
					features_df = self.feature_engineer.create_features(df)
					
					features_df = self.feature_engineer.select_features(features_df, max_features=30)
					
					results = self._train_with_cv(features_df)
					
					return {
							'training_results': results,
							'model_saved': results['final_metrics']['r2'] > 0.4,
							'data_quality': self.data_collector.validate_data(df),
							'feature_info': self.feature_engineer.get_feature_info()
					}
					
			except Exception as e:
					print(f"ERROR in training pipeline: {e}")
					import traceback
					traceback.print_exc()
					return None
	
	def _train_with_cv(self, features_df):
			print("4. Training with Advanced Cross Validation...")
			
			X = features_df.drop('target', axis=1)
			y = features_df['target']
			
			if len(X.columns) == 0:
					raise ValueError("CRITICAL ERROR: No features available for training!")
			
			if len(X) < 50:
					raise ValueError("CRITICAL ERROR: Insufficient data for training!")
			
			print(f"  Validation OK: {len(X.columns)} features, {len(X)} records")
			
			n = len(features_df)
			train_end = int(0.7 * n)
			val_end = int(0.85 * n)
			
			X_train = X.iloc[:train_end]
			y_train = y.iloc[:train_end]
			X_val = X.iloc[train_end:val_end]
			y_val = y.iloc[train_end:val_end]
			X_test = X.iloc[val_end:]
			y_test = y.iloc[val_end:]
			
			print(f"  Data: Train={len(X_train)} | Val={len(X_val)} | Test={len(X_test)}")
			
			models_config = {
					'XGBoost': {
							'model': xgb.XGBRegressor(
									n_estimators=50,
									max_depth=4,
									learning_rate=0.1,
									subsample=0.8,
									colsample_bytree=0.8,
									reg_alpha=0.1,
									reg_lambda=1.0,
									random_state=42,
									n_jobs=1,
									verbosity=0
							),
							'scaler': None
					},
					'LightGBM': {
							'model': lgb.LGBMRegressor(
									n_estimators=50,
									max_depth=4,
									learning_rate=0.1,
									subsample=0.8,
									colsample_bytree=0.8,
									reg_alpha=0.1,
									reg_lambda=1.0,
									random_state=42,
									n_jobs=1,
									verbose=-1
							),
							'scaler': None
					},
					'RandomForest': {
							'model': RandomForestRegressor(
									n_estimators=50,
									max_depth=8,
									min_samples_split=10,
									min_samples_leaf=5,
									random_state=42,
									n_jobs=1
							),
							'scaler': None
					},
					'Ridge': {
							'model': Ridge(alpha=5.5, random_state=42),
							'scaler': 'robust'
					},
					'ElasticNet': {
							'model': ElasticNet(alpha=0.5, l1_ratio=0.5, random_state=42, max_iter=2000),
							'scaler': 'robust'
					}
			}
			
			cv_results = {}
			
			print("\n Executing Walk-Forward CV for each model:")
			print("-" * 60)
			
			for name, config in models_config.items():
					print(f"\\n{name}:")
					
					try:
							cv_result = self._walk_forward_cv(
									X_train, y_train, 
									config['model'], 
									config['scaler']
							)
							
							cv_results[name] = {
									'cv_stats': cv_result,
									'config': config,
									'final_score': cv_result['mean_r2'] - cv_result['std_r2']
							}
							
							print(f"  CV R²: {cv_result['mean_r2']:.4f} ± {cv_result['std_r2']:.4f}")
							print(f"  Adjusted Score: {cv_results[name]['final_score']:.4f}")
							
					except Exception as e:
							print(f"  ERROR in {name}: {str(e)[:60]}")
							cv_results[name] = {
									'cv_stats': {'mean_r2': 0, 'std_r2': 1},
									'config': config,
									'final_score': -999
							}
			
			valid_models = {k: v for k, v in cv_results.items() if v['final_score'] > -900}
			
			if not valid_models:
					print("ERROR: No model worked. Using simple Ridge as fallback.")
					fallback_model = Ridge(alpha=1.0, random_state=42)
					cv_results = {
							'Ridge_Fallback': {
									'cv_stats': {'mean_r2': 0.1, 'std_r2': 0.1},
									'config': {'model': fallback_model, 'scaler': 'robust'},
									'final_score': 0.05
							}
					}
					valid_models = cv_results
			
			best_model_name = max(valid_models.keys(), key=lambda k: valid_models[k]['final_score'])
			best_config = valid_models[best_model_name]['config']
			
			print(f"\\nBest model by CV: {best_model_name}")
			
			print("  Preparing data for final training...")
			
			X_train_filled = X_train.fillna(X_train.mean())
			X_val_filled = X_val.fillna(X_train.mean())
			X_test_filled = X_test.fillna(X_train.mean())
			
			if X_train_filled.isnull().any().any():
					print("    WARNING: Still have NAs. Filling with zero.")
					X_train_filled = X_train_filled.fillna(0)
					X_val_filled = X_val_filled.fillna(0)
					X_test_filled = X_test_filled.fillna(0)

			X_train_filled = X_train_filled.replace([np.inf, -np.inf], 0)
			X_val_filled = X_val_filled.replace([np.inf, -np.inf], 0)
			X_test_filled = X_test_filled.replace([np.inf, -np.inf], 0)
			
			if best_config['scaler']:
					print(f"    Applying scaling: {best_config['scaler']}")
					scaler = RobustScaler() if best_config['scaler'] == 'robust' else StandardScaler()
					
					try:
							X_train_scaled = scaler.fit_transform(X_train_filled)
							X_test_scaled = scaler.transform(X_test_filled)
							self.scalers['final'] = scaler
							
					except Exception as e:
							print(f"    ERROR in scaling: {e}. Using data without scaling.")
							X_train_scaled = X_train_filled.values
							X_test_scaled = X_test_filled.values
			else:
					X_train_scaled = X_train_filled.values
					X_test_scaled = X_test_filled.values
			
			print(f"    Final shape: Train={X_train_scaled.shape}, Test={X_test_scaled.shape}")
			
			if X_train_scaled.shape[1] == 0:
					raise ValueError("FATAL ERROR: No features after processing!")
			
			if X_train_scaled.shape[0] < 10:
					raise ValueError("FATAL ERROR: Few records after processing!")

			print("  Training final model...")
			final_model = best_config['model']
			
			try:
					final_model.fit(X_train_scaled, y_train.values)
					print("    Training completed successfully!")
			except Exception as e:
					print(f"    ERROR in training: {e}")
					print("    Trying with simple Ridge...")
					final_model = Ridge(alpha=1.0)
					final_model.fit(X_train_scaled, y_train.values)
					best_model_name = "Ridge_Emergency"

			try:
					test_pred = final_model.predict(X_test_scaled)
			except Exception as e:
					print(f"    ERROR in prediction: {e}")
					test_pred = np.full(len(y_test), y_test.mean())
			
			final_r2 = r2_score(y_test, test_pred)
			final_rmse = np.sqrt(mean_squared_error(y_test, test_pred))
			final_mae = mean_absolute_error(y_test, test_pred)

			if len(y_test) > 1:
					try:
							actual_dir = np.sign(np.diff(y_test.values))
							pred_dir = np.sign(np.diff(test_pred))
							dir_acc = np.mean(actual_dir == pred_dir) if len(actual_dir) > 0 else 0.5
					except:
							dir_acc = 0.5
			else:
					dir_acc = 0.5
			
			self.best_model = final_model
			self.best_model_name = best_model_name
			self.feature_columns = X.columns.tolist()

			try:
					for i, (actual, pred) in enumerate(zip(y_test.values, test_pred)):
							self._error_adaptive_learning(actual, pred, best_model_name)
			except:
					print("    WARNING: Error initializing adaptive system")
			
			print(f"\n FINAL RESULTS:")
			print(f"Model: {best_model_name}")
			print(f"Final R²: {final_r2:.4f}")
			print(f"RMSE: {final_rmse:.4f}")
			print(f"MAE: {final_mae:.4f}")
			print(f"Directional Accuracy: {dir_acc:.4f}")
			
			if best_model_name in cv_results:
					cv_std = cv_results[best_model_name]['cv_stats']['std_r2']
					print(f"CV Stability: ±{cv_std:.4f}")
			
			return {
					'best_model': final_model,
					'best_model_name': best_model_name,
					'cv_results': cv_results,
					'final_metrics': {
							'r2': final_r2,
							'rmse': final_rmse,
							'mae': final_mae,
							'dir_acc': dir_acc
					},
					'predictions': {
							'y_test': y_test,
							'test_pred': test_pred,
							'X_test': X_test
					}
			}
	
	def _walk_forward_cv(self, X, y, model, scaler_type=None):
			print("3. Executing Walk-Forward Cross Validation...")
			
			n_samples = len(X)
			min_train = self.cv_config['min_train_size']
			test_size = self.cv_config['test_size']
			step_size = self.cv_config['step_size']
			purged_gap = self.cv_config['purged_gap']
			
			if n_samples < min_train + test_size + purged_gap:
					print(f"  WARNING: Insufficient data for WF-CV ({n_samples} < {min_train + test_size + purged_gap})")
					return self._fallback_cv(X, y, model, scaler_type)
			
			cv_results = {
					'r2_scores': [],
					'rmse_scores': [],
					'mae_scores': [],
					'dir_acc_scores': [],
					'predictions': [],
					'actuals': [],
					'train_sizes': []
			}
			
			splits = []
			for start in range(0, n_samples - min_train - test_size, step_size):
					train_end = start + min_train
					test_start = train_end + purged_gap
					test_end = min(test_start + test_size, n_samples)
					
					if test_end - test_start >= test_size // 2:
							splits.append((start, train_end, test_start, test_end))
					
					if len(splits) >= self.cv_config['max_splits']:
							break
			
			print(f"  Configured {len(splits)} walk-forward splits")
			
			for i, (train_start, train_end, test_start, test_end) in enumerate(splits):
					try:
							X_train_cv = X.iloc[train_start:train_end]
							y_train_cv = y.iloc[train_start:train_end]
							X_test_cv = X.iloc[test_start:test_end]
							y_test_cv = y.iloc[test_start:test_end]

							X_train_filled = X_train_cv.fillna(X_train_cv.mean()).fillna(0)
							X_test_filled = X_test_cv.fillna(X_train_cv.mean()).fillna(0)
							
							X_train_filled = X_train_filled.replace([np.inf, -np.inf], 0)
							X_test_filled = X_test_filled.replace([np.inf, -np.inf], 0)
							
							if scaler_type:
									scaler = RobustScaler() if scaler_type == 'robust' else StandardScaler()
									X_train_scaled = scaler.fit_transform(X_train_filled)
									X_test_scaled = scaler.transform(X_test_filled)
							else:
									X_train_scaled = X_train_filled.values
									X_test_scaled = X_test_filled.values
							
							model_cv = self._clone_model(model)
							model_cv.fit(X_train_scaled, y_train_cv.values)

							y_pred = model_cv.predict(X_test_scaled)

							r2 = r2_score(y_test_cv, y_pred)
							rmse = np.sqrt(mean_squared_error(y_test_cv, y_pred))
							mae = mean_absolute_error(y_test_cv, y_pred)
							
							if len(y_test_cv) > 1:
									actual_dir = np.sign(np.diff(y_test_cv.values))
									pred_dir = np.sign(np.diff(y_pred))
									dir_acc = np.mean(actual_dir == pred_dir) if len(actual_dir) > 0 else 0.5
							else:
									dir_acc = 0.5
							
							cv_results['r2_scores'].append(r2)
							cv_results['rmse_scores'].append(rmse)
							cv_results['mae_scores'].append(mae)
							cv_results['dir_acc_scores'].append(dir_acc)
							cv_results['predictions'].extend(y_pred.tolist())
							cv_results['actuals'].extend(y_test_cv.tolist())
							cv_results['train_sizes'].append(len(X_train_cv))
							
							print(f"    Split {i+1}/{len(splits)}: R²={r2:.3f}, RMSE={rmse:.3f}, Dir={dir_acc:.3f}")
							
					except Exception as e:
							print(f"    Split {i+1} ERROR: {str(e)[:50]}")
							continue
			
			if len(cv_results['r2_scores']) == 0:
					return self._fallback_cv(X, y, model, scaler_type)
			
			results_summary = {
					'mean_r2': np.mean(cv_results['r2_scores']),
					'std_r2': np.std(cv_results['r2_scores']),
					'mean_rmse': np.mean(cv_results['rmse_scores']),
					'mean_mae': np.mean(cv_results['mae_scores']),
					'mean_dir_acc': np.mean(cv_results['dir_acc_scores']),
					'cv_scores': np.array(cv_results['r2_scores']),
					'detailed_results': cv_results
			}
			
			print(f"  WF-CV Complete: R²={results_summary['mean_r2']:.4f}±{results_summary['std_r2']:.4f}")
			
			return results_summary
	
	def _fallback_cv(self, X, y, model, scaler_type=None):
			from sklearn.model_selection import cross_val_score
			
			print("  Using TimeSeriesSplit fallback...")
			
			try:
					X_filled = X.fillna(X.mean())
					
					if scaler_type:
							if scaler_type == 'robust':
									scaler = RobustScaler()
							else:
									scaler = StandardScaler()
							X_scaled = scaler.fit_transform(X_filled)
					else:
							X_scaled = X_filled.values
					
					tscv = TimeSeriesSplit(n_splits=min(5, len(X)//50), test_size=min(20, len(X)//10))
					scores = cross_val_score(model, X_scaled, y, cv=tscv, scoring='r2', n_jobs=1)
					
					return {
							'mean_r2': scores.mean(),
							'std_r2': scores.std(),
							'cv_scores': scores,
							'mean_rmse': 0,
							'mean_mae': 0,
							'mean_dir_acc': 0.5
					}
					
			except Exception as e:
					print(f"  ERROR in fallback CV: {e}")
					return {
							'mean_r2': 0,
							'std_r2': 1,
							'cv_scores': np.array([0]),
							'mean_rmse': 999,
							'mean_mae': 999,
							'mean_dir_acc': 0.5
					}
	
	def _clone_model(self, model):
			from copy import deepcopy
			try:
					return deepcopy(model)
			except:
					model_type = type(model)
					if hasattr(model, 'get_params'):
							return model_type(**model.get_params())
					else:
							return model_type()
	
	def _error_adaptive_learning(self, y_true, y_pred, model_name):
			current_error = {
					'mae': mean_absolute_error([y_true], [y_pred]),
					'mape': abs((y_true - y_pred) / y_true) * 100,
					'direction_error': 0 if np.sign(y_true) == np.sign(y_pred) else 1,
					'timestamp': datetime.now()
			}

			self.error_history.append({
					'model': model_name,
					'error': current_error,
					'prediction': y_pred,
					'actual': y_true
			})

			if model_name not in self.performance_tracker:
					self.performance_tracker[model_name] = {
							'total_predictions': 0,
							'correct_directions': 0,
							'total_mae': 0,
							'recent_errors': deque(maxlen=20)
					}
			
			tracker = self.performance_tracker[model_name]
			tracker['total_predictions'] += 1
			tracker['total_mae'] += current_error['mae']
			tracker['correct_directions'] += (1 - current_error['direction_error'])
			tracker['recent_errors'].append(current_error['mae'])
			
			if len(tracker['recent_errors']) >= 5:
					recent_performance = 1 / (1 + np.mean(list(tracker['recent_errors'])))
					direction_accuracy = tracker['correct_directions'] / tracker['total_predictions']
					
					adaptive_weight = 0.6 * recent_performance + 0.4 * direction_accuracy
					self.adaptive_weights[model_name] = adaptive_weight
			
			return current_error
	
	def predict(self):
			if self.best_model is None:
					raise ValueError("Model not trained. Execute train() first.")
			
			print("6. Generating prediction with confidence analysis...")
			
			latest_df = self.data_collector.collect_data(period='1y')
			features_df = self.feature_engineer.create_features(latest_df)
			
			X_latest = features_df.drop('target', axis=1).iloc[-1:][self.feature_columns]
			
			X_latest_filled = X_latest.fillna(X_latest.mean()).fillna(0)
			X_latest_filled = X_latest_filled.replace([np.inf, -np.inf], 0)
			
			if 'final' in self.scalers:
					X_latest_scaled = self.scalers['final'].transform(X_latest_filled)
			else:
					X_latest_scaled = X_latest_filled.values
			
			try:
					prediction = self.best_model.predict(X_latest_scaled)[0]
			except Exception as e:
					print(f"ERROR in prediction: {e}")

					current_price = latest_df['PETR4'].iloc[-1]
					prediction = current_price * 1.001
			
			if self.best_model_name in self.performance_tracker:
					tracker = self.performance_tracker[self.best_model_name]
					if tracker['total_predictions'] > 0:
							avg_error = tracker['total_mae'] / tracker['total_predictions']
							confidence_95 = 2 * avg_error
							confidence_68 = avg_error
					else:
							confidence_95 = prediction * 0.05
							confidence_68 = prediction * 0.025
			else:
					confidence_95 = prediction * 0.05
					confidence_68 = prediction * 0.025
			
			lower_95 = prediction - confidence_95
			upper_95 = prediction + confidence_95
			lower_68 = prediction - confidence_68
			upper_68 = prediction + confidence_68
			
			current_price = latest_df['PETR4'].iloc[-1]
			current_date = latest_df.index[-1]
			next_date = current_date + pd.Timedelta(days=1)
			
			while next_date.weekday() >= 5:
					next_date += pd.Timedelta(days=1)
			
			change_abs = prediction - current_price
			change_pct = (change_abs / current_price) * 100
			
			model_performance = self.adaptive_weights.get(self.best_model_name, 0.5)
			
			if len(self.error_history) > 5:
					recent_direction_accuracy = np.mean([
							1 - error['error']['direction_error'] 
							for error in list(self.error_history)[-10:]
					])
			else:
					recent_direction_accuracy = 0.5
			
			overall_confidence = (model_performance + recent_direction_accuracy) / 2
			
			if change_pct > 1.0:
					movement = "UPWARD"
			elif change_pct < -1.0:
					movement = "DOWNWARD"
			else:
					movement = "SIDEWAYS"

			if overall_confidence > 0.7 and abs(change_pct) > 1.0:
					if change_pct > 0:
							recommendation = "BUY HIGH CONFIDENCE"
							risk_level = "LOW"
					else:
							recommendation = "SELL HIGH CONFIDENCE"
							risk_level = "LOW"
			elif overall_confidence > 0.5 and abs(change_pct) > 0.5:
					if change_pct > 0:
							recommendation = "BUY MODERATE"
							risk_level = "MEDIUM"
					else:
							recommendation = "SELL MODERATE"
							risk_level = "MEDIUM"
			else:
					recommendation = "NEUTRAL/WAIT"
					risk_level = "HIGH"
			
			return {
					'prediction': prediction,
					'current_price': current_price,
					'change_absolute': change_abs,
					'change_percentage': change_pct,
					'movement_direction': movement,
					'confidence_intervals': {
							'95%': {'lower': lower_95, 'upper': upper_95},
							'68%': {'lower': lower_68, 'upper': upper_68}
					},
					'model_confidence': overall_confidence,
					'recommendation': recommendation,
					'risk_level': risk_level,
					'next_date': next_date.strftime('%Y-%m-%d'),
					'model_name': self.best_model_name,
					'timestamp': datetime.now().isoformat()
			}
	
	def get_model_info(self):
			if self.best_model is None:
					return {"error": "Model not trained yet"}
			
			performance_info = {}
			if self.best_model_name in self.performance_tracker:
					tracker = self.performance_tracker[self.best_model_name]
					performance_info = {
							'total_predictions': tracker['total_predictions'],
							'directional_accuracy': tracker['correct_directions'] / max(1, tracker['total_predictions']),
							'average_mae': tracker['total_mae'] / max(1, tracker['total_predictions']),
							'recent_errors': list(tracker['recent_errors'])
					}
			
			feature_info = self.feature_engineer.get_feature_info()
			
			data_quality = self.data_collector.validate_data(self.data) if self.data is not None else {}
			
			return {
					'model_name': self.best_model_name,
					'model_type': type(self.best_model).__name__,
					'training_date': datetime.now().isoformat(),
					'feature_count': len(self.feature_columns) if self.feature_columns else 0,
					'feature_columns': self.feature_columns,
					'performance_metrics': performance_info,
					'adaptive_weight': self.adaptive_weights.get(self.best_model_name, 0.5),
					'error_history_size': len(self.error_history),
					'feature_info': feature_info,
					'data_quality': data_quality,
					'cv_config': self.cv_config
			}