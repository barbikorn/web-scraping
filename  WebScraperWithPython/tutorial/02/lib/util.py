import os.path
import requests
from bs4 import BeautifulSoup

def fileExist( fileName ) :
    return os.path.isfile(fileName) 

def getNameFromUrl( url ) :
    arr = url.split( '/')
    return arr[ len( arr ) - 1 ]

# change to name + '.html'
def readFromUrl( path , url  ) :
    fileName = path + '/' + getNameFromUrl( url ) + '.html'
    if not fileExist( fileName ) :
        print( "Read from " + url )
        page = requests.get( url )
        file = open( fileName , "w")
        file.write( page.text )
        file.close()
        result = { 'content' : page.content }
    else :
        print( "Read " + url + ' from  ' + fileName )
        file = open( fileName , 'r')
        content  = file.read() 
        result = { 'content' : content }

    return result 

def getDOMfromUrl( path , url ) :
    page = readFromUrl( path , url )
    soup = BeautifulSoup( page[ 'content' ], 'html.parser')
    return soup
