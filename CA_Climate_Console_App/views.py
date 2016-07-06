from django.http import HttpResponse
import re
#import netCDF4

import numpy as np
import os
import ast
from django.shortcuts import render
from django.db import connection
import json

from json import encoder
#Two decimal places when dumping to JSON
encoder.FLOAT_REPR = lambda o: format(o, '.2f')

from django.views.decorators.gzip import gzip_page

from collections import OrderedDict

#Potential security hole.
from django.views.decorators.csrf import csrf_exempt

@gzip_page
@csrf_exempt
def index(request):

    has_ecosystem_services=1

    studyarea = request.resolver_match.url_name
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
        #Near-term weather forecast data retrieved from NOAA through Cronjob.

    ############################################# INPUT PARAMETERS #####################################################

    stats_field_exclusions="'id_for_zon', 'objectid', 'shape_leng', 'shape_area'"

    if studyarea=='drecp':

        if table == None:
            table="drecp_reporting_units_county_boundaries_no_simplify"
            categoricalFields="name_pcase"

        template='drecp'
        config_file="config_drecp.js"

    elif studyarea=='ca':

        if table == None:
            table="ca_reporting_units_county_boundaries_5_simplify"
            categoricalFields="name"

        template='ca'
        config_file="config_ca.js"

    elif studyarea=='multi-lcc':

        if table == None:
            table="multi_lcc_reporting_units_llc_boundaries_2_simplify"
            categoricalFields="name"

        template='multi-lcc'
        config_file="config_multi-lcc.js"

    elif studyarea=='utah':

        if table == None:
            table="utah_cop_reporting_units_blm_admin_units_1_5_simplify"
            categoricalFields="name"

        template='utah'
        config_file="config_utah.js"

    elif studyarea=='dev':

        if table == None:
            table="ca_reporting_units_county_boundaries_5_simplify"
            categoricalFields="name"

        template='ca_dev'
        config_file="config_ca.js"

    ####################################### GET LIST OF FIELD NAMES FOR STATS ##########################################

    cursor = connection.cursor()
    field_name_query="SELECT string_agg(column_name, ',') FROM information_schema.columns where table_name ='" + table + "' and (data_type = 'numeric' or data_type = 'double precision') and column_name not in (" + stats_field_exclusions + ");"
    cursor.execute(field_name_query);
    statsFieldsTuple=cursor.fetchone()
    statsFields = ",".join(statsFieldsTuple)

    ########################################### INITIALIZATION RESPONSE ################################################
    if not WKT:
        context={'initialize': 1,
                 'config_file': config_file,
                 'count': 0}
        return render(request, template+'.html', context)

    #################################### OR DATABASE QUERY (SELECT FEATURES) ###########################################
    ############################################ BUILD SQL EXPRESSION ##################################################
    else:

        ################################### BUILD SELECT LIST (FIELDS & TABLES) ########################################
        selectList="SELECT "

        if ('POINT' in WKT):
            #Point selection. No Area Weighted Average in the query. Performance gains are minimal even with 900 fields.
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
            print "Error: No features selected"
            raise SystemExit(0)
            #return render(request, template+'.html')

        WKT_SelectedPolys=resultsDict['outline_of_selected_features']

        if categoricalFields:
            categoricalValues=[]
            categoricalValues.extend(resultsDict['categorical_values'].split(','))
            categoricalValues=list(set(categoricalValues))
            categoricalValues.sort()
        else:
            categoricalValues=[' ']

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
        if studyarea=='multi-lcc':
            resultsDict["intactness_avg"]=0
            resultsDict["hisensfz_avg"]=0
            resultsDict["eecefzt1_avg"]=0
            resultsDict["eecefzt2_avg"]=0
            resultsDict["eepifzt1_avg"]=0
            resultsDict["eepifzt2_avg"]=0

            columnChartColors=6*"#444444,"

        elif studyarea=='drecp':

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

            #if table == "ca_reporting_units_1km_poly":
            #    resultsDict["intactness_avg"]=0
            #    resultsDict["hisensfz_avg"]=0
            #    resultsDict["eecefzt1_avg"]=0
            #    resultsDict["eecefzt2_avg"]=0
            #    resultsDict["eepifzt1_avg"]=0
            #    resultsDict["eepifzt2_avg"]=0

            #    columnChartColors=6*"#444444,"


            #columnChartColor1=getColor(resultsDict["intactness_avg"], "TI")
            columnChartColor1=getColor(resultsDict["hisensfz_avg"], "ClimateEEMS")
            columnChartColor2=getColor(resultsDict["eecefzt1_avg"], "ClimateEEMS")
            columnChartColor3=getColor(resultsDict["eecefzt2_avg"], "ClimateEEMS")
            columnChartColor4=getColor(resultsDict["eepifzt1_avg"], "ClimateEEMS")
            columnChartColor5=getColor(resultsDict["eepifzt2_avg"], "ClimateEEMS")
            columnChartColor6="#4444444"

            columnChartColors=columnChartColor1+","+columnChartColor2+","+columnChartColor3+","+columnChartColor4+","+columnChartColor5+","+columnChartColor6


        if has_ecosystem_services:
            ecosystem_services_data=get_ecosystem_services_data(WKT)
        else:
            ecosystem_services_data=''

        ########################################### RETURN RESULTS #####################################################

        context={'initialize': 0,
                 'WKT_SelectedPolys': WKT_SelectedPolys,
                 'count': count,
                 'resultsJSON': resultsJSON,
                 'categoricalValues': categoricalValues,
                 'columnChartColors': columnChartColors,
                 'error': 0,
                 'config_file':config_file,
                 'ecosystem_services_data':ecosystem_services_data
                 }

    if request.method == 'POST':
        return HttpResponse(json.dumps(context))
    else:
        return render(request, template+'.html', context)

