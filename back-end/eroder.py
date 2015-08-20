from settings import APP_STATIC
import os
import re
import json
import time
from random import randint
#import httplib2
import requests

def main():
	while True:
		filenameWithPath = os.path.join(APP_STATIC, "historyState.txt")
		with open(filenameWithPath, 'r') as f:
			fileContents = f.read()
		if "1" not in fileContents: #if there is no more history then exit
			print "no more aces"
			exit()		
		fileContents = re.sub(r'\s*', r'', fileContents)
		fileContents = list(fileContents)
		fileContents = [int(i) for i in fileContents]

		randomPositionInFile = randint(0,len(fileContents)-1)
		while fileContents[randomPositionInFile] == 0:
			randomPositionInFile = randint(0,len(fileContents)-1)
		fileContents[randomPositionInFile] = 0
		
		#fileContents = ''.join(str(fileContents))
		result = ""
		for i in fileContents:
			result+=str(i)
		#fileContents = fileContents.append(str(i)) for i in fileContents
		
		#print(result)
		with open(filenameWithPath, 'w') as f:
			f.write(result)
		
		lastWordFilenamePath = os.path.join(APP_STATIC, "lastWord.txt")
		r = requests.get("http://localhost:90/getTermAt/" + str(randomPositionInFile))
		with open(lastWordFilenamePath, 'w') as f:
			f.write(r.content)

		lastWordFilenamePath = os.path.join(APP_STATIC, "lastWordTimeStamp.txt")
		localtime = time.asctime( time.localtime(time.time()) )
		with open(lastWordFilenamePath, 'w') as f:
			f.write(localtime)

		durationOfSleep = 300
		print "sleeping for: " + str(durationOfSleep) + " seconds"
		time.sleep(durationOfSleep)
        
if __name__ == '__main__':
	main()
