"""Receive short-lived Sites credentials through hidden stdin; never persist them."""
import json,os,subprocess,sys
credential=json.loads(sys.stdin.readline())
remote=credential['remote_url']
branch=credential.get('branch','main')
subprocess.run(['git','remote','remove','origin'],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
subprocess.run(['git','remote','add','origin',remote],check=True)
env=os.environ.copy()
if credential.get('token'):
 env['GIT_CONFIG_COUNT']='1'
 env['GIT_CONFIG_KEY_0']='http.extraHeader'
 env['GIT_CONFIG_VALUE_0']='Authorization: Bearer '+credential['token']
env['GIT_TERMINAL_PROMPT']='0'
result=subprocess.run(['git','push','-u','origin','HEAD:'+branch],env=env,stdout=subprocess.PIPE,stderr=subprocess.PIPE,text=True)
# Do not print raw transport errors that may echo credential headers.
print('Source push succeeded.' if result.returncode==0 else 'Source push failed (transport or credentials).')
sys.exit(result.returncode)
