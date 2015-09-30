from django.http import HttpResponse
import urllib

from django.shortcuts import render
from django.db import connection
import json
#The encoder module is used to prevent excessive decimals from being generated when dumping to JSON object
from json import encoder
encoder.FLOAT_REPR = lambda o: format(o, '.2f')

from django.views.decorators.gzip import gzip_page

#Potential security hole.
from django.views.decorators.csrf import csrf_exempt

@gzip_page
@csrf_exempt
def index(request):

    studyarea=request.GET.get('studyarea','ca')

    #################### REQUEST TYPE (POST through App OR (GET Through external OR initialize) ########################

    if request.method == 'POST':
        WKT = request.POST.get('wktPOST')
        reporting_units=request.POST.get('reporting_units')

    else:
        WKT=request.GET.get('user_wkt')
        reporting_units=request.GET.get('reporting_units')
        #urllib.urlretrieve ("http://www.cpc.ncep.noaa.gov/pacdir/NFORdir/HUGEdir2/cpcllftd.dat", "static/data/noaa/climate/cpcllftd.dat")
        #urllib.urlretrieve ("http://www.cpc.ncep.noaa.gov/pacdir/NFORdir/HUGEdir2/cpcllfpd.dat", "static/data/noaa/climate/cpcllfpd.dat")

    ############################################# INPUT PARAMETERS #####################################################

    stats_field_exclusions="'id_for_zon', 'objectid', 'shape_leng', 'shape_area'"

    if studyarea=='drecp':

        if reporting_units == "counties" or reporting_units == None:
            table="drecp_reporting_units_county_boundaries_no_simplify"
            categoricalFields="name_pcase"

        elif reporting_units == "ecoregion_subareas":
            table="drecp_reporting_units_ecoregion_subareas_no_simplify"
            categoricalFields="sa_name"

        elif reporting_units == "blm_field_offices":
            table="drecp_reporting_units_blm_field_offices_no_simplify"
            categoricalFields="fo_name"

        elif reporting_units == "deto_recovery_units":
            table="drecp_reporting_units_deto_recovery_units_no_simplify"
            categoricalFields="unit_name"

        elif reporting_units == "huc5_watersheds":
            table="drecp_reporting_units_huc5_watersheds_1_5_simplify"
            categoricalFields="Name"

        elif reporting_units == "onekm":
            table="drecp_reporting_units_1km_poly_v2"
            categoricalFields="''"

        initial_lat=34.8
        initial_lon=-116.7
        zoomLevel = int(request.POST.get('zoomLevel',8))
        template='drecp'
        config_file="config_drecp.js"

    elif studyarea=='ca':

        if reporting_units == "counties" or reporting_units == None:
            table="ca_reporting_units_county_boundaries_5_simplify"
            categoricalFields="name"

        if reporting_units == "usfs_national_forests":
            table="ca_reporting_units_usfs_national_forests_15_simplify"
            categoricalFields="name"

        elif reporting_units == "jepson_ecoregions":
            table="ca_jepson_ecoregions_2_simplify"
            categoricalFields="name"

        elif reporting_units == "ecoregion_subareas":
            table="drecp_reporting_units_ecoregion_subareas_no_simplify"
            categoricalFields="sa_name"

        elif reporting_units == "blm_field_offices":
            table="ca_reporting_units_blm_field_offices_7_simplify"
            categoricalFields="name"

        elif reporting_units == "deto_recovery_units":
            table="drecp_reporting_units_deto_recovery_units_no_simplify"
            categoricalFields="unit_name"

        elif reporting_units == "huc5_watersheds":
            table="ca_reporting_units_huc5_watersheds_5_simplify"
            categoricalFields="Name"

        elif reporting_units == "onekm":
            table="drecp_reporting_units_1km_poly_v2"
            categoricalFields="''"

        initial_lat=37.229722
        initial_lon=-121.509444
        template='ca'
        config_file="config_ca.js"
        zoomLevel = int(request.POST.get('zoomLevel',7))

    elif studyarea=='utah':

        if reporting_units == "blm_admin_units" or reporting_units == None:
            table="utah_cop_reporting_units_blm_admin_units_1_5_simplify"
            categoricalFields="name"

        elif reporting_units == "dwr_admin_boundaries":
            table="utah_cop_reporting_units_dwr_admin_boundaries_no_simplify"
            categoricalFields="name"

        elif reporting_units == "onekm":
            table="utah_cop_ru_1km_poly_postgis_v3"
            categoricalFields="''"

        initial_lat=39.4
        initial_lon=-112
        template='utah'
        config_file="config_utah.js"
        zoomLevel = int(request.POST.get('zoomLevel',7))

    ####################################### GET LIST OF FIELD NAMES FOR STATS ##########################################

    cursor = connection.cursor()
    field_name_query="SELECT string_agg(column_name, ',') FROM information_schema.columns where table_name ='" + table + "' and (data_type = 'numeric' or data_type = 'double precision') and column_name not in (" + stats_field_exclusions + ");"
    cursor.execute(field_name_query);
    statsFieldsTuple=cursor.fetchone()
    statsFields = ",".join(statsFieldsTuple)

    #Not used in AWA calculation
    #PostgresStatsToRetrieve=['avg']

    ########################################### INITIALIZATION RESPONSE ################################################
    if not WKT:
        initialize=1
        context={'template': template,
                 'zoomLevel': zoomLevel,
                 'reporting_units': reporting_units,
                 'initialize': initialize,
                 'initial_lat':initial_lat,
                 'initial_lon': initial_lon,
                 'config_file': config_file,
                 'studyarea':studyarea,
                 'count': 0}
        return render(request, template+'.html', context)

    #################################### OR DATABASE QUERY (SELECT FEATURES) ###########################################
    ############################################ BUILD SQL EXPRESSION ##################################################
    else:
        initialize=0

        ################################### BUILD SELECT LIST (FIELDS & TABLES) ########################################
        selectList="SELECT "

        if ('POINT' in WKT):
            #Point selection. No Area Weighted Average in the query.
            #Performance gains are minimal even with 900 fields.
            for field in statsFields.split(','):
                selectList+=field + " as " + field + "_" + "avg" + ","
            selectList+=categoricalFields + " as categorical_values, "
            selectList+="1 as count, "
            selectList+="ST_AsText(ST_SnapToGrid(ST_Force_2D(geom), .0001)) as outline_of_selected_features"

        else:
            #Area or line based selection, requiring AWA
            for field in statsFields.split(','):
                #Non area weighted selection
                #for stat in PostgresStatsToRetrieve:
                    #selectList+= stat+"(" + field + ")" + "as " + field + "_"+ stat + ","
                    #Area weighted selection. Would be preferable to get the sum of the shape area once, but would require
                    #a new selection using all the search conditions below.
                    #No need to store sum(shape_area) in a separate variable to avoid recalculating for each field....
                    #Time difference is negligible. 2.007133 mins for all watersheds vs 2.001333 mins with hard coded sum(shape_area).
                    #example: select sum(c4prec1530 * shape_area)/sum(shape_area) as c4prec1530_avg from table;
                    selectList+= "sum(" + field + " * shape_area)/sum(shape_area)" + " as " + field + "_" + "avg" + ","
            selectList+="count(*) as count, "
            #Aggregates. Count, Unique CSV from categorical fields, Outline of selected features.
            selectList+="string_agg(" + categoricalFields + ", ',') as categorical_values, "
            #Sum of the area of selected features for area weighted average. Maybe report later.
            #selectList+="sum(shape_area) as sum_area, "
            selectList+="ST_AsText(ST_SnapToGrid(ST_Force_2D(ST_Union(geom)), .0001)) as outline_of_selected_features"

        tableList=" FROM " + table

        selectFieldsFromTable = selectList + tableList

        ############################ "WHERE" (ADD ASPATIAL SEARCH CONDITIONS) ##########################################
        if WKT=='aspatial':

            queryField=request.GET.get('queryField')
            operator=request.GET.get('operator').strip()
            stringOrValue=request.GET.get('stringOrValue').lower().strip()

            if operator == "LIKE":
                selectStatement=selectFieldsFromTable + " where LOWER(" + queryField + ") " +  operator  + "%s"
            elif operator == ">" or operator == "<":
                selectStatement=selectFieldsFromTable + " where " + queryField + operator + stringOrValue
            else:
                selectStatement=selectFieldsFromTable + " where LOWER(" + queryField + ") " + operator + " '" + \
                                stringOrValue + "'"

        ########################## or "WHERE" (ADD SPATIAL SEARCH CONDITIONS) ##########################################
        else:

            WKT=WKT.replace('%', ' ')
            WKT="SRID=4326;"+WKT

            operator=None
            selectStatement=selectFieldsFromTable + " where ST_Intersects('"+ WKT + "', " + table + ".geom)"

        ######################################## EXECUTE DATABASE QUERY ################################################

        if operator == "LIKE":
            try:
                cursor.execute(selectStatement,['%' + stringOrValue + '%'] )
            except:
                return render(request, template+'.html', errorHandler(reporting_units, template, initial_lat, initial_lon, 1,0))
                #cursor.execute(selectStatement,['%' + stringOrValue + '%'] )
        else:
            cursor.execute(selectStatement)
            try:
               cursor.execute(selectStatement)
            except:
               return render(request, template+'.html', errorHandler(reporting_units, template, initial_lat, initial_lon, 1,0))
               #cursor.execute(selectStatement)

        ################################# STORE COLUMN, VALUE PAIRS IN A DICT ##########################################

        resultsDict={}

        #Get field names
        columns = [colName[0] for colName in cursor.description]

        try:
            for row in cursor:
                for i in range(len(row)):
                    if isinstance(row[i], basestring):
                        resultsDict[columns[i]] = row[i].strip()
                    else:
                        resultsDict[columns[i]] =(float(round(row[i],2)))
        except:
            return render(request, template+'.html', errorHandler(reporting_units, template, initial_lat, initial_lon, 0,1))

        WKT_SelectedPolys=resultsDict['outline_of_selected_features']


        categoricalValues=[]
        categoricalValues.extend(resultsDict['categorical_values'].split(','))
        categoricalValues=list(set(categoricalValues))
        categoricalValues.sort()

        #Remove these from the Dictionary before dumping to a JSON object (causing error & no need to send twice).
        resultsDict.pop('outline_of_selected_features',0)
        resultsDict.pop('categorical_values',0)

        count=int(resultsDict["count"])

        #Take fieldname,value pairs from the dict and dump to a JSON string.
        resultsJSON=json.dumps(resultsDict)
        #return HttpResponse(str(resultsDict.keys())+ str(resultsDict.values()))
        #return HttpResponse(resultsJSON)
        #return HttpResponse(resultsDict['tm_c4_2_avg'])

        ##################################### SET ADDITIONAL VARIABLES #################################################

        #BAR COLORS
        if studyarea=='drecp':

            columnChartColor1=getColor(resultsDict["intactness_avg"], "TI")
            columnChartColor2=getColor(resultsDict["hisensfz_avg"], "ClimateEEMS")
            columnChartColor3=getColor(resultsDict["eecefzt1_avg"], "ClimateEEMS")
            columnChartColor4=getColor(resultsDict["eecefzt2_avg"], "ClimateEEMS")
            columnChartColor5=getColor(resultsDict["eepifzt1_avg"], "ClimateEEMS")
            columnChartColor6=getColor(resultsDict["eepifzt2_avg"], "ClimateEEMS")

            columnChartColors=columnChartColor1+","+columnChartColor2+","+columnChartColor3+","+columnChartColor4+","+columnChartColor5+","+columnChartColor6

        elif studyarea=='utah':

            columnChartColor1=getColor(resultsDict["ti_union_avg"], "TI")
            columnChartColor2=getColor(resultsDict["hisensfz_avg"], "ClimateEEMS")
            columnChartColor3=getColor(resultsDict["eeccfz1530_avg"], "ClimateEEMS")
            columnChartColor4=getColor(resultsDict["eeccfz4560_avg"], "ClimateEEMS")
            columnChartColor5=getColor(resultsDict["eepifz1530_avg"], "ClimateEEMS")
            columnChartColor6=getColor(resultsDict["eepifz4560_avg"], "ClimateEEMS")

            columnChartColors=columnChartColor1+","+columnChartColor2+","+columnChartColor3+","+columnChartColor4+","+columnChartColor5+","+columnChartColor6

        else:

            resultsDict["intactness_avg"]=.3
            resultsDict["hisensfz_avg"]=.9
            resultsDict["eecefzt1_avg"]=.7
            resultsDict["eecefzt2_avg"]=.2
            resultsDict["eepifzt1_avg"]=-.3
            resultsDict["eepifzt2_avg"]=.4

            columnChartColors=6*"#444444,"

        ########################################### RETURN RESULTS #####################################################

        context={'template': template,
                 'initialize': initialize,
                 'WKT_SelectedPolys': WKT_SelectedPolys,
                 'reporting_units': reporting_units,
                 'zoomLevel': zoomLevel, 'count': count,
                 'initial_lat':initial_lat,
                 'initial_lon': initial_lon,
                 'resultsJSON': resultsJSON,
                 'categoricalValues': categoricalValues,
                 'columnChartColors': columnChartColors,
                 'error': 0,
                 'config_file':config_file,
                 'studyarea':studyarea,
                 }
    if request.method == 'POST':
        #Also works
        #return HttpResponse(resultsJSON)
        #return HttpResponse(context["resultsJSON"])
        return HttpResponse(json.dumps(context))
    else:
        return render(request, template+'.html', context)

