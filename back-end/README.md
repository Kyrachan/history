cd /var/www/FlaskApp/FlaskApp
python eroder.py
python __init__.py runserver --host 0.0.0.0 --port 90
======
this is what I run:
gunicorn --access-logfile FILE.txt -b 0.0.0.0:90  __init__:app
