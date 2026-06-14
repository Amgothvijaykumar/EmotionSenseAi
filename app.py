# Proxy to run the backend from the root directory
from backend.app import app

if __name__ == '__main__':
    # This is only run when executing python app.py locally from the root
    import os
    port = int(os.getenv("PORT", 5002))
    app.run(host='0.0.0.0', port=port, debug=True)