def errorHandler(reporting_units, template, initial_lat, initial_lon, error, selectionWarning):
    WKT="SRID=4326;POLYGON((-180 0,-180 0,-180 0,-180 0,-180 0))"
    context={'template': template,
             'zoomLevel': 8,
             'reporting_units': reporting_units,
             'initialize': 0,
             'WKT_SelectedPolys': WKT,
             'initial_lat': initial_lat,
             'initial_lon': initial_lon,
             'resultsJSON': resultsJSON,
             'count': 0,
             'error': error,
             'selectionWarning':selectionWarning,
             }
    return context

def getColor(value, parameter):
    """Colors used in the highcharts chart"""
    if (value > .75):
        if (parameter == 'TI'):
            return "#364D22"
        if (parameter == 'CV'):
            return "#26641B"
        if (parameter == 'SS'):
            return "#664830"
        if (parameter == 'PR'):
            return "#2892C7"
        if (parameter == 'ClimateEEMS'):
            return "#C44539"
    elif (value > .5):
        if (parameter == 'TI'):
            return "#7F9A51"
        if (parameter == 'CV'):
            return "#7FBD42"
        if (parameter == 'SS'):
            return "#806444"
        if (parameter == 'PR'):
            return "#8CB8A4"
        if (parameter == 'ClimateEEMS'):
            return "#E08865"
    elif (value > .0):
        if (parameter == 'TI'):
            return "#BFD67B"
        if (parameter == 'CV'):
            return "#DBF5B7"
        if (parameter == 'SS'):
            return "#99825A"
        if (parameter == 'PR'):
            return "#D7E37D"
        if (parameter == 'ClimateEEMS'):
            return "#F7D59E"
    elif (value > -.499999):
        if (parameter == 'TI'):
            return "#FFFFBE"
        if (parameter == 'CV'):
            return "#F29ED2"
        if (parameter == 'SS'):
            return "#B5A372"
        if (parameter == 'PR'):
            return "#364D22"
        if (parameter == 'ClimateEEMS'):
            return "#DADBC5"
    elif (value >  -.749999):
        if (parameter == 'TI'):
            return "#9EAAD7"
        if (parameter == 'CV'):
            return "#C51B7E"
        if (parameter == 'SS'):
            return "#D1C68C"
        if (parameter == 'PR'):
            return "#F5A27A"
        if (parameter == 'ClimateEEMS'):
            return "#8B97CC"
    elif (value >  -1.00001):
        if (parameter == 'TI'):
            return "#444F89"
        if (parameter == 'CV'):
            return "#8F0051"
        if (parameter == 'SS'):
            return "#F0ECAA"
        if (parameter == 'PR'):
            return "#CD6666"
        if (parameter == 'ClimateEEMS'):
            return "#3462CF"
    else:
        return "gray"

