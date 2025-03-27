# User Flow Specification

# 1. SCREEN DEFINITIONS
screens:
  login_register:
    path: "/login"
    components:
      - type: "modal"
        state: "visible"
        actions:
          - action: "login"
            next_state: "redirect_to_original_destination"
          - action: "register"
            next_state: "dna_assessment"
    transitions:
      - to: "dna_assessment"
        condition: "new_user_registration_completed"
      - to: "email_confirmation"
        condition: "registration_completed"

  dna_assessment:
    path: "/dna"
    auth_required: false
    components:
      - type: "assessment_questions"
        state: "visible"
      - type: "user_icon"
        state: "visible"
        position: "top_right"
        actions:
          - action: "click"
            next_state: "login_register"
    transitions:
      - to: "dna_completion"
        condition: "assessment_completed"

  dna_completion:
    path: "/dna/completion"
    auth_required: false
    components:
      - type: "completion_message"
        state: "visible"
    transitions:
      - to: "email_confirmation"
        condition: "user_authenticated"

  email_confirmation:
    path: "/confirm-email"
    auth_required: true
    components:
      - type: "confirmation_message"
        state: "visible"
      - type: "confirm_button"
        state: "visible"
        label: "I've Confirmed my Email"
        actions:
          - action: "click"
            next_state: "dna_welcome"
    transitions:
      - to: "dna_welcome"
        condition: "email_confirmed"
      - to: "dna_welcome"
        condition: "auto_detected_email_confirmation"
        delay: "immediate"

  general_email_confirmation:
    path: "/confirm-email"
    auth_required: true
    components:
      - type: "confirmation_message"
        state: "visible"
      - type: "confirm_button"
        state: "visible"
        label: "I've Confirmed my Email"
        actions:
          - action: "click"
            next_state: "original_destination"
    transitions:
      - to: "original_destination"
        condition: "email_confirmed"
      - to: "original_destination"
        condition: "auto_detected_email_confirmation"
        delay: "immediate"

  dna_welcome:
    path: "/dna/welcome"
    auth_required: true
    components:
      - type: "welcome_message"
        state: "visible"
      - type: "chat_with_virgil_button"
        state: "visible"
        actions:
          - action: "click"
            next_state: "virgil_chat_intro"
    transitions:
      - to: "profile"
        condition: "chat_completed"
        delay: "2_minutes"
      - to: "profile"
        condition: "see_results_clicked"

  discover:
    path: "/discover"
    auth_required: false
    components:
      - type: "content_feed"
        state: "visible"
        content_types: ["icons", "concepts", "classics", "great_questions"]
      - type: "for_you_button"
        state: "disabled"
        condition: "!authenticated || !dna_completed"
        tooltip: "Take your intellectual DNA assessment to access personalized recommendations"
        actions:
          - action: "click"
            condition: "authenticated && dna_completed"
            next_state: "discover_for_you"
      - type: "menu"
        state: "visible"
      - type: "encyclopedia_links"
        state: "visible"
        actions:
          - action: "click"
            next_state: "detailed_view"
      - type: "share_button"
        state: "visible"
        actions:
          - action: "click"
            next_state: "share_modal"
    transitions:
      - to: "detailed_view"
        condition: "entry_clicked"
      - to: "login_register"
        condition: "auth_required_feature_clicked && !authenticated"

  detailed_view:
    path: "/entry/{type}/{slug}"
    auth_required: false
    components:
      - type: "content_container"
        state: "visible"
      - type: "interlinked_content"
        state: "visible"
        actions:
          - action: "click_link"
            next_state: "detailed_view"
      - type: "read_button"
        state: "visible"
        condition: "entry_type == 'classic'"
        auth_required: true
        actions:
          - action: "click"
            condition: "authenticated"
            next_state: "reader"
          - action: "click"
            condition: "!authenticated"
            next_state: "login_register"
      - type: "favorite_button"
        state: "visible"
        auth_required: true
        actions:
          - action: "click"
            condition: "authenticated && first_time_favoriting"
            next_state: "favorite_tooltip"
          - action: "click"
            condition: "authenticated && !first_time_favoriting"
            next_state: "add_to_bookshelf"
      - type: "virgil_button"
        state: "visible"
        auth_required: true
        actions:
          - action: "click"
            condition: "authenticated"
            next_state: "virgil_grow_mind"
          - action: "click"
            condition: "!authenticated"
            next_state: "login_register"
      - type: "badge_display"
        state: "visible"
        condition: "authenticated && has_badge_for_entry"
    transitions:
      - to: "reader"
        condition: "read_button_clicked && authenticated"
      - to: "login_register"
        condition: "auth_required_feature_clicked && !authenticated"
      - to: "detailed_view"
        condition: "interlink_clicked"

  profile:
    path: "/profile"
    auth_required: true
    components:
      - type: "hero_image"
        state: "visible"
      - type: "dna_results"
        state: "visible"
        data_source: "dna_analysis_results"
      - type: "kindred_spirits"
        state: "visible"
        actions:
          - action: "click"
            next_state: "detailed_view"
      - type: "challenging_voices"
        state: "visible"
        actions:
          - action: "click"
            next_state: "detailed_view"
      - type: "domain_content_cards"
        state: "visible"
        actions:
          - action: "click"
            next_state: "virgil_classroom"
      - type: "share_button"
        state: "visible"
        actions:
          - action: "click"
            next_state: "share_profile"
    transitions:
      - to: "detailed_view"
        condition: "icon_clicked"
      - to: "virgil_classroom"
        condition: "domain_content_clicked"
      - to: "share_profile"
        condition: "share_clicked"

  share_profile:
    path: "/share/DNA"
    auth_required: true
    components:
      - type: "hero_image"
        state: "visible"
      - type: "sharing_options"
        state: "visible"
      - type: "kindred_spirits"
        state: "visible"
        actions:
          - action: "click"
            next_state: "detailed_view"
      - type: "challenging_voices"
        state: "visible"
        actions:
          - action: "click"
            next_state: "detailed_view"
    transitions:
      - to: "detailed_view"
        condition: "icon_clicked"
      - to: "profile"
        condition: "back_button_clicked"

  share_badge:
    path: "/share_badge/slug/name"
    auth_required: false
    components:
      - type: "share_icon"
        state: "visible"
        actions:
          - action: "click"
            next_state: "share_functionality"
      - type: "x_button"
        state: "visible"
        actions:
          - action: "click"
            condition: "authenticated"
            next_state: "exam_room"
          - action: "click"
            condition: "!authenticated"
            next_state: "detailed_view"
      - type: "badge_display"
        state: "visible"
        data_source: "exam_scores"
    transitions:
      - to: "exam_room"
        condition: "x_clicked && authenticated"
      - to: "detailed_view"
        condition: "x_clicked && !authenticated"

  study_books:
    path: "/study/books"
    auth_required: true
    components:
      - type: "bookshelf"
        state: "visible"
      - type: "heart_icon"
        state: "visible"
        position: "top_right"
        actions:
          - action: "click"
            next_state: "study_favorites"
      - type: "book_icon"
        state: "visible"
        position: "top_right"
      - type: "dna_shelf"
        state: "visible"
        editable: false
      - type: "user_shelves"
        state: "visible"
        editable: true
        actions:
          - action: "create_shelf"
            next_state: "new_shelf_modal"
          - action: "remove_book"
            next_state: "study_books"
    transitions:
      - to: "study_favorites"
        condition: "heart_icon_clicked"
      - to: "reader"
        condition: "book_clicked"

  study_favorites:
    path: "/study/favorites"
    auth_required: true
    components:
      - type: "favorites_list"
        state: "visible"
        data_source: "user_books"
      - type: "remove_button"
        state: "visible"
        actions:
          - action: "click"
            next_state: "study_favorites"
    transitions:
      - to: "reader"
        condition: "book_clicked"

  reader:
    path: "/read/{classic}"
    auth_required: true
    components:
      - type: "book_content"
        state: "visible"
      - type: "highlight_tool"
        state: "visible"
        data_persistence: true
      - type: "bookmark_tool"
        state: "visible"
        data_persistence: true
      - type: "virgil_chat_button"
        state: "visible"
        actions:
          - action: "click"
            next_state: "virgil_book_chat"
    transitions:
      - to: "virgil_book_chat"
        condition: "virgil_chat_clicked"

  virgil:
    path: "/virgil"
    auth_required: true
    components:
      - type: "course_option"
        state: "disabled"
        condition: "!dna_completed"
        actions:
          - action: "click"
            condition: "dna_completed"
            next_state: "virgil_classroom"
      - type: "test_knowledge_option"
        state: "disabled"
        condition: "!dna_completed"
        actions:
          - action: "click"
            condition: "dna_completed"
            next_state: "virgil_exam"
      - type: "chat_icon"
        state: "visible"
        actions:
          - action: "click"
            next_state: "chat_navigation"
    transitions:
      - to: "virgil_classroom"
        condition: "course_clicked && dna_completed"
      - to: "virgil_exam"
        condition: "test_knowledge_clicked && dna_completed"
      - to: "chat_navigation"
        condition: "chat_icon_clicked"

  virgil_chat_modalities:
    path: "/virgil-mode"
    auth_required: true
    components:
      - type: "chat_interface"
        state: "visible"
        data_source: "prompts_table"
      - type: "compact_summary"
        state: "hidden"
        trigger: "chat_ends"
        condition: "chat_duration > 60_seconds"
        data_persistence: 
          destination: "user_profile_metadata"
          usage: "future_customization"
    transitions:
      - to: "virgil"
        condition: "chat_ended"

  virgil_classroom:
    path: "/virgil/classroom"
    auth_required: true
    components:
      - type: "dna_courses"
        state: "visible"
        data: ["icon", "book", "rationale"]
      - type: "available_course"
        state: "visible"
        actions:
          - action: "click"
            next_state: "virgil_chat_modalities"
      - type: "unavailable_course"
        state: "disabled"
        visual: "locked_container"
      - type: "completed_course"
        state: "visible"
        visual: "checkmark"
        actions:
          - action: "click"
            next_state: "virgil_chat_modalities"
      - type: "create_course_button"
        state: "visible"
        actions:
          - action: "click"
            next_state: "create_course_modal"
      - type: "drop_course_button"
        state: "visible"
        actions:
          - action: "click"
            next_state: "virgil_classroom"
      - type: "filter_controls"
        state: "visible"
        options: ["intellectual_dna", "icon", "concept", "classic"]
      - type: "progress_indicator"
        state: "visible"
        data_source: "ll_check_after_conversation"
    transitions:
      - to: "virgil_chat_modalities"
        condition: "course_clicked"
      - to: "virgil_classroom"
        condition: "filter_applied"

  virgil_exam:
    path: "/virgil/exam"
    auth_required: true
    components:
      - type: "dna_exams"
        state: "visible"
        data: ["icon", "book", "rationale"]
      - type: "past_exams"
        state: "visible"
        sort_default: "date"
        filters: ["intellectual_dna", "icon", "concept", "classic"]
        data_source: "badge_scores"
    transitions:
      - to: "virgil_chat_modalities"
        condition: "exam_clicked"
      - to: "virgil_exam"
        condition: "filter_applied"

  virgil_book_chat:
    path: "/read/{classic}/chat"
    auth_required: true
    components:
      - type: "chat_interface"
        state: "visible"
        context: "book_content"
        persistence: "ongoing"
    transitions:
      - to: "reader"
        condition: "back_button_clicked"

  virgil_grow_mind:
    path: "/virgil/grow"
    auth_required: true
    components:
      - type: "chat_interface"
        state: "visible"
        context: "entry_information"
        data_source: "system_prompt"
    transitions:
      - to: "detailed_view"
        condition: "back_button_clicked"

