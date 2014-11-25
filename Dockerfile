FROM python:2.7.8

RUN pip install pytz beautifulsoup4 requests

ADD minibar.py /minibar.py
RUN chmod +x /minibar.py

CMD ["/minibar.py", "--output", "/log/out.log"]
