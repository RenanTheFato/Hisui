"""
Main Application Entry Point
Flask application setup and configuration.
"""

import os
import logging
from flask import Flask
from flask_cors import CORS
from .api.routes import api_bp

from dotenv import load_dotenv
load_dotenv()


# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


def create_app():
    """
    Create and configure Flask application.
    
    Returns:
        Flask: Configured Flask application
    """
    app = Flask(__name__)
    
    # Configuration
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')
    app.config['DEBUG'] = os.environ.get('FLASK_ENV') == 'development'
    
    # Enable CORS for all origins (required for frontend-backend interaction)
    CORS(app, origins="*")
    
    # Register blueprints
    app.register_blueprint(api_bp)
    
    # Root endpoint
    @app.route('/')
    def index():
        """Root endpoint with service information."""
        return {
            "service": "PETR4 ML Prediction Server",
            "version": "1.0.0",
            "description": "Machine learning server for PETR4 stock price predictions",
            "status": "running",
            "endpoints": {
                "health": "/health",
                "prediction": "/predict",
                "model_info": "/model/info",
                "model_metrics": "/model/metrics",
                "documentation": "/api/docs"
            },
            "documentation_url": "/api/docs"
        }
    
    # Create necessary directories
    os.makedirs('data', exist_ok=True)
    os.makedirs('logs', exist_ok=True)
    
    logger.info("PETR4 ML Prediction Server initialized")
    return app


def main():
    """
    Main entry point for running the server.
    """
    # Get configuration from environment
    host = os.environ.get('HOST', '0.0.0.0')
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_ENV') == 'development'
    
    # Create app
    app = create_app()
    
    logger.info(f"Starting PETR4 ML Prediction Server on {host}:{port}")
    logger.info(f"Debug mode: {debug}")
    
    # Run server
    app.run(
        host=host,
        port=port,
        debug=debug,
        threaded=True
    )


if __name__ == '__main__':
    main()

