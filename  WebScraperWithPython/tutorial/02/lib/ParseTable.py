#from bs4 import BeautifulSoup
import csv
import lib.util



class ParseTable :
    def __init__( self  , url = '' ) :
        self.ext = 'csv'
        self.dataPath = 'data'
        self.cachePath = 'cache'

        if url != '' :
            self.setUrl( url )

    def setUrl( self , url , tableId = ''  ) :
        outputFile = self.getOutputFileName( url )
        if util.fileExist( outputFile) :
            return 

        print( url , " => " , outputFile )
        # page = util.readFromUrl( self.cachePath , url )
        # self.soup = BeautifulSoup( page[ 'content' ], 'html.parser')
        self.soup = util.getDOMfromUrl( self.cachePath , url )
        if tableId != '' :
            self.parse( tableId)
            self.write( outputFile)

        
    def parse( self , tableId  = 'individualResults') :
        table = self.soup.find( id = tableId )
        #print(table)

        rows = table.find_all( "tr")
        ths = table.find_all( 'th')

        headers = [ th.getText() for th in ths ]
        #print( headers )
        records = []
        for i in range( 1 ,  len( rows)) :
            row = rows[i]
            tds = row.find_all('td')
            record = [ td.getText() for td in tds ]
            records.append( record ) 
        
        self.result = { 'headers' : headers , 'records' : records }
        return self.result 

    def write( self , outputFile ) :
        #outputFile = 'runner.csv'
        #outputFile = self.dataPath + '/' + outputFile + '.' + self.ext
        # print( 'output ' , outputFile )
        file = open( outputFile , 'w' )
        writer = csv.writer( file )
        # write header
        writer.writerow( self.result[ 'headers' ])
        # write all records
        writer.writerows( self.result[ 'records' ] )
        file.close()



    def getOutputFileName( self , url ) :
        return self.dataPath + '/' + util.getNameFromUrl( url ) + '.' + self.ext

