import logging
from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from config import Config
from app.utils.db import init_db
from app.utils.helpers import api_error

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")

jwt = JWTManager()

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # CORS configuration
    CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)

    # JWT configuration
    jwt.init_app(app)

    @jwt.invalid_token_loader
    def invalid_token_callback(reason):
        return api_error("INVALID_TOKEN", f"Token validation failed: {reason}", status_code=401)

    @jwt.unauthorized_loader
    def missing_token_callback(reason):
        return api_error("UNAUTHORIZED", "Missing authorization bearer token.", status_code=401)

    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return api_error("TOKEN_EXPIRED", "Your session token has expired. Please sign in again.", status_code=401)

    # Initialize Database
    init_db(app)

    # Auto-seed initial accounts if database is fresh (safe idempotency check inside seed_database)
    try:
        from seed.seed_data import seed_database
        seed_database(app)
    except Exception as e:
        logging.getLogger(__name__).debug(f"[SEED NOTE] {e}")

    from app.routes.auth import auth_bp
    from app.routes.schools import schools_bp
    from app.routes.teams import teams_bp
    from app.routes.projects import projects_bp
    from app.routes.quizzes import quizzes_bp
    from app.routes.evaluators import evaluators_bp
    from app.routes.jury import jury_bp
    from app.routes.state_jury import state_jury_bp
    from app.routes.admin import admin_bp
    from app.routes.leaderboard import leaderboard_bp
    from app.routes.notifications import notifications_bp
    from app.routes.mentors import mentors_bp
    from app.routes.districts import districts_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(schools_bp)
    app.register_blueprint(teams_bp)
    app.register_blueprint(projects_bp)
    app.register_blueprint(quizzes_bp)
    app.register_blueprint(evaluators_bp)
    app.register_blueprint(jury_bp)
    app.register_blueprint(state_jury_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(leaderboard_bp)
    app.register_blueprint(notifications_bp)
    app.register_blueprint(mentors_bp)
    app.register_blueprint(districts_bp)

    @app.route("/api/v1/health", methods=["GET"])
    def healthcheck():
        return jsonify({
            "status": "healthy",
            "service": "Assam Future Innovation Program API",
            "version": "1.0.0",
            "partners": [
                "Technology Innovation Hub of IIT Delhi / IHFC",
                "Samagra Shiksha, Assam"
            ]
        }), 200

    @app.errorhandler(404)
    def handle_404(e):
        return api_error("NOT_FOUND", "Endpoint not found.", status_code=404)

    @app.errorhandler(500)
    def handle_500(e):
        return api_error("INTERNAL_ERROR", "An internal server error occurred.", status_code=500)

    return app
