import { EventEmitter, Injectable, Output } from '@angular/core';
import { NotificationData } from '@perun-web-apps/perun/models';
import { RPCError } from '@perun-web-apps/perun/models';
import { PerunTranslateService } from './perun-translate.service';

@Injectable({
  providedIn: 'root',
})
export class NotificatorService {
  @Output() addNotification: EventEmitter<NotificationData> = new EventEmitter<NotificationData>();
  defaultAction: string;
  defaultRpcMessage: string;
  defaultErrorDelayMs = 5_000;
  defaultSuccessDelayMs = 3_000;
  constructor(private translate: PerunTranslateService) {}

  getDefaultActionMessage(): string {
    if (this.defaultAction === undefined) {
      return (this.defaultAction = this.translate.instant(
        'SHARED_LIB.PERUN.COMPONENTS.NOTIFICATOR.NOTIFICATION.DEFAULT_ACTION'
      ));
    } else {
      return this.defaultAction;
    }
  }

  getDefaultRpcMessage(): string {
    if (this.defaultRpcMessage === undefined) {
      return (this.defaultRpcMessage = this.translate.instant(
        'SHARED_LIB.PERUN.COMPONENTS.NOTIFICATOR.NOTIFICATION.DEFAULT_RPC_ERROR_MESSAGE'
      ));
    } else {
      return this.defaultRpcMessage;
    }
  }

  /**
   * Shows default RPC error
   *
   * @param rpcError - error returned by the backend
   * @param errorMessage - custom message that will be displayed
   */
  showRPCError(rpcError: RPCError, errorMessage = this.getDefaultRpcMessage()): void {
    if (rpcError.name === 'PrivilegeException') {
      this.showError(
        this.translate.instant(
          'SHARED_LIB.PERUN.COMPONENTS.NOTIFICATOR.NOTIFICATION.PRIVILEGE_EXCEPTION'
        ),
        rpcError,
        rpcError.message
      );
    } else {
      const title =
        rpcError.name === undefined ? errorMessage : errorMessage + '\n' + rpcError.name;
      this.showError(title, rpcError, rpcError.message);
    }
  }

  showRouteError(): void {
    this.showInstantError(
      'SHARED_LIB.PERUN.COMPONENTS.NOTIFICATOR.NOTIFICATION.ROUTE_DENIED_ERROR',
      null,
      'SHARED_LIB.PERUN.COMPONENTS.NOTIFICATOR.NOTIFICATION.ROUTE_DENIED_DESC'
    );
  }

  /**
   * Shows error notification
   *
   * @param title - text that is shown on the notification
   * @param error - RPC error
   * @param description - text shown in the body of dialog which is displayed after clicking the action
   * @param actionText - clickable text shown on the notification which starts specified or default action
   * @param action - action which will be executed after clicking the actionText
   */
  showError(
    title: string,
    error?: RPCError,
    description?: string,
    actionText?: string,
    action?: () => void
  ): void {
    this.addNotification.emit({
      type: 'error',
      error: error,
      description: description,
      title: title,
      actionText:
        actionText === undefined && description !== undefined
          ? this.getDefaultActionMessage()
          : actionText,
      delay: this.defaultErrorDelayMs,
      icon: 'error_outline',
      action: action,
      timeStamp: `${new Date().getHours()}:${new Date().getMinutes()}`,
    });
  }

  /**
   * Shows error notification
   *
   * @param title - text that is shown on the notification
   * @param error - RPC error
   * @param description - text shown in the body of dialog which is displayed after clicking the action
   * @param actionText - clickable text shown on the notification which starts specified or default action
   * @param action - action which will be executed after clicking the actionText
   */
  showInstantError(
    title: string,
    error?: RPCError,
    description?: string,
    actionText?: string,
    action?: () => void
  ): void {
    const translatedDescription = description ? this.translate.instant(description) : null;
    const translatedActionText = actionText ? this.translate.instant(actionText) : null;
    if (translatedActionText) {
      this.showError(
        this.translate.instant(title),
        error,
        translatedDescription,
        translatedActionText,
        action
      );
    } else {
      this.showError(this.translate.instant(title), error, translatedDescription);
    }
  }

  /**
   * Shows success notification
   *
   * @param title - text that is shown on the notification
   * @param description - text shown in the body of dialog which is displayed after clicking the action
   * @param actionText - clickable text shown on the notification which starts specified or default action
   * @param action - action which will be executed after clicking the actionText
   */
  showSuccess(title: string, description?: string, actionText?: string, action?: () => void): void {
    this.addNotification.emit({
      type: 'success',
      description: description,
      title: title,
      actionText:
        actionText === undefined && description !== undefined
          ? this.getDefaultActionMessage()
          : actionText,
      delay: this.defaultSuccessDelayMs,
      icon: 'done',
      action: action,
      timeStamp: `${new Date().getHours()}:${new Date().getMinutes()}`,
    });
  }

  /**
   * Translates instantly and shows success notification
   *
   * @param title - text to be translated that is shown on the notification
   * @param description - text  to be translated that is shown in the body of dialog which is displayed after clicking the action
   * @param actionText - clickable text  to be translated that is shown on the notification which starts specified or default action
   * @param action - action which will be executed after clicking the actionText
   */
  showInstantSuccess(
    title: string,
    description?: string,
    actionText?: string,
    action?: () => void
  ): void {
    const translatedDescription = description ? this.translate.instant(description) : undefined;
    const translatedActionText = actionText ? this.translate.instant(actionText) : undefined;
    if (translatedActionText) {
      this.showSuccess(
        this.translate.instant(title),
        translatedDescription,
        translatedActionText,
        action
      );
    } else {
      this.showSuccess(this.translate.instant(title), translatedDescription);
    }
  }
}
