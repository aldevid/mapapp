#!/usr/bin/env bash

# 依存パッケージのインストール
pip install -r requirements.txt

# マイグレーションの実行
python manage.py migrate

# 静的ファイルの収集（本番では必要）
python manage.py collectstatic --noinput
