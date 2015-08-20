import os
import random

def main():
	pc = raw_input("enter PC of erased values (0-1): ")
	historyString = ""
	for i in range(10650):
		if random.random()>float(pc): historyString = historyString + str(1)
		else: historyString = historyString + str(0)
	f = open('aHistory.txt', 'w')
	f.write(historyString)
	f.close()
	print "saved in aHistory.txt"
        
if __name__ == '__main__':
	main()
