/*
 * Copyright 2016-2017 the original author or authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Author - Ketan Gote, Pratik Kelwalkar, Dattaram Gawas
 *
 */

import {
    Input, OnInit, forwardRef, Component, ContentChildren, QueryList, AfterContentInit, Output, EventEmitter,
    SimpleChange, SimpleChanges
} from "@angular/core";
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from "@angular/forms";
import {DataTableService} from "./datatable.service";
import {ColumnComponent} from "./column.component";


const noop = () => {
};

export const CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR: any = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => DataTableComponent),
    multi: true
};

@Component({
    selector: 'amexio-data-table',
    template : `
        <div>
            <ng-content></ng-content>
        </div>

        <table class="table table-hover table-striped table-bordered"  [attr.id]="elementId" (window:resize)="onResize($event)">
            <thead>

            <tr>
                <td [attr.colspan]="columns.length + (checkboxSelect? 1: 0)" width="100%" data align="right">
                    <span style="float: left;">
                      <b>{{title}}</b>
                    </span>
                    <span style="float: right">
                       <div class="btn-group">
                        <button type="button" class="btn btn-default" aria-label="Previous" (click)="prev()">
                          <span aria-hidden="true">&laquo;</span>
                        </button>
        
                        <button type="button" class="btn btn-default">
                          <span> ({{currentPage}} of {{maxPage}})</span>
                        </button>
        
                        <div class="btn-group" role="group">
                          <button type="button" class="btn btn-secondary btn-block dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" data-id="simple-select"><i class="fa fa-bars"></i>
                            Page - {{currentPage}}
                          </button>
                            <!--  <ul class="dropdown-menu  dropdown-menu-right">
                                  <li *ngFor="let row of pageNumbers let pageNo = index " value="{{pageNo+1}}"><a (click)="setPageNo(pageNo+1)">{{pageNo+1}}</a></li>
                              </ul>-->
                          <div class="dropdown-menu open">
                            <ul class="dropdown-menu inner" role="menu" style="max-height: 445.406px; overflow-y: auto; min-height: 0px;">
                              <li *ngFor="let row of pageNumbers let pageNo = index " value="{{pageNo+1}}"><a (click)="setPageNo(pageNo+1)">{{pageNo+1}}</a></li>
                            </ul>
                          </div>
                          
                        </div>
        
                        <div class="btn-group" role="group">
                          <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            <span class="glyphicon glyphicon-th-list"></span>
                          </button>
                          <ul class="dropdown-menu  dropdown-menu-right">
                              <li>
                                  &nbsp;&nbsp;<b> Show Columns</b>
                              </li>
                              <li *ngFor="let cols of columns;let i = index;">
                                <div class="checkbox">
                                      <label>
                                          &nbsp;&nbsp;<input type="checkbox" (click)="setColumnVisiblity(cols.dataIndex)" [attr.checked]="!cols.hidden ? true: null"> {{cols.text +" "}}
                                      </label>
                                 </div>
                              </li> 
                          </ul>
                        </div>
                        <button type="button" class="btn btn-default" aria-label="Next" (click)="next()"><span aria-hidden="true">&raquo;</span></button>
                      </div>
                    </span>
                </td>
            </tr>

            <tr *ngIf="!smallScreen">
                <td *ngIf="checkboxSelect" width="5%"><input type="checkbox" (click)="selectAllVisibleRows()" ></td>
                <td *ngFor="let cols of columns" [hidden]="cols.hidden" >
                    <!-- Column Header -->
                    <span style="cursor: pointer;" (click)="sortOnColHeaderClick(cols)">
                        
                        <!-- If user hasnt embedded view -->
                        <ng-container *ngIf="!cols?.headerTemplate"><b>{{cols.text}}</b></ng-container>

                        <!--Check if user has embedded view inserted then -->
                        <ng-template *ngIf="cols?.headerTemplate" [ngTemplateOutlet]="cols?.headerTemplate" [ngOutletContext]="{ $implicit: { header: cols.text } }"></ng-template>
                      </span>

                    <span  style="float: right" class="btn-group" role="group">
                        <span class="dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                          <span class="glyphicon glyphicon-triangle-bottom" style="color:#93a1a1"></span>
                        </span>
                        <div class="dropdown-menu">
                            <button class="btn btn-link" (click)="setSortColumn(cols,1)">
                                <span class="glyphicon glyphicon glyphicon-sort-by-attributes pull-left"></span><span>&nbsp;Sort Ascending</span>
                            </button>                          
                            <button class="btn btn-link" (click)="setSortColumn(cols,2)">
                                <span class="glyphicon glyphicon glyphicon glyphicon-sort-by-attributes-alt pull-left"></span><span>&nbsp;Sort Descending</span>
                            </button>                          
                        </div>
                      </span>
                </td>
            </tr>

            <tr  *ngIf="!smallScreen">
                <td *ngIf="checkboxSelect"  width="5%"></td>
                <td *ngFor="let cols of columns let colIndex = index " [hidden] ="cols.hidden" >
                    <b>{{summaryData[colIndex]}}</b>
                </td>
            </tr>

            </thead>

            <tbody *ngIf="!smallScreen">

            <tr style="cursor: pointer" *ngFor="let row of viewRows let rowIndex = index " (click)="rowClick(row, rowIndex)" [class.info]="isSelected(rowIndex)">
                <td *ngIf="checkboxSelect"  width="5%"><input type="checkbox" id="checkbox-{{elementId}}-{{rowIndex}}" [attr.checked]="selectAll? true: null" (click)="setSelectedRow(row, $event)"></td>

                <td *ngFor="let cols of columns" [hidden] ="cols.hidden" >

                    <!-- If user hasnt specified customized cell use default -->
                    <ng-container *ngIf="!cols?.bodyTemplate">{{row[cols.dataIndex]}}</ng-container>

                    <!-- else insert customized code -->
                    <template *ngIf="cols.bodyTemplate" [ngTemplateOutlet]="cols.bodyTemplate" [ngOutletContext]="{ $implicit: { text : row[cols.dataIndex] }, row: row }"></template>

                </td>
            </tr>

            </tbody>

            <tbody *ngIf="smallScreen">
            <tr style="cursor: pointer" *ngFor="let row of viewRows let rowIndex = index " (click)="rowClick(row, rowIndex)" [class.info]="isSelected(rowIndex)">
                <td *ngIf="checkboxSelect"  width="5%"><input type="checkbox" id="checkbox-{{elementId}}-{{rowIndex}}" [attr.checked]="selectAll? true: null" (click)="setSelectedRow(row, $event)"></td>
                <td>
                    <div style="word-wrap: break-word" *ngFor="let cols of columns" [hidden] ="cols.hidden" >
                        <b>{{cols.text}}</b> :
                        <!-- If user hasnt specified customized cell use default -->
                        <ng-container *ngIf="!cols?.bodyTemplate">{{row[cols.dataIndex]}}</ng-container>

                        <!-- else insert customized code -->
                        <template *ngIf="cols.bodyTemplate" [ngTemplateOutlet]="cols.bodyTemplate" [ngOutletContext]="{ $implicit: { text : row[cols.dataIndex] }, row: row }"></template>
                    </div>
                </td>
            </tr>
            </tbody>

        </table>
    `,
    providers : [CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR, DataTableService]
})

