FROM python:3.10

WORKDIR /app

COPY . .

RUN pip install --upgrade pip
RUN pip install -r requirements.txt

EXPOSE 8000

CMD ["gunicorn", "SanpurnamEngine.wsgi:application", "--bind", "0.0.0.0:8000"]