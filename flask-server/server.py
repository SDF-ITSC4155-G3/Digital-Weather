from flask import Flask

app = Flask(__name__)


# Hello World API route
@app.route("/hello-world")
def hello_world():
    return {"hello_world": [0, 1, 3, 2]}


# Add simple CORS headers so the frontend (dev server or browser) can fetch safely
@app.after_request
def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type,Authorization"
    response.headers["Access-Control-Allow-Methods"] = "GET,POST,PUT,DELETE,OPTIONS"
    return response


if __name__ == "__main__":
    app.run(debug=True)