export class DataTableComponent  implements OnInit {

    @Input()    title : string;

    @Input()
    pageSize: number;

    @Input()
    httpUrl : string;

    @Input()
    httpMethod : string;

    @Input()
    dataReader : string;

    @Input()
    checkboxSelect : boolean;

    @Input()
    dataTableBindData : any;

    @Output()
    rowSelect : any = new EventEmitter <any>();

    @Output()
    selectedRowData : any = new EventEmitter<any>();

    @Input()
    height : string;

    @Input()
    width : string;

    columns : any[];

    data : any[];

    viewRows : any[];

    maxPage : number;

    currentPage : number;

    sortColumn : any;

    pageNumbers : number[];

    elementId : string;

    selectedRowNo : number;

    selectAll : boolean;

    selectedRows : any[];

    summary : any[];

    summaryData : any[];

    isSummary : boolean;

    smallScreen : boolean;

    sortBy : number;

    randomIDCheckALL : string;

    @ContentChildren(ColumnComponent) columnRef : QueryList<ColumnComponent>;


    constructor(private dataTableSevice : DataTableService) {
        this.pageNumbers = [];
        this.currentPage = 1;
        this.elementId = "mytable-"+Math.random();
        this.selectAll = false;
        this.selectedRows = [];
        this.isSummary = false;
        this.summaryData = [];
        this.summary = [];
        this.smallScreen = false;
        this.sortBy = -1;
        this.randomIDCheckALL = 'checkall-'+new Date().getTime() + Math.random();
    }

    ngOnInit()
    {

    }

    ngAfterContentInit() {
        this.createConfig();
    }

    createConfig(){

        this.columns = [];
        this.createColumnConfig();

        for(let ir = 0 ; ir<this.columns.length; ir++){
            let column = this.columns[ir];

            if(column.summaryType && column.dataType && column.dataType == "number")
                this.isSummary = true;

            this.summaryData.push(0);

            this.summary.push({summaryType: column.summaryType, summaryCaption : column.summaryCaption, data:[]});
        }

    }


