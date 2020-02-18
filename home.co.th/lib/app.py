
from bs4 import BeautifulSoup

import lib.util


def saveAllCompanyUrl(  ) :
    urlAllCompany = "https://www.home.co.th/d/showall"
    domain = "https://www.home.co.th"
    fileName = 'company.csv'
    urls = getAllCompanyUrl( urlAllCompany , domain )
    writeCsvUrl( fileName , urls )
    return urls 

def getAllCompanyUrl( urlAllCompany , domain) :
    #page = requests.get( urlAllCompany )
    page = lib.util.readFromUrl( urlAllCompany )
    dom = dom = BeautifulSoup( page[ 'content'] , 'lxml')
    project = dom.find( class_="list-project")
    articles = project.find_all( 'article' , recursive=False )

    urls = {}
    for article in articles :
        anchor = article.find( 'a')
        href    = anchor[ 'href'].strip()
        img     = anchor.find( 'img')
        name    = img[ 'alt'].strip()
        url     = domain + href 
        urls[ name ] = url 

    return urls 

def saveOneCompanyUrl( url , domain , directory ) :
    company = lib.util.getLastWord( url , '/')
    domain = "https://www.home.co.th"
    fileName = "%s/%s.csv" % ( directory , company )
    
    urls = getOneCompanyUrl( url , domain )
    writeCsvUrl( fileName, urls )
    return urls 




# url = https://www.home.co.th/d/bungaasset
# domain = "https://www.home.co.th"
def getOneCompanyUrl( url , domain ) :
    #company = getLastWord( url  , "/")
    #page = requests.get( url )
    page = lib.util.readFromUrl( url )
    dom = BeautifulSoup( page[ 'content'], 'lxml')
    root = dom.find( class_="list-project")

    divs = root.find_all( 'div' , recursive=False )
    urls = {}
    for div in divs :
        detail  = div.find( class_="detail" )
        name    = detail.find( 'h3').getText().strip()
        anchor  = detail.find( 'a')
        subUrl  = lib.util.urlEncode( anchor[ 'href'] )
        url     = domain + subUrl 
        urls[ name ] = url 

    return urls 
    # fileName = "company/" + company + ".csv"
    # writeCsvUrl( fileName , urls )

def writeCsvUrl( fileName , urls  ):
    i = 0 
    #fileName = 'company.csv'
    header  = "no,name,url"
    f = open( fileName , 'w' , encoding='utf-8')
    f.write( header + "\n" )
    for name in urls :
        url = urls[ name ]
        f.write( "%d,%s,%s\n" % ( i , name , url ))
        i = i + 1 

    f.close()