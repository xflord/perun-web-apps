export interface OidcClient {
  oauth_authority: string;
  oauth_callback: string;
  oauth_client_id: string;
  oauth_post_logout_redirect_uri: string;
  oauth_redirect_uri: string;
  oauth_scopes: string;
  oauth_response_type: string;
  user_info_endpoint_url: string;
  filters: Record<string, string>;
  oauth_offline_access_consent_prompt: boolean;
  oauth_acr_value: string;
}

interface PerunTheme {
  content_bg_color?: string;
  back_button_color?: string;
  nav_bg_color?: string;
  nav_text_color?: string;
  nav_icon_color?: string;
  footer_bg_color?: string;
  footer_headers_text_color?: string;
  footer_links_text_color?: string;
  footer_copyright_text_color?: string;
  sidemenu_divider_color?: string;
  sidemenu_bg_color?: string;
  sidemenu_border_color?: string;
  sidemenu_text_color?: string;
  sidemenu_hover_color?: string;
  sidemenu_hover_text_color?: string;
  sidemenu_active_color?: string;
  sidemenu_active_text_color?: string;
  sidemenu_submenu_bg_color?: string;
  sidemenu_submenu_text_color?: string;
  sidemenu_submenu_hover_color?: string;
  sidemenu_submenu_hover_text_color?: string;
  sidemenu_submenu_active_color?: string;
  sidemenu_submenu_active_text_color?: string;
  sidemenu_vo_bg_color?: string;
  sidemenu_member_bg_color?: string;
  sidemenu_group_bg_color?: string;
  sidemenu_facility_bg_color?: string;
  sidemenu_resource_bg_color?: string;
  sidemenu_user_bg_color?: string;
  sidemenu_service_bg_color?: string;
  sidemenu_vo_text_color?: string;
  sidemenu_member_text_color?: string;
  sidemenu_group_text_color?: string;
  sidemenu_facility_text_color?: string;
  sidemenu_resource_text_color?: string;
  sidemenu_user_text_color?: string;
  sidemenu_service_text_color?: string;
  vo_color?: string;
  group_color?: string;
  facility_color?: string;
  resource_color?: string;
  user_color?: string;
  member_color?: string;
  admin_color?: string;
  service_color?: string;
}

export interface CopyrightItem {
  name: string;
  url: string;
}

export interface FooterElement {
  logo: string;
  icon?: string;
  dialog?: string;
  link_en: string;
  link_cs?: string;
  label_en: string;
  label_cs?: string;
}

export interface FooterColumn {
  title_en: string;
  title_cs?: string;
  logos?: boolean;
  elements: FooterElement[];
}

interface Footer {
  columns: FooterColumn[];
  copyright_items: CopyrightItem[];
  github_releases?: string;
  github_backend_releases?: string;
}

interface DocumentTitle {
  en: string;
  cs?: string;
}

interface ProfileAttribute {
  friendly_name: string;
  display_name_en: string;
  display_name_cs: string;
  tooltip_en: string;
  tooltip_cs: string;
  is_virtual?: boolean;
}

interface ProfileExtService {
  url: string;
  label_en: string;
  label_cs: string;
}

interface ProfileCustomLabel {
  label: string;
  en: string;
  cs: string;
}

interface ProfileMFA {
  api_url: string;
  enable_security_image: boolean;
  enable_security_text: boolean;
  security_image_attribute: string;
  security_text_attribute: string;
  mfa_instance: string;
  url_en: string;
  url_cs: string;
}

export type PasswordAction = 'activation' | 'reset';

export interface PasswordLabel {
  description?: string;
  success?: string;
  passwordDoesntMatchError?: string;
  passwordChangeFailedError?: string;
  passwordCreationFailedError?: string;
  passwordDeletionFailedError?: string;
  loginNotExistsError?: string;
  passwordStrengthFailedError?: string;
  passwordOperationTimeoutError?: string;
}

export type PasswordLabels = Record<string, Record<PasswordAction, PasswordLabel>>;

export interface PerunConfig {
  // Shared properties
  // Required
  api_url: string;
  oidc_client: OidcClient;
  proxy_logout: boolean;
  pwd_reset_base_url: string;
  password_namespace_attributes: string[];
  // Optional
  auto_auth_redirect?: boolean;
  supported_languages?: string[];
  enforce_consents?: boolean;
  instance_favicon?: boolean;
  log_out_enabled?: boolean;
  header_label_en?: string;
  header_label_cs?: string;
  document_title?: DocumentTitle;
  footer?: Footer;
  brandings?: Record<string, PerunConfig>;
  logo?: string;
  theme?: PerunTheme;
  auto_service_access_redirect: boolean;

  // Admin gui specific
  // Required
  config: string;
  user_deletion_forced?: boolean;
  // Optional
  login_namespace_attributes?: string[];
  profile_label_en?: string;
  allow_empty_sponsor_namespace?: boolean;
  member_profile_attributes_friendly_names?: string[];
  groupNameSecondaryRegex?: string;
  groupNameErrorMessage?: string;
  display_warning?: boolean;
  warning_message?: string;
  logo_padding?: string;
  group_name_error_message?: string;
  group_name_secondary_regex?: string;
  link_to_admin_gui_by_roles?: string[];

  // User profile specific
  // Required
  displayed_tabs: string[];
  consolidator_url: string;
  consolidator_url_cert: string;
  registrar_base_url: string;
  mfa: ProfileMFA;
  preferred_unix_group_names: string[];
  // Optional
  admin_gui_label_en?: string;
  admin_gui_label_cs?: string;
  local_account_namespace?: string;
  profile_page_attributes?: ProfileAttribute[];
  external_services?: ProfileExtService[];
  custom_labels?: ProfileCustomLabel[];
  display_identity_certificates?: boolean;
  use_new_consolidator: boolean;

  // Publications specific
  // Optional
  allowed_owners_for_thanks?: string[];

  // Password reset specific
  // Optional
  password_help?: Record<string, string>;
  password_help_cs?: Record<string, string>;
  password_labels?: PasswordLabels;
  password_labels_cs?: PasswordLabels;
  password_reset_logo?: string;

  //Consolidator + Linker
  application: string;
  support_mail: string;

  // Consolidator specific
  path_to_idp_provider_userinfo: string[];
  path_to_idp_logo_userinfo: string[];
  path_to_idp_logo_width_userinfo: string[];
  path_to_idp_logo_height_userinfo: string[];

  //User profile + Consolidator
  use_localhost_linker_url: boolean;
}