#Not currently used in this application. The decision was made to keep these separate.
@gzip_page
@csrf_exempt
def energy(request):

    if request.method == 'POST':
        WKT = request.POST.get('wktPOST')
        reporting_units=request.POST.get('reporting_units')
        ti_slider = request.POST.get('ti_slider')
        cv_slider = request.POST.get('cv_slider')
        species_count_slider_value = request.POST.get('species_count_slider_value')
        chat_slider_value = request.POST.get('chat_slider_value')
        solar_slider_value = request.POST.get('solar_slider_value')
        ownership_values = request.POST.get('ownership_values')

        if ownership_values == '':
            ownership_values='BLM,Military,Native American,Other,Private,State Land,USFS'

        exemptions=" and gap_sts NOT IN('1')"

        corridor_avoidance_slider_value = request.POST.get('corridor_avoidance_slider_value')
        cdfw_slider_value = request.POST.get('cdfw_slider_value')

        min_area = float(request.POST.get('min_area'))
        min_area_units = request.POST.get('min_area_units')
        #1 square km = 247.105 acres.

        if min_area_units == 'meters':
            area_conversion_factor=1
        elif min_area_units == 'acres':
            area_conversion_factor=4046.86
        elif min_area_units == 'hectares':
            area_conversion_factor=10000
        elif min_area_units == 'square_km':
            area_conversion_factor=1e+6
        elif min_area_units == 'square_mi':
            area_conversion_factor=2.59e+6
        elif min_area_units == 'square_feet':
            area_conversion_factor=0.092903
        else:
            area_conversion_factor=1

    else:
        WKT=request.GET.get('user_wkt')
        reporting_units=request.GET.get('reporting_units', "counties")

    ############################################# INPUT PARAMETERS #####################################################

    template=request.GET.get('template')
    if not template:
        template='index'

    query_layer="energy_scenario_1km_query_grid"

    #statsFields="intactness"
    statsFields=None

    if reporting_units == "counties":
        table="drecp_reporting_units_county_boundaries_no_simplify"
        featureName="County"
        featureNamePlural="Counties"
        categoricalFields="name_pcase"

    if reporting_units == "ecoregion_subareas":
        table="drecp_reporting_units_ecoregion_subareas_no_simplify"
        featureName="Ecoregion Subarea"
        featureNamePlural="Ecoregion Subareas"
        categoricalFields="sa_name"

    if reporting_units == "blm_field_offices":
        table="drecp_reporting_units_blm_field_offices_no_simplify"
        featureName="BLM Field Office"
        featureNamePlural="BLM Field Offices"
        categoricalFields="fo_name"

    if reporting_units == "deto_recovery_units":
        table="drecp_reporting_units_deto_recovery_units_no_simplify"
        featureName="Desert Tortoise Recovery Unit"
        featureNamePlural="Desert Tortoise Recovery Units"
        categoricalFields="unit_name"

    if reporting_units == "huc5_watersheds":
        table="drecp_reporting_units_huc5_watersheds_1_5_simplify"
        featureName="HUC5 Watersheds"
        featureNamePlural="HUC5 Watersheds"
        categoricalFields="Name"

    elif reporting_units == "onekm":
        table="drecp_reporting_units_1km_poly_v2"
        featureName="1km Reporting Unit"
        featureNamePlural="1km Reporting Units"
        categoricalFields="''"

    #areaField="shape_area" #Dataset needs an area field in a PCS (not Lat,Lon).
    #areaConversionDivisor=1000000 #m2 to km2

    totalArea=1

    #California
    initial_lat=37.229722
    initial_lon=-121.509444

    #DRECP
    initial_lat=34.8
    initial_lon=-116.7

    zoomLevel = int(request.POST.get('zoomLevel',8))

    #Not used in AWA calculation
    #PostgresStatsToRetrieve=['avg']

    cursor = connection.cursor()

    ########################################### INITIALIZATION RESPONSE ################################################
    if not WKT:
        initialize=1
        WKT="SRID=4326;POINT(-115.7 34.8)"
        context={'template': template,
                 'zoomLevel': zoomLevel,
                 'reporting_units': reporting_units,
                 'initialize': initialize,
                 'WKT_SelectedPolys': WKT,
                 'initial_lat':initial_lat,
                 'initial_lon': initial_lon,
                 'count': 0}

    #################################### OR DATABASE QUERY (SELECT FEATURES) ###########################################
    ############################################ BUILD SQL EXPRESSION ##################################################

    else:
        initialize=0

        ################################### BUILD SELECT LIST (FIELDS & TABLES) ########################################
        selectList="SELECT "

        if statsFields:

            for field in statsFields.split(','):
                #Non area weighted selection
                #for stat in PostgresStatsToRetrieve:
                    #selectList+= stat+"(" + field + ")" + "as " + field + "_"+ stat + ","
                    #Area weighted selection. Would be preferable to get the sum of the shape area once, but would require
                    #a new selection using all the search conditions below.
                    #Extra time for AWA calculation is negligible (2.01mins vs 1.997mins for all watersheds).
                    #No need to store sum(shape_area) in a separate variable to avoid recalculating for each field....
                    #Time difference is negligible. 2.007133 mins for all watersheds vs 2.001333 mins with hard coded sum(shape_area).
                    #example: select sum(c4prec1530 * shape_area)/sum(shape_area) as c4prec1530_avg from table;
                    selectList+= "sum(" + field + " * shape_area)/sum(shape_area)" + " as " + field + "_" + "avg" + ","

        #Aggregates. Count, Unique CSV from categorical fields, Outline of selected features.
        selectList+="count(*) as count, "

        selectList+="string_agg(" + categoricalFields + ", ',') as categorical_values, "
        #Sum of the area of selected features for area weighted average. Maybe report later.
        #selectList+="sum(shape_area) as sum_area, "

        selectList+="ST_AsText(ST_SnapToGrid(ST_Force_2D(ST_Union(geom)), .0001)) as outline_of_selected_features"

        tableList=" FROM " + table

        selectFieldsFromTable = selectList + tableList

        ############################ "WHERE" (ADD ASPATIAL SEARCH CONDITIONS) ##########################################
        if WKT=='aspatial':

            queryField=request.GET.get('queryField')
            operator=request.GET.get('operator').strip()
            stringOrValue=request.GET.get('stringOrValue').lower().strip()

            if operator == "LIKE":
                selectStatement=selectFieldsFromTable + " where LOWER(" + queryField + ") " +  operator  + "%s"
            elif operator == ">" or operator == "<":
                selectStatement=selectFieldsFromTable + " where " + queryField + operator + stringOrValue
            else:
                selectStatement=selectFieldsFromTable + " where LOWER(" + queryField + ") " + operator + " '" + \
                                stringOrValue + "'"

        ########################## or "WHERE" (ADD SPATIAL SEARCH CONDITIONS) ##########################################
        else:

            WKT=WKT.replace('%', ' ')
            WKT="SRID=4326;"+WKT

            operator=None
            selectStatement=selectFieldsFromTable + " where ST_Intersects('"+ WKT + "', " + table + ".geom)"

        ######################################## EXECUTE DATABASE QUERY ################################################

        if operator == "LIKE":
            try:
                cursor.execute(selectStatement,['%' + stringOrValue + '%'] )
            except:
                return render(request, template+'.html', errorHandler(reporting_units, template, initial_lat, initial_lon, 1,0))
                #cursor.execute(selectStatement,['%' + stringOrValue + '%'] )
        else:
            cursor.execute(selectStatement)
            try:
               cursor.execute(selectStatement)
            except:
               return render(request, template+'.html', errorHandler(reporting_units, template, initial_lat, initial_lon, 1,0))
               #cursor.execute(selectStatement)

        ################################# STORE COLUMN, VALUE PAIRS IN A DICT ##########################################

        resultsDict={}

        #Get field names
        columns = [colName[0] for colName in cursor.description]

        try:
            for row in cursor:
                for i in range(len(row)):
                    if isinstance(row[i], basestring):
                        resultsDict[columns[i]] = row[i].strip()
                    else:
                        resultsDict[columns[i]] =(float(round(row[i],2)))
        except:
            return render(request, template+'.html', errorHandler(reporting_units, template, initial_lat, initial_lon, 0,1))

        #return HttpResponse(resultsDict['sum_area'])

        WKT_SearchArea=resultsDict['outline_of_selected_features']
        WKT_SearchArea=WKT_SearchArea.replace('%', ' ')
        WKT_SearchArea="SRID=4326;"+WKT_SearchArea

        categoricalValues=[]
        categoricalValues.extend(resultsDict['categorical_values'].split(','))
        categoricalValues=list(set(categoricalValues))
        categoricalValues.sort()

        #Remove these from the Dictionary before dumping to a JSON object (causing error & no need to send twice).
        resultsDict.pop('outline_of_selected_features',0)
        resultsDict.pop('categorical_values',0)

        count=int(resultsDict["count"])

        #Take fieldname,value pairs from the dict and dump to a JSON string.
        resultsJSON=json.dumps(resultsDict)

        ##################################### SET ADDITIONAL VARIABLES #################################################

        if count > 1 :
            featureName=featureNamePlural

        if not featureName:
            featureName="Counties"

        ################################## GRID CELL Query (Find suitable polygons) ####################################

        cursor = connection.cursor()

        #initial query. Find suitable polygons
        query1="create temp table temp1 as SELECT ST_Union(geom) as the_geom from " +  query_layer + " where intactness <=" + ti_slider + "and hi_linkage <=" + cv_slider + " and speciescou <=" + species_count_slider_value + " and ch_rank >=" + chat_slider_value + " and dniann >=" + solar_slider_value  + " and ownership = ANY('" + "{" + ownership_values + "}" + "'::text[]) " + "and ST_Intersects('"+ WKT_SearchArea + "', " + query_layer + ".geom)" + exemptions
        cursor.execute(query1)

        #explode to isolate smaller shapes
        query2="create temp table temp2 as select (st_dump(the_geom)).geom as geom2 from temp1;"
        cursor.execute(query2)

        #remove smaller shapes
        query3="alter table temp2 add area float; " \
               "update temp2 set area = st_area(geom2::geography); " \
               "delete from temp2 where area < " + str(min_area * area_conversion_factor) + ";"

        cursor.execute(query3)

        query4="create temp table temp3 as select (st_dump(ST_Union(geom2))).geom as the_geom from temp2;"
        cursor.execute(query4)

        onekm_query="SELECT ST_AsText(ST_SnapToGrid(ST_Force_2D(ST_Union(the_geom)), .0001)) as outline_of_selected_features from temp3"

        cursor.execute(onekm_query)

        onekmDict={}

        #Get field names
        columns = [colName[0] for colName in cursor.description]

        try:
            for row in cursor:
                for i in range(len(row)):
                    if isinstance(row[i], basestring):
                        onekmDict[columns[i]] = row[i].strip()
                    else:
                        onekmDict[columns[i]] =(float(round(row[i],2)))
        except:
            return render(request, template+'.html', errorHandler(reporting_units, template, initial_lat, initial_lon, 0,1))


        WKT_SelectedPolys=onekmDict['outline_of_selected_features']
        #The version of PostGIS on Webfaction was returning SRID=4326 in the multipolygon (check the console for last_poly). It was causing Leaflet to Break. t is null. This was the solution.
        WKT_SelectedPolys=WKT_SelectedPolys.replace('SRID=4326;','')

        if reporting_units=='onekm':
            WKT_SearchArea=WKT

        context={'template': template,
                 'initialize': initialize,
                 'WKT_SelectedPolys': WKT_SelectedPolys,
                 'WKT_SearchArea': WKT_SearchArea,
                 'reporting_units': reporting_units,
                 'featureName': featureName,
                 'featureNamePlural': featureNamePlural,
                 'totalArea': totalArea,
                 'zoomLevel': zoomLevel, 'count': count,
                 'initial_lat':initial_lat,
                 'initial_lon': initial_lon,
                 'resultsJSON': resultsJSON,
                 'categoricalValues': categoricalValues,
                 'error': 0,
                 'ti_slider':ti_slider,
                 }
    if request.method == 'POST':
        return HttpResponse(json.dumps(context))
    else:
        return render(request, template+'.html', context)

def errorHandler(reporting_units, template, initial_lat, initial_lon, error, selectionWarning):
    WKT="SRID=4326;POLYGON((-180 0,-180 0,-180 0,-180 0,-180 0))"
    context={'template': template,
             'zoomLevel': 8,
             'reporting_units': reporting_units,
             'initialize': 0,
             'WKT_SelectedPolys': WKT,
             'initial_lat': initial_lat,
             'initial_lon': initial_lon,
             'resultsJSON': resultsJSON,
             'count': 0,
             'error': error,
             'selectionWarning':selectionWarning,
             'totalArea':0,
             }
    return context

