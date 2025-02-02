poetry shell

then

python run.py

optional while in shell:
python -m pip install httpx

# To remove the latest entries

cd backend
cd data

sqlite3 -column -header twitter.db

SELECT datetime(last_updated/1000, 'unixepoch') as readable_time, user_id, username FROM users ORDER BY last_updated DESC LIMIT 5;
DELETE FROM users WHERE user_id = 1247069231885115392;
DELETE FROM users WHERE user_id IN (1247069231885115392, 929861851864817664, 398106702);

select \* from user_daily_metrics limit 5;
DELETE FROM user_daily_metrics WHERE user_id = 1247069231885115392;

# Confirmation

```sql
SELECT datetime(last_updated/1000, 'unixepoch') as readable_time, user_id, username FROM users ORDER BY last_updated DESC LIMIT 5;
select * from user_daily_metrics limit 5;
```
