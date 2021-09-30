import { SafeHtml } from '@angular/platform-browser';

interface OidcClient {
  oauth_authority: string;
  oauth_callback: string;
  oauth_client_id: string;
  oauth_post_logout_redirect_uri: string;
  oauth_redirect_uri: string;
  oauth_scopes: string;
  oauth_response_type: string;
  user_info_endpoint_url: string;
  filters: Record<string, string>;
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
  sidemenu_item_links_bg_color?: string;
  sidemenu_hover_color?: string;
  sidemenu_root_active_color?: string;
  sidemenu_link_hover?: string;
  sidemenu_link_active?: string;
  sidemenu_text_color?: string;
  sidemenu_vo_bg_color?: string;
  sidemenu_member_bg_color?: string;
  sidemenu_group_bg_color?: string;
  sidemenu_facility_bg_color?: string;
  sidemenu_resource_bg_color?: string;
  sidemenu_user_bg_color?: string;
  sidemenu_service_bg_color?: string;
  sidemenu_item_links_text_color?: string;
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

interface CopyrightItem {
  name: string;
  url: string;
}

interface FooterElement {
  logo: string;
  icon?: string;
  dialog?: string;
  link_en: string;
  link_cs?: string;
  label_en: string;
  label_cs?: string;
}

interface FooterColumn {
  title_en: string;
  title_cs?: string;
  logos?: boolean;
  elements: FooterElement[];
}

interface Footer {
  columns: FooterColumn[];
  copyrightItems: CopyrightItem[];
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
  security_image_attribute: string;
  enforce_mfa_attribute: string;
  url_en: string;
  url_cs: string;
}

export interface PerunConfig {
  // Shared properties
  // Required
  api_url: string;
  oidc_client: OidcClient;
  pwd_reset_base_url: string;
  password_namespace_attributes: string[];
  // Optional
  auto_auth_redirect?: boolean;
  supported_languages?: string[];
  is_devel?: boolean;
  instance_favicon?: boolean;
  log_out_enabled?: boolean;
  header_label_en?: string;
  header_label_cs?: string;
  document_title?: DocumentTitle;
  footer?: Footer;
  brandings?: Record<string, PerunConfig>;
  logo?: string;
  theme?: PerunTheme;

  // Admin gui specific
  // Required
  config: string;
  // Optional
  login_namespace_attributes?: string[];
  profile_label_en?: string;
  allow_empty_sponsor_namespace?: boolean;
  member_profile_attributes_friendly_names?: string[];
  skip_oidc?: boolean;
  groupNameSecondaryRegex?: string;
  groupNameErrorMessage?: string;
  display_warning?: boolean;
  warning_message?: string;
  logo_padding?: string;

  // User profile specific
  // Required
  displayed_tabs: string[];
  consolidator_base_url: string;
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
  password_requirements_help_en?: string;
  password_requirements_help_cs?: string;
  password_reset_logo?: SafeHtml;

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