# 2. COMPONENT SPECIFICATIONS
components:
  user_authentication:
    states:
      - name: "unauthenticated"
        actions:
          - action: "login_click"
            next_state: "authentication_modal"
          - action: "restricted_feature_click"
            next_state: "authentication_modal"
      - name: "authenticated"
        actions:
          - action: "logout"
            next_state: "unauthenticated"
    data_requirements:
      - user_id
      - email_verification_status
      - dna_assessment_status
    error_states:
      - name: "login_failed"
        actions:
          - action: "retry"
            next_state: "authentication_modal"
      - name: "registration_failed"
        actions:
          - action: "retry"
            next_state: "authentication_modal"

  dna_assessment_component:
    states:
      - name: "not_started"
        actions:
          - action: "start"
            next_state: "in_progress"
      - name: "in_progress"
        actions:
          - action: "continue"
            next_state: "in_progress"
          - action: "complete"
            next_state: "completed"
      - name: "completed"
        actions:
          - action: "view_results"
            next_state: "profile"
    data_requirements:
      - user_responses
      - completion_status
      - analysis_result_id
    error_states:
      - name: "submission_error"
        actions:
          - action: "retry"
            next_state: "in_progress"

  virgil_chat_component:
    states:
      - name: "idle"
        actions:
          - action: "initiate_chat"
            next_state: "active"
      - name: "active"
        actions:
          - action: "send_message"
            next_state: "active"
          - action: "end_chat"
            next_state: "idle"
          - action: "timeout"
            delay: "2_minutes"
            next_state: "locked"
      - name: "locked"
        actions:
          - action: "navigate_to_profile"
            next_state: "profile"
    data_requirements:
      - chat_history
      - context_information
      - user_profile_data
    error_states:
      - name: "message_failed"
        actions:
          - action: "retry"
            next_state: "active"

  content_discovery_component:
    states:
      - name: "browse"
        actions:
          - action: "filter"
            next_state: "filtered"
          - action: "select_item"
            next_state: "detailed_view"
      - name: "filtered"
        actions:
          - action: "clear_filter"
            next_state: "browse"
          - action: "select_item"
            next_state: "detailed_view"
    data_requirements:
      - content_categories
      - trending_items
      - user_preferences
    error_states:
      - name: "load_failed"
        actions:
          - action: "retry"
            next_state: "browse"

  favorites_component:
    states:
      - name: "viewing"
        actions:
          - action: "add_favorite"
            next_state: "viewing"
          - action: "remove_favorite"
            next_state: "viewing"
    data_requirements:
      - user_favorites
      - user_shelves
    error_states:
      - name: "action_failed"
        actions:
          - action: "retry"
            next_state: "viewing"

