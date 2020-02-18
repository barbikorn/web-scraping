import os.path
import requests
from bs4 import BeautifulSoup
import hashlib
import csv

pathCache = 'cache'
currentHtmlPage = None
currnetHtmlContent = None 

def fileExist( fileName ) :
    return os.path.isfile(fileName) 

def getNameFromUrl( url ) :
    arr = url.split( '/')
    return arr[ len( arr ) - 1 ]

# change to name + '.html'
def readFromUrl(  url  , path = pathCache ) :
    fileName = md5( url )
    fullFileName = path + '/' +  fileName 
    # if( fullFileName == currentHtmlPage ) :
    #     return currnetHtmlContent
    
    if not fileExist( fullFileName ) :
        print( "Read from " + url )
        page = requests.get( url )
        file = open( fullFileName , "w")
        file.write( page.text )
        file.close()
        log( url + "\t" + fileName)
        result = { 'content' : page.content }
    else :
        print( "Read " + url + ' from  ' + fileName )
        file = open( fullFileName , 'r')
        content  = file.read() 
        result = { 'content' : content }

    # currentHtmlPage = fullFileName
    # currnetHtmlContent = result 

    return result

def log( str , path = pathCache ) :
    file = open( path  + '/log.txt' , 'a+')
    file.write( str + "\n" )
    file.close() 


def getDomTableFromUrl(  url , path = pathCache , tableId= None , tableNo = None  ) :
    page = readFromUrl( url , path  )
    dom = BeautifulSoup( page[ 'content' ], 'html.parser')
    if not tableId is None : 
        dom = dom.find( id = tableId )
    if not tableNo is None : 
        dom = dom.find_all( 'table' )
        if tableNo < len( dom ) and tableNo > -1 :
            dom = dom[ tableNo ]
    return dom

def getDataFromDomTable( domTable , headers = None ) :
    rows = domTable.find_all( "tr")
    ths = domTable.find_all( 'th')
    startRow = 0
    if headers is None :
        headers = [ th.getText() for th in ths ]
        startRow = 1
    #print( headers )
    records = []
    for i in range( startRow ,  len( rows)) :
        row = rows[i]
        tds = row.find_all('td')
        record = [ td.getText() for td in tds ]
        records.append( record ) 
    
    result = { 'headers' : headers , 'records' : records }
    return result 

def md5( str ) :
    return hashlib.md5( str.encode('utf-8')).hexdigest()

def writeCSV( fileName , headers = None, records = None) :
    file = open( fileName , 'w' )
    writer = csv.writer( file )
    # write header
    if not headers is None :
        writer.writerow( headers )
    # write all records
    if not records is None :
        writer.writerows( records  )
    file.close()