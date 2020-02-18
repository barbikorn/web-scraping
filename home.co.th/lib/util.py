import os.path
import hashlib
import csv
import requests

import urllib.parse


pathCache = 'cache'

def fileExist( fileName ) :
    return os.path.isfile(fileName) 

def readFromUrl(  url  , path = pathCache ) :
    fileName = md5( url )
    fullFileName = path + '/' +  fileName 
    
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

    return result

def log( str , path = pathCache ) :
    file = open( path  + '/log.txt' , 'a+')
    file.write( str + "\n" )
    file.close() 

def md5( cStr ) :
    return hashlib.md5( cStr.encode('utf-8')).hexdigest()

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


#/home/i/10626-ฮาบิเทีย-ยาร์ด-รามอินทรา
def urlEncode( subUrl ) :
    arr = subUrl.split( "/")
    nPos = len( arr ) -1
    arr[ nPos ] = urllib.parse.quote_plus( arr[ nPos ])
    return "/".join( arr )

def urlDecode( url ) :
    return urllib.parse.unquote( url )

def getLastWord( cStr , separator = ' ' ) :
    arr = cStr.split( separator)
    return arr[ len( arr) - 1]