# 3. NAVIGATION ARCHITECTURE
navigation:
  primary_menu:
    - name: "Intellectual DNA"
      path: "/dna"
      auth_required: false
      default_for: ["new_users"]
    - name: "Discover"
      path: "/discover"
      auth_required: false
    - name: "Virgil"
      path: "/virgil"
      auth_required: true
      default_for: ["authenticated_users"]
    - name: "Study"
      path: "/study/books"
      auth_required: true
    - name: "Profile"
      path: "/profile"
      auth_required: true
      visible_condition: "authenticated"

  deep_linking:
    - pattern: "/share/DNA/{user_id}"
      destination: "share_profile"
      auth_requirement: false
    - pattern: "/share_badge/{slug}/{name}"
      destination: "share_badge"
      auth_requirement: false
    - pattern: "/entry/{type}/{slug}"
      destination: "detailed_view"
      auth_requirement: false

  screen_transitions:
    default:
      transition_type: "fade"
      duration: "300ms"
    
    custom:
      - from: "dna_assessment"
        to: "dna_completion"
        transition_type: "slide_up"
        duration: "500ms"
      - from: "discover"
        to: "detailed_view"
        transition_type: "slide_left"
        duration: "300ms"
      - from: "detailed_view"
        to: "discover"
        transition_type: "slide_right"
        duration: "300ms"

