import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AuditMessage } from '@perun-web-apps/perun/openapi';

export interface AuditMessageDetailDialogData {
  message: AuditMessage
}

@Component({
  selector: 'app-audit-message-detail-dialog',
  templateUrl: './audit-message-detail-dialog.component.html',
  styleUrls: ['./audit-message-detail-dialog.component.scss']
})
export class AuditMessageDetailDialogComponent implements OnInit {

  title;
  eventData = {}

  constructor( public dialogRef: MatDialogRef<AuditMessageDetailDialogComponent>,
               @Inject(MAT_DIALOG_DATA) public data: AuditMessageDetailDialogData,) { }

  ngOnInit(): void {
    const eventData = this.data.message.event;
    if(eventData.message){
      delete eventData.message;
    }
    if(eventData.name){
      this.title = eventData.name;
      delete eventData.name;
    }
    this.eventData = eventData;
  }


  onClose(){
    this.dialogRef.close();
  }

}
