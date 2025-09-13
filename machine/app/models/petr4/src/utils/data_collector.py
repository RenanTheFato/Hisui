import pandas as pd
import yfinance as yf
import warnings

warnings.filterwarnings('ignore')


class DataCollector:	
	def __init__(self):
			self.symbols = {
					'PETR4.SA': 'PETR4',
					'PETR3.SA': 'PETR3',
					'^BVSP': 'IBOV',
					'BRL=X': 'USD_BRL',
					'CL=F': 'OIL_WTI',
					'BZ=F': 'BRENT',
					'^GSPC': 'SP500',
					'^VIX': 'VIX',
					'VALE3.SA': 'VALE',
					'XOM': 'EXXON',
					'CVX': 'CHEVRON',
					'GC=F': 'GOLD'
			}
	
	def collect_data(self, period='6y', include_intraday=False):
			print("1. Collecting data with optimized strategy...")
			
			data_dict = {}
			
			# Collect daily data
			for symbol, name in self.symbols.items():
					try:
							print(f"  Collecting {name}...")
							if include_intraday and name == 'PETR4':
									data = self._get_intraday_data(symbol)
							else:
									data = yf.download(symbol, period=period, progress=False, interval='1d')
							
							if not data.empty and len(data) > 100:
									data_dict[name] = data['Close']
									
									# OHLCV data for PETR4
									if name == 'PETR4' and len(data.columns) > 1:
											data_dict['PETR4_Volume'] = data['Volume']
											data_dict['PETR4_High'] = data['High'] 
											data_dict['PETR4_Low'] = data['Low']
											data_dict['PETR4_Open'] = data['Open']
									
									print(f"    ✓ {name}: {len(data)} records")
							else:
									print(f"    ✗ {name}: Insufficient data")
									
					except Exception as e:
							print(f"    ✗ {name}: Error - {str(e)[:30]}")
			
			if 'PETR4' not in data_dict:
					raise ValueError("CRITICAL ERROR: PETR4 data not collected")
			
			# Create DataFrame
			base_index = data_dict['PETR4'].index
			df = pd.DataFrame(index=base_index)
			
			for name, data in data_dict.items():
					df[name] = data
			
			# Optimized cleaning
			df = df.dropna(thresh=len(df.columns)*0.6)
			df = df.fillna(method='ffill').fillna(method='bfill').dropna()
			
			print(f"Final dataset: {len(df)} records, {len(df.columns)} assets")
			return df
	
	def _get_intraday_data(self, symbol, interval='30m'):
			"""
			Method for intraday data (placeholder - adapt for your source).
			
			Args:
					symbol (str): Stock symbol
					interval (str): Data interval
					
			Returns:
					pd.DataFrame: Intraday data
			"""
			try:
					# Example with hourly data from last 7 days
					data = yf.download(symbol, period='7d', interval=interval, progress=False)
					if not data.empty:
							# Resample to daily if necessary
							daily_data = data.resample('D').agg({
									'Open': 'first',
									'High': 'max',
									'Low': 'min',
									'Close': 'last',
									'Volume': 'sum'
							}).dropna()
							return daily_data
			except:
					pass
			
			# Fallback to daily data
			return yf.download(symbol, period='1y', progress=False)
	
	def get_latest_price(self, symbol='PETR4.SA'):
			"""
			Get the latest price for a symbol.
			
			Args:
					symbol (str): Stock symbol
					
			Returns:
					float: Latest price
			"""
			try:
					ticker = yf.Ticker(symbol)
					data = ticker.history(period='1d')
					if not data.empty:
							return data['Close'].iloc[-1]
			except Exception as e:
					print(f"Error getting latest price: {e}")
			return None
	
	def validate_data(self, df):
			"""
			Validate collected data quality.
			
			Args:
					df (pd.DataFrame): Data to validate
					
			Returns:
					dict: Validation results
			"""
			validation = {
					'total_records': len(df),
					'total_columns': len(df.columns),
					'missing_data_pct': (df.isnull().sum().sum() / (len(df) * len(df.columns))) * 100,
					'date_range': {
							'start': df.index.min(),
							'end': df.index.max()
					},
					'petr4_available': 'PETR4' in df.columns,
					'quality_score': 0
			}
			
			# Calculate quality score
			score = 0
			if validation['petr4_available']:
					score += 40
			if validation['total_records'] >= 252:  # At least 1 year
					score += 30
			if validation['missing_data_pct'] < 5:
					score += 20
			if validation['total_columns'] >= 5:
					score += 10
			
			validation['quality_score'] = score
			validation['quality_level'] = (
					'Excellent' if score >= 90 else
					'Good' if score >= 70 else
					'Fair' if score >= 50 else
					'Poor'
			)
			
			return validation