# 4. ERROR STATES AND EDGE CASES
error_states:
  network_error:
    components:
      - type: "error_message"
        state: "visible"
        message: "Connection lost. Please check your internet connection."
      - type: "retry_button"
        state: "visible"
        actions:
          - action: "click"
            next_state: "retry_action"
  
  authentication_required:
    components:
      - type: "error_message"
        state: "visible"
        message: "You need to be logged in to access this feature."
      - type: "login_button"
        state: "visible"
        actions:
          - action: "click"
            next_state: "login_register"
  
  dna_required:
    components:
      - type: "error_message"
        state: "visible"
        message: "Complete your Intellectual DNA assessment to access this feature."
      - type: "take_assessment_button"
        state: "visible"
        actions:
          - action: "click"
            next_state: "dna_assessment"

# 5. BUSINESS LOGIC RULES
business_rules:
  - rule: "Users must complete DNA assessment to access personalized features"
    implementation: "Check dna_completed flag in user profile before enabling personalized features"
  
  - rule: "Users must be authenticated to use bookmarking, highlighting, and favorites"
    implementation: "Check authentication status before showing or enabling these features"
  
  - rule: "Email must be confirmed before accessing certain features"
    implementation: "Check email_verified flag in user profile"
  
  - rule: "After 2 minutes of chatting with Virgil in welcome mode, lock chat and direct to profile"
    implementation: "Start timer on chat initiation, lock interface after 2 minutes, show see_results button"
  
  - rule: "Clicking the share button should share the current view's URL"
    implementation: "Generate shareable URL based on current screen context"
  
  - rule: "Virgil chat sessions longer than 60 seconds should be summarized for user profile metadata"
    implementation: "Run compact function at chat conclusion to extract key information for customization"
  
  - rule: "Intellectual DNA bookshelf cannot be edited by users"
    implementation: "Disable edit controls on DNA shelf items"
  
  - rule: "Trending items in discovery feed should be based on view count for last 30 days"
    implementation: "Query content items with highest view_count where view_date > (current_date - 30 days)"