    createColumnConfig(){
        let columnRefArray = [];

        columnRefArray = this.columnRef.toArray();
        for(let cr =0 ; cr<columnRefArray.length;cr++){
            let columnConfig = columnRefArray[cr];
            let columnData : any;

            if(columnConfig.headerTemplate != null && columnConfig.bodyTemplate != null)
                columnData = {text:columnConfig.text, dataIndex: columnConfig.dataIndex, hidden: columnConfig.hidden, dataType : columnConfig.dataType,headerTemplate : columnConfig.headerTemplate,bodyTemplate : columnConfig.bodyTemplate};
            else if(columnConfig.headerTemplate != null && columnConfig.bodyTemplate == null){
                columnData = {text:columnConfig.text, dataIndex: columnConfig.dataIndex, hidden: columnConfig.hidden, dataType : columnConfig.dataType,headerTemplate : columnConfig.headerTemplate};
            }
            else if(columnConfig.bodyTemplate != null && columnConfig.headerTemplate == null){
                columnData = {text:columnConfig.text, dataIndex: columnConfig.dataIndex, hidden: columnConfig.hidden, dataType : columnConfig.dataType,bodyTemplate : columnConfig.bodyTemplate};
            }
            else if(columnConfig.bodyTemplate == null && columnConfig.headerTemplate == null){
                columnData = {text:columnConfig.text, dataIndex: columnConfig.dataIndex, hidden: columnConfig.hidden, dataType : columnConfig.dataType};
            }


            if(columnConfig.summaryType){
                columnData['summaryType'] = columnConfig.summaryType;
            }

            if(columnConfig.summaryCaption){
                columnData['summaryCaption'] = columnConfig.summaryCaption;
            }

            this.columns.push(columnData);
        }

    }

    ngOnChanges(change : SimpleChanges){
        if(change['dataTableBindData']){
            let data : any = change['dataTableBindData'].currentValue;
            if(data){
                this.setData(data)
            }
        }
    }

    ngAfterViewInit(){
        if(this.httpMethod && this.httpUrl){
            this.dataTableSevice.fetchData(this,this.httpUrl,this.httpMethod);
        }
        else if(this.dataTableBindData){
            this.setData(this.dataTableBindData);
        }
    }

    setData(httpResponse: any){
        this.data = this.getResponseData(httpResponse);

        if(this.data.length > (1 * this.pageSize))
        {
            this.maxPage = Math.floor((this.data.length/this.pageSize));

            if((this.data.length%this.pageSize)>0)
            {
                this.maxPage ++;
            }
        }

        for(let pageNo = 1; pageNo<=this.maxPage; pageNo++)
        {
            this.pageNumbers.push(pageNo);
        }

        this.createSummaryData();
        this.renderData();
    }


    createSummaryData (){
        for(let sd = 0 ; sd<this.data.length; sd++){
            let localData = this.data[sd];
            if(this.isSummary){
                for(let ir = 0 ; ir<this.columns.length; ir++) {
                    let column = this.columns[ir];

                    if(column.summaryType && column.dataType && column.dataType == "number")
                    {
                        let colData = localData[column.dataIndex];

                        if(colData){
                            let summaryData  = this.summary[ir];
                            if(summaryData && summaryData != "")
                                summaryData.data.push(colData);
                        }
                    }
                }
            }
        }

        for (let is = 0 ;is <this.summaryData.length ; is ++){
            if(this.summaryData[is] == 0){
                this.summaryData[is] = "";
            }

            let summarized = this.summary[is];
            if(summarized){
                let summaryType = summarized.summaryType;
                let summarizeData = summarized.data.sort((a : any, b : any)=>{return a - b});
                let summaryCaption = summarized.summaryCaption;

                if(summaryType){
                    if(summaryType == 'sum'){
                        let sumValue = 0;
                        for (let s = 0 ; s < summarizeData.length ; s++){
                            sumValue = sumValue + summarizeData[s];
                        }
                        this.summaryData[is] = summaryCaption + " " + sumValue;
                    }
                    else if(summaryType == 'min'){
                        if(summarizeData){
                            this.summaryData[is] = summaryCaption + " " + summarizeData[0];
                        }
                    }
                    else if(summaryType == 'max'){
                        if(summarizeData){
                            this.summaryData[is] = summaryCaption + " " + summarizeData[summarizeData.length-1];
                        }
                    }
                    else if(summaryType == 'avg'){
                        if(summarizeData){
                            let sumValue = 0;
                            for (let s = 0 ; s < summarizeData.length ; s++){
                                sumValue = sumValue + summarizeData[s];
                            }
                            this.summaryData[is] = summaryCaption + " " + Math.round(sumValue / summarizeData.length) ;
                        }
                    }
                }
            }
        }

        console.log(this.summaryData);
    }


