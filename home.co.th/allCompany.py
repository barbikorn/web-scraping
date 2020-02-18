import lib.app



urls = lib.app.saveAllCompanyUrl( )

directory = "company"
domain = "https://www.home.co.th"
# i = 0 
for name in urls :
    url = urls[ name ]
    print( name )
    lib.app.saveOneCompanyUrl( url , domain , directory)
#     i = i + 1 
#     if i > 10 :
#         break 