# 7. DATA MODELS
data_models:
  user:
    properties:
      - name: "id"
        type: "uuid"
        required: true
      - name: "email"
        type: "string"
        required: true
      - name: "email_verified"
        type: "boolean"
        default: false
      - name: "dna_completed"
        type: "boolean"
        default: false
      - name: "dna_results_id"
        type: "uuid"
        required: false
  
  dna_analysis_results:
    properties:
      - name: "id"
        type: "uuid"
        required: true
      - name: "user_id"
        type: "uuid"
        required: true
      - name: "assessment_id"
        type: "uuid"
        required: true
      - name: "kindred_spirits"
        type: "array"
        items: "content_reference"
      - name: "challenging_voices"
        type: "array"
        items: "content_reference"
      - name: "domain_scores"
        type: "object"
        properties: ["domain_name", "score", "icon", "text", "rationale"]
  
  content_item:
    properties:
      - name: "id"
        type: "uuid"
        required: true
      - name: "type"
        type: "enum"
        values: ["icon", "concept", "classic", "great_question"]
        required: true
      - name: "slug"
        type: "string"
        required: true
      - name: "title"
        type: "string"
        required: true
      - name: "content"
        type: "text"
        required: true
      - name: "metadata"
        type: "object"
        properties: ["author", "era", "category", "related_items"]
      - name: "view_count"
        type: "integer"
        default: 0
  
  user_book:
    properties:
      - name: "id"
        type: "uuid"
        required: true
      - name: "user_id"
        type: "uuid"
        required: true
      - name: "content_id"
        type: "uuid"
        required: true
      - name: "shelf_id"
        type: "uuid"
        required: true
      - name: "added_date"
        type: "timestamp"
        required: true
      - name: "last_accessed"
        type: "timestamp"
        required: false
  
  reading_list:
    properties:
      - name: "id"
        type: "uuid"
        required: true
      - name: "user_id"
        type: "uuid"
        required: true
      - name: "name"
        type: "string"
        required: true
      - name: "is_dna_shelf"
        type: "boolean"
        default: false
  
  conversation:
    properties:
      - name: "id"
        type: "uuid"
        required: true
      - name: "user_id"
        type: "uuid"
        required: true
      - name: "title"
        type: "string"
        required: true
      - name: "modality"
        type: "string"
        required: true
      - name: "context"
        type: "object"
        required: false
      - name: "created_at"
        type: "timestamp"
        required: true
      - name: "last_message_at"
        type: "timestamp"
        required: true
      - name: "metadata"
        type: "object"
        required: false