    getResponseData(httpResponse : any){
        let responsedata = httpResponse;
        let dr = this.dataReader.split(".");
        for(let ir = 0 ; ir<dr.length; ir++){
            responsedata = responsedata[dr[ir]];
        }
        return responsedata;
    }




    renderData(){
        if(this.pageSize > 1){
            let rowsTemp = this.data;
            let newRows = [];
            let startIndex = 1;
            let endIndex = this.pageSize;
            if(this.currentPage>1){
                startIndex  = (this.currentPage-1) * this.pageSize;
                endIndex = startIndex + this.pageSize;
            }

            while(startIndex<=endIndex){
                if(rowsTemp[startIndex]){
                    newRows.push(rowsTemp[startIndex]);
                }
                startIndex++;
            }

            this.viewRows = newRows;

        }else{
            this.viewRows = this.data;
        }

        this.selectedRowNo = -1;



    }

    sortData(){
        if(this.sortColumn){
            let sortColDataIndex : any;
            let sortOrder = this.sortBy;
            if(this.sortColumn.dataIndex && this.sortColumn.dataType){
                let dataIndex = this.sortColumn.dataIndex;
                sortColDataIndex = dataIndex;
                if(this.sortColumn.dataType == 'string'){
                    this.data.sort(function(a,b){

                        let x = a[sortColDataIndex].toLowerCase();
                        let y = b[sortColDataIndex].toLowerCase();

                        if(sortOrder == 2){
                            if (x < y) {return 1;}
                            if (x > y) {return -1;}
                        }else{
                            if (x < y) {return -1;}
                            if (x > y) {return 1;}
                        }

                        return 0;
                    });

                }
                else if(this.sortColumn.dataType == 'number'){
                    this.data.sort(function(a,b){
                        let x = a[sortColDataIndex];
                        let y = b[sortColDataIndex];

                        if(sortOrder == 2){
                            return y-x;
                        }else{
                            return x-y;
                        }

                    });

                }
            }
        }
        this.renderData();
    }

    next(){
        if(this.currentPage<this.maxPage){
            this.currentPage++;
        }
        this.renderData();
    }

    prev(){
        if(this.currentPage>1){
            this.currentPage--;
        }else{
            this.currentPage = 1;
        }
        this.renderData();
    }

    sortOnColHeaderClick(sortCol : any){
        if(this.sortBy == -1)
            this.sortBy = 1;
        else if (this.sortBy == 1)
            this.sortBy = 2;
        else if (this.sortBy == 2)
            this.sortBy = 1;

        this.setSortColumn(sortCol, this.sortBy);
    }

    setSortColumn(sortCol : any, _sortBy:number){

        this.sortBy = _sortBy;
        this.sortColumn = sortCol;
        this.sortData();
    }

    setPageNo(value : any){
        this.currentPage = value;
        this.renderData();
    }

    setUserPageNo(){
        this.renderData();
    }

    rowClick(rowData:any, rowIndex: any){
        this.rowSelect.emit(rowData);
        this.selectedRowNo = rowIndex;
    }

    isSelected(rowNo:any){
        return rowNo == this.selectedRowNo;
    }

    setColumnVisiblity(dataIndex : string){
        for(let ic = 0; ic<this.columns.length;ic++){
            let col = this.columns[ic];
            if(col.dataIndex == dataIndex){
                col.hidden = !col.hidden;
            }
        }
    }

    selectAllVisibleRows(){
        this.selectAll = !this.selectAll;

        if(this.selectAll)
        {
            for(let vr=0; vr<this.viewRows.length;vr++){
                this.selectedRows.push(this.viewRows[vr]);
            }
        }else{
            this.selectedRows = [];
        }
        this.emitSelectedRows();
    }

    setSelectedRow(rowData:any, event:any){
        if(event.currentTarget.checked){
            this.selectedRows.push(rowData);
        }
        else{
            let indexOf = this.selectedRows.indexOf(rowData);
            delete this.selectedRows[indexOf];
        }
        this.emitSelectedRows();
    }

    emitSelectedRows(){
        let sRows = [];
        for(let sr=0; sr<this.selectedRows.length;sr++){
            if(this.selectedRows[sr]){
                sRows.push(this.selectedRows[sr]);
            }
        }
        this.selectedRowData.emit(sRows);

    }

    onResize(event : any){
        if(event.target.innerWidth <768){
            this.smallScreen = true;
        }
        else{
            this.smallScreen = false;
        }
        console.log(this.smallScreen);
    }
}
