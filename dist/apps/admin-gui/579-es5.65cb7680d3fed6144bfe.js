!function(){function t(t,i){var n="undefined"!=typeof Symbol&&t[Symbol.iterator]||t["@@iterator"];if(!n){if(Array.isArray(t)||(n=function(t,i){if(!t)return;if("string"==typeof t)return e(t,i);var n=Object.prototype.toString.call(t).slice(8,-1);"Object"===n&&t.constructor&&(n=t.constructor.name);if("Map"===n||"Set"===n)return Array.from(t);if("Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))return e(t,i)}(t))||i&&t&&"number"==typeof t.length){n&&(t=n);var s=0,a=function(){};return{s:a,n:function(){return s>=t.length?{done:!0}:{done:!1,value:t[s++]}},e:function(t){throw t},f:a}}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}var r,c=!0,u=!1;return{s:function(){n=n.call(t)},n:function(){var t=n.next();return c=t.done,t},e:function(t){u=!0,r=t},f:function(){try{c||null==n.return||n.return()}finally{if(u)throw r}}}}function e(t,e){(null==e||e>t.length)&&(e=t.length);for(var i=0,n=new Array(e);i<e;i++)n[i]=t[i];return n}function i(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function n(t,e){for(var i=0;i<e.length;i++){var n=e[i];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(t,n.key,n)}}function s(t,e,i){return e&&n(t.prototype,e),i&&n(t,i),t}(self.webpackChunkperun_web_apps=self.webpackChunkperun_web_apps||[]).push([[579],{21575:function(t,e,n){"use strict";n.d(e,{A:function(){return u}});var a=n(17),r=n(31572),c=n(57629),u=function(){var t=function(){function t(){i(this,t)}return s(t,[{key:"prepareRoute",value:function(t){return t&&t.activatedRouteData&&t.activatedRouteData.animation}}]),t}();return t.\u0275fac=function(e){return new(e||t)},t.\u0275cmp=r.Xpm({type:t,selectors:[["app-animated-router-outlet"]],decls:3,vars:0,consts:[["outlet","outlet"]],template:function(t,e){1&t&&(r.TgZ(0,"div"),r._UZ(1,"router-outlet",null,0),r.qZA())},directives:[c.lC],styles:[""],data:{animation:[a.Ji]}}),t}()},40695:function(e,n,a){"use strict";a.d(n,{n:function(){return A}});var r=a(84608),c=a(4230),u=a(88426),o=a(33642),l=a(60611),d=(a(10896),a(31572)),f=a(48160),h=a(19139),b=a(61511),p=a(15980),g=a(39571),y=a(67806),m=a(41186),E=["list"];function S(t,e){1&t&&(d.TgZ(0,"app-alert",10),d._uU(1),d.ALo(2,"translate"),d.qZA()),2&t&&(d.xp6(1),d.hij(" ",d.lcZ(2,1,"DIALOGS.CREATE_ATTRIBUTE.ERROR_EMPTY_VALUE")," "))}function v(t,e){1&t&&d._UZ(0,"mat-spinner",11)}function I(t,e){if(1&t){var i=d.EpF();d.TgZ(0,"perun-web-apps-attributes-list",12,13),d.NdJ("page",function(t){return d.CHM(i),d.oxw().pageChanged(t)}),d.qZA()}if(2&t){var n=d.oxw();d.Q6J("attributes",n.attributes)("filterValue",n.filterValue)("inDialog",!0)("emptyListText","SHARED_LIB.PERUN.COMPONENTS.ATTRIBUTES_LIST.EMPTY_ATTRIBUTES")("pageSize",n.pageSize)("selection",n.selected)}}var A=function(){var e=function(){function e(t,n,s,a,r,u){var o=this;i(this,e),this.dialogRef=t,this.data=n,this.attributesManager=s,this.notificator=a,this.tableConfigService=r,this.translate=u,this.selected=new c.Ov(!0,[]),this.showError=!1,this.filterValue="",this.tableId=l.rF,this.translate.get("DIALOGS.CREATE_ATTRIBUTE.SUCCESS_SAVE").subscribe(function(t){return o.saveSuccessMessage=t})}return s(e,[{key:"ngOnInit",value:function(){var t=this;this.pageSize=this.tableConfigService.getTablePageSize(this.tableId);var e,i,n,s,a,r,c,u,o=new Array;switch(this.data.notEmptyAttributes.forEach(function(t){o.push(t.id)}),this.data.entity){case"member":e=this.data.entityId;break;case"user":i=this.data.entityId;break;case"vo":n=this.data.entityId;break;case"group":s=this.data.entityId;break;case"resource":a=this.data.entityId;break;case"facility":r=this.data.entityId;break;case"host":c=this.data.entityId;break;case"ues":u=this.data.entityId}switch(this.data.secondEntity){case"member":e=this.data.secondEntityId;break;case"user":i=this.data.secondEntityId;break;case"vo":n=this.data.secondEntityId;break;case"group":s=this.data.secondEntityId;break;case"resource":a=this.data.secondEntityId;break;case"facility":r=this.data.secondEntityId;break;case"host":c=this.data.secondEntityId;break;case"ues":u=this.data.secondEntityId}this.loading=!0,this.attributesManager.getAttributesDefinitionWithRights(e,i,n,s,a,r,c,u).subscribe(function(e){t.attributes=e,t.attributes=t.attributes.filter(function(e){return!o.includes(e.id)&&t.twoEntityValid(e)}),t.loading=!1})}},{key:"onCancel",value:function(){this.dialogRef.close()}},{key:"onSave",value:function(){var e=this;this.list.updateMapAttributes();var i,n=!1,s=t(this.selected.selected);try{for(s.s();!(i=s.n()).done;){var a=i.value;"java.util.ArrayList"===a.type&&0===a.value.length&&(n=!0),void 0===a.value&&(n=!0)}}catch(r){s.e(r)}finally{s.f()}if(n)return this.showError=!0,void setTimeout(function(){e.showError=!1},5e3);switch(this.data.entity){case"facility":this.attributesManager.setFacilityAttributes({facility:this.data.entityId,attributes:this.selected.selected}).subscribe(function(){e.handleSuccess()});break;case"group":switch(this.data.secondEntity){case"resource":this.attributesManager.setGroupResourceAttributes({group:this.data.entityId,resource:this.data.secondEntityId,attributes:this.selected.selected}).subscribe(function(){e.handleSuccess()});break;default:this.attributesManager.setGroupAttributes({group:this.data.entityId,attributes:this.selected.selected}).subscribe(function(){e.handleSuccess()})}break;case"member":switch(this.data.secondEntity){case"resource":this.attributesManager.setMemberResourceAttributes({member:this.data.entityId,resource:this.data.secondEntityId,attributes:this.selected.selected}).subscribe(function(){e.handleSuccess()});break;case"group":this.attributesManager.setMemberGroupAttributes({member:this.data.entityId,group:this.data.secondEntityId,attributes:this.selected.selected}).subscribe(function(){e.handleSuccess()});break;default:this.attributesManager.setMemberAttributes({member:this.data.entityId,attributes:this.selected.selected}).subscribe(function(){e.handleSuccess()})}break;case"resource":this.attributesManager.setResourceAttributes({resource:this.data.entityId,attributes:this.selected.selected}).subscribe(function(){e.handleSuccess()});break;case"user":switch(this.data.secondEntity){case"facility":this.attributesManager.setUserFacilityAttributes({user:this.data.entityId,facility:this.data.secondEntityId,attributes:this.selected.selected}).subscribe(function(){e.handleSuccess()});break;default:this.attributesManager.setUserAttributes({user:this.data.entityId,attributes:this.selected.selected}).subscribe(function(){e.handleSuccess()})}break;case"vo":this.attributesManager.setVoAttributes({vo:this.data.entityId,attributes:this.selected.selected}).subscribe(function(){e.handleSuccess()});break;case"host":this.attributesManager.setHostAttributes({host:this.data.entityId,attributes:this.selected.selected}).subscribe(function(){e.handleSuccess()})}}},{key:"applyFilter",value:function(t){this.filterValue=t}},{key:"handleSuccess",value:function(){this.notificator.showSuccess(this.saveSuccessMessage),this.selected.clear(),this.dialogRef.close("saved")}},{key:"pageChanged",value:function(t){this.pageSize=t.pageSize,this.tableConfigService.setTablePageSize(this.tableId,t.pageSize)}},{key:"twoEntityValid",value:function(t){return!this.data.secondEntity||t.entity==="".concat(this.data.entity,"_").concat(this.data.secondEntity)}}]),e}();return e.\u0275fac=function(t){return new(t||e)(d.Y36(r.so),d.Y36(r.WI),d.Y36(o.H8),d.Y36(u.V6),d.Y36(l.dB),d.Y36(f.sK))},e.\u0275cmp=d.Xpm({type:e,selectors:[["app-create-attribute-dialog"]],viewQuery:function(t,e){var i;(1&t&&d.Gf(E,5),2&t)&&(d.iGM(i=d.CRH())&&(e.list=i.first))},decls:17,vars:17,consts:[["mat-dialog-title",""],[1,"page-subtitle"],[1,"font-size-1rem",3,"placeholder","filter"],["class","ml-3 font-size-1rem","alert_type","error",4,"ngIf"],["mat-dialog-content",""],["class","ml-auto mr-auto",4,"ngIf"],[3,"attributes","filterValue","inDialog","emptyListText","pageSize","selection","page",4,"ngIf"],["mat-dialog-actions",""],["mat-flat-button","",1,"ml-auto",3,"click"],["color","accent","mat-flat-button","",1,"ml-2",3,"disabled","click"],["alert_type","error",1,"ml-3","font-size-1rem"],[1,"ml-auto","mr-auto"],[3,"attributes","filterValue","inDialog","emptyListText","pageSize","selection","page"],["list",""]],template:function(t,e){1&t&&(d.TgZ(0,"div"),d.TgZ(1,"div",0),d.TgZ(2,"h1",1),d._uU(3),d.ALo(4,"translate"),d.qZA(),d.TgZ(5,"perun-web-apps-immediate-filter",2),d.NdJ("filter",function(t){return e.applyFilter(t)}),d.qZA(),d.YNc(6,S,3,3,"app-alert",3),d.qZA(),d.TgZ(7,"div",4),d.YNc(8,v,1,0,"mat-spinner",5),d.YNc(9,I,2,6,"perun-web-apps-attributes-list",6),d.qZA(),d.TgZ(10,"div",7),d.TgZ(11,"button",8),d.NdJ("click",function(){return e.onCancel()}),d._uU(12),d.ALo(13,"translate"),d.qZA(),d.TgZ(14,"button",9),d.NdJ("click",function(){return e.onSave()}),d._uU(15),d.ALo(16,"translate"),d.qZA(),d.qZA(),d.qZA()),2&t&&(d.Tol(e.data.style),d.xp6(3),d.Oqu(d.lcZ(4,11,"DIALOGS.CREATE_ATTRIBUTE.SET_NEW")),d.xp6(2),d.Q6J("placeholder","SHARED_LIB.PERUN.COMPONENTS.ATTRIBUTES_LIST.FILTER"),d.xp6(1),d.Q6J("ngIf",e.showError),d.xp6(2),d.Q6J("ngIf",e.loading),d.xp6(1),d.Q6J("ngIf",void 0!==e.attributes&&!e.loading),d.xp6(3),d.hij(" ",d.lcZ(13,13,"DIALOGS.CREATE_ATTRIBUTE.CANCEL")," "),d.xp6(2),d.Q6J("disabled",0===e.selected.selected.length),d.xp6(1),d.hij(" ",d.lcZ(16,15,"DIALOGS.CREATE_ATTRIBUTE.SAVE")," "))},directives:[r.uh,h.L,b.O5,r.xY,r.H8,p.lW,g.w,y.$g,m.p],pipes:[f.X$],styles:[".font-size-1rem[_ngcontent-%COMP%]{font-size:1rem!important}"]}),e}()},13572:function(e,n,a){"use strict";a.d(n,{k:function(){return v}});var r=a(84608),c=a(67033),u=a(88426),o=a(33642),l=a(31572),d=a(48160),f=a(61511),h=a(15980),b=a(67806);function p(t,e){1&t&&l._UZ(0,"mat-spinner",6)}function g(t,e){1&t&&l._UZ(0,"th",15)}function y(t,e){if(1&t&&(l.TgZ(0,"td",16),l._uU(1),l.qZA()),2&t){var i=e.$implicit;l.xp6(1),l.hij(" ",i.displayName," ")}}function m(t,e){1&t&&l._UZ(0,"tr",17)}function E(t,e){1&t&&l._UZ(0,"tr",18)}function S(t,e){if(1&t&&(l.TgZ(0,"div",7),l.TgZ(1,"div"),l._uU(2),l.ALo(3,"translate"),l.qZA(),l.TgZ(4,"div",8),l._uU(5),l.ALo(6,"translate"),l.qZA(),l.TgZ(7,"table",9),l.ynx(8,10),l.YNc(9,g,1,0,"th",11),l.YNc(10,y,2,1,"td",12),l.BQk(),l.YNc(11,m,1,0,"tr",13),l.YNc(12,E,1,0,"tr",14),l.qZA(),l.qZA()),2&t){var i=l.oxw();l.xp6(2),l.hij(" ",l.lcZ(3,5,"DIALOGS.DELETE_ATTRIBUTES.DESCRIPTION")," "),l.xp6(3),l.hij(" ",l.lcZ(6,7,"DIALOGS.DELETE_ATTRIBUTES.ASK")," "),l.xp6(2),l.Q6J("dataSource",i.dataSource),l.xp6(4),l.Q6J("matHeaderRowDef",i.displayedColumns),l.xp6(1),l.Q6J("matRowDefColumns",i.displayedColumns)}}var v=function(){var e=function(){function e(t,n,s,a,r){i(this,e),this.dialogRef=t,this.data=n,this.notificator=s,this.translate=a,this.attributesManager=r,this.displayedColumns=["name"],this.loading=!1}return s(e,[{key:"ngOnInit",value:function(){this.dataSource=new c.by(this.data.attributes),this.theme=this.data.theme}},{key:"onCancel",value:function(){this.dialogRef.close(!1)}},{key:"onSubmit",value:function(){var e,i=this,n=[],s=t(this.data.attributes);try{for(s.s();!(e=s.n()).done;){var a=e.value;n.push(a.id)}}catch(c){s.e(c)}finally{s.f()}var r={};switch(r[this.data.entity]=this.data.entityId,r.attributes=n,void 0!==this.data.secondEntity&&(r[this.data.secondEntity]=this.data.secondEntityId),this.loading=!0,this.data.entity){case"vo":this.attributesManager.removeVoAttributes(this.data.entityId,n).subscribe(function(){i.onSuccess()},function(){return i.loading=!1});break;case"group":switch(this.data.secondEntity){case"resource":this.attributesManager.removeGroupResourceAttributes(this.data.entityId,this.data.secondEntityId,n).subscribe(function(){i.onSuccess()},function(){return i.loading=!1});break;default:this.attributesManager.removeGroupAttributes(this.data.entityId,n).subscribe(function(){i.onSuccess()},function(){return i.loading=!1})}break;case"user":switch(this.data.secondEntity){case"facility":this.attributesManager.removeUserFacilityAttributes(this.data.entityId,this.data.secondEntityId,n).subscribe(function(){i.onSuccess()},function(){return i.loading=!1});break;default:this.attributesManager.removeUserAttributes(this.data.entityId,n).subscribe(function(){i.onSuccess()},function(){return i.loading=!1})}break;case"member":switch(this.data.secondEntity){case"resource":this.attributesManager.removeMemberResourceAttributes(this.data.entityId,this.data.secondEntityId,n).subscribe(function(){i.onSuccess()},function(){return i.loading=!1});break;case"group":this.attributesManager.removeMemberGroupAttributes(this.data.entityId,this.data.secondEntityId,n).subscribe(function(){i.onSuccess()},function(){return i.loading=!1});break;default:this.attributesManager.removeMemberAttributes(this.data.entityId,n).subscribe(function(){i.onSuccess()},function(){return i.loading=!1})}break;case"facility":this.attributesManager.removeFacilityAttributes(this.data.entityId,n).subscribe(function(){i.onSuccess()},function(){return i.loading=!1});break;case"host":this.attributesManager.removeHostAttributes(this.data.entityId,n).subscribe(function(){i.onSuccess()},function(){return i.loading=!1});break;case"ues":this.attributesManager.removeUesAttributes(this.data.entityId,n).subscribe(function(){i.onSuccess()});break;case"resource":this.attributesManager.removeResourceAttributes(this.data.entityId,n).subscribe(function(){return i.onSuccess()})}}},{key:"onSuccess",value:function(){var t=this;this.translate.get("DIALOGS.DELETE_ATTRIBUTES.SUCCESS").subscribe(function(e){t.notificator.showSuccess(e),t.dialogRef.close(!0)})}}]),e}();return e.\u0275fac=function(t){return new(t||e)(l.Y36(r.so),l.Y36(r.WI),l.Y36(u.V6),l.Y36(d.sK),l.Y36(o.H8))},e.\u0275cmp=l.Xpm({type:e,selectors:[["app-delete-attribute-dialog"]],decls:13,vars:15,consts:[["mat-dialog-title",""],["class","ml-auto mr-auto",4,"ngIf"],["mat-dialog-content","",4,"ngIf"],["mat-dialog-actions",""],["mat-flat-button","",1,"ml-auto",3,"click"],["mat-flat-button","","color","warn",1,"ml-2",3,"disabled","click"],[1,"ml-auto","mr-auto"],["mat-dialog-content",""],[1,"font-weight-bold"],["mat-table","",1,"w-100",3,"dataSource"],["matColumnDef","name"],["mat-header-cell","",4,"matHeaderCellDef"],["mat-cell","",4,"matCellDef"],["mat-header-row","","class","font-weight-bolder",4,"matHeaderRowDef"],["mat-row","",4,"matRowDef","matRowDefColumns"],["mat-header-cell",""],["mat-cell",""],["mat-header-row","",1,"font-weight-bolder"],["mat-row",""]],template:function(t,e){1&t&&(l.TgZ(0,"div"),l.TgZ(1,"h1",0),l._uU(2),l.ALo(3,"translate"),l.qZA(),l.YNc(4,p,1,0,"mat-spinner",1),l.YNc(5,S,13,9,"div",2),l.TgZ(6,"div",3),l.TgZ(7,"button",4),l.NdJ("click",function(){return e.onCancel()}),l._uU(8),l.ALo(9,"translate"),l.qZA(),l.TgZ(10,"button",5),l.NdJ("click",function(){return e.onSubmit()}),l._uU(11),l.ALo(12,"translate"),l.qZA(),l.qZA(),l.qZA()),2&t&&(l.Tol(e.theme),l.xp6(2),l.Oqu(l.lcZ(3,9,"DIALOGS.DELETE_ATTRIBUTES.TITLE")),l.xp6(2),l.Q6J("ngIf",e.loading),l.xp6(1),l.Q6J("ngIf",!e.loading),l.xp6(3),l.hij(" ",l.lcZ(9,11,"DIALOGS.DELETE_ATTRIBUTES.CANCEL")," "),l.xp6(2),l.Q6J("disabled",e.loading),l.xp6(1),l.hij(" ",l.lcZ(12,13,"DIALOGS.DELETE_ATTRIBUTES.DELETE")," "))},directives:[r.uh,f.O5,r.H8,h.lW,b.$g,r.xY,c.BZ,c.w1,c.fO,c.Dz,c.as,c.nj,c.ge,c.ev,c.XQ,c.Gk],pipes:[d.X$],styles:[""]}),e}()},541:function(t,e,n){"use strict";n.d(e,{t:function(){return T}});var a=n(33642),r=n(4230),c=n(84140),u=n(40695),o=n(61189),l=n(13572),d=(n(10896),n(60611)),f=n(31572),h=n(84608),b=n(59403),p=n(15980),g=n(19139),y=n(61511),m=n(67806),E=n(41186),S=n(48160),v=["list"];function I(t,e){1&t&&f._UZ(0,"mat-spinner",7)}function A(t,e){if(1&t){var i=f.EpF();f.TgZ(0,"perun-web-apps-attributes-list",8,9),f.NdJ("page",function(t){return f.CHM(i),f.oxw().pageChanged(t)}),f.qZA()}if(2&t){var n=f.oxw();f.Q6J("pageSize",n.pageSize)("filterValue",n.filterValue)("attributes",n.attributes)("selection",n.selection)}}var T=function(){var t=function(){function t(e,n,s){i(this,t),this.attributesManagerService=e,this.tableConfigService=n,this.dialog=s,this.attributes=[],this.selection=new r.Ov(!0,[]),this.filterValue="",this.tableId=d.rF,this.loading=!1}return s(t,[{key:"ngOnInit",value:function(){this.pageSize=this.tableConfigService.getTablePageSize(this.tableId),this.refreshTable()}},{key:"refreshTable",value:function(){var t=this;switch(this.loading=!0,this.entity){case"member":this.attributesManagerService.getMemberAttributes(this.entityId).subscribe(function(e){t.attributes=e,t.selection.clear(),t.loading=!1});break;case"group":this.attributesManagerService.getGroupAttributes(this.entityId).subscribe(function(e){t.attributes=e,t.selection.clear(),t.loading=!1});break;case"user":this.attributesManagerService.getUserAttributes(this.entityId).subscribe(function(e){t.attributes=e,t.selection.clear(),t.loading=!1});break;case"resource":this.attributesManagerService.getResourceAttributes(this.entityId).subscribe(function(e){t.attributes=e,t.selection.clear(),t.loading=!1});break;case"facility":this.attributesManagerService.getFacilityAttributes(this.entityId).subscribe(function(e){t.attributes=e,t.selection.clear(),t.loading=!1});break;case"vo":this.attributesManagerService.getVoAttributes(this.entityId).subscribe(function(e){t.attributes=e,t.selection.clear(),t.loading=!1})}}},{key:"applyFilter",value:function(t){this.filterValue=t}},{key:"pageChanged",value:function(t){this.pageSize=t.pageSize,this.tableConfigService.setTablePageSize(this.tableId,t.pageSize)}},{key:"onCreate",value:function(){var t=this,e=(0,c.kZ)();e.width="1050px",e.data={entityId:this.entityId,entity:this.entity,notEmptyAttributes:this.attributes,style:this.entity+"-theme"},this.dialog.open(u.n,e).afterClosed().subscribe(function(e){e&&t.refreshTable()})}},{key:"onSave",value:function(){var t=this;this.list.updateMapAttributes();var e=(0,c.kZ)();e.width="450px",e.data={entityId:this.entityId,entity:this.entity,attributes:this.selection.selected},this.dialog.open(o.wA,e).afterClosed().subscribe(function(e){e&&t.refreshTable()})}},{key:"onDelete",value:function(){var t=this,e=(0,c.kZ)();e.width="450px",e.data={entityId:this.entityId,entity:this.entity,attributes:this.selection.selected},this.dialog.open(l.k,e).afterClosed().subscribe(function(e){e&&t.refreshTable()})}}]),t}();return t.\u0275fac=function(e){return new(e||t)(f.Y36(a.H8),f.Y36(d.dB),f.Y36(h.uw))},t.\u0275cmp=f.Xpm({type:t,selectors:[["app-one-entity-attribute-page"]],viewQuery:function(t,e){var i;(1&t&&f.Gf(v,5),2&t)&&(f.iGM(i=f.CRH())&&(e.list=i.first))},inputs:{entity:"entity",entityId:"entityId"},decls:13,vars:14,consts:[[1,"mt-2",3,"refresh"],["mat-flat-button","","color","accent",1,"mr-2","mt-2",3,"click"],["mat-flat-button","","color","accent",1,"mr-2","mt-2",3,"disabled","click"],["mat-flat-button","","color","warn",1,"mt-2",3,"disabled","click"],[3,"placeholder","filter"],["class","ml-auto mr-auto",4,"ngIf"],[3,"pageSize","filterValue","attributes","selection","page",4,"ngIf"],[1,"ml-auto","mr-auto"],[3,"pageSize","filterValue","attributes","selection","page"],["list",""]],template:function(t,e){1&t&&(f.TgZ(0,"perun-web-apps-refresh-button",0),f.NdJ("refresh",function(){return e.refreshTable()}),f.qZA(),f.TgZ(1,"button",1),f.NdJ("click",function(){return e.onCreate()}),f._uU(2),f.ALo(3,"translate"),f.qZA(),f.TgZ(4,"button",2),f.NdJ("click",function(){return e.onSave()}),f._uU(5),f.ALo(6,"translate"),f.qZA(),f.TgZ(7,"button",3),f.NdJ("click",function(){return e.onDelete()}),f._uU(8),f.ALo(9,"translate"),f.qZA(),f.TgZ(10,"perun-web-apps-immediate-filter",4),f.NdJ("filter",function(t){return e.applyFilter(t)}),f.qZA(),f.YNc(11,I,1,0,"mat-spinner",5),f.YNc(12,A,2,4,"perun-web-apps-attributes-list",6)),2&t&&(f.xp6(2),f.hij(" ",f.lcZ(3,8,"USER_DETAIL.SETTINGS.ATTRIBUTES.CREATE"),"\n"),f.xp6(2),f.Q6J("disabled",0===e.selection.selected.length),f.xp6(1),f.hij(" ",f.lcZ(6,10,"USER_DETAIL.SETTINGS.ATTRIBUTES.SAVE"),"\n"),f.xp6(2),f.Q6J("disabled",0===e.selection.selected.length),f.xp6(1),f.hij(" ",f.lcZ(9,12,"USER_DETAIL.SETTINGS.ATTRIBUTES.DELETE"),"\n"),f.xp6(2),f.Q6J("placeholder","SHARED_LIB.PERUN.COMPONENTS.ATTRIBUTES_LIST.FILTER"),f.xp6(1),f.Q6J("ngIf",e.loading),f.xp6(1),f.Q6J("ngIf",!e.loading))},directives:[b.t,p.lW,g.L,y.O5,m.$g,E.p],pipes:[S.X$],styles:[""]}),t}()},69012:function(e,n,a){"use strict";a.d(n,{Y:function(){return F}});var r=a(33642),c=(a(10896),a(4230)),u=a(13572),o=a(84140),l=a(61189),d=a(40695),f=a(67004),h=a(31572),b=a(84608),p=a(61511),g=a(67806),y=a(39571),m=a(59403),E=a(15980),S=a(37665),v=a(44973),I=a(48160),A=function(){var t=function(){function t(){i(this,t),this.resourceSelected=new h.vpe,this.nameFunction=function(t){return t.name}}return s(t,[{key:"ngOnInit",value:function(){this.resources=this.resources.sort(o.aC)}}]),t}();return t.\u0275fac=function(e){return new(e||t)},t.\u0275cmp=h.Xpm({type:t,selectors:[["perun-web-apps-resource-search-select"]],inputs:{resources:"resources"},outputs:{resourceSelected:"resourceSelected"},decls:4,vars:13,consts:[[3,"entities","displayStatus","searchFunction","mainTextFunction","selectPlaceholder","findPlaceholder","noEntriesText","entitySelected"]],template:function(t,e){1&t&&(h.TgZ(0,"perun-web-apps-entity-search-select",0),h.NdJ("entitySelected",function(t){return e.resourceSelected.emit(t)}),h.ALo(1,"translate"),h.ALo(2,"translate"),h.ALo(3,"translate"),h.qZA()),2&t&&h.Q6J("entities",e.resources)("displayStatus",!0)("searchFunction",e.nameFunction)("mainTextFunction",e.nameFunction)("selectPlaceholder",h.lcZ(1,7,"SHARED_LIB.PERUN.COMPONENTS.RESOURCE_SEARCH_SELECT.SELECT_RESOURCE"))("findPlaceholder",h.lcZ(2,9,"SHARED_LIB.PERUN.COMPONENTS.RESOURCE_SEARCH_SELECT.FIND_RESOURCE"))("noEntriesText",h.lcZ(3,11,"SHARED_LIB.PERUN.COMPONENTS.RESOURCE_SEARCH_SELECT.NO_RESOURCE_FOUND"))},directives:[v.i],pipes:[I.X$],styles:[""]}),t}(),T=function(){var t=function(){function t(){i(this,t),this.memberSelected=new h.vpe,this.memberFullNameFunction=function(t){return(0,o.bD)(t.user)}}return s(t,[{key:"ngOnInit",value:function(){this.members=this.members.sort(o.fx)}}]),t}();return t.\u0275fac=function(e){return new(e||t)},t.\u0275cmp=h.Xpm({type:t,selectors:[["perun-web-apps-member-search-select"]],inputs:{members:"members"},outputs:{memberSelected:"memberSelected"},decls:4,vars:12,consts:[[3,"entities","searchFunction","mainTextFunction","selectPlaceholder","findPlaceholder","noEntriesText","entitySelected"]],template:function(t,e){1&t&&(h.TgZ(0,"perun-web-apps-entity-search-select",0),h.NdJ("entitySelected",function(t){return e.memberSelected.emit(t)}),h.ALo(1,"translate"),h.ALo(2,"translate"),h.ALo(3,"translate"),h.qZA()),2&t&&h.Q6J("entities",e.members)("searchFunction",e.memberFullNameFunction)("mainTextFunction",e.memberFullNameFunction)("selectPlaceholder",h.lcZ(1,6,"SHARED_LIB.PERUN.COMPONENTS.MEMBER_SEARCH_SELECT.SELECT_MEMBER"))("findPlaceholder",h.lcZ(2,8,"SHARED_LIB.PERUN.COMPONENTS.MEMBER_SEARCH_SELECT.FIND_MEMBER"))("noEntriesText",h.lcZ(3,10,"SHARED_LIB.PERUN.COMPONENTS.MEMBER_SEARCH_SELECT.NO_MEMBER_FOUND"))},directives:[v.i],pipes:[I.X$],styles:[""]}),t}(),w=function(){var t=function(){function t(){i(this,t),this.facilitySelected=new h.vpe,this.nameFunction=function(t){return t.name}}return s(t,[{key:"ngOnInit",value:function(){this.facilities=this.facilities.sort(o.aC)}}]),t}();return t.\u0275fac=function(e){return new(e||t)},t.\u0275cmp=h.Xpm({type:t,selectors:[["perun-web-apps-facility-search-select"]],inputs:{facilities:"facilities"},outputs:{facilitySelected:"facilitySelected"},decls:4,vars:12,consts:[[3,"entities","searchFunction","mainTextFunction","selectPlaceholder","findPlaceholder","noEntriesText","entitySelected"]],template:function(t,e){1&t&&(h.TgZ(0,"perun-web-apps-entity-search-select",0),h.NdJ("entitySelected",function(t){return e.facilitySelected.emit(t)}),h.ALo(1,"translate"),h.ALo(2,"translate"),h.ALo(3,"translate"),h.qZA()),2&t&&h.Q6J("entities",e.facilities)("searchFunction",e.nameFunction)("mainTextFunction",e.nameFunction)("selectPlaceholder",h.lcZ(1,6,"SHARED_LIB.PERUN.COMPONENTS.FACILITY_SEARCH_SELECT.SELECT_FACILITY"))("findPlaceholder",h.lcZ(2,8,"SHARED_LIB.PERUN.COMPONENTS.FACILITY_SEARCH_SELECT.FIND_FACILITY"))("noEntriesText",h.lcZ(3,10,"SHARED_LIB.PERUN.COMPONENTS.FACILITY_SEARCH_SELECT.NO_FACILITY_FOUND"))},directives:[v.i],pipes:[I.X$],styles:[""]}),t}(),M=a(7927),Z=a(41186),k=["list"];function C(t,e){1&t&&h._UZ(0,"mat-spinner",4)}function R(t,e){if(1&t&&(h.TgZ(0,"app-alert",5),h._uU(1),h.qZA()),2&t){var i=h.oxw();h.xp6(1),h.Oqu(i.noEntityMessage)}}function x(t,e){if(1&t){var i=h.EpF();h.TgZ(0,"perun-web-apps-group-search-select",17),h.NdJ("groupSelected",function(t){return h.CHM(i),h.oxw(2).specifySecondEntity(t)}),h.qZA()}if(2&t){var n=h.oxw(2);h.Q6J("groups",n.entityValues)("firstSelectedGroup",n.specificSecondEntity)("displayStatus",!0)}}function _(t,e){if(1&t){var i=h.EpF();h.TgZ(0,"perun-web-apps-resource-search-select",18),h.NdJ("resourceSelected",function(t){return h.CHM(i),h.oxw(2).specifySecondEntity(t)}),h.qZA()}if(2&t){var n=h.oxw(2);h.Q6J("resources",n.entityValues)}}function L(t,e){if(1&t){var i=h.EpF();h.TgZ(0,"perun-web-apps-member-search-select",19),h.NdJ("memberSelected",function(t){return h.CHM(i),h.oxw(2).specifySecondEntity(t)}),h.qZA()}if(2&t){var n=h.oxw(2);h.Q6J("members",n.entityValues)}}function N(t,e){if(1&t){var i=h.EpF();h.TgZ(0,"perun-web-apps-facility-search-select",20),h.NdJ("facilitySelected",function(t){return h.CHM(i),h.oxw(2).specifySecondEntity(t)}),h.qZA()}if(2&t){var n=h.oxw(2);h.Q6J("facilities",n.entityValues)}}function O(t,e){if(1&t){var i=h.EpF();h.TgZ(0,"perun-web-apps-user-search-select",21),h.NdJ("userSelected",function(t){return h.CHM(i),h.oxw(2).specifySecondEntity(t)}),h.qZA()}if(2&t){var n=h.oxw(2);h.Q6J("users",n.entityValues)}}function U(t,e){1&t&&h._UZ(0,"mat-spinner",4)}function D(t,e){if(1&t&&h._UZ(0,"perun-web-apps-attributes-list",22,23),2&t){var i=h.oxw(2);h.Q6J("attributes",i.attributes)("selection",i.selection)}}function J(t,e){if(1&t){var i=h.EpF();h.TgZ(0,"div"),h.TgZ(1,"div",6),h.YNc(2,x,1,3,"perun-web-apps-group-search-select",7),h.YNc(3,_,1,1,"perun-web-apps-resource-search-select",8),h.YNc(4,L,1,1,"perun-web-apps-member-search-select",9),h.YNc(5,N,1,1,"perun-web-apps-facility-search-select",10),h.YNc(6,O,1,1,"perun-web-apps-user-search-select",11),h.qZA(),h.TgZ(7,"perun-web-apps-refresh-button",12),h.NdJ("refresh",function(){h.CHM(i);var t=h.oxw();return t.getAttributes(t.specificSecondEntity.id)}),h.qZA(),h.TgZ(8,"button",13),h.NdJ("click",function(){h.CHM(i);var t=h.oxw();return t.onAdd(t.specificSecondEntity.id)}),h._uU(9),h.ALo(10,"translate"),h.qZA(),h.TgZ(11,"button",14),h.NdJ("click",function(){h.CHM(i);var t=h.oxw();return t.onSave(t.specificSecondEntity.id)}),h._uU(12),h.ALo(13,"translate"),h.qZA(),h.TgZ(14,"button",15),h.NdJ("click",function(){h.CHM(i);var t=h.oxw();return t.onDelete(t.specificSecondEntity.id)}),h._uU(15),h.ALo(16,"translate"),h.qZA(),h.YNc(17,U,1,0,"mat-spinner",1),h.YNc(18,D,2,2,"perun-web-apps-attributes-list",16),h.qZA()}if(2&t){var n=h.oxw();h.xp6(2),h.Q6J("ngIf","group"===n.secondEntity),h.xp6(1),h.Q6J("ngIf","resource"===n.secondEntity),h.xp6(1),h.Q6J("ngIf","member"===n.secondEntity),h.xp6(1),h.Q6J("ngIf","facility"===n.secondEntity),h.xp6(1),h.Q6J("ngIf","user"===n.secondEntity),h.xp6(3),h.hij(" ",h.lcZ(10,12,"MEMBER_DETAIL.SETTINGS.ATTRIBUTES.CREATE")," "),h.xp6(2),h.Q6J("disabled",0===n.selection.selected.length),h.xp6(1),h.hij(" ",h.lcZ(13,14,"MEMBER_DETAIL.SETTINGS.ATTRIBUTES.SAVE")," "),h.xp6(2),h.Q6J("disabled",0===n.selection.selected.length),h.xp6(1),h.hij(" ",h.lcZ(16,16,"MEMBER_DETAIL.SETTINGS.ATTRIBUTES.DELETE")," "),h.xp6(2),h.Q6J("ngIf",n.innerLoading),h.xp6(1),h.Q6J("ngIf",!n.innerLoading)}}var F=function(){var e=function(){function e(t,n,s,a,r,u){i(this,e),this.attributesManagerService=t,this.resourcesManagerService=n,this.facilitiesManagerService=s,this.groupsManagerService=a,this.membersManager=r,this.dialog=u,this.entityValues=[],this.attributes=[],this.selection=new c.Ov(!0,[]),this.allowedStatuses=["INVALID","VALID"],this.loading=!1,this.innerLoading=!1}return s(e,[{key:"ngOnInit",value:function(){this.loadEntityValues(),this.setMessages(this.secondEntity.toLowerCase())}},{key:"loadEntityValues",value:function(){var t=this;switch(this.loading=!0,this.firstEntity){case"member":switch(this.secondEntity){case"resource":this.resourcesManagerService.getAssignedResourcesWithStatus(this.firstEntityId).subscribe(function(e){t.entityValues=e.map(function(t){return t.enrichedResource.resource}),t.preselectEntity(),t.loading=!1});break;case"group":this.groupsManagerService.getMemberGroups(this.firstEntityId).subscribe(function(e){t.entityValues=e,t.preselectEntity(),t.loading=!1})}break;case"group":switch(this.secondEntity){case"resource":this.resourcesManagerService.getResourceAssignments(this.firstEntityId).subscribe(function(e){t.entityValues=e.map(function(t){var e=t.enrichedResource.resource;return e.status=t.status,e}),t.preselectEntity(),t.loading=!1});break;case"member":this.membersManager.getCompleteRichMembersForGroup(this.firstEntityId,!1,this.allowedStatuses,null,[f.r.MEMBER_CORE_ID]).subscribe(function(e){t.entityValues=e,t.preselectEntity(),t.loading=!1})}break;case"user":this.facilitiesManagerService.getAssignedFacilitiesByUser(this.firstEntityId).subscribe(function(e){t.entityValues=e,t.preselectEntity(),t.loading=!1});break;case"resource":switch(this.secondEntity){case"member":this.resourcesManagerService.getAssignedMembersWithStatus(this.firstEntityId).subscribe(function(e){t.entityValues=e.map(function(t){return t.richMember}),t.preselectEntity(),t.loading=!1});break;case"group":this.resourcesManagerService.getGroupAssignments(this.firstEntityId).subscribe(function(e){t.entityValues=e.map(function(t){var e=t.enrichedGroup.group;return e.status=t.status,e}),t.preselectEntity(),t.loading=!1})}break;case"facility":this.facilitiesManagerService.getAssignedUsers(this.firstEntityId).subscribe(function(e){t.entityValues=e,t.preselectEntity(),t.loading=!1})}}},{key:"preselectEntity",value:function(){0!==this.entityValues.length&&this.findInitiallySelectedEntity()}},{key:"findInitiallySelectedEntity",value:function(){var e=this.entityValues[0],i=(0,o.vL)(this.entityKey());if(i){var n,s=t(this.entityValues);try{for(s.s();!(n=s.n()).done;){var a=n.value;if(a.id===i[0]){e=a;break}}}catch(r){s.e(r)}finally{s.f()}}this.specifySecondEntity(e)}},{key:"entityKey",value:function(){switch(this.secondEntity){case"group":return"groups";default:return""}}},{key:"getAttributes",value:function(t){var e=this;switch(this.innerLoading=!0,this.firstEntity){case"member":switch(this.secondEntity){case"resource":this.attributesManagerService.getMemberResourceAttributes(this.firstEntityId,t).subscribe(function(t){e.attributes=t,e.innerLoading=!1});break;case"group":this.attributesManagerService.getMemberGroupAttributes(this.firstEntityId,t).subscribe(function(t){e.attributes=t,e.innerLoading=!1})}break;case"group":switch(this.secondEntity){case"resource":this.attributesManagerService.getGroupResourceAttributes(this.firstEntityId,t).subscribe(function(t){e.attributes=t,e.innerLoading=!1});break;case"member":this.attributesManagerService.getMemberGroupAttributes(t,this.firstEntityId).subscribe(function(t){e.attributes=t,e.innerLoading=!1})}break;case"user":this.attributesManagerService.getUserFacilityAttributes(this.firstEntityId,t).subscribe(function(t){e.attributes=t,e.innerLoading=!1});break;case"resource":switch(this.secondEntity){case"member":this.attributesManagerService.getMemberResourceAttributes(t,this.firstEntityId).subscribe(function(t){e.attributes=t,e.innerLoading=!1});break;case"group":this.attributesManagerService.getGroupResourceAttributes(t,this.firstEntityId).subscribe(function(t){e.attributes=t,e.innerLoading=!1})}break;case"facility":this.attributesManagerService.getUserFacilityAttributes(t,this.firstEntityId).subscribe(function(t){e.attributes=t,e.innerLoading=!1})}}},{key:"setMessages",value:function(t){this.noEntityMessage="No ".concat(t," assigned")}},{key:"onSave",value:function(t){var e=this;this.list.updateMapAttributes();var i=(0,o.kZ)();i.width="450px",i.data={entityId:this.firstEntityId,entity:this.firstEntity,secondEntity:this.secondEntity,secondEntityId:t,attributes:this.selection.selected},this.dialog.open(l.wA,i).afterClosed().subscribe(function(i){i&&(e.selection.clear(),e.getAttributes(t))})}},{key:"onDelete",value:function(t){var e=this,i=(0,o.kZ)();i.width="450px",i.data={entityId:this.firstEntityId,entity:this.firstEntity,secondEntity:this.secondEntity,secondEntityId:t,attributes:this.selection.selected,theme:"".concat(this.firstEntity,"-theme")},this.dialog.open(u.k,i).afterClosed().subscribe(function(i){i&&(e.selection.clear(),e.getAttributes(t))})}},{key:"onAdd",value:function(t){var e=this,i=(0,o.kZ)();i.width="1050px",i.data={entityId:this.firstEntityId,entity:this.firstEntity,secondEntity:this.secondEntity,secondEntityId:t,notEmptyAttributes:this.attributes,style:"".concat(this.firstEntity,"-theme")},this.dialog.open(d.n,i).afterClosed().subscribe(function(i){i&&(e.selection.clear(),e.getAttributes(t))})}},{key:"specifySecondEntity",value:function(t){t&&(this.specificSecondEntity=t,this.getAttributes(this.specificSecondEntity.id))}}]),e}();return e.\u0275fac=function(t){return new(t||e)(h.Y36(r.H8),h.Y36(r.xk),h.Y36(r.IQ),h.Y36(r.ff),h.Y36(r.uq),h.Y36(b.uw))},e.\u0275cmp=h.Xpm({type:e,selectors:[["app-two-entity-attribute-page"]],viewQuery:function(t,e){var i;(1&t&&h.Gf(k,5),2&t)&&(h.iGM(i=h.CRH())&&(e.list=i.first))},inputs:{firstEntityId:"firstEntityId",firstEntity:"firstEntity",secondEntity:"secondEntity"},decls:4,vars:3,consts:[[1,"mt-3"],["class","ml-auto mr-auto",4,"ngIf"],["alert_type","warn",4,"ngIf"],[4,"ngIf"],[1,"ml-auto","mr-auto"],["alert_type","warn"],[1,"flex-row"],[3,"groups","firstSelectedGroup","displayStatus","groupSelected",4,"ngIf"],[3,"resources","resourceSelected",4,"ngIf"],[3,"members","memberSelected",4,"ngIf"],[3,"facilities","facilitySelected",4,"ngIf"],[3,"users","userSelected",4,"ngIf"],[3,"refresh"],["mat-flat-button","","color","accent",1,"mr-2",3,"click"],["mat-flat-button","","color","accent",1,"mr-2",3,"disabled","click"],["mat-flat-button","","color","warn",3,"disabled","click"],[3,"attributes","selection",4,"ngIf"],[3,"groups","firstSelectedGroup","displayStatus","groupSelected"],[3,"resources","resourceSelected"],[3,"members","memberSelected"],[3,"facilities","facilitySelected"],[3,"users","userSelected"],[3,"attributes","selection"],["list",""]],template:function(t,e){1&t&&(h.TgZ(0,"div",0),h.YNc(1,C,1,0,"mat-spinner",1),h.YNc(2,R,2,1,"app-alert",2),h.YNc(3,J,19,18,"div",3),h.qZA()),2&t&&(h.xp6(1),h.Q6J("ngIf",e.loading),h.xp6(1),h.Q6J("ngIf",0===e.entityValues.length&&!e.loading),h.xp6(1),h.Q6J("ngIf",0!==e.entityValues.length))},directives:[p.O5,g.$g,y.w,m.t,E.lW,S.h,A,T,w,M.S,Z.p],pipes:[I.X$],styles:[".w-35[_ngcontent-%COMP%]{width:35%}"]}),e}()},8557:function(t,e,n){"use strict";n.d(e,{L:function(){return g}});var a=n(31572),r=n(84608),c=n(57629),u=n(61511),o=n(71522),l=n(84534),d=n(43691),f=n(48160),h=function(t){return[t]};function b(t,e){if(1&t&&(a.TgZ(0,"div",3),a.TgZ(1,"a",4),a._UZ(2,"mat-icon",5),a._uU(3),a.ALo(4,"translate"),a.qZA(),a.qZA()),2&t){var i=e.$implicit;a.xp6(1),a.Gre("",i.style," item-itself"),a.Q6J("perunWebAppsMiddleClickRouterLink",a.VKq(9,h,i.url))("routerLink",i.url),a.xp6(1),a.Q6J("svgIcon",i.cssIcon),a.xp6(1),a.hij(" ",a.lcZ(4,7,i.label)," ")}}function p(t,e){if(1&t&&(a.TgZ(0,"div",1),a.YNc(1,b,5,11,"div",2),a.qZA()),2&t){var i=a.oxw();a.xp6(1),a.Q6J("ngForOf",i.items)}}var g=function(){var t=function(){function t(e,n){i(this,t),this.dialog=e,this.route=n,this.size="large"}return s(t,[{key:"ngOnInit",value:function(){var t=this;this.route.params.subscribe(function(e){t.voId=e.voId})}}]),t}();return t.\u0275fac=function(e){return new(e||t)(a.Y36(r.uw),a.Y36(c.gz))},t.\u0275cmp=a.Xpm({type:t,selectors:[["perun-web-apps-menu-buttons-field"]],inputs:{items:"items",size:"size"},decls:1,vars:1,consts:[["class","items-container",4,"ngIf"],[1,"items-container"],["class","item-itself-container","mat-ripple","",4,"ngFor","ngForOf"],["mat-ripple","",1,"item-itself-container"],["queryParamsHandling","merge",3,"perunWebAppsMiddleClickRouterLink","routerLink"],[1,"item-pic","perun-icon",3,"svgIcon"]],template:function(t,e){1&t&&a.YNc(0,p,2,1,"div",0),2&t&&a.Q6J("ngIf","small"===e.size)},directives:[u.O5,u.sg,o.wG,c.yS,l.YH,d.Hw],pipes:[f.X$],styles:[".items-container[_ngcontent-%COMP%]{display:grid;grid-gap:0;grid-template-columns:repeat(auto-fill,minmax(208px,1fr));margin:0 -8px}@media (max-width:768px){.items-container[_ngcontent-%COMP%]{grid-template-columns:repeat(auto-fill,minmax(148px,1fr))}}.item-pic[_ngcontent-%COMP%]{color:currentColor;transform:scale(3);height:74px;margin-bottom:22px}.item-itself-container[_ngcontent-%COMP%]{margin:8px}.item-itself[_ngcontent-%COMP%]{text-align:center;min-height:186px;height:100%;padding:20px;display:flex;flex-direction:column;align-items:center;font-size:1.25rem}.item-itself[_ngcontent-%COMP%]:hover{text-decoration:none}.item-itself[_ngcontent-%COMP%]   img[_ngcontent-%COMP%]{height:120px;margin-bottom:10px}@media (max-width:768px){.item-itself[_ngcontent-%COMP%]{min-height:150px;padding:10px}.item-itself[_ngcontent-%COMP%]   img[_ngcontent-%COMP%]{height:80px;margin-bottom:10px}}"]}),t}()}}])}();