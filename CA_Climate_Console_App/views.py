from django.http import HttpResponse
import urllib
import re
import netCDF4
import numpy as np
import time

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
    template=request.GET.get('template','template1')

    #################### REQUEST TYPE (POST through App OR (GET Through external OR initialize) ########################

    if request.method == 'POST':
        WKT = request.POST.get('wktPOST')
        table=request.POST.get('reporting_units')
        categoricalFields=request.POST.get('name_field')

    else:
        WKT=request.GET.get('user_wkt')
        table=request.GET.get('reporting_units')
        categoricalFields=request.GET.get('name_field')
        #urllib.urlretrieve ("http://www.cpc.ncep.noaa.gov/pacdir/NFORdir/HUGEdir2/cpcllftd.dat", "static/data/noaa/climate/cpcllftd.dat")
        #urllib.urlretrieve ("http://www.cpc.ncep.noaa.gov/pacdir/NFORdir/HUGEdir2/cpcllfpd.dat", "static/data/noaa/climate/cpcllfpd.dat")

    ############################################# INPUT PARAMETERS #####################################################

    stats_field_exclusions="'id_for_zon', 'objectid', 'shape_leng', 'shape_area'"

    if studyarea=='drecp':

        #Default
        if table == None:
            table="drecp_reporting_units_county_boundaries_no_simplify"
            categoricalFields="name_pcase"

        template='drecp'
        config_file="config_drecp.js"

    elif studyarea=='ca':

        #Default
        if table == None:
            table="ca_reporting_units_county_boundaries_5_simplify"
            categoricalFields="name"

        template='ca'
        config_file="config_ca.js"

    elif studyarea=='utah':

        if table == None:
            table="utah_cop_reporting_units_blm_admin_units_1_5_simplify"
            categoricalFields="name"

        config_file="config_utah.js"

    elif studyarea=='test':

        if table == None:
            table="ca_reporting_units_county_boundaries_5_simplify"
            categoricalFields="name"

        template='test'
        config_file="config_ca.js"

    ####################################### GET LIST OF FIELD NAMES FOR STATS ##########################################

    cursor = connection.cursor()
    field_name_query="SELECT string_agg(column_name, ',') FROM information_schema.columns where table_name ='" + table + "' and (data_type = 'numeric' or data_type = 'double precision') and column_name not in (" + stats_field_exclusions + ");"
    cursor.execute(field_name_query);
    statsFieldsTuple=cursor.fetchone()
    statsFields = ",".join(statsFieldsTuple)

    ########################################### INITIALIZATION RESPONSE ################################################
    if not WKT:
        initialize=1
        context={'initialize': initialize,
                 'config_file': config_file,
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
                selectList+=field + " as " + field + "_" + "avg, "
            if categoricalFields:
                selectList+=categoricalFields + " as categorical_values, "
            selectList+=" 1 as count, "
            selectList+="ST_AsText(ST_SnapToGrid(ST_Force_2D(geom), .0001)) as outline_of_selected_features"

        else:
            #Area or line based selection, requiring Area Weighted Average
            for field in statsFields.split(','):
                    selectList+= "sum(" + field + " * shape_area)/sum(shape_area)" + " as " + field + "_" + "avg" + ","
            selectList+="count(*) as count "
            #Aggregates. Count, Unique CSV from categorical fields, Outline of selected features.
            if categoricalFields:
                selectList+=", string_agg(" + categoricalFields + ", ',') as categorical_values"
            #Sum of the area of selected features for area weighted average. Maybe report later.
            #selectList+="sum(shape_area) as sum_area, "
            selectList+=", ST_AsText(ST_SnapToGrid(ST_Force_2D(ST_Union(geom)), .0001)) as outline_of_selected_features"

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
              cursor.execute(selectStatement,['%' + stringOrValue + '%'] )
        else:
            cursor.execute(selectStatement)

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
            return render(request, template+'.html', errorHandler(template, 0,1))

        WKT_SelectedPolys=resultsDict['outline_of_selected_features']

        if categoricalFields:
            categoricalValues=[]
            categoricalValues.extend(resultsDict['categorical_values'].split(','))
            categoricalValues=list(set(categoricalValues))
            categoricalValues.sort()
        else:
            categoricalValues=['']

        #Remove these from the Dictionary before dumping to a JSON object (causing error & no need to send twice).
        resultsDict.pop('outline_of_selected_features',0)
        resultsDict.pop('categorical_values',0)

        count=int(resultsDict["count"])

        #Take fieldname,value pairs from the dict and dump to a JSON string.
        resultsJSON=json.dumps(resultsDict)
        #return HttpResponse(str(resultsDict.keys())+ str(resultsDict.values()))
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
            columnChartColor2=getColor(resultsDict["ai_100m_avg"], "TI")
            columnChartColor3=getColor(resultsDict["hisensfz_avg"], "ClimateEEMS")
            columnChartColor4=getColor(resultsDict["eeccfz1530_avg"], "ClimateEEMS")
            columnChartColor5=getColor(resultsDict["eeccfz4560_avg"], "ClimateEEMS")
            columnChartColor6=getColor(resultsDict["eepifz1530_avg"], "ClimateEEMS")
            columnChartColor7=getColor(resultsDict["eepifz4560_avg"], "ClimateEEMS")

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

        context={'initialize': initialize,
                 'WKT_SelectedPolys': WKT_SelectedPolys,
                 'count': count,
                 'resultsJSON': resultsJSON,
                 'categoricalValues': categoricalValues,
                 'columnChartColors': columnChartColors,
                 'error': 0,
                 'config_file':config_file,
                 }
    if request.method == 'POST':
        return HttpResponse(json.dumps(context))
    else:
        return render(request, template+'.html', context)

@gzip_page
@csrf_exempt
def downscale(request):
    userWKT = request.POST.get('input')
    #print userWKT
    coords=re.findall("[+-]?\d+.\d+", userWKT)
    print coords
    lon_target=float(coords[0])
    lat_target=float(coords[1])
    #lat_target=44.5608
    #lon_target-123.2614
    #=========================================================
    #             SET OPENDAP PATH
    #=========================================================
    #pathname = 'http://thredds.nkn.uidaho.edu:8080/thredds/dodsC/NWCSC_INTEGRATED_SCENARIOS_ALL_CLIMATE/projections/nmme/bcsd_nmme_metdata_NCAR_forecast_daily.nc'
    #pathname = 'static/data/idaho/bcsd_nmme_metdata_NCAR_forecast_daily.nc'
    #pathname = 'http://thredds.nkn.uidaho.edu:8080/thredds/dodsC/NWCSC_INTEGRATED_SCENARIOS_ALL_CLIMATE/projections/nmme/bcsd_nmme_metdata_ENSMEAN_forecast_monthly.nc'
    pathname = 'http://thredds.nkn.uidaho.edu:8080/thredds/dodsC/NWCSC_INTEGRATED_SCENARIOS_ALL_CLIMATE/projections/nmme/bcsd_nmme_metdata_ENSMEAN_forecast_1monthAverage.nc'
    #pathname = 'http://thredds.nkn.uidaho.edu:8080/thredds/dodsC/NWCSC_INTEGRATED_SCENARIOS_ALL_CLIMATE/projections/nmme/bcsd_nmme_metdata_ENSMEAN_forecast_3monthAverage.nc'
    #pathname = 'static/data/idaho/bcsd_nmme_metdata_ENSMEAN_forecast_3monthAverage.nc'
    #pathname = 'http://thredds.nkn.uidaho.edu:8080/thredds/dodsC/NWCSC_INTEGRATED_SCENARIOS_ALL_CLIMATE/projections/nmme/bcsd_nmme_metdata_ENSMEAN_forecast_daily.nc'
    #pathname = 'http://inside-dev1.nkn.uidaho.edu:8080/thredds/dodsC/agg_met_tmmx_1979_2015_WUSA.nc'

    #=========================================================
    #             GET DATA HANDLES
    #=========================================================
    filehandle=netCDF4.Dataset(pathname,'r',format="NETCDF4")

    lats=filehandle.variables['lat'][:]
    lons=filehandle.variables['lon'][:]
    days_since_19000101=filehandle.variables['time'][:]
    #tmax=filehandle.variables['tasmax']
    #precip=filehandle.variables['pr']

    #tmax=filehandle.variables['tasmax']
    #precip=filehandle.variables['pr']

    #tmax=filehandle.variables['tmp2m']
    #precip=filehandle.variables['prate']

    tmax=filehandle.variables['tmp2m_anom']
    precip=filehandle.variables['prate_anom']

    #days_since_19000101=filehandle.variables['day'][0:20]
    #variable=filehandle.variables['daily_maximum_temperature'][0:20]

    #Get the closest lat and lon value in the netCDF File
    lon_index = np.abs(lons - lon_target).argmin()
    lat_index = np.abs(lats - lat_target).argmin()

    time_num=len(days_since_19000101)
    time_index=range(0,time_num,1)

    #Get the formatted dates and the data as lists
    #dates=[str(netCDF4.num2date(int(i),'days since 1900-01-01',calendar='standard').date()) for i in days_since_19000101]
    #Abbreviated Month Format
    #print days_since_19000101
    dates=[str(netCDF4.num2date(int(i),'days since 1900-01-01',calendar='standard').date().strftime("%b")) for i in days_since_19000101]
    tmax_data=tmax[lon_index,lat_index, time_index].tolist()
    precip_data=precip[lon_index,lat_index, time_index].tolist()
    #Historical Order of variables
    #data=variable[time_index,lon_index,lat_index].tolist()
    rounded_tmax_data=[round(x,2) for x in tmax_data ]
    rounded_precip_data=[round(x,2) for x in precip_data ]

    context={
        'dates': dates,
        'tmax_data': rounded_tmax_data,
        'precip_data': rounded_precip_data
    }

    return HttpResponse(json.dumps(context))


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
