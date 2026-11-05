"""Submit one-use bootstrap ticket via hidden stdin. Does not save credentials."""
import json,sys,urllib.request,urllib.error
payload=json.loads(sys.stdin.readline())
req=urllib.request.Request('https://mvxceyvbiehxeolfxslw.supabase.co/functions/v1/bylt-bootstrap',data=json.dumps(payload).encode(),headers={'Content-Type':'application/json'},method='POST')
try:
 with urllib.request.urlopen(req,timeout=40) as r:print(r.read().decode())
except urllib.error.HTTPError as e:
 print(e.read().decode());sys.exit(1)
