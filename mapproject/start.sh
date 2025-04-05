#!/usr/bin/env bash

# gunicornで本番用サーバーを起動（project名.wsgiに置き換えてね）
gunicorn mapproject.wsgi:application --bind 0.0.0.0:$PORT
