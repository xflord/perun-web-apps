!function(){function e(e,t){for(var a=0;a<t.length;a++){var i=t[a];i.enumerable=i.enumerable||!1,i.configurable=!0,"value"in i&&(i.writable=!0),Object.defineProperty(e,i.key,i)}}(self.webpackChunkperun_web_apps=self.webpackChunkperun_web_apps||[]).push([[592],{4359:function(t,a,i){"use strict";i.d(a,{D:function(){return k}});var n=i(31572),r=i(4230),l=i(58623),c=i(67033),o=i(27613),s=i(88426),u=i(82819),p=i(61511),h=i(29236),d=i(39571),f=i(48160),m=i(99373);function S(e,t){if(1&e){var a=n.EpF();n.TgZ(0,"th",14),n.TgZ(1,"mat-checkbox",15),n.NdJ("change",function(e){n.CHM(a);var t=n.oxw();return e?t.masterToggle():null}),n.qZA(),n.qZA()}if(2&e){var i=n.oxw();n.xp6(1),n.Q6J("aria-label",i.checkboxLabel())("checked",i.selection.hasValue()&&i.isAllSelected())("indeterminate",i.selection.hasValue()&&!i.isAllSelected())}}function g(e,t){if(1&e){var a=n.EpF();n.TgZ(0,"td",16),n.TgZ(1,"mat-checkbox",17),n.NdJ("change",function(e){var t=n.CHM(a).$implicit,i=n.oxw();return e?i.selection.toggle(t):null})("click",function(e){return e.stopPropagation()}),n.qZA(),n.qZA()}if(2&e){var i=t.$implicit,r=n.oxw();n.xp6(1),n.Q6J("aria-label",r.checkboxLabel(i))("checked",r.selection.isSelected(i))}}function x(e,t){1&e&&(n.TgZ(0,"th",18),n._uU(1),n.ALo(2,"translate"),n.qZA()),2&e&&(n.xp6(1),n.Oqu(n.lcZ(2,1,"SHARED.COMPONENTS.EXT_SOURCES_LIST.ID")))}function C(e,t){if(1&e&&(n.TgZ(0,"td",16),n._uU(1),n.qZA()),2&e){var a=t.$implicit;n.xp6(1),n.Oqu(a.id)}}function D(e,t){1&e&&(n.TgZ(0,"th",18),n._uU(1),n.ALo(2,"translate"),n.qZA()),2&e&&(n.xp6(1),n.Oqu(n.lcZ(2,1,"SHARED.COMPONENTS.EXT_SOURCES_LIST.NAME")))}function T(e,t){if(1&e&&(n.TgZ(0,"td",19),n._uU(1),n.qZA()),2&e){var a=t.$implicit;n.xp6(1),n.Oqu(a.name)}}function y(e,t){1&e&&(n.TgZ(0,"th",18),n._uU(1),n.ALo(2,"translate"),n.qZA()),2&e&&(n.xp6(1),n.Oqu(n.lcZ(2,1,"SHARED.COMPONENTS.EXT_SOURCES_LIST.TYPE")))}function v(e,t){if(1&e&&(n.TgZ(0,"td",19),n._uU(1),n.ALo(2,"extSourceType"),n.qZA()),2&e){var a=t.$implicit;n.xp6(1),n.Oqu(n.lcZ(2,1,a.type))}}function Z(e,t){1&e&&n._UZ(0,"tr",20)}function A(e,t){1&e&&n._UZ(0,"tr",21)}function O(e,t){1&e&&(n.TgZ(0,"app-alert",22),n._uU(1),n.ALo(2,"translate"),n.qZA()),2&e&&(n.xp6(1),n.hij(" ",n.lcZ(2,1,"SHARED.COMPONENTS.EXT_SOURCES_LIST.NO_EXT_SOURCES"),"\n"))}function b(e,t){1&e&&(n.TgZ(0,"app-alert",22),n._uU(1),n.ALo(2,"translate"),n.qZA()),2&e&&(n.xp6(1),n.hij(" ",n.lcZ(2,1,"SHARED.COMPONENTS.EXT_SOURCES_LIST.NO_FILTER_RESULTS"),"\n"))}var k=function(){var t=function(){function t(e,a){!function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,t),this.authResolver=e,this.tableCheckbox=a,this.selection=new r.Ov,this.filterValue="",this.displayedColumns=["select","id","name","type"],this.pageSize=5,this.page=new n.vpe,this.exporting=!1,this.pageSizeOptions=o.f7}var a,i,l;return a=t,(i=[{key:"matSort",set:function(e){this.sort=e,this.setDataSource()}},{key:"ngAfterViewInit",value:function(){this.setDataSource()}},{key:"ngOnChanges",value:function(){this.authResolver.isPerunAdminOrObserver()||(this.displayedColumns=this.displayedColumns.filter(function(e){return"id"!==e})),this.dataSource=new c.by(this.extSources),this.setDataSource()}},{key:"getDataForColumn",value:function(e,t){switch(t){case"id":return e.id.toString();case"type":return e.type.substring(40);case"name":return e.name;default:return""}}},{key:"exportData",value:function(e){(0,o.O6)((0,o.Xn)(this.dataSource.filteredData,this.displayedColumns,this.getDataForColumn,this),e)}},{key:"setDataSource",value:function(){var e=this;this.dataSource&&(this.dataSource.filterPredicate=function(t,a){return(0,o.Sd)(t,a,e.displayedColumns,e.getDataForColumn,e)},this.dataSource.sortData=function(t,a){return(0,o.pR)(t,a,e.getDataForColumn,e)},this.dataSource.sort=this.sort,this.dataSource.paginator=this.child.paginator,this.dataSource.filter=this.filterValue)}},{key:"isAllSelected",value:function(){return this.tableCheckbox.isAllSelected(this.selection.selected.length,this.filterValue,this.pageSize,this.child.paginator.hasNextPage(),this.dataSource)}},{key:"masterToggle",value:function(){this.tableCheckbox.masterToggle(this.isAllSelected(),this.selection,this.filterValue,this.dataSource,this.sort,this.pageSize,this.child.paginator.pageIndex,!1)}},{key:"checkboxLabel",value:function(e){return e?"".concat(this.selection.isSelected(e)?"deselect":"select"," row ").concat(e.id+1):(this.isAllSelected()?"select":"deselect")+" all"}}])&&e(a.prototype,i),l&&e(a,l),t}();return t.\u0275fac=function(e){return new(e||t)(n.Y36(s.x4),n.Y36(s.UA))},t.\u0275cmp=n.Xpm({type:t,selectors:[["app-ext-sources-list"]],viewQuery:function(e,t){var a;(1&e&&(n.Gf(o.l9,7),n.Gf(l.YE,7)),2&e)&&(n.iGM(a=n.CRH())&&(t.child=a.first),n.iGM(a=n.CRH())&&(t.matSort=a.first))},inputs:{extSources:"extSources",selection:"selection",filterValue:"filterValue",displayedColumns:"displayedColumns",pageSize:"pageSize"},outputs:{page:"page"},features:[n.TTD],decls:19,vars:9,consts:[[1,"card","mt-2",3,"hidden"],[3,"dataLength","pageSizeOptions","pageSize","exportData","page"],["mat-table","","matSort","","matSortActive","id","matSortDirection","asc","matSortDisableClear","",1,"w-100",3,"dataSource"],["matColumnDef","select"],["mat-header-cell","",4,"matHeaderCellDef"],["class","static-column-size","mat-cell","",4,"matCellDef"],["matColumnDef","id"],["mat-header-cell","","mat-sort-header","",4,"matHeaderCellDef"],["matColumnDef","name"],["mat-cell","",4,"matCellDef"],["matColumnDef","type"],["mat-header-row","",4,"matHeaderRowDef"],["class","dark-hover-list-item","mat-row","",4,"matRowDef","matRowDefColumns"],["alert_type","warn",4,"ngIf"],["mat-header-cell",""],["color","primary",3,"aria-label","checked","indeterminate","change"],["mat-cell","",1,"static-column-size"],["color","primary",3,"aria-label","checked","change","click"],["mat-header-cell","","mat-sort-header",""],["mat-cell",""],["mat-header-row",""],["mat-row","",1,"dark-hover-list-item"],["alert_type","warn"]],template:function(e,t){1&e&&(n.TgZ(0,"div",0),n.TgZ(1,"perun-web-apps-table-wrapper",1),n.NdJ("exportData",function(e){return t.exportData(e)})("page",function(e){return t.page.emit(e)}),n.TgZ(2,"table",2),n.ynx(3,3),n.YNc(4,S,2,3,"th",4),n.YNc(5,g,2,2,"td",5),n.BQk(),n.ynx(6,6),n.YNc(7,x,3,3,"th",7),n.YNc(8,C,2,1,"td",5),n.BQk(),n.ynx(9,8),n.YNc(10,D,3,3,"th",7),n.YNc(11,T,2,1,"td",9),n.BQk(),n.ynx(12,10),n.YNc(13,y,3,3,"th",7),n.YNc(14,v,3,3,"td",9),n.BQk(),n.YNc(15,Z,1,0,"tr",11),n.YNc(16,A,1,0,"tr",12),n.qZA(),n.qZA(),n.qZA(),n.YNc(17,O,3,3,"app-alert",13),n.YNc(18,b,3,3,"app-alert",13)),2&e&&(n.Q6J("hidden",0===t.extSources.length||0===t.dataSource.filteredData.length),n.xp6(1),n.Q6J("dataLength",t.dataSource.filteredData.length)("pageSizeOptions",t.pageSizeOptions)("pageSize",t.pageSize),n.xp6(1),n.Q6J("dataSource",t.dataSource),n.xp6(13),n.Q6J("matHeaderRowDef",t.displayedColumns),n.xp6(1),n.Q6J("matRowDefColumns",t.displayedColumns),n.xp6(1),n.Q6J("ngIf",0===t.extSources.length),n.xp6(1),n.Q6J("ngIf",0===t.dataSource.filteredData.length&&0!==t.extSources.length))},directives:[u.l,c.BZ,l.YE,c.w1,c.fO,c.Dz,c.as,c.nj,p.O5,c.ge,h.oG,c.ev,l.nU,c.XQ,c.Gk,d.w],pipes:[f.X$,m.A],styles:[""]}),t}()}}])}();