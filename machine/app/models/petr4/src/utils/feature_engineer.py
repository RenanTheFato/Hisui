import numpy as np
import pandas as pd
from sklearn.feature_selection import SelectKBest, f_regression
import warnings

warnings.filterwarnings('ignore')


class FeatureEngineer:
	
	def __init__(self):
			self.feature_columns = None
	
	def create_features(self, df):
			print("2. Creating features with maximum robustness...")
			
			features_df = pd.DataFrame(index=df.index)
			
			if 'PETR4' not in df.columns:
					raise ValueError("PETR4 column not found in data!")
			
			price = df['PETR4']
			print(f"  Base data: {len(price)} records")
			
			print("  - Basic price features...")
			
			for p in [1, 2, 3, 5, 10, 20]:
					try:
							ret = price.pct_change(p)
							if not ret.isnull().all():
									features_df[f'return_{p}d'] = ret
									
									log_ret = np.log(price / price.shift(p))
									if not log_ret.isnull().all():
											features_df[f'log_return_{p}d'] = log_ret
					except:
							continue
			
			print("  - Moving averages...")
			
			for p in [5, 10, 20, 50]:
					try:
							sma = price.rolling(p, min_periods=max(1, p//2)).mean()
							if not sma.isnull().all():
									features_df[f'sma_{p}'] = sma
									
									ratio = price / sma
									if not ratio.isnull().all():
											features_df[f'price_sma_{p}_ratio'] = ratio
							
							ema = price.ewm(span=p, min_periods=max(1, p//4)).mean()
							if not ema.isnull().all():
									features_df[f'ema_{p}'] = ema
									
					except Exception as e:
							print(f"    WARNING: Error in MA {p}: {str(e)[:30]}")
							continue
			
			print("  - Volatility...")
			
			for p in [5, 10, 20]:
					try:
							vol = price.pct_change().rolling(p, min_periods=max(1, p//2)).std()
							if not vol.isnull().all():
									features_df[f'volatility_{p}'] = vol
					except:
							continue
			
			print("  - Technical indicators...")
			
			try:
					rsi_14 = self._calculate_rsi(price, 14)
					if not rsi_14.isnull().all():
							features_df['rsi_14'] = rsi_14
			except:
					pass
			
			try:
					ema_12 = price.ewm(span=12).mean()
					ema_26 = price.ewm(span=26).mean()
					macd = ema_12 - ema_26
					if not macd.isnull().all():
							features_df['macd'] = macd
			except:
					pass
			
			print("  - Correlations with other assets...")
			
			key_assets = ['IBOV', 'USD_BRL', 'OIL_WTI', 'BRENT']
			
			for asset in key_assets:
					if asset in df.columns:
							try:
									asset_price = df[asset]
									
									asset_ret = asset_price.pct_change()
									if not asset_ret.isnull().all():
											features_df[f'{asset.lower()}_return'] = asset_ret
									
									petr4_ret = price.pct_change()
									corr = petr4_ret.rolling(20, min_periods=10).corr(asset_ret)
									if not corr.isnull().all():
											features_df[f'{asset.lower()}_corr'] = corr
											
							except Exception as e:
									print(f"    WARNING: Error in correlation {asset}: {str(e)[:30]}")
									continue
			
			print("  - Temporal features...")
			
			try:
					features_df['day_of_week'] = df.index.dayofweek
					features_df['month'] = df.index.month
					features_df['day_of_month'] = df.index.day
					
					features_df['day_sin'] = np.sin(2 * np.pi * df.index.dayofweek / 7)
					features_df['month_sin'] = np.sin(2 * np.pi * df.index.month / 12)
					
			except Exception as e:
					print(f"    WARNING: Error in temporal features: {str(e)[:30]}")
			
			if 'PETR4_Volume' in df.columns:
					print("  - Volume features...")
					try:
							volume = df['PETR4_Volume']
							
							vol_ma_20 = volume.rolling(20, min_periods=10).mean()
							if not vol_ma_20.isnull().all():
									features_df['volume_ma_20'] = vol_ma_20
									
									vol_ratio = volume / vol_ma_20
									if not vol_ratio.isnull().all():
											features_df['volume_ratio'] = vol_ratio
											
					except Exception as e:
							print(f"    WARNING: Error in volume features: {str(e)[:30]}")
			
			if 'PETR4_High' in df.columns and 'PETR4_Low' in df.columns:
					print("  - High/Low features...")
					try:
							high = df['PETR4_High']
							low = df['PETR4_Low']
							
							tr1 = high - low
							tr2 = np.abs(high - price.shift(1))
							tr3 = np.abs(low - price.shift(1))
							true_range = np.maximum(tr1, np.maximum(tr2, tr3))
							
							if not true_range.isnull().all():
									features_df['true_range'] = true_range
									
									atr = true_range.rolling(14, min_periods=7).mean()
									if not atr.isnull().all():
											features_df['atr_14'] = atr
											
					except Exception as e:
							print(f"    WARNING: Error in High/Low features: {str(e)[:30]}")
			
			print("  - Momentum features...")
			
			try:
					for p in [10, 20]:
							roc = ((price - price.shift(p)) / price.shift(p)) * 100
							if not roc.isnull().all():
									features_df[f'roc_{p}'] = roc
			except:
					pass
			
			features_df['target'] = price.shift(-1)
			
			print("  - Final cleaning...")
			
			features_df = features_df.replace([np.inf, -np.inf], np.nan)
			
			feature_cols = [col for col in features_df.columns if col != 'target']
			valid_features = []
			
			for col in feature_cols:
					valid_count = features_df[col].count()
					if valid_count >= 50: 
							valid_features.append(col)
					else:
							print(f"    Removing {col}: only {valid_count} valid values")
			
			if len(valid_features) == 0:
					print("    CRITICAL: No valid features found! Creating emergency features...")
					
					features_df = pd.DataFrame(index=df.index)
					
					# Lagged prices
					features_df['price_lag_1'] = price.shift(1)
					features_df['price_lag_2'] = price.shift(2)
					features_df['price_lag_3'] = price.shift(3)
					
					features_df['return_1d'] = price.pct_change()
					features_df['return_3d'] = price.pct_change(3)
					
					features_df['ma_5'] = price.rolling(5, min_periods=1).mean()
					features_df['ma_10'] = price.rolling(10, min_periods=1).mean()
					
					features_df['price_ma5_ratio'] = price / features_df['ma_5']
					features_df['price_ma10_ratio'] = price / features_df['ma_10']
					
					features_df['target'] = price.shift(-1)
					
					valid_features = [col for col in features_df.columns if col != 'target']
			else:
					features_df = features_df[valid_features + ['target']]
			
			features_final = features_df.dropna()
			
			print(f"  Final features: {len(valid_features)}")
			print(f"  Final records: {len(features_final)}")
			print(f"  Created features: {valid_features}")
			
			if len(features_final) < 50:
					print("  WARNING: Few final records. Model may have low performance.")
			
			self.feature_columns = valid_features
			return features_final
	
	def _calculate_rsi(self, prices, window=14):
			try:
					delta = prices.diff()
					gain = delta.where(delta > 0, 0)
					loss = -delta.where(delta < 0, 0)
					
					avg_gain = gain.rolling(window=window, min_periods=max(1, window//2)).mean()
					avg_loss = loss.rolling(window=window, min_periods=max(1, window//2)).mean()
					
					rs = avg_gain / (avg_loss + 1e-10)
					rsi = 100 - (100 / (1 + rs))
					
					return rsi
			except:
					return pd.Series([50] * len(prices), index=prices.index)
	
	def select_features(self, features_df, max_features=30):
			print("  - Optimized feature selection...")
			
			X = features_df.drop('target', axis=1)
			y = features_df['target']
			
			na_threshold = 0.1
			X = X.dropna(thresh=int(len(X) * (1 - na_threshold)), axis=1)
			
			X = X.loc[:, X.var() > 1e-6]
			
			if len(X.columns) > max_features * 2:
					corr_matrix = X.corr().abs()
					upper_triangle = corr_matrix.where(np.triu(np.ones(corr_matrix.shape), k=1).astype(bool))
					to_drop = [col for col in upper_triangle.columns if any(upper_triangle[col] > 0.9)]
					X = X.drop(columns=to_drop)
			
			if len(X.columns) > max_features:
					selector = SelectKBest(score_func=f_regression, k=max_features)
					selector.fit(X, y)
					selected_features = X.columns[selector.get_support()]
					X = X[selected_features]
			
			# Reconstruct
			final_df = X.copy()
			final_df['target'] = y
			final_df = final_df.dropna()
			
			print(f"    Selected features: {len(X.columns)}")
			self.feature_columns = X.columns.tolist()
			return final_df
	
	def get_feature_info(self):
			if self.feature_columns is None:
					return {"error": "No features created yet"}
			
			feature_categories = {
					'price_features': [f for f in self.feature_columns if 'return' in f or 'price' in f],
					'technical_indicators': [f for f in self.feature_columns if any(x in f for x in ['rsi', 'macd', 'sma', 'ema'])],
					'volatility_features': [f for f in self.feature_columns if 'volatility' in f or 'atr' in f],
					'correlation_features': [f for f in self.feature_columns if 'corr' in f],
					'temporal_features': [f for f in self.feature_columns if any(x in f for x in ['day', 'month'])],
					'volume_features': [f for f in self.feature_columns if 'volume' in f],
					'momentum_features': [f for f in self.feature_columns if 'roc' in f]
			}
			
			return {
					'total_features': len(self.feature_columns),
					'feature_list': self.feature_columns,
					'categories': feature_categories,
					'category_counts': {k: len(v) for k, v in feature_categories.items()}
			}