@gzip_page
@csrf_exempt
def view2(request):

    #studyarea = request.resolver_match.url_name
    #template=request.GET.get('template','template1')

    WKT = request.POST.get('wktPOST')
    table=request.POST.get('reporting_units')
    categoricalFields=request.POST.get('name_field')
    print WKT

    ############################################# INPUT PARAMETERS #####################################################

    stats_field_exclusions="'id_for_zon', 'objectid', 'shape_leng', 'shape_area'"

    if table == None:
        #table="multi_lcc_query_layer_protected_areas_5_simplify"
        #table="multi_lcc_query_layer_protected_areas_no_simplify"
        table="multi_lcc_query_layer_protected_areas_soils_5_simplify"
        categoricalFields="name,ru_type"

    template='multi-lcc'
    config_file="config_multi-lcc.js"

    ########################################### INITIALIZATION RESPONSE ################################################
    if not WKT:
        context={'initialize': 1,
                 'config_file': config_file,
                 'count': 0}
        return render(request, template+'.html', context)

    #################################### OR DATABASE QUERY (SELECT FEATURES) ###########################################
    ############################################ BUILD SQL EXPRESSION ##################################################
    else:
        cursor = connection.cursor()

        #First condition handles a Map Click. Select LCC Boundary & get all protected areas within it.
        if "POINT" in WKT or "POLYGON" in WKT or "LINESTRING" in WKT:
            print "yes"

            table="multi_lcc_reporting_units_llc_boundaries_2_simplify"

            WKT=WKT.replace('%', ' ')
            WKT="SRID=4326;"+WKT

            spatial_filter_layer='multi_lcc_reporting_units_llc_boundaries_2_simplify'
            #query_layer='multi_lcc_query_layer_protected_areas_5_simplify'
            #query_layer="multi_lcc_query_layer_protected_areas_no_simplify"
            query_layer="multi_lcc_query_layer_protected_areas_soils_5_simplify"
            print query_layer

            if "POINT" in WKT:
                #Get geometery of LCC Boundary
                spatial_filter_shape_query="SELECT ST_AsText(ST_SnapToGrid(ST_Force_2D(ST_Union(geom)), .0001)) from " + spatial_filter_layer + " where ST_Intersects('"+ WKT + "', " + spatial_filter_layer + ".geom)"
                cursor.execute(spatial_filter_shape_query)
                spatial_filter_shape=cursor.fetchone()[0]

                #Get name. Should do in query above.
                spatial_filter_name="SELECT name from " + spatial_filter_layer + " where ST_Intersects('"+ WKT + "', " + spatial_filter_layer + ".geom)"
                cursor.execute(spatial_filter_name)
                spatial_filter_name=cursor.fetchone()[0]

                #Sub query to get the clicked shape used to be the spatial fitler
                spatial_filter_shape_sub_query="(SELECT geom from " + spatial_filter_layer + " where ST_Intersects('"+ WKT + "', " + spatial_filter_layer + ".geom))"

            else: #POLYGON or LINESTRING
                spatial_filter_shape_sub_query="'"+ WKT + "'"
                spatial_filter_shape=WKT
                spatial_filter_name="User Defined Area"

            #Get all protected areas within LCC boundary
            tabular_query="SELECT distinct a.name, a.ru_type, a.eetmads0t1, a.eetmids0t1, a.eepreds0t1, a.eetmads0t2, a.eetmids0t2, a.eepreds0t2, a.gis_acres from " + query_layer + " as a, " + spatial_filter_layer + " as b where ST_Intersects(a.geom, " + spatial_filter_shape_sub_query + ")"


            cursor.execute(tabular_query)

            #Get all selected protected area data into an array
            tabular_data={}

            for row in cursor:
                feature_name=row[0]
                data=[]
                ru_type=row[1]
                tmax_delta_t1=float(row[2])
                tmin_delta_t1=float(row[3])
                prec_delta_t1=float(row[4])
                tmax_delta_t2=float(row[5])
                tmin_delta_t2=float(row[6])
                prec_delta_t2=float(row[7])
                gis_acres=round(row[8],0)
                data.extend([ru_type, tmax_delta_t1, tmin_delta_t1, prec_delta_t1, tmax_delta_t2, tmin_delta_t2, prec_delta_t2, gis_acres])

                tabular_data[feature_name]=data

            tabularResultsJSON=json.dumps(tabular_data)

            #If empty, resultsJSON is null and response is unsuccessfull, thus triggering the "No Features Selected" error.
            if tabular_data:
                #Required in the front end.
                resultsJSON=json.dumps({})

            columnChartColors=''

            context={'initialize': 0,
                 'WKT_SelectedPolys': spatial_filter_shape,
                 'resultsJSON': resultsJSON,
                 'categoricalValues': spatial_filter_name,
                 'columnChartColors': columnChartColors,
                 'config_file':config_file,
                 'tabularResultsJSON': tabularResultsJSON,
                 }

            if request.method == 'POST':
                return HttpResponse(json.dumps(context))
            else:
                return render(request, template+'.html', context)


        #Else condition handles a click in the table. Aspatial Query for detailed report/chart.
        else:

            ####################################### GET LIST OF FIELD NAMES FOR STATS ##########################################

            field_name_query="SELECT string_agg(column_name, ',') FROM information_schema.columns where table_name ='" + table + "' and (data_type = 'numeric' or data_type = 'double precision') and column_name not in (" + stats_field_exclusions + ");"

            print field_name_query
            cursor.execute(field_name_query);
            statsFieldsTuple=cursor.fetchone()
            statsFields = ",".join(statsFieldsTuple)

            ################################### BUILD SELECT LIST (FIELDS & TABLES) ########################################
            selectList="SELECT "

            #Area or line based selection, requiring Area Weighted Average
            for field in statsFields.split(','):
                    selectList+= "sum(" + field + " * shape_area)/sum(shape_area)" + " as " + field + "_" + "avg" + ","
            selectList+="count(*) as count "
            #Aggregates. Count, Unique CSV from categorical fields, Outline of selected features.
            if categoricalFields:
                selectList+=", string_agg(" + categoricalFields + ", ',') as categorical_values"
            #Sum of the area of selected features for area weighted average. Maybe report later.
            #selectList+="sum(shape_area) as sum_area, "
            selectList+=", ST_AsText(ST_SnapToGrid(ST_Force_2D(ST_Union(geom)), .0001)) as outline_of_selected_features, ST_AsText(ST_Centroid(st_union(geom))) as centroid"

            tableList=" FROM " + table

            selectFieldsFromTable = selectList + tableList

            ############################ "WHERE" (ADD ASPATIAL SEARCH CONDITIONS) ##########################################

            #queryField=request.GET.get('queryField')
            #operator=request.GET.get('operator').strip()
            #stringOrValue=request.GET.get('stringOrValue').lower().strip()

            stringOrValue='WKT'
            queryField='name'
            operator='='

            selectStatement=selectFieldsFromTable + " where " + queryField + " " + operator + " '" + WKT + "'"

            print selectStatement

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
                print "Error: No features selected"
                raise SystemExit(0)
                #return render(request, template+'.html')


            spatial_filter_shape=resultsDict['outline_of_selected_features']

            if categoricalFields:
                categoricalValues=[]
                categoricalValues.extend(resultsDict['categorical_values'].split(','))
                categoricalValues=list(set(categoricalValues))
                categoricalValues.sort()
            else:
                categoricalValues=[' ']

            #Remove these from the Dictionary before dumping to a JSON object (causing error & no need to send twice).
            resultsDict.pop('outline_of_selected_features',0)
            resultsDict.pop('categorical_values',0)

            count=int(resultsDict["count"])

            #Take fieldname,value pairs from the dict and dump to a JSON string.
            resultsJSON=json.dumps(resultsDict)
            #return HttpResponse(str(resultsDict.keys())+ str(resultsDict.values()))
            #return HttpResponse(resultsDict['tm_c4_2_avg'])
            print resultsJSON


            ##################################### SET ADDITIONAL VARIABLES #################################################


            resultsDict["intactness_avg"]=0
            resultsDict["hisensfz_avg"]=0
            resultsDict["eecefzt1_avg"]=0
            resultsDict["eecefzt2_avg"]=0
            resultsDict["eepifzt1_avg"]=0
            resultsDict["eepifzt2_avg"]=0

            columnChartColors=6*"#444444,"

            ########################################### RETURN RESULTS #####################################################

            try:
                centroid=resultsDict['centroid']
            except:
                centroid=0

            print centroid

            context={'initialize': 0,
                     'WKT_SelectedPolys': spatial_filter_shape,
                     'count': count,
                     'resultsJSON': resultsJSON,
                     'categoricalValues': categoricalValues,
                     'columnChartColors': columnChartColors,
                     'error': 0,
                     'config_file':config_file,
                     'centroid': centroid,
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
    #coords=re.findall("[+-]?\d+.\d+", userWKT)
    coords=re.findall("[-+]?\d+[\.]?\d*", userWKT)
    #print coords
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
    #pathname = 'http://thredds.nkn.uidaho.edu:8080/thredds/dodsC/NWCSC_INTEGRATED_SCENARIOS_ALL_CLIMATE/projections/nmme/bcsd_nmme_metdata_ENSMEAN_forecast_1monthAverage.nc'
    pathname = 'http://thredds.nkn.uidaho.edu:8080/thredds/dodsC/NWCSC_INTEGRATED_SCENARIOS_ALL_CLIMATE/projections/nmme/bcsd_nmme_metdata_ENSMEAN_forecast_3monthAverage.nc'
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
    #print rounded_precip_data

    context={
        'dates': dates,
        'tmax_data': rounded_tmax_data,
        'precip_data': rounded_precip_data
    }

    return HttpResponse(json.dumps(context))

@gzip_page
@csrf_exempt
#Needs to be added to urls.py
def generate_eems_tree(request):

    #from django.utils.translation import pgettext_lazy, pgettext, gettext as _
    from EEMSBasePackage import EEMSCmd, EEMSProgram

    eems_file_name=request.POST.get("eems_file_name")
    print eems_file_name
    top_node=request.POST.get("top_node")

    #eems_file_directory="static/config/eems"
    #On Webfaction. EEMSBasepackage doesn't have any knowledge of the static files dir, so need to explicityly type the path.
    eems_file_directory="/home/consbio/webapps/static_climate_console/config/eems"

    eems_file=eems_file_directory + "/command_files/" + eems_file_name
    eems_alias_file=eems_file_directory + "/aliases/" + eems_file_name.replace('eem','txt')

    dataset=''

    #Determine EEMS v1 or EEMS v2
    if os.path.isfile(eems_file):
        eems_file_handle= open(eems_file,"r")
        for line in eems_file_handle:
            if re.match(r'^[a-zA-Z0-9_ ]+:', line):
                eems_version=1
                #top_node=lastLine.split(':')[0]
                break

            elif re.match(r'^[a-zA-Z0-9_ ]+\(', line):
                eems_version=2
                break

        global eems_version

    aliases={}

    #Get Aliases
    if os.path.isfile(eems_alias_file):
        eems_alias_file_handle=open(eems_alias_file,"r")
        for line in eems_alias_file_handle:
           fieldname=line.split(":")[0]
           alias=line.split(":")[1].strip()
           #If the eems command file has an explicit layer order defined, Add it to the alias separated by a dash. The layer index is used to open the appropriate layer in Data Basin.
           try:
               line.split(":")[2]
               alias+=":" + line.split(":")[2].strip()
           except:
               pass
           if alias=='':
               alias=fieldname
           aliases[fieldname]=alias

        eems_alias_file_handle.close()

    #Alphabetical order. Perhaps use this as the basis for determining layer index
    #aliases=OrderedDict(sorted(aliases.items(), key=lambda t: t[0]))

    class EEMSFileParser(object):
        """
        EEMS File Parser is the base class for any of the parsers associated with EEMS files.
        """

        def __init__(self, uploaded_file, dataset_model):
            # Circular dependency with datasets
            #from databasin.datasets.models import DatasetAttribute

            self.uploaded_file = uploaded_file
            self.dataset_model = dataset_model
            self.dataset_attributes = ''
            #self.dataset_attributes = DatasetAttribute.objects.filter(
            #    dataset_id=self.dataset_model.dataset.id
            #)
            #self.attribute_map = dict(self.dataset_attributes.values_list('attribute', 'alias'))

        def get_model(self, validate=True):
            """
            Method for generating the JSON model used by the EEMS explorer. The format of this is an entry "nodes" that
            is a dictionary of the individual nodes within the model. Each node will be formatted as :

                "<attribute>" : {
                    "operation": "<Human readable operation name, ex. Convert to Fuzzy>",
                    "raw_operation": "<Machine readable operation name, ex. CVTTOFUZZY>",
                    "arguments": "[a list of strings that are more readable argument descriptions]",
                    "raw_arguments": "[a list of the arguments passed to the function]",
                    "children": "[a list of attributes that are children to this node]",
                    "is_fuzzy": <True if the operation has results that are fuzzy>,
                    "short_desc": "<An optional human readable short description of the operation>"
                }

            """
            raise NotImplementedError()

        def get_attribute_alias(self, attribute):
            return self.attribute_map[attribute] if attribute in self.attribute_map else attribute

        def validate_dataset(self, attributes_in_model):

            if self.dataset_model.dataset.mapservice.is_netcdf:
                # Validate against dataset layers
                layers_in_dataset = self.dataset_model.dataset.mapservice.datasetlayer_set.values_list('layer_id', flat=True)
                layers_not_in_dataset = [layer for layer in attributes_in_model if layer not in layers_in_dataset]

                if layers_not_in_dataset:
                    raise ValueError(
                        _('The following layers appear in the file but are not in the dataset: {0}').format(
                            ', '.join(layers_not_in_dataset)
                        )
                    )

            else:
                # Validate against dataset attributes
                attributes_in_dataset = self.dataset_attributes.values_list('attribute', flat=True)
                attributes_not_in_dataset = [att for att in attributes_in_model if att not in attributes_in_dataset]

                if attributes_not_in_dataset:
                    raise ValueError(
                        _('The following attributes appear in the file but are not in the dataset: {0}').format(
                            ', '.join(attributes_not_in_dataset)
                        )
                    )


    class EEMSOneFileParser(EEMSFileParser):
        """
        Parser for EEMS 1.0 style files. These files look like this:

        ACEIII_Sensitive_Habitat_Index:READ
        ACEIII_Rarity_Weighted_Richness_Index:READ
        ACEIII_Biological_Index:READ
        High_Conservation_Elements:UNION:ACEIII_Sensitive_Habitat_Index,ACEIII_Rarity_Weighted_Richness_Index,ACEIII_Biological_Index
        Fuzzy_High_Conservation_Elements:CVTTOFUZZY:High_Conservation_Elements:0,0.5

        """

        operation_map = {
            'READ': 'Read',
            'AND': 'And',
            'CVTTOFUZZY': 'Convert to Fuzzy',
            'CVTTOFUZZYCURVE': 'Convert to Fuzzy Curve',
            'COPYFIELD':  'Copy Field',
            'DIF':  'Difference',
            'MAX':  'Max',
            'MEAN':  'Mean',
            'MIN':  'Min',
            'NOT':  'Not',
            'OR':  'Or',
            'ORNEG':  'Negative Or',
            'SELECTEDUNION':  'Selected Union',
            'SUM':  'Sum',
            'UNION':  'Union',
            'WTDAND':  'Weighted And',
            'WTDMEAN':  'Weighted Mean',
            'WTDSUM':  'Weighted Sum',
            'WTDUNION':  'Weighted Union',
            'XOR':  'XOr',
        }

        fuzzy_operations = [
            'AND', 'CVTTOFUZZY', 'CVTTOFUZZYCURVE', 'NOT', 'OR', 'ORNEG', 'SELECTEDUNION',
            'UNION', 'WTDAND', 'WTDMEAN', 'WTDUNION', 'XOR'
        ]

        def get_model(self, validate=True):
            # This makes the JSON
            command_model = {'nodes': {}}

            self.uploaded_file.seek(0)
            for line in self.uploaded_file:
                command = line.strip()
                split_command = command.split(':')
                command_entry = {
                    'raw_operation': split_command[1],
                    'operation': split_command[1],
                    #'is_fuzzy': split_command[1] in self.fuzzy_operations,
                }
                if split_command[1] in self.operation_map:
                    #command_entry['operation'] = unicode(self.operation_map[split_command[1]])
                    command_entry['operation'] = self.operation_map[split_command[1]]

                if len(split_command) > 2:
                    command_entry['children'] = split_command[2].split(',')

                if len(split_command) > 3:
                    command_entry['raw_arguments'] = split_command[3].split(',')

                command_model[ split_command[0]] = command_entry

            if validate:
               #self.validate_dataset(command_model['nodes'])
                pass

            # Do this after we validate attributes, since it makes use of attribute Aliases
            for node_key in command_model['nodes']:
                single_node = command_model['nodes'][node_key]
                if 'raw_arguments' in single_node:
                    single_node['arguments'] = self.parse_arguments(
                        single_node['raw_operation'], single_node['raw_arguments'], single_node['children']
                    )

            return command_model

        def parse_arguments(self, operation, arguments, children):
            if operation == 'CVTTOFUZZY':
                return [
                    '{0}: {1}'.format(('False Threshold'), arguments[0]),
                    '{0}: {1}'.format(('True Threshold'), arguments[1])
                ]
            elif operation == 'SELECTEDUNION':
                return [
                    '{0} {1} {2}'.format(
                        ('Union of sets', 'Union of the'),
                        arguments[1],
                        ('most false', 'falsest values') if arguments[0] == -1 else ('truest values')
                    )
                ]
            elif len(arguments) == len(children):
                weight_list = []
                for index, argument in enumerate(arguments):
                    weight_list.append(('{0} weight: {1}').format(
                        self.get_attribute_alias(children[index]),
                        arguments[index]
                    ))
                return weight_list
            elif len(children) == 1:
                return [
                    '{0}: {1}'.format(self.get_attribute_alias(children[0]), ','.join(arguments))
                ]
            else:
                return [','.join(arguments)]


    class EEMSTwoFileParser(EEMSFileParser):
        """
        EEMS Parser for EEMS 2.0 style files. These files look like this:

        # Barren
        READ(
            InFileName = /Users/timsheehan/Projects/BLMUtahCOP/EEMSModels/SensitivityModel/6.0/BLMUtahSiteSensitivity.csv,
            InFieldName = IsNotBarrenFz,
            OutFileName = /Users/timsheehan/Projects/BLMUtahCOP/EEMSModels/PotentialImpactModel/2.0/CCSM4/1530/BLMUtahPotentialImpacts.csv
            )

        HighCalculatedPotentialImpactFz = UNION(
            InFieldNames = [
                HighClimateExposureFz,
                HighPotentialSiteSensitivityFz
                ],
            OutFileName = /Users/timsheehan/Projects/BLMUtahCOP/EEMSModels/PotentialImpactModel/2.0/CCSM4/1530/BLMUtahPotentialImpacts.csv
            )

        HiPotImpactFz = AND(
            InFieldNames = [
                IsNotBarrenFz,
                HighCalculatedPotentialImpactFz
                ],
            OutFileName = /Users/timsheehan/Projects/BLMUtahCOP/EEMSModels/PotentialImpactModel/2.0/CCSM4/1530/BLMUtahPotentialImpacts.csv
            )
        """

        def get_model(self, validate=True):
            command_model = {'nodes': {}}

            program = EEMSProgram(self.uploaded_file)
            for eems_command in program.orderedCmds:
                command_name = eems_command.GetCommandName()

                if eems_command.IsReadCmd():
                    if eems_command.HasParam('NewFieldName'):
                        attribute_name = eems_command.GetParam('NewFieldName')
                    else:
                        attribute_name = eems_command.GetParam('InFieldName')
                else:
                    attribute_name = eems_command.GetResultName()

                # Skip CSVIndex Commands. These are special commands used by EEMS, but not shown in the model.
                if attribute_name == 'CSVIndex':
                    continue

                command_entry = {
                    'raw_operation': command_name,
                    'operation': eems_command.GetReadableNm(),
                    #'is_fuzzy': eems_command.GetRtrnType() == 'Fuzzy',
                    'short_desc': eems_command.GetShortDesc()
                }

                # The CallExtern command's return type is not known by default. It is determined by what is being run
                # externally. Need to get the fuzzy property based on its ResultType parameter.
                if command_name == 'CALLEXTERN':
                    command_entry['is_fuzzy'] = eems_command.GetParam('ResultType').lower() == 'fuzzy'

                if not eems_command.IsReadCmd():
                    if 'InFieldNames' in eems_command.GetRequiredParamNames():
                        command_entry['children'] = eems_command.GetParam('InFieldNames')
                    else:
                        command_entry['children'] = [eems_command.GetParam('InFieldName')]

                command_entry['arguments'] = []
                for param_name in eems_command.GetParamNames():
                    if param_name not in ['InFileName', 'OutFileName', 'InFieldNames', 'InFieldName']:
                        param_value = eems_command.GetParam(param_name)
                        if type(param_value) is list:
                            param_str = ', '.join(str(x) for x in param_value)
                        else:
                            param_str = str(param_value)
                        command_entry['arguments'].append('{0}: {1}'.format(param_name, param_str))
                if len(command_entry['arguments']) == 0:
                    command_entry.pop('arguments', None)

                command_model['nodes'][attribute_name] = command_entry

            if validate:
                #self.validate_dataset(command_model['nodes'])
                pass

            return command_model

    #for attr in (a for a in dir(eems_one_file_parser) if not a.startswith('_')):
    #    print attr

    #Get Original JSON from Mike's Parser
    if eems_version == 1:

        eems_file_parser=EEMSOneFileParser(eems_file_handle,dataset)
        JSON=eems_file_parser.get_model()

    elif eems_version == 2:

        eems_file_parser=EEMSTwoFileParser(eems_file,dataset)
        JSON=eems_file_parser.get_model()
        #get rid of "Nodes"
        for k,v in JSON.iteritems():
            JSON=v

    #Create new restructured JSON (JSON2) compatible with JIT, separate innto data key and children key
    JSON2={}

    for key,value in JSON.iteritems():
        JSON2[key]={}
        JSON2[key]['data']={}
        for sub_key,value in value.iteritems():
            if sub_key == 'children':
                JSON2[key][sub_key]=value
            else:
                JSON2[key]['data'].update(JSON[key])

        if JSON2[key].has_key('children'):
            JSON2[key]['data'].pop('children')

    if eems_version == 1:
        JSON2.pop('nodes')

    #for making the aliases file
    SortedJSON2=OrderedDict(sorted(JSON2.items(), key=lambda t: t[0]))
    count=0
    for k,v in SortedJSON2.iteritems():
        print k + ":" + k+":"+str(count)
        count+=1

    #Expand the pointers to children for each key
    #each variable become it's own key containing a completed dictinonary of all its children
    def expandChildren(JSON2):
        for k, v in JSON2.iteritems():
            JSON2[k]['name']=k
            JSON2[k]['id']=k
            child_list=[]
            if isinstance(v, dict) and JSON2[k].has_key('children'):
              for child in JSON2[k]['children']:
                  child_list.append(child)
              JSON2[k].pop('children')
              JSON2[k]['children']=[]
              JSON2[k]['children'].append({})
              for child in child_list:
                  JSON2[k]['children'][0][child]=JSON2[child]
            else:
              pass
        return JSON2

    #Print the JSON Tree
    def createFinalJSONString(d):
        global eems_tree
        eems_tree+='"id": ' + "'" + d['id'] + "',"
        if d['name'] in aliases:
           alias=aliases[d['name']]
        else:
           alias = d['name']
        eems_tree+='"name": ' + "'" + alias + "',"
        eems_tree+='"data": '
        eems_tree+=json.dumps(d['data'])
        eems_tree+=(",")
        if d.has_key('children'):
            eems_tree+='"children": ['
            for k,v in d['children'][0].iteritems():
                eems_tree+="{"
                createFinalJSONString(v)
            eems_tree+="]},"
        else:
            eems_tree+="},"

    expandedJSON=expandChildren(JSON2)

    global eems_tree
    eems_tree = '{'

    createFinalJSONString(expandedJSON[top_node])
    #print json.dumps(JSON2, indent=4, sort_keys=True)

    eems_tree_dict=ast.literal_eval(eems_tree.rstrip(","))

    eems_file_handle.close()

    # To write json tree to file
    #eems_json_file=open("F:/Projects2/EEMS_Online/json_models/" + top_node +".json",'w')
    #eems_json_file.write(json.dumps(eems_tree_dict, indent=4, sort_keys=True))
    #eems_json_file.close()

    context={
        'eems_tree_dict': eems_tree_dict,
        'top_node': top_node
    }

    return HttpResponse(json.dumps(context))

def get_ecosystem_services_data(WKT):

    #VTYPE
    cursor = connection.cursor()
    vtype_tables=['ca_reporting_units_huc5_watersheds_es_decadal_vtype_ccsm4','ca_reporting_units_huc5_watersheds_es_decadal_vtype_cnrm','ca_reporting_units_huc5_watersheds_es_decadal_vtype_canesm2','ca_reporting_units_huc5_watersheds_es_decadal_vtype_hadgem2es']
    field_exclusions="'objectid','shape_leng','shape_area','id_for_zon','ID_For_Zonal_Stats_JOIN','name'"
    resultsDictMultiTable={}
    resultsDictMultiTable["vegetation_composition"]={}
    for vtype_table in vtype_tables:
        field_name_query="SELECT string_agg(column_name, ',') FROM information_schema.columns where table_name ='" + vtype_table + "' and (data_type = 'text' or data_type = 'character varying')  and column_name not in (" + field_exclusions + ");"
        cursor.execute(field_name_query)
        statsFieldsTuple=cursor.fetchone()
        statsFields = ",".join(statsFieldsTuple)
        cursor = connection.cursor()
        selectList="SELECT "
        for field in statsFields.split(','):
            selectList+=field + " as " + field +", "
        #Extra comma
        selectList=selectList.rstrip(', ')
        vtype_tableList=" FROM " + vtype_table
        selectFieldsFromTable = selectList + vtype_tableList
        selectStatement=selectFieldsFromTable + " where ST_Intersects('"+ WKT + "', " + vtype_table + ".geom)"
        print selectStatement
        cursor.execute(selectStatement)
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
            print "Error: No features selected"
            raise SystemExit(0)

        resultsDictMultiTable["vegetation_composition"][vtype_table]=resultsDict

    #Continuous7
    continuous7_tables=['ca_reporting_units_huc5_watersheds_es_decadal_ccsm4','ca_reporting_units_huc5_watersheds_es_decadal_cnrm','ca_reporting_units_huc5_watersheds_es_decadal_canesm2','ca_reporting_units_huc5_watersheds_es_decadal_hadgem2es' ]
    field_exclusions="'objectid','shape_leng','shape_area','id_for_zon','ID_For_Zonal_Stats_JOIN','name'"
    resultsDictMultiTable["continuous7"]={}
    for continuous7_table in continuous7_tables:
        field_name_query="SELECT string_agg(column_name, ',') FROM information_schema.columns where table_name ='" + continuous7_table + "' and (data_type = 'text' or data_type = 'character varying')  and column_name not in (" + field_exclusions + ");"
        cursor.execute(field_name_query)
        statsFieldsTuple=cursor.fetchone()
        statsFields = ",".join(statsFieldsTuple)
        cursor = connection.cursor()
        selectList="SELECT "
        for field in statsFields.split(','):
            selectList+=field + " as " + field +", "
        #Extra comma
        selectList=selectList.rstrip(', ')
        continuous7_tableList=" FROM " + continuous7_table
        selectFieldsFromTable = selectList + continuous7_tableList
        selectStatement=selectFieldsFromTable + " where ST_Intersects('"+ WKT + "', " + continuous7_table + ".geom)"
        print selectStatement
        cursor.execute(selectStatement)
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
            print "Error: No features selected"
            raise SystemExit(0)

        resultsDictMultiTable["continuous7"][continuous7_table]=resultsDict

    #Take fieldname,value pairs from the dict and dump to a JSON string.
    veg_composition_data=json.dumps(resultsDictMultiTable)

    return veg_composition_data

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

