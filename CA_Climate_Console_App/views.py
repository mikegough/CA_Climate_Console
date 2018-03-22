from django.http import HttpResponse
import re
from django.conf import settings

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

from django.views.decorators.csrf import csrf_exempt

import glob
from rasterstats import zonal_stats
from rasterstats import point_query
from osgeo import ogr
from osgeo import osr

import rasterio
from rasterio import mask
import geojson
import shapely.wkt
from django.utils.crypto import get_random_string
import csv

@gzip_page
@csrf_exempt
def index(request):
    print ("index")
    domain = request.get_host()
    if 'climatedashboard.org' in domain:
        return view2(request)
    else:
        return view1(request)

def view1(request):
    studyarea = request.resolver_match.url_name
    template = request.GET.get('template', 'template1')

    #################### REQUEST TYPE (POST through App OR (GET Through external OR initialize) ########################

    if request.method == 'POST':
        WKT = request.POST.get('wktPOST')
        table = request.POST.get('reporting_units')
        categoricalFields = request.POST.get('name_field')
        ecosystem_services_continuous_tables = request.POST.getlist('ecosystem_services_continuous_tables[]')
        ecosystem_services_vtype_tables = request.POST.getlist('ecosystem_services_vtype_tables[]')

    else:
        WKT = request.GET.get('user_wkt')
        table = request.GET.get('reporting_units')
        categoricalFields = request.GET.get('name_field')
        #Near-term weather forecast data retrieved from NOAA through Cronjob.

    ############################################# INPUT PARAMETERS #####################################################

    print table

    stats_field_exclusions = "'id_for_zon', 'objectid', 'shape_leng', 'shape_area'"

    if studyarea == 'drecp':

        if table == None:
            table = "drecp_reporting_units_county_boundaries_no_simplify"
            categoricalFields = "name_pcase"

        template = 'drecp'
        config_file = "config_drecp.js"

    elif studyarea == 'ca':

        if table == None:
            table = "ca_reporting_units_county_boundaries_5_simplify"
            categoricalFields = "name"

        template = 'ca'
        config_file = "config_ca.js"

    elif studyarea == 'ca2':

        if table == None:
            table = "ca_reporting_units_county_boundaries_5_simplify"
            categoricalFields = "name"

        template = 'ca2'
        config_file = "config_ca.js"

    elif studyarea == 'multi-lcc':

        if table == None:
            table = "multi_lcc_reporting_units_llc_boundaries_1_simplify"
            categoricalFields = "name"

        template = 'multi-lcc'
        config_file = "config_multi-lcc.js"

    elif studyarea == 'sagebrush':

        if table == None:
            table = "ca_reporting_units_county_boundaries_5_simplify"
            categoricalFields = "name"

        template = 'sagebrush'
        config_file = "config_sagebrush.js"

    elif studyarea == 'utah':

        if table == None:
            table = "utah_cop_reporting_units_blm_admin_units_1_5_simplify"
            categoricalFields = "name"

        template = 'utah'
        config_file = "config_utah.js"

    elif studyarea == 'conus':

        if table == None:
            table = "ca_reporting_units_county_boundaries_5_simplify"
            categoricalFields = "name"

        template = 'conus'
        config_file = "config_conus.js"

    elif studyarea == 'dev':

        if table == None:
            table = "ca_reporting_units_county_boundaries_5_simplify"
            categoricalFields = "name"

        template = 'ca_dev'
        config_file = "config_ca.js"

    ####################################### GET LIST OF FIELD NAMES FOR STATS ##########################################

    cursor = connection.cursor()
    field_name_query = "SELECT string_agg(column_name, ',') FROM information_schema.columns where table_name ='" + table + "' and (data_type = 'numeric' or data_type = 'double precision') and column_name not in (" + stats_field_exclusions + ");"
    cursor.execute(field_name_query);
    statsFieldsTuple = cursor.fetchone()
    statsFields = ",".join(statsFieldsTuple)

    ########################################### INITIALIZATION RESPONSE ################################################
    if not WKT:
        context = {
            'initialize': 1,
            'config_file': config_file,
            'count': 0
        }
        return render(request, template+'.html', context)

    #################################### OR DATABASE QUERY (SELECT FEATURES) ###########################################
    ############################################ BUILD SQL EXPRESSION ##################################################
    else:

        ################################### BUILD SELECT LIST (FIELDS & TABLES) ########################################
        selectList = "SELECT "

        if ('POINT' in WKT):
            #Point selection. No Area Weighted Average in the query. Performance gains are minimal even with 900 fields.
            for field in statsFields.split(','):
                selectList += field + " as " + field + "_" + "avg, "
            if categoricalFields:
                selectList += categoricalFields + " as categorical_values, "
            selectList += " 1 as count, "
            selectList += "ST_AsText(ST_SnapToGrid(ST_Force_2D(geom), .0001)) as outline_of_selected_features"

        else:
            #Area or line based selection, requiring Area Weighted Average
            for field in statsFields.split(','):
                    selectList += "sum(" + field + " * shape_area)/sum(shape_area)" + " as " + field + "_" + "avg" + ","
            selectList += "count(*) as count "
            #Aggregates. Count, Unique CSV from categorical fields, Outline of selected features.
            if categoricalFields:
                selectList += ", string_agg(" + categoricalFields + ", ',') as categorical_values"
            #Sum of the area of selected features for area weighted average. Maybe report later.
            #selectList += "sum(shape_area) as sum_area, "
            selectList += ", ST_AsText(ST_SnapToGrid(ST_Force_2D(ST_Union(geom)), .0001)) as outline_of_selected_features"

        tableList = " FROM " + table

        selectFieldsFromTable = selectList + tableList

        ############################ "WHERE" (ADD ASPATIAL SEARCH CONDITIONS) ##########################################
        if WKT == 'aspatial':

            queryField = request.GET.get('queryField')
            operator = request.GET.get('operator').strip()
            stringOrValue = request.GET.get('stringOrValue').lower().strip()

            if operator == "LIKE":
                selectStatement = selectFieldsFromTable + " where LOWER(" + queryField + ") " + operator + "%s"
            elif operator == ">" or operator == "<":
                selectStatement = selectFieldsFromTable + " where " + queryField + operator + stringOrValue
            else:
                selectStatement = selectFieldsFromTable + " where LOWER(" + queryField + ") " + operator + " '" + \
                                stringOrValue + "'"

        ########################## or "WHERE" (ADD SPATIAL SEARCH CONDITIONS) ##########################################
        else:

            WKT = WKT.replace('%', ' ')
            WKT = "SRID=4326;"+WKT

            operator = None
            selectStatement = selectFieldsFromTable + " where ST_Intersects('" + WKT + "', " + table + ".geom)"

        ######################################## EXECUTE DATABASE QUERY ################################################

        if operator == "LIKE":
            cursor.execute(selectStatement, ['%' + stringOrValue + '%'])
        else:
            cursor.execute(selectStatement)

        ################################# STORE COLUMN, VALUE PAIRS IN A DICT ##########################################

        resultsDict = {}

        #Get field names
        columns = [colName[0] for colName in cursor.description]

        try:
            for row in cursor:
                for i in range(len(row)):
                    if isinstance(row[i], basestring):
                        resultsDict[columns[i]] = row[i].strip()
                    else:
                        resultsDict[columns[i]] = (float(round(row[i], 2)))
        except:
            print "Error: No features selected"
            raise SystemExit(0)
            #return render(request, template+'.html')

        WKT_SelectedPolys = resultsDict['outline_of_selected_features']

        if categoricalFields:
            categoricalValues = []
            categoricalValues.extend(resultsDict['categorical_values'].split(','))
            categoricalValues = list(set(categoricalValues))
            categoricalValues.sort()
        else:
            categoricalValues = [' ']

        #Remove these from the Dictionary before dumping to a JSON object (causing error & no need to send twice).
        resultsDict.pop('outline_of_selected_features', 0)
        resultsDict.pop('categorical_values', 0)

        count = int(resultsDict["count"])

        #Take fieldname,value pairs from the dict and dump to a JSON string.
        resultsJSON = json.dumps(resultsDict)
        #return HttpResponse(str(resultsDict.keys())+ str(resultsDict.values()))
        #return HttpResponse(resultsDict['tm_c4_2_avg'])

        ##################################### SET ADDITIONAL VARIABLES #################################################

        #BAR COLORS
        if studyarea == 'sagebrush':

            columnChartColor1 = getColor(resultsDict["hisensfz_avg"], "ClimateEEMS")
            columnChartColor2 = getColor(resultsDict["eecefzt1_avg"], "ClimateEEMS")
            columnChartColor3 = getColor(resultsDict["eecefzt2_avg"], "ClimateEEMS")
            columnChartColor4 = getColor(resultsDict["eepifzt1_avg"], "ClimateEEMS")
            columnChartColor5 = getColor(resultsDict["eepifzt2_avg"], "ClimateEEMS")
            columnChartColor6 = getColor(resultsDict["theobald_i_avg"], "theobald")

            columnChartColors = columnChartColor1+","+columnChartColor2+","+columnChartColor3+","+columnChartColor4+","+columnChartColor5+","+columnChartColor6

        elif studyarea == 'drecp':

            columnChartColor1 = getColor(resultsDict["intactness_avg"], "TI")
            columnChartColor2 = getColor(resultsDict["hisensfz_avg"], "ClimateEEMS")
            columnChartColor3 = getColor(resultsDict["eecefzt1_avg"], "ClimateEEMS")
            columnChartColor4 = getColor(resultsDict["eecefzt2_avg"], "ClimateEEMS")
            columnChartColor5 = getColor(resultsDict["eepifzt1_avg"], "ClimateEEMS")
            columnChartColor6 = getColor(resultsDict["eepifzt2_avg"], "ClimateEEMS")

            columnChartColors = columnChartColor1+","+columnChartColor2+","+columnChartColor3+","+columnChartColor4+","+columnChartColor5+","+columnChartColor6

        elif studyarea == 'utah':

            columnChartColor1 = getColor(resultsDict["ti_union_avg"], "TI")
            columnChartColor2 = getColor(resultsDict["ai_100m_avg"], "TI")
            columnChartColor3 = getColor(resultsDict["hisensfz_avg"], "ClimateEEMS")
            columnChartColor4 = getColor(resultsDict["eeccfz1530_avg"], "ClimateEEMS")
            columnChartColor5 = getColor(resultsDict["eeccfz4560_avg"], "ClimateEEMS")
            columnChartColor6 = getColor(resultsDict["eepifz1530_avg"], "ClimateEEMS")
            columnChartColor7 = getColor(resultsDict["eepifz4560_avg"], "ClimateEEMS")

            columnChartColors = columnChartColor1+","+columnChartColor2+","+columnChartColor3+","+columnChartColor4+","+columnChartColor5+","+columnChartColor6

        elif studyarea == 'ca2':

            #columnChartColor1 = getColor(resultsDict["intactness_avg"], "TI")
            columnChartColor1 = getColor(resultsDict["hisensfz270_avg"], "ClimateEEMS")
            columnChartColor2 = getColor(resultsDict["eecefzt1_avg"], "ClimateEEMS")
            columnChartColor3 = getColor(resultsDict["eecefzt2_avg"], "ClimateEEMS")
            #columnChartColor4 = getColor(resultsDict["eepifzt1_avg"], "ClimateEEMS")
            #columnChartColor5 = getColor(resultsDict["eepifzt2_avg"], "ClimateEEMS")
            # Took out potential impacts, so TI is Color4
            columnChartColor4 = getColor(resultsDict["intactness_avg"], "TI")
            columnChartColor5 = ""
            columnChartColor6 = ""

            columnChartColors = columnChartColor1+","+columnChartColor2+","+columnChartColor3+","+columnChartColor4+","+columnChartColor5+","+columnChartColor6

        else:

            #if table == "ca_reporting_units_1km_poly":
            #    resultsDict["intactness_avg"] = 0
            #    resultsDict["hisensfz_avg"] = 0
            #    resultsDict["eecefzt1_avg"] = 0
            #    resultsDict["eecefzt2_avg"] = 0
            #    resultsDict["eepifzt1_avg"] = 0
            #    resultsDict["eepifzt2_avg"] = 0

            #    columnChartColors = 6*"#444444,"


            if table == "ca_reporting_units_1km_poly_join_eems":
                resultsDict["intactness_avg"] = 0

            #columnChartColor1 = getColor(resultsDict["intactness_avg"], "TI")
            columnChartColor1 = getColor(resultsDict["hisensfz_avg"], "ClimateEEMS")
            columnChartColor2 = getColor(resultsDict["eecefzt1_avg"], "ClimateEEMS")
            columnChartColor3 = getColor(resultsDict["eecefzt2_avg"], "ClimateEEMS")
            #columnChartColor4 = getColor(resultsDict["eepifzt1_avg"], "ClimateEEMS")
            #columnChartColor5 = getColor(resultsDict["eepifzt2_avg"], "ClimateEEMS")
            # Took out potential impacts, so TI is Color4
            columnChartColor4 = getColor(resultsDict["intactness_avg"], "TI")
            columnChartColor5 = ""
            columnChartColor6 = ""

            columnChartColors = columnChartColor1+","+columnChartColor2+","+columnChartColor3+","+columnChartColor4+","+columnChartColor5+","+columnChartColor6


        if ecosystem_services_vtype_tables != "":
            ecosystem_services_data = get_ecosystem_services_data(WKT,ecosystem_services_continuous_tables, ecosystem_services_vtype_tables, "spatial")
        else:
            ecosystem_services_data = ''

        ########################################### RETURN RESULTS #####################################################

        context = {
            'initialize': 0,
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
    #multi-lcc view
    WKT = request.POST.get('wktPOST')
    table = request.POST.get('reporting_units')
    categoricalFields = request.POST.get('name_field')
    ecosystem_services_continuous_tables = request.POST.getlist('ecosystem_services_continuous_tables[]')
    ecosystem_services_vtype_tables = request.POST.getlist('ecosystem_services_vtype_tables[]')

    ############################################# INPUT PARAMETERS #####################################################

    stats_field_exclusions = "'id_for_zon', 'objectid', 'shape_leng', 'shape_area'"

    if table == None:
        table = "multi_lcc_query_layer_protected_areas_soils_90_simplify_v2" #CHANGE IN DASHBOARD.JS TOO!!!!
        categoricalFields = "name,ru_type"

    template = 'multi-lcc'
    config_file = "config_multi-lcc.js"

    ########################################### INITIALIZATION RESPONSE ################################################
    if not WKT:
        context = {
            'initialize': 1,
            'config_file': config_file,
            'count': 0
        }
        return render(request, template+'.html', context)

    #################################### OR DATABASE QUERY (SELECT FEATURES) ###########################################
    ############################################ BUILD SQL EXPRESSION ##################################################
    else:
        cursor = connection.cursor()

        #First condition handles a Map Click. Select LCC Boundary & get all protected areas within it.
        if "POINT" in WKT or "POLYGON" in WKT or "LINESTRING" in WKT:
            print "yes"

            table = "multi_lcc_query_layer_protected_areas_soils_90_simplify_v2"

            WKT = WKT.replace('%', ' ')
            WKT = "SRID=4326;"+WKT

            spatial_filter_layer = 'multi_lcc_reporting_units_llc_boundaries_1_simplify'
            query_layer = "multi_lcc_query_layer_protected_areas_soils_90_simplify_v2" #CHANGE IN DASHBOARD.JS TOO!!!!!
            print query_layer

            if "POINT" in WKT:
                #Get geometery of LCC Boundary
                spatial_filter_shape_query = "SELECT ST_AsText(ST_SnapToGrid(ST_Force_2D(ST_Union(geom)), .0001)) from " + spatial_filter_layer + " where ST_Intersects('"+ WKT + "', " + spatial_filter_layer + ".geom)"
                cursor.execute(spatial_filter_shape_query)
                spatial_filter_shape = cursor.fetchone()[0]

                #Get name. Should do in query above.
                spatial_filter_name = "SELECT name from " + spatial_filter_layer + " where ST_Intersects('"+ WKT + "', " + spatial_filter_layer + ".geom)"
                cursor.execute(spatial_filter_name)
                spatial_filter_name = cursor.fetchone()[0]

                #Sub query to get the clicked shape used to be the spatial fitler
                spatial_filter_shape_sub_query = "(SELECT geom from " + spatial_filter_layer + " where ST_Intersects('"+ WKT + "', " + spatial_filter_layer + ".geom))"

            else: #POLYGON or LINESTRING
                spatial_filter_shape_sub_query = "'"+ WKT + "'"
                spatial_filter_shape = WKT
                spatial_filter_name = "User Defined Area"

            #Get all protected areas within LCC boundary
            tabular_query = "SELECT distinct a.name, a.ru_type, a.eetmads0t1, a.eetmids0t1, a.eepreds0t1, a.eetmads0t2, a.eetmids0t2, a.eepreds0t2, a.gis_acres from " + query_layer + " as a, " + spatial_filter_layer + " as b where ST_Intersects(a.geom, " + spatial_filter_shape_sub_query + ")"

            cursor.execute(tabular_query)

            #Get all selected protected area data into an array
            tabular_data = {}

            for row in cursor:
                feature_name = row[0]
                data = []
                ru_type = row[1]
                tmax_delta_t1 = float(row[2])
                tmin_delta_t1 = float(row[3])
                prec_delta_t1 = float(row[4])
                tmax_delta_t2 = float(row[5])
                tmin_delta_t2 = float(row[6])
                prec_delta_t2 = float(row[7])
                gis_acres = round(row[8],0)
                data.extend([ru_type, tmax_delta_t1, tmin_delta_t1, prec_delta_t1, tmax_delta_t2, tmin_delta_t2, prec_delta_t2, gis_acres])

                tabular_data[feature_name] = data

            tabularResultsJSON = json.dumps(tabular_data)

            #If empty, resultsJSON is null and response is unsuccessfull, thus triggering the "No Features Selected" error.
            if tabular_data:
                #Required in the front end.
                resultsJSON = json.dumps({})

            columnChartColors = ''

            context = {
                'initialize': 0,
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

            field_name_query = "SELECT string_agg(column_name, ',') FROM information_schema.columns where table_name ='" + table + "' and (data_type = 'numeric' or data_type = 'double precision') and column_name not in (" + stats_field_exclusions + ");"

            #print field_name_query
            cursor.execute(field_name_query);
            statsFieldsTuple = cursor.fetchone()
            statsFields = ",".join(statsFieldsTuple)

            ################################### BUILD SELECT LIST (FIELDS & TABLES) ########################################
            selectList = "SELECT "

            #Area or line based selection, requiring Area Weighted Average
            for field in statsFields.split(','):
                    selectList += "sum(" + field + " * shape_area)/sum(shape_area)" + " as " + field + "_" + "avg" + ","
            selectList += "count(*) as count "
            #Aggregates. Count, Unique CSV from categorical fields, Outline of selected features.
            if categoricalFields:
                selectList += ", string_agg(" + categoricalFields + ", ',') as categorical_values"
            #Sum of the area of selected features for area weighted average. Maybe report later.
            #selectList += "sum(shape_area) as sum_area, "
            selectList += ", ST_AsText(ST_SnapToGrid(ST_Force_2D(ST_Union(geom)), .0001)) as outline_of_selected_features, ST_AsText(ST_Centroid(st_union(geom))) as centroid"

            tableList = " FROM " + table

            selectFieldsFromTable = selectList + tableList

            ############################ "WHERE" (ADD ASPATIAL SEARCH CONDITIONS) ##########################################

            #queryField = request.GET.get('queryField')
            #operator = request.GET.get('operator').strip()
            #stringOrValue = request.GET.get('stringOrValue').lower().strip()

            stringOrValue = 'WKT'
            queryField = 'name'
            operator = '='

            #WKT here is the protected area name.
            selectStatement = selectFieldsFromTable + " where " + queryField + " " + operator + " '" + WKT + "'"

            #print selectStatement

            ######################################## EXECUTE DATABASE QUERY ################################################

            if operator == "LIKE":
                cursor.execute(selectStatement,['%' + stringOrValue + '%'] )
            else:
                cursor.execute(selectStatement)

            ################################# STORE COLUMN, VALUE PAIRS IN A DICT ##########################################

            resultsDict = {}

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


            spatial_filter_shape = resultsDict['outline_of_selected_features']

            if categoricalFields:
                categoricalValues = []
                categoricalValues.extend(resultsDict['categorical_values'].split(','))
                categoricalValues = list(set(categoricalValues))
                categoricalValues.sort()
            else:
                categoricalValues = [' ']

            #Remove these from the Dictionary before dumping to a JSON object (causing error & no need to send twice).
            resultsDict.pop('outline_of_selected_features', 0)
            resultsDict.pop('categorical_values', 0)

            count = int(resultsDict["count"])

            #Take fieldname,value pairs from the dict and dump to a JSON string.
            resultsJSON = json.dumps(resultsDict)
            #return HttpResponse(str(resultsDict.keys())+ str(resultsDict.values()))
            #return HttpResponse(resultsDict['tm_c4_2_avg'])
            print resultsJSON


            ##################################### SET ADDITIONAL VARIABLES #################################################

            resultsDict["intactness_avg"] = 0
            resultsDict["hisensfz_avg"] = 0
            resultsDict["eecefzt1_avg"] = 0
            resultsDict["eecefzt2_avg"] = 0
            resultsDict["eepifzt1_avg"] = 0
            resultsDict["eepifzt2_avg"] = 0

            columnChartColors = 6*"#444444,"

            ########################################### RETURN RESULTS #####################################################

            try:
                centroid = "SRID=4326;" + resultsDict['centroid']
            except:
                centroid = 0

            if ecosystem_services_vtype_tables != "":
                ecosystem_services_data = get_ecosystem_services_data(WKT,ecosystem_services_continuous_tables, ecosystem_services_vtype_tables, 'aspatial')
            else:
                ecosystem_services_data = ''

            context = {
                'initialize': 0,
                'WKT_SelectedPolys': spatial_filter_shape,
                'count': count,
                'resultsJSON': resultsJSON,
                'categoricalValues': categoricalValues,
                'columnChartColors': columnChartColors,
                'error': 0,
                'config_file':config_file,
                'centroid': centroid,
                'ecosystem_services_data':ecosystem_services_data
            }

        if request.method == 'POST':
            return HttpResponse(json.dumps(context))
        else:
            return render(request, template+'.html', context)

@gzip_page
@csrf_exempt
# Used by the CONUS console
def view3(request):

    studyarea = request.resolver_match.url_name

    if studyarea == 'conus':
        template = 'conus.html'
        config_file = "config_conus.js"

    if request.method == 'GET':
        context = {
            'initialize': 1,
            'config_file': config_file,
            'count': 0
        }
        return render(request, template, context)

    else:

        user_wkt = request.POST.get('wktPOST')
        WKT = "SRID=4326;" + user_wkt.replace('%', ' ')
        ru_table = request.POST.get('reporting_units')
        ecosystem_services_continuous_tables = request.POST.getlist('ecosystem_services_continuous_tables[]')
        ecosystem_services_vtype_tables = request.POST.getlist('ecosystem_services_vtype_tables[]')

        cursor = connection.cursor()
        if ru_table != "netcdf":

            # Get reporting unit set id, eg counties with ID = 1 (ru_set_id)
            query = "SELECT id from reporting_unit_sets where name = '%s'" % ru_table
            cursor.execute(query)
            ru_set_id = cursor.fetchone()[0]

            # Get a list of individual reporting unit id's intersecting the user wkt
            ru_name_list = []
            ru_id_list = []
            query = "SELECT name, id from %s where ST_Intersects('%s', %s.geom)" % (ru_table, WKT, ru_table)
            cursor.execute(query)
            results = cursor.fetchall()
            count = len(results)
            for row in results:
                ru_name_list.append(row[0])
                ru_id_list.append(str(row[1]))

            ru_id_csv = (",").join(ru_id_list)

            # Get outline of selected features. Could calculate area here, but probably preferable to precalculate in a PCS.
            #query = "SELECT ST_AsText(ST_SnapToGrid(ST_Force_2D(ST_Union(geom)), .0001)), ST_Area(ST_Union(geom)) as outline_of_selected_features from %s where ST_Intersects('%s', %s.geom)" % (ru_table, WKT, ru_table)
            query = "SELECT ST_AsText(ST_SnapToGrid(ST_Force_2D(ST_Union(geom)), .0001)) as outline_of_selected_features from %s where ST_Intersects('%s', %s.geom)" % (ru_table, WKT, ru_table)
            cursor.execute(query)
            results = cursor.fetchone()
            ru_wkt = results[0]
            #sum_area = results[1]
            #print sum_area

            def getValues(cursor, ru_set_id, ru_id_csv, ru_table):

                query = "select concat(m.code, v.code, s.code, t.code) as climate_code, sum(d.value * ru.area)/sum(ru.area) as value \
                    from models m, variables v, seasons s, time_periods t, data d, %s ru \
                    where m.id = d.model_id and v.id = d.var_id and s.id = d.season_id and t.id = d.time_id \
                    and d.ru_set_id = %s and d.ru_id in (%s) and ru.id = d.ru_id group by climate_code" % (ru_table, ru_set_id, ru_id_csv)
                print query
                cursor.execute(query)
                res = cursor.fetchall()
                return {r[0] + "_avg": round(r[1], 2) for r in res}

            data = getValues(cursor, ru_set_id, ru_id_csv, ru_table)

        else:

            ru_set_id = "User Defined"
            ru_id_csv = "User Defined"
            ru_name_list = "User Defined"
            count = 1

            # Calculate the zonal means for each of the NetCDF files in the study area directory.
            data = calc_zonal_mean_netcdf(user_wkt, studyarea)
            data['outline_of_selected_features'] = WKT

            ru_wkt = data['outline_of_selected_features']
            data['categorical_values'] = "User Defined"


        resultsJSON = json.dumps(data)

        columnChartColors = ""

        if ecosystem_services_vtype_tables:
            ecosystem_services_data = get_ecosystem_services_data2(str(ru_set_id), str(ru_id_csv))
        else:
            ecosystem_services_data = ''

        context = {
            'initialize': 0,
             'WKT_SelectedPolys': ru_wkt,
             'count': count,
             'resultsJSON': resultsJSON,
            'ecosystem_services_data':ecosystem_services_data,
             'categoricalValues': ru_name_list,
             'columnChartColors': columnChartColors,
             'error': 0,
             'config_file': config_file,
        }

        return HttpResponse(json.dumps(context))


@gzip_page
@csrf_exempt
def downscale(request):
    userWKT = request.POST.get('input')
    coords = re.findall("[-+]?\d+[\.]?\d*", userWKT)
    #print coords
    lon_target = float(coords[0])
    lat_target = float(coords[1])
    #lat_target = 44.5608
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
    filehandle = netCDF4.Dataset(pathname,'r',format = "NETCDF4")

    lats = filehandle.variables['lat'][:]
    lons = filehandle.variables['lon'][:]
    days_since_19000101 = filehandle.variables['time'][:]
    #tmax = filehandle.variables['tasmax']
    #precip = filehandle.variables['pr']

    #tmax = filehandle.variables['tasmax']
    #precip = filehandle.variables['pr']

    #tmax = filehandle.variables['tmp2m']
    #precip = filehandle.variables['prate']

    tmax = filehandle.variables['tmp2m_anom']
    precip = filehandle.variables['prate_anom']

    #days_since_19000101 = filehandle.variables['day'][0:20]
    #variable = filehandle.variables['daily_maximum_temperature'][0:20]

    #Get the closest lat and lon value in the netCDF File
    lon_index = np.abs(lons - lon_target).argmin()
    lat_index = np.abs(lats - lat_target).argmin()

    time_num = len(days_since_19000101)
    time_index = range(0,time_num,1)

    #Get the formatted dates and the data as lists
    #dates = [str(netCDF4.num2date(int(i),'days since 1900-01-01',calendar = 'standard').date()) for i in days_since_19000101]
    #Abbreviated Month Format
    #print days_since_19000101
    dates = [str(netCDF4.num2date(int(i),'days since 1900-01-01',calendar = 'standard').date().strftime("%b")) for i in days_since_19000101]
    tmax_data = tmax[lon_index,lat_index, time_index].tolist()
    precip_data = precip[lon_index,lat_index, time_index].tolist()
    #Historical Order of variables
    #data = variable[time_index,lon_index,lat_index].tolist()
    rounded_tmax_data = [round(x,2) for x in tmax_data ]
    rounded_precip_data = [round(x,2) for x in precip_data ]
    #print rounded_precip_data

    context = {
        'dates': dates,
        'tmax_data': rounded_tmax_data,
        'precip_data': rounded_precip_data
    }

    return HttpResponse(json.dumps(context))

@gzip_page
@csrf_exempt
def generate_eems_tree(request):

    #from django.utils.translation import pgettext_lazy, pgettext, gettext as _
    from EEMSBasePackage import EEMSCmd, EEMSProgram

    eems_file_name = request.POST.get("eems_file_name")
    print eems_file_name
    top_node = request.POST.get("top_node")

    eems_file_directory = settings.STATICFILES_DIRS[0] + "/config/eems"

    eems_file = eems_file_directory + "/command_files/" + eems_file_name
    eems_alias_file = eems_file_directory + "/aliases/" + eems_file_name.replace('eem','txt')

    dataset = ''

    #Determine EEMS v1 or EEMS v2
    if os.path.isfile(eems_file):
        eems_file_handle= open(eems_file,"r")
        for line in eems_file_handle:
            if re.match(r'^[a-zA-Z0-9_ ]+:', line):
                eems_version = 1
                #top_node = lastLine.split(':')[0]
                break

            elif re.match(r'^[a-zA-Z0-9_ ]+\(', line):
                eems_version = 2
                break

        global eems_version

    aliases = {}

    #Get Aliases
    if os.path.isfile(eems_alias_file):
        eems_alias_file_handle = open(eems_alias_file,"r")
        for line in eems_alias_file_handle:
           fieldname = line.split(":")[0]
           alias = line.split(":")[1].strip()
           #If the eems command file has an explicit layer order defined, Add it to the alias separated by a dash. The layer index is used to open the appropriate layer in Data Basin.
           try:
               line.split(":")[2]
               alias += ":" + line.split(":")[2].strip()
           except:
               pass
           if alias == '':
               alias = fieldname
           aliases[fieldname] = alias

        eems_alias_file_handle.close()

    #Alphabetical order. Perhaps use this as the basis for determining layer index
    #aliases = OrderedDict(sorted(aliases.items(), key = lambda t: t[0]))

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
            #    dataset_id = self.dataset_model.dataset.id
            #)
            #self.attribute_map = dict(self.dataset_attributes.values_list('attribute', 'alias'))

        def get_model(self, validate = True):
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
                layers_in_dataset = self.dataset_model.dataset.mapservice.datasetlayer_set.values_list('layer_id', flat = True)
                layers_not_in_dataset = [layer for layer in attributes_in_model if layer not in layers_in_dataset]

                if layers_not_in_dataset:
                    raise ValueError(
                        _('The following layers appear in the file but are not in the dataset: {0}').format(
                            ', '.join(layers_not_in_dataset)
                        )
                    )

            else:
                # Validate against dataset attributes
                attributes_in_dataset = self.dataset_attributes.values_list('attribute', flat = True)
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

        def get_model(self, validate = True):
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

        def get_model(self, validate = True):
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

        eems_file_parser = EEMSOneFileParser(eems_file_handle,dataset)
        JSON = eems_file_parser.get_model()

    elif eems_version == 2:

        eems_file_parser = EEMSTwoFileParser(eems_file,dataset)
        JSON = eems_file_parser.get_model()
        #get rid of "Nodes"
        for k,v in JSON.iteritems():
            JSON = v

    #Create new restructured JSON (JSON2) compatible with JIT, separate innto data key and children key
    JSON2 = {}

    for key,value in JSON.iteritems():
        JSON2[key] = {}
        JSON2[key]['data'] = {}
        for sub_key,value in value.iteritems():
            if sub_key == 'children':
                JSON2[key][sub_key] = value
            else:
                JSON2[key]['data'].update(JSON[key])

        if JSON2[key].has_key('children'):
            JSON2[key]['data'].pop('children')

    if eems_version == 1:
        JSON2.pop('nodes')

    #for making the aliases file
    SortedJSON2 = OrderedDict(sorted(JSON2.items(), key = lambda t: t[0]))
    count = 0
    for k,v in SortedJSON2.iteritems():
        print k + ":" + k+":"+str(count)
        count += 1

    #Expand the pointers to children for each key
    #each variable become it's own key containing a completed dictinonary of all its children
    def expandChildren(JSON2):
        for k, v in JSON2.iteritems():
            JSON2[k]['name'] = k
            JSON2[k]['id'] = k
            child_list = []
            if isinstance(v, dict) and JSON2[k].has_key('children'):
              for child in JSON2[k]['children']:
                  child_list.append(child)
              JSON2[k].pop('children')
              JSON2[k]['children'] = []
              JSON2[k]['children'].append({})
              for child in child_list:
                  JSON2[k]['children'][0][child] = JSON2[child]
            else:
              pass
        return JSON2

    #Print the JSON Tree
    def createFinalJSONString(d):
        global eems_tree
        eems_tree += '"id": ' + "'" + d['id'] + "',"
        if d['name'] in aliases:
           alias = aliases[d['name']]
        else:
           alias = d['name']
        eems_tree += '"name": ' + "'" + alias + "',"
        eems_tree += '"data": '
        eems_tree += json.dumps(d['data'])
        eems_tree+=(",")
        if d.has_key('children'):
            eems_tree += '"children": ['
            for k,v in d['children'][0].iteritems():
                eems_tree += "{"
                createFinalJSONString(v)
            eems_tree += "]},"
        else:
            eems_tree += "},"

    expandedJSON = expandChildren(JSON2)

    global eems_tree
    eems_tree = '{'

    createFinalJSONString(expandedJSON[top_node])
    #print json.dumps(JSON2, indent = 4, sort_keys = True)

    eems_tree_dict = ast.literal_eval(eems_tree.rstrip(","))

    eems_file_handle.close()

    # To write json tree to file
    #eems_json_file = open("F:/Projects2/EEMS_Online/json_models/" + top_node +".json",'w')
    #eems_json_file.write(json.dumps(eems_tree_dict, indent = 4, sort_keys = True))
    #eems_json_file.close()

    context = {
        'eems_tree_dict': eems_tree_dict,
        'top_node': top_node
    }

    return HttpResponse(json.dumps(context))

def get_ecosystem_services_data(WKT,continuous_tables,vtype_tables,spatial_or_aspatial):
    #VTYPE
    cursor = connection.cursor()
    #vtype_tables = ['ca_reporting_units_huc5_watersheds_es_decadal_vtype_ccsm4','ca_reporting_units_huc5_watersheds_es_decadal_vtype_cnrm','ca_reporting_units_huc5_watersheds_es_decadal_vtype_canesm2','ca_reporting_units_huc5_watersheds_es_decadal_vtype_hadgem2es']
    field_exclusions = "'objectid','shape_leng','shape_area','id_for_zon','ID_For_Zonal_Stats_JOIN','name'"
    resultsDictMultiTable = {}
    resultsDictMultiTable["vegetation_composition"] = {}
    for vtype_table in vtype_tables:
        field_name_query = "SELECT string_agg(column_name, ',') FROM information_schema.columns where table_name ='" + vtype_table + "' and (data_type = 'text' or data_type = 'character varying')  and column_name not in (" + field_exclusions + ");"
        #print field_name_query
        cursor.execute(field_name_query)
        statsFieldsTuple = cursor.fetchone()
        statsFields = ",".join(statsFieldsTuple)
        cursor = connection.cursor()
        selectList = "SELECT "
        for field in statsFields.split(','):
            selectList += field + " as " + field +", "
        #Extra comma
        selectList = selectList.rstrip(', ')
        vtype_tableList = " FROM " + vtype_table
        selectFieldsFromTable = selectList + vtype_tableList
        if spatial_or_aspatial == 'spatial':
            selectStatement = selectFieldsFromTable + " where ST_Intersects('"+ WKT + "', " + vtype_table + ".geom)"
        else:
            selectStatement = selectFieldsFromTable + " where name = '" + WKT + "'"
        #print selectStatement
        cursor.execute(selectStatement)
        resultsDict = {}
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
            #raise SystemExit(0)

        if resultsDict:
            print "resultsDict"
            print resultsDict
            resultsDictMultiTable["vegetation_composition"][vtype_table] = resultsDict

    #Continuous7
    #continuous_tables = ['ca_reporting_units_huc5_watersheds_es_decadal_ccsm4','ca_reporting_units_huc5_watersheds_es_decadal_cnrm','ca_reporting_units_huc5_watersheds_es_decadal_canesm2','ca_reporting_units_huc5_watersheds_es_decadal_hadgem2es' ]
    field_exclusions = "'objectid','shape_leng','shape_area','id_for_zon','ID_For_Zonal_Stats_JOIN','name'"
    resultsDictMultiTable["continuous7"] = {}
    if continuous_tables:
        try:
            for continuous_table in continuous_tables:
                field_name_query = "SELECT string_agg(column_name, ',') FROM information_schema.columns where table_name ='" + continuous_table + "' and (data_type = 'text' or data_type = 'character varying')  and column_name not in (" + field_exclusions + ");"
                #print field_name_query
                cursor.execute(field_name_query)
                statsFieldsTuple = cursor.fetchone()
                if not all(statsFieldsTuple):
                    print "Missing data fields in " + continuous_table
                statsFields = ",".join(statsFieldsTuple)
                cursor = connection.cursor()
                selectList = "SELECT "
                for field in statsFields.split(','):
                    selectList += field + " as " + field +", "
                #Extra comma
                selectList = selectList.rstrip(', ')
                continuous_tableList = " FROM " + continuous_table
                selectFieldsFromTable = selectList + continuous_tableList
                if spatial_or_aspatial == 'spatial':
                    selectStatement = selectFieldsFromTable + " where ST_Intersects('"+ WKT + "', " + continuous_table + ".geom)"
                else:
                    selectStatement = selectFieldsFromTable + " where name = '" + WKT + "'"
                #print selectStatement
                cursor.execute(selectStatement)
                resultsDict = {}
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

                resultsDictMultiTable["continuous7"][continuous_table] = resultsDict
        except:
            print "No continuous MC2 data"

    #print resultsDictMultiTable["continuous7"]
    #Take fieldname,value pairs from the dict and dump to a JSON string.
    veg_composition_data = json.dumps(resultsDictMultiTable)

    return veg_composition_data

# Created for the CONUS Console. Old method would have required 100 database tables.
def get_ecosystem_services_data2(ru_set_id, ru_id):

    # Only have support for single feature selection for MC2 data.
    # This ensures it doesn't break for the time being.
    # User will see notification on front end if more than on reporting unit is selected.
    ru_id = str(ru_id.split(",")[0])

    vtype_master_table = "mc2_vtype_merge"
    continuous_master_table = "mc2_continuous_merge"

    # VTYPE
    # Get a list of fields from the master mc2 vtype_table
    cursor = connection.cursor()
    field_exclusions = "'objectid','shape_leng','shape_area','id_for_zon','ID_For_Zonal_Stats_JOIN','name', 'id', 'ru_id', 'ru_set_id', 'ru_set_name', 'console', 'model'"
    field_name_query = "SELECT string_agg(column_name, ',') FROM information_schema.columns where table_name ='" + vtype_master_table + "' and (data_type = 'text' or data_type = 'character varying')  and column_name not in (" + field_exclusions + ");"

    cursor.execute(field_name_query)
    statsFieldsTuple = cursor.fetchone()

    statsFields = ",".join(statsFieldsTuple)

    # Create and execute the VTYPE database query
    cursor = connection.cursor()
    selectList = "SELECT ru_set_name, "

    for field in statsFields.split(','):
        selectList += field + " as " + field + ", "

    selectList = selectList.rstrip(', ') #Remove Extra comma

    vtype_tableList = " FROM " + vtype_master_table
    selectFieldsFromTable = selectList + vtype_tableList

    selectStatement = selectFieldsFromTable + " where ru_set_id = " + ru_set_id + " and id = " + ru_id

    cursor.execute(selectStatement)

    # Get field names
    columns = [colName[0] for colName in cursor.description]

    resultsDictMultiTable = {}
    resultsDictMultiTable["vegetation_composition"] = {}

    # Create the VTYPE dictionary
    try:
        for row in cursor:
            table_name = row[0]
            resultsDictMultiTable["vegetation_composition"][table_name] = {}
            for i in range(len(row) - 1):
                column_name = columns[i+1]
                values = row[i+1].strip()
                resultsDictMultiTable["vegetation_composition"][table_name][column_name] = values
    except:
        print "Error: No features selected"

    #Continuous7

    #Get a list of fields from the master mc2 continuous_table
    field_exclusions = "'objectid','shape_leng','shape_area','id_for_zon','ID_For_Zonal_Stats_JOIN','name','id', 'ru_set_id', 'ru_set_name', 'console', 'model'"
    field_name_query = "SELECT string_agg(column_name, ',') FROM information_schema.columns where table_name ='" + continuous_master_table + "' and (data_type = 'text' or data_type = 'character varying')  and column_name not in (" + field_exclusions + ");"

    cursor.execute(field_name_query)
    statsFieldsTuple = cursor.fetchone()

    if not all(statsFieldsTuple):
        print "Missing data fields in master table."

    statsFields = ",".join(statsFieldsTuple)

    # Create and execute the continuous database query
    cursor = connection.cursor()
    selectList = "SELECT ru_set_name, "

    for field in statsFields.split(','):
        selectList += field + " as " + field +", "

    selectList = selectList.rstrip(', ') #Remove Extra comma

    continuous_tableList = " FROM " + continuous_master_table
    selectFieldsFromTable = selectList + continuous_tableList

    selectStatement = selectFieldsFromTable + " where ru_set_id = " + ru_set_id + " and id = " + ru_id

    cursor.execute(selectStatement)

    #Get field names
    columns = [colName[0] for colName in cursor.description]

    # Create the continuous dictionary
    resultsDictMultiTable["continuous7"] = {}
    try:
        for row in cursor:
            table_name = row[0]
            resultsDictMultiTable["continuous7"][table_name] = {}
            for i in range(len(row) - 1):
                column_name = columns[i+1]
                values = row[i+1].strip()
                resultsDictMultiTable["continuous7"][table_name][column_name] = values

    except:
        print "Error: No features selected"
        raise SystemExit(0)

    #Take fieldname,value pairs from the dict and dump to a JSON string.
    mc2_data = json.dumps(resultsDictMultiTable)

    return mc2_data

def calc_zonal_mean_netcdf(user_wkt, study_area):

    print user_wkt
    if study_area == "conus":
        dst_epsg = 102003 #USA Contiguous Albers Equal Area Conic


    raster_extension = "tif"

    # Project WKT using ogr
    geom = ogr.CreateGeometryFromWkt(user_wkt)
    source = osr.SpatialReference()
    source.ImportFromEPSG(4326)
    target = osr.SpatialReference()
    target.ImportFromEPSG(dst_epsg)
    transform = osr.CoordinateTransformation(source, target)
    geom.Transform(transform)
    wkt_proj = geom.ExportToWkt()

    # Project WKT using PostGIS
    #cursor = connection.cursor()
    #query = "SELECT ST_AsGeoJSON(ST_Transform(ST_GeomFromText('" + user_wkt + "', '4326'), '%s'))" % dst_epsg
    #print query
    #cursor.execute(query)
    #wkt_proj = cursor.fetchone()[0]

    raster_dir = settings.STATICFILES_DIRS[0] + "/data/tif/%s/climate" % study_area
    files = [y for x in os.walk(raster_dir) for y in glob.glob(os.path.join(x[0], '*.tif'))]

    print raster_dir

    results_dict = {}

    for file in files:
        filename = os.path.basename(file)
        climate_code = getClimateCode(filename)

        if "POINT" in user_wkt:
            value = point_query(wkt_proj, file)[0]

        else:
            value = zonal_stats(wkt_proj, file, stats="mean")[0]["mean"]

        results_dict[climate_code + "_avg"] = round(value, 2)

    return results_dict

@gzip_page
@csrf_exempt
def extract_raster_values(request):

    user_wkt = request.POST.get("last_poly")
    g1 = shapely.wkt.loads(user_wkt)
    g2 = geojson.Feature(geometry=g1, properties={})

    macrogroup_code = request.POST.get("macrogroup_code")
    macrogroup_name = request.POST.get("macrogroup_name")

    features = []
    features.append(g2.geometry)

    rasters = get_raster_defs()
    results = {}

    # for each raster group (e.g., "cns")
    for raster_group, raster_subgroups in rasters.items():
        results[raster_group] = {}
        for raster_subgroup, raster_subgroup_list in raster_subgroups.items():
            results[raster_group][raster_subgroup] = []
            # for each raster_dict in that raster groups list.
            for raster_dict in raster_subgroup_list:

                if raster_dict["raster"]:
                    tif_file = settings.STATICFILES_DIRS[0] + "/data/raster/ca/{}".format(raster_dict["raster"])

                    with rasterio.open(tif_file) as src:
                        out_image, out_transform = rasterio.mask.mask(src, features, crop=True)
                        out_meta = src.meta.copy()

                    out_meta.update({"driver": "GTiff",
                                     "height": out_image.shape[1],
                                     "width": out_image.shape[2],
                                     "transform": out_transform})

                    RASTER_ID = get_random_string(length=32)
                    clipped_raster = settings.TEMP_DIR + RASTER_ID + ".tif"

                    with rasterio.open(clipped_raster, "w", **out_meta) as dest:
                        dest.write(out_image)

                    with rasterio.open(clipped_raster, 'r') as src:
                        array = src.read(1, masked=True)

                    # Remove masked values

                    raw_data_array = (array[~array.mask])
                                        # Temporary dictionary to store the results of this raster definition
                    raster_definition_dict = {}

                    raster_definition_dict["title"] = raster_dict["title"]
                    raster_definition_dict["file"] = raster_dict["raster"]
                    raster_definition_dict["series"] = raster_dict["series"]
                    raster_definition_dict["stats"] = {}

                    raster_definition_dict["stats"]["mean"] = round(float(array.mean()), 1)
                    raster_definition_dict["stats"]["min"] = round(float(array.min()), 1)
                    raster_definition_dict["stats"]["max"] = round(float(array.max()), 1)
                    raster_definition_dict["stats"]["sd"] = round(float(array.std()), 1)

                    raster_definition_dict["raw_data"] = json.loads(json.dumps(raw_data_array.tolist()))

                    try:
                        raster_definition_dict["netcdf"] = raster_dict["netcdf"]
                    except:
                        pass

                    raster_definition_dict["chart_type"] = raster_dict["chart_type"]

                    try:
                        raster_definition_dict["bins"] = raster_dict["bins"]
                    except:
                        pass

                    try:
                        raster_definition_dict["data_type"] = raster_dict["data_type"]

                        if raster_definition_dict["data_type"] == "categorical":
                            binned_data_array = bin_the_data(raster_definition_dict["raw_data"], raster_dict["labels"], raster_dict["sort"])
                            raster_definition_dict["binned_data"] = binned_data_array
                            del raster_definition_dict["raw_data"]
                            print (raster_dict["title"] + ": Success")
                    except:
                        print (raster_dict["title"] + ": Failed to bin data")
                        pass

                    try:
                        raster_definition_dict["labels"] = raster_dict["labels"]
                    except:
                        pass
                    try:
                        raster_definition_dict["color"] = raster_dict["color"]
                    except:
                        pass
                    try:
                        raster_definition_dict["series_opacity"] = raster_dict["series_opacity"]
                    except:
                        pass
                    results[raster_group][raster_subgroup].append(raster_definition_dict)

                    os.remove(clipped_raster)

    if macrogroup_code != "none":
        macrogroup_bioclim_results = extract_text_values(macrogroup_code, macrogroup_name)

        for k, v in macrogroup_bioclim_results.iteritems():
            results["Climate"][k].append(v)

    context = {
        "selected_reporting_unit_results": results,
    }

    return HttpResponse(json.dumps(context, sort_keys=True))

def get_raster_defs():

    rasters = {}
    rasters["Climate"] = {}

    climate_colors = ["rgba(67,67,67,.4)", "rgba(255,0,0,.4)", "rgba(0,102,200,.4)"]
    climate_opacity = [.4, .3, .3]

    rasters["Climate"]["bio5"] = [
        {"raster": "hist_tmax.tif",  "title": "Max Temp of the Warmest Month (C)", "series": "Historical (1971 - 2000)", "data_type": "continuous", "chart_type": "areaspline", "color": climate_colors[0],"series_opacity": climate_opacity[0]},
        {"raster": "hadgem_tmax.tif", "title": "", "series": "Future (2046 - 2075, HadGEM2-ES (Hot/Dry))", "data_type": "continuous",  "chart_type": "areaspline", "color": climate_colors[1],"series_opacity": climate_opacity[1]},
        {"raster": "canesm_tmax.tif", "title": "", "series": "Future (2046 - 2075, CanESM2 (Hot/Wet))", "data_type": "continuous",  "chart_type": "areaspline", "color": climate_colors[2],"series_opacity":climate_opacity[2]},
    ]

    rasters["Climate"]["bio6"] = [
        {"raster": "hist_tmin.tif", "title": "Min Temp of the Coolest Month (C)", "series": "Historical (1971 - 2000)", "data_type": "continuous", "chart_type": "areaspline", "color": climate_colors[0], "series_opacity":climate_opacity[0]},
        {"raster": "hadgem_tmin.tif", "title": "", "series": "Future (2046 - 2075, HadGEM2-ES (Hot/Dry))", "data_type": "continuous", "chart_type": "areaspline", "color": climate_colors[1], "series_opacity":climate_opacity[1]},
        {"raster": "canesm_tmin.tif", "title": "", "series": "Future (2046 - 2075, CanESM2 (Hot/Wet))", "data_type": "continuous", "chart_type": "areaspline", "color": climate_colors[2], "series_opacity":climate_opacity[2]},
    ]

    rasters["Climate"]["bio_12"] = [
        {"raster": "hist_ppt.tif", "title": "Annual Precipitation (mm)", "series": "Historical (1971 - 2000)", "data_type": "continuous", "chart_type": "areaspline", "color": climate_colors[0], "series_opacity":climate_opacity[0]},
        {"raster": "hadgem_ppt.tif", "title": "", "series": "Future (2046 - 2075, HadGEM2-ES (Hot/Dry))", "data_type": "continuous", "chart_type": "areaspline", "color": climate_colors[1], "series_opacity":climate_opacity[1]},
        {"raster": "canesm_ppt.tif", "title": "", "series": "Future (2046 - 2075, CanESM2 (Hot/Wet))", "data_type": "continuous", "chart_type": "areaspline","color": climate_colors[2],"series_opacity": climate_opacity[2]},
    ]

    rasters["Climate"]["bio_13"] = [
        {"raster": "hist_bio13.tif", "title": "Precipitation of the Wettest Month (mm)", "series": "Historical (1971 - 2000)", "data_type": "continuous", "chart_type": "areaspline", "color": climate_colors[0], "series_opacity":climate_opacity[0]},
        {"raster": "hadgem_bio13.tif", "title": "", "series": "Future (2046 - 2075, HadGEM2-ES (Hot/Dry))", "data_type": "continuous", "chart_type": "areaspline", "color": climate_colors[1], "series_opacity":climate_opacity[1]},
        {"raster": "canesm_bio13.tif", "title": "", "series": "Future (2046 - 2075, CanESM2 (Hot/Wet))", "data_type": "continuous", "chart_type": "areaspline","color": climate_colors[2],"series_opacity": climate_opacity[2]},
    ]

    rasters["Climate"]["bio_14"] = [
        {"raster": "hist_bio14.tif", "title": "Precipitation of the Driest Month (mm)", "series": "Historical (1971 - 2000)", "data_type": "continuous", "chart_type": "areaspline", "color": climate_colors[0], "series_opacity":climate_opacity[0]},
        {"raster": "hadgem_bio14.tif", "title": "", "series": "Future (2046 - 2075, HadGEM2-ES (Hot/Dry))", "data_type": "continuous", "chart_type": "areaspline", "color": climate_colors[1], "series_opacity":climate_opacity[1]},
        {"raster": "canesm_bio14.tif", "title": "", "series": "Future (2046 - 2075, CanESM2 (Hot/Wet))", "data_type": "continuous", "chart_type": "areaspline","color": climate_colors[2],"series_opacity": climate_opacity[2]},
    ]

    # Driest and wetest quarter.

#    rasters["Climate"]["bio_16"] = [
#        {"raster": "hist_dry_qtr.tif", "title": "Precipitation of the Driest Quarter<br>(mm)", "series": "Historical (1971 - 2000)", "data_type": "continuous", "chart_type": "areaspline", "color": climate_colors[0], "series_opacity":climate_opacity[0]},
#        {"raster": "hadgem_dry_qtr.tif", "title": "", "series": "Future (2046 - 2075, HadGEM2-ES (Hot/Dry))", "data_type": "continuous", "chart_type": "areaspline", "color": climate_colors[1], "series_opacity":climate_opacity[1]},
#        {"raster": "canesm_dry_qtr.tif", "title": "", "series": "Future (2046 - 2075, CanESM2 (Hot/Wet))", "data_type": "continuous", "chart_type": "areaspline","color": climate_colors[2],"series_opacity": climate_opacity[2]},
#    ]
#
#    rasters["Climate"]["bio_17"] = [
#        {"raster": "hist_wet_qtr.tif", "title": "Precipitation of the Wettest Quarter<br>(mm)", "series": "Historical (1971 - 2000)", "data_type": "continuous", "chart_type": "areaspline", "color": climate_colors[0], "series_opacity":climate_opacity[0]},
#        {"raster": "hadgem_wet_qtr.tif", "title": "", "series": "Future (2046 - 2075, HadGEM2-ES (Hot/Dry))", "data_type": "continuous", "chart_type": "areaspline", "color": climate_colors[1], "series_opacity":climate_opacity[1]},
#        {"raster": "canesm_wet_qtr.tif", "title": "", "series": "Future (2046 - 2075, CanESM2 (Hot/Wet))", "data_type": "continuous", "chart_type": "areaspline","color": climate_colors[2],"series_opacity": climate_opacity[2]},
#    ]

    rasters["Climate"]["cwd"] = [
        {"raster": "hist_cwd.tif", "title": "Climatic Water Deficit (mm)", "series": "Historical (1971 - 2000)", "data_type": "continuous", "chart_type": "areaspline", "color": climate_colors[0], "series_opacity":climate_opacity[0]},
        {"raster": "hadgem_cwd.tif", "title": "", "series": "Future (2046 - 2075, HadGEM2-ES (Hot/Dry))", "data_type": "continuous", "chart_type": "areaspline", "color": climate_colors[1], "series_opacity":climate_opacity[1]},
        {"raster": "canesm_cwd.tif", "title": "", "series": "Future (2046 - 2075, CanESM2 (Hot/Wet))", "data_type": "continuous", "chart_type": "areaspline","color": climate_colors[2],"series_opacity": climate_opacity[2]},
    ]


    return rasters

def extract_text_values(macrogroup_code, macrogroup_name):

    results = {}

    macrogroup_file = settings.STATICFILES_DIRS[0] + "/data/txt/macrogrp_dist_climate_vars" + os.sep + macrogroup_code + "_dist_climate_variables.txt"

    with open(macrogroup_file) as f:
        reader = csv.reader(f)
        header_list = reader.next()
        header_list_filtered = [header.replace("bio12", "bio_12").replace("bio13", "bio_13").replace("bio14", "bio_14") for header in header_list if header not in ('model', 'y', 'x')]
        #raw_data = [round(float(row[0]), 1) for row in reader]

        raw_data = {}
        for header in header_list_filtered:
            raw_data[header] = []

        for line in reader:
            count = 0
            for header in header_list_filtered:
                # Ken's corrected CWD text files had "--" where there were no data pixels.
                try:
                    raw_data[header].append(round(float(line[count]), 2))
                except:
                    pass
                count += 1

        max_val = {}
        min_val = {}

        for header in header_list_filtered:
            max_val[header] = max(raw_data[header])
            min_val[header] = min(raw_data[header])

        mean_val = 1

        results["bio5"] = {"title": "", "series": macrogroup_name, "data_type": "continuous", "chart_type": "areaspline", "color": "rgba(255,165,0,.6)", "series_opacity": .6, "raw_data": raw_data["bio5"], "stats": {"mean": mean_val, "max": max_val["bio5"], "min": min_val["bio5"]}}
        results["bio6"] = {"title": "", "series": macrogroup_name, "data_type": "continuous", "chart_type": "areaspline", "color": "rgba(255,165,0,.6)", "series_opacity": .6, "raw_data": raw_data["bio6"], "stats": {"mean": mean_val, "max": max_val["bio6"], "min": min_val["bio6"]}}
        results["bio_12"] = {"title": "", "series": macrogroup_name, "data_type": "continuous", "chart_type": "areaspline", "color": "rgba(255,165,0,.6)", "series_opacity": .6, "raw_data": raw_data["bio_12"], "stats": {"mean": mean_val, "max": max_val["bio_12"], "min": min_val["bio_12"]}}
        results["bio_13"] = {"title": "", "series": macrogroup_name, "data_type": "continuous", "chart_type": "areaspline", "color": "rgba(255,165,0,.6)", "series_opacity": .6, "raw_data": raw_data["bio_13"], "stats": {"mean": mean_val, "max": max_val["bio_13"], "min": min_val["bio_13"]}}
        results["bio_14"] = {"title": "", "series": macrogroup_name, "data_type": "continuous", "chart_type": "areaspline", "color": "rgba(255,165,0,.6)", "series_opacity": .6, "raw_data": raw_data["bio_14"], "stats": {"mean": mean_val, "max": max_val["bio_14"], "min": min_val["bio_14"]}}
        results["cwd"] = {"title": "", "series": macrogroup_name, "data_type": "continuous", "chart_type": "areaspline", "color": "rgba(255,165,0,.6)", "series_opacity": .6, "raw_data": raw_data["cwd"], "stats": {"mean": mean_val, "max": max_val["cwd"], "min": min_val["cwd"]}}

    return results

def getClimateCode(Name):

    def getSeasonAbbreviation(Name):
       if "JFM" in Name:
          return "s1"
       elif "AMJ" in Name or "Summer" in Name:
          return "s2"
       elif "JAS" in Name:
          return "s3"
       elif "OND" in Name or "Winter" in Name:
          return "s4"
       else:
          return "s0"

    def getVariableAbbreviation(Name):
      if "_pr" in Name or "_ppt" in Name:
        if "delta" in Name or "_pct_" in Name:
            if "summer" in Name.lower():
              return "prsd"
            elif "winter" in Name.lower():
              return "prwd"
            else:
              return "pred"
        elif "anom" in Name:
          return "prea"
        elif "summer" in Name.lower():
          return "pres"
        elif "winter" in Name.lower():
          return "prew"
        else:
          return "prec"
      elif "_tasmax" in Name or "_tmax" in Name:
         if "delta" in Name:
             if "summer" in Name.lower():
                  return "masd"
             elif "winter" in Name.lower():
                  return "mawd"
             else:
                  return "tmad"
         elif "anom" in Name:
            return "tmaa"
         elif "summer" in Name.lower():
            return "tmas"
         elif "winter" in Name.lower():
            return "tmaw"
         else:
            return "tmax"
      elif "_tasmin" in Name or "_tmin" in Name:
          if "delta" in Name:
              if "summer" in Name.lower():
                  return "misd"
              elif "winter" in Name.lower():
                  return "miwd"
              else:
                  return "tmid"
          elif "anom" in Name:
             return "tmia"
          elif "summer" in Name.lower():
             return "tmis"
          elif "winter" in Name.lower():
             return "tmiw"
          else:
             return "tmin"
      elif "_pet" in Name:
          #No Deltas for pet
          if "summer" in Name.lower():
             return "pets"
          elif "winter" in Name.lower():
             return "petw"
          else:
             return "pet"
      elif "_aridity" in Name:
          #All Deltas for Aridity
          if "summer" in Name.lower():
             return "arsd"
          elif "winter" in Name.lower():
             return "arwd"
          else:
             return "arid"
      elif "_vpr" in Name:
          if "delta" in Name or "_pct_" in Name:
              if "summer" in Name.lower():
                  return "vpsd"
              elif "winter" in Name.lower():
                  return "vpwd"
              else:
                  return "vpd"
          else:
              return "vpr"

    def getTimePeriodAbbreviation(Name):
      if "1645" in Name or "1530" in Name or "1120" in Name:
        return "t1"
      elif "4675" in Name or "4560" in Name or "2130" in Name:
         return "t2"
      elif "3140" in Name:
          return "t3"
      elif "4150" in Name:
          return "t4"
      elif "5160" in Name:
          return "t5"
      elif "6170" in Name:
          return "t6"
      elif "7180" in Name:
          return "t7"
      elif "8190" in Name:
          return "t8"
      elif "9199" in Name:
          return "t9"
      elif "7100" in Name or "6899" or "8110" in Name:
         return "t0"

    def getModelAbbreviation(Name):

      #Note that these have dashes from the netCDF filenames, not underscores like the datasets.

       if "CCSM4" in Name:
          modelAbbreviation='C4'
       elif "ensemble" in Name:
          modelAbbreviation='ee'
       elif "GFDL-ESM2G" in Name:
           modelAbbreviation='g4'
       elif "GFDL-ESM2M" in Name:
           modelAbbreviation='g5'
       elif "GFDL" in Name:
          modelAbbreviation='G3'
       elif "MRI-CGCM3" in Name:
           modelAbbreviation='mi'
       elif "MRI" in Name:
          modelAbbreviation='M3'
       elif "CanESM2" in Name:
          modelAbbreviation='C2'
       elif "MIROC5" in Name:
          modelAbbreviation='M5'
       elif "MIROC-ESM-CHEM" in Name:
           modelAbbreviation='mc'
       elif "MIROC-ESM" in Name:
           modelAbbreviation='me'
       elif "HadGEM2-ES" in Name:
          modelAbbreviation='HS'
       elif "HadGEM2-CC" in Name:
          modelAbbreviation='HC'
       elif "CNRM-CM5" in Name:
          modelAbbreviation='C5'
       elif "CMCC-CM" in Name:
          modelAbbreviation='CM'
       elif "CESM1-BGC" in Name:
          modelAbbreviation='CC'
       elif "CESM1-CAM5" in Name:
           modelAbbreviation='C5'
       elif "ACCESS1-0" in Name:
          modelAbbreviation='A0'
       elif "bcc-csm1-1-m" in Name:
           modelAbbreviation='bm'
       elif "bcc-csm1-1" in Name:
           modelAbbreviation='bc'
       elif "CSIRO-Mk3-6-0" in Name:
           modelAbbreviation='c0'
       elif "IPSL-CM5A-MR" in Name:
           modelAbbreviation='ir'
       elif "NorESM1-M" in Name:
           modelAbbreviation='nm'
       elif "BNU-ESM" in Name:
           modelAbbreviation='BN'
       elif "inmcm4" in Name:
           modelAbbreviation='in'
       elif "IPSL-CM5A-LR" in Name:
           modelAbbreviation='ia'
       elif "IPSL-CM5A-MR" in Name:
           modelAbbreviation='ir'
       elif "IPSL-CM5B-LR" in Name:
           modelAbbreviation='ib'
       elif "PRISM" in Name:
          modelAbbreviation='pm'
       else:
          modelAbbreviation="NoModel"
       return modelAbbreviation

    modelAbbreviation=getModelAbbreviation(Name)
    variable=getVariableAbbreviation(Name)
    season=getSeasonAbbreviation(Name)
    timePeriod=getTimePeriodAbbreviation(Name)

    try:
        climateCode = (modelAbbreviation+variable+season+timePeriod).lower()
    except:
        climateCode = Name
    return climateCode

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
        if (parameter == 'theobald'):
            return "#612F49"
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
        if (parameter == 'theobald'):
            return "#8A6557"
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
        if (parameter == 'theobald'):
            return "#B5A762"
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
        if (parameter == 'theobald'):
            return "#9FAA50"
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
        if (parameter == 'theobald'):
            return "#526E2B"
    elif (value >  -1.00001):
        if (parameter == 'TI'):
            return "#45508A"
        if (parameter == 'CV'):
            return "#8F0051"
        if (parameter == 'SS'):
            return "#F0ECAA"
        if (parameter == 'PR'):
            return "#CD6666"
        if (parameter == 'ClimateEEMS'):
            return "#3462CF"
        if (parameter == 'theobald'):
            return "#173B0F"
    else:
        return "gray"

