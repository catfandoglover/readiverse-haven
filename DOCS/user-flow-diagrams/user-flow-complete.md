# User Flow Specification

# 1. SCREEN DEFINITIONS
screens:
  landing:
    path: "/"
    auth_required: false
    components:
      - type: "hero_section"
        state: "visible"
      - type: "navigation_menu"
        state: "visible"
      - type: "get_started_button"
        state: "visible"
        actions:
          - action: "click"
            next_state: "login_register"
    transitions:
      - to: "login_register"
        condition: "get_started_clicked"
      - to: "discover"
        condition: "discover_clicked"

  login_register:
    path: "/login"
    auth_required: false
    components:
      - type: "auth_form"
        state: "visible"
        actions:
          - action: "login"
            next_state: "check_dna_status"
          - action: "register"
            next_state: "email_confirmation"
      - type: "social_auth_buttons"
        state: "visible"
        actions:
          - action: "oauth_login"
            next_state: "check_dna_status"
    transitions:
      - to: "dna_assessment"
        condition: "authenticated && !dna_completed"
      - to: "discover"
        condition: "authenticated && dna_completed"
      - to: "email_confirmation"
        condition: "new_registration"

  email_confirmation:
    path: "/confirm-email"
    auth_required: true
    components:
      - type: "confirmation_message"
        state: "visible"
      - type: "confirm_button"
        state: "visible"
        actions:
          - action: "click"
            next_state: "check_confirmation"
    transitions:
      - to: "dna_assessment"
        condition: "email_confirmed && !dna_completed"
      - to: "discover"
        condition: "email_confirmed && dna_completed"

  dna_assessment:
    path: "/dna"
    auth_required: true
    components:
      - type: "assessment_header"
        state: "visible"
      - type: "question_container"
        state: "visible"
      - type: "progress_bar"
        state: "visible"
      - type: "navigation_buttons"
        state: "visible"
        actions:
          - action: "next"
            next_state: "next_question"
          - action: "previous"
            next_state: "previous_question"
          - action: "complete"
            next_state: "dna_results"
    transitions:
      - to: "dna_results"
        condition: "assessment_completed"

  dna_results:
    path: "/dna/results"
    auth_required: true
    components:
      - type: "results_summary"
        state: "visible"
      - type: "kindred_spirits"
        state: "visible"
      - type: "challenging_voices"
        state: "visible"
      - type: "chat_with_virgil"
        state: "visible"
        actions:
          - action: "click"
            next_state: "virgil_welcome_chat"
    transitions:
      - to: "virgil_welcome_chat"
        condition: "chat_clicked"
      - to: "profile"
        condition: "view_profile_clicked"

  virgil_welcome_chat:
    path: "/virgil/welcome"
    auth_required: true
    components:
      - type: "chat_interface"
        state: "visible"
      - type: "timer"
        state: "visible"
        duration: "120_seconds"
      - type: "see_results_button"
        state: "hidden"
        show_condition: "timer_expired"
    transitions:
      - to: "profile"
        condition: "timer_expired"
        delay: "2_minutes"
      - to: "profile"
        condition: "see_results_clicked"

  discover:
    path: "/discover"
    auth_required: false
    components:
      - type: "search_bar"
        state: "visible"
      - type: "content_grid"
        state: "visible"
        content_types: ["icons", "concepts", "classics"]
      - type: "filters"
        state: "visible"
      - type: "for_you_section"
        state: "conditional"
        condition: "authenticated && dna_completed"
      - type: "take_dna_prompt"
        state: "conditional"
        condition: "authenticated && !dna_completed"
    transitions:
      - to: "content_detail"
        condition: "item_clicked"
      - to: "login_register"
        condition: "auth_required_action && !authenticated"
      - to: "dna_assessment"
        condition: "take_dna_clicked"

  content_detail:
    path: "/content/:type/:slug"
    auth_required: false
    components:
      - type: "content_header"
        state: "visible"
      - type: "content_body"
        state: "visible"
      - type: "related_content"
        state: "visible"
      - type: "action_buttons"
        state: "visible"
        actions:
          - action: "start_reading"
            next_state: "reader"
          - action: "chat_with_virgil"
            next_state: "virgil_chat"
    transitions:
      - to: "reader"
        condition: "start_reading_clicked"
      - to: "virgil_chat"
        condition: "chat_clicked"
      - to: "login_register"
        condition: "auth_required_action && !authenticated"

  reader:
    path: "/read/:slug"
    auth_required: true
    components:
      - type: "reader_content"
        state: "visible"
      - type: "progress_bar"
        state: "visible"
      - type: "annotation_tools"
        state: "visible"
      - type: "chat_button"
        state: "visible"
    transitions:
      - to: "virgil_chat"
        condition: "chat_clicked"
      - to: "content_detail"
        condition: "back_clicked"

  virgil:
    path: "/virgil"
    auth_required: true
    components:
      - type: "chat_interface"
        state: "visible"
      - type: "context_panel"
        state: "visible"
      - type: "conversation_history"
        state: "visible"
    transitions:
      - to: "discover"
        condition: "explore_clicked"
      - to: "reader"
        condition: "continue_reading_clicked"

  profile:
    path: "/profile"
    auth_required: true
    components:
      - type: "profile_header"
        state: "visible"
      - type: "dna_summary"
        state: "visible"
      - type: "reading_history"
        state: "visible"
      - type: "badges_section"
        state: "visible"
      - type: "settings_button"
        state: "visible"
    transitions:
      - to: "settings"
        condition: "settings_clicked"
      - to: "reader"
        condition: "continue_reading_clicked"

  dna_completion:
    path: "/dna/completion"
    auth_required: false
    components:
      - type: "completion_message"
        state: "visible"
    transitions:
      - to: "email_confirmation"
        condition: "user_authenticated"

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
    path: "/share/badge/:examId"
    auth_required: false
    components:
      - type: "badge_display"
        state: "visible"
      - type: "share_options"
        state: "visible"
      - type: "achievement_details"
        state: "visible"
      - type: "get_started_button"
        state: "conditional"
        condition: "!authenticated"
    transitions:
      - to: "login_register"
        condition: "get_started_clicked && !authenticated"
      - to: "virgil_exam_room"
        condition: "try_exam_clicked && authenticated"

  study_books:
    path: "/study"
    auth_required: true
    components:
      - type: "reading_lists"
        state: "visible"
        sections:
          - name: "dna_recommendations"
            editable: false
            condition: "dna_completed"
          - name: "favorites"
            editable: true
          - name: "custom_shelves"
            editable: true
      - type: "create_shelf_button"
        state: "visible"
        actions:
          - action: "click"
            next_state: "create_shelf_modal"
      - type: "book_actions"
        state: "visible"
        actions:
          - action: "add_to_shelf"
            next_state: "shelf_selector_modal"
          - action: "remove_from_shelf"
            next_state: "study_books"
    transitions:
      - to: "reader"
        condition: "book_clicked"
      - to: "study_favorites"
        condition: "favorites_clicked"

  study_favorites:
    path: "/study/favorites"
    auth_required: true
    components:
      - type: "favorites_grid"
        state: "visible"
      - type: "sort_controls"
        state: "visible"
      - type: "remove_button"
        state: "visible"
        actions:
          - action: "click"
            next_state: "study_favorites"
    transitions:
      - to: "reader"
        condition: "book_clicked"
      - to: "study_books"
        condition: "back_clicked"

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

  virgil_exam_room:
    path: "/virgil/exam/:id"
    auth_required: true
    components:
      - type: "exam_header"
        state: "visible"
      - type: "question_container"
        state: "visible"
      - type: "timer"
        state: "visible"
      - type: "submit_button"
        state: "visible"
        actions:
          - action: "click"
            next_state: "exam_results"
    transitions:
      - to: "exam_results"
        condition: "exam_submitted || timer_expired"
      - to: "share_badge"
        condition: "share_clicked && exam_passed"

  exam_results:
    path: "/virgil/exam/:id/results"
    auth_required: true
    components:
      - type: "results_summary"
        state: "visible"
      - type: "badge_display"
        state: "conditional"
        condition: "exam_passed"
      - type: "share_button"
        state: "conditional"
        condition: "exam_passed"
        actions:
          - action: "click"
            next_state: "share_badge"
    transitions:
      - to: "share_badge"
        condition: "share_clicked"
      - to: "virgil"
        condition: "continue_clicked"

# 2. COMPONENT SPECIFICATIONS
components:
  user_authentication:
    states:
      - name: "unauthenticated"
        actions:
          - action: "login_click"
            next_state: "auth_form"
          - action: "social_auth_click"
            next_state: "oauth_flow"
      - name: "authenticated_no_dna"
        actions:
          - action: "start_dna"
            next_state: "dna_assessment"
          - action: "logout"
            next_state: "unauthenticated"
      - name: "authenticated_with_dna"
        actions:
          - action: "view_profile"
            next_state: "profile"
          - action: "logout"
            next_state: "unauthenticated"
    data_requirements:
      - user_id
      - email_verification_status
      - dna_assessment_status

  dna_assessment_flow:
    states:
      - name: "not_started"
        actions:
          - action: "begin_assessment"
            next_state: "in_progress"
      - name: "in_progress"
        actions:
          - action: "answer_question"
            next_state: "in_progress"
          - action: "complete"
            next_state: "results"
      - name: "results"
        actions:
          - action: "chat_with_virgil"
            next_state: "welcome_chat"
          - action: "view_profile"
            next_state: "profile"
    data_requirements:
      - assessment_responses
      - completion_status
      - results_data

  virgil_interface:
    states:
      - name: "welcome_chat"
        actions:
          - action: "chat"
            next_state: "welcome_chat"
          - action: "timeout"
            next_state: "profile"
            delay: "120_seconds"
      - name: "exam_mode"
        actions:
          - action: "take_exam"
            next_state: "exam_in_progress"
          - action: "view_results"
            next_state: "exam_results"
      - name: "general_chat"
        actions:
          - action: "chat"
            next_state: "general_chat"
          - action: "end_chat"
            next_state: "previous_screen"
    data_requirements:
      - chat_history
      - exam_data
      - user_progress

  content_management:
    states:
      - name: "browsing"
        actions:
          - action: "view_content"
            next_state: "content_detail"
          - action: "filter"
            next_state: "filtered_view"
      - name: "reading"
        actions:
          - action: "annotate"
            next_state: "reading"
          - action: "chat_about"
            next_state: "virgil_chat"
      - name: "organizing"
        actions:
          - action: "add_to_shelf"
            next_state: "organizing"
          - action: "remove_from_shelf"
            next_state: "organizing"
    data_requirements:
      - content_library
      - user_shelves
      - reading_progress

# 3. NAVIGATION ARCHITECTURE
navigation:
  primary_menu:
    - name: "Discover"
      path: "/discover"
      auth_required: false
      default_for: ["all_users"]
    - name: "Read"
      path: "/read"
      auth_required: true
      visible_condition: "authenticated"
    - name: "Study"
      path: "/study"
      auth_required: true
      visible_condition: "authenticated"
    - name: "Virgil"
      path: "/virgil"
      auth_required: true
      visible_condition: "authenticated"
    - name: "Profile"
      path: "/profile"
      auth_required: true
      visible_condition: "authenticated"

  conditional_navigation:
    - condition: "!authenticated"
      available_paths: ["/discover", "/login", "/register", "/share/badge/*"]
    - condition: "authenticated && !dna_completed"
      available_paths: ["/discover", "/dna", "/study", "/read/*"]
    - condition: "authenticated && dna_completed"
      available_paths: ["*"]

  deep_linking:
    - pattern: "/content/:type/:slug"
      destination: "content_detail"
      auth_requirement: false
    - pattern: "/read/:slug"
      destination: "reader"
      auth_requirement: true
    - pattern: "/share/dna/:userId"
      destination: "dna_results"
      auth_requirement: false
    - pattern: "/share/badge/:examId"
      destination: "share_badge"
      auth_requirement: false
    - pattern: "/virgil/exam/:id"
      destination: "virgil_exam_room"
      auth_requirement: true

  screen_transitions:
    default:
      transition_type: "fade"
      duration: "300ms"
    
    custom:
      - from: "discover"
        to: "content_detail"
        transition_type: "slide_right"
        duration: "300ms"
      - from: "content_detail"
        to: "reader"
        transition_type: "slide_up"
        duration: "300ms"
      - from: "reader"
        to: "virgil_chat"
        transition_type: "slide_left"
        duration: "300ms"
      - from: "dna_assessment"
        to: "dna_results"
        transition_type: "fade"
        duration: "500ms"
      - from: "virgil_exam_room"
        to: "exam_results"
        transition_type: "fade"
        duration: "500ms"

# 4. ERROR STATES
error_states:
  network_error:
    components:
      - type: "error_message"
        state: "visible"
        message: "Unable to connect. Please check your internet connection."
      - type: "retry_button"
        state: "visible"
  
  auth_required:
    components:
      - type: "modal"
        state: "visible"
        message: "Please log in to access this feature"
      - type: "login_button"
        state: "visible"
  
  content_not_found:
    components:
      - type: "error_message"
        state: "visible"
        message: "Content not found"
      - type: "back_button"
        state: "visible"

# 5. BUSINESS RULES
business_rules:
  - rule: "Authentication required for reading full content"
    implementation: "Show preview and prompt login for full access"
  
  - rule: "DNA assessment required for personalized recommendations"
    implementation: "Check dna_completed flag before showing personalized content"
  
  - rule: "Annotation persistence"
    implementation: "Save highlights and notes to user's account"
  
  - rule: "Reading progress tracking"
    implementation: "Track and save user's progress in content"
  
  - rule: "Chat context preservation"
    implementation: "Maintain chat context when switching between content and chat"

# 6. DATA MODELS
data_models:
  user:
    properties:
      - name: "id"
        type: "uuid"
        required: true
      - name: "email"
        type: "string"
        required: true
      - name: "dna_completed"
        type: "boolean"
        default: false
      - name: "preferences"
        type: "jsonb"
        required: false

  content:
    properties:
      - name: "id"
        type: "uuid"
        required: true
      - name: "type"
        type: "string"
        enum: ["icon", "concept", "classic"]
        required: true
      - name: "title"
        type: "string"
        required: true
      - name: "content"
        type: "text"
        required: true
      - name: "metadata"
        type: "jsonb"
        required: false

  annotation:
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
      - name: "type"
        type: "string"
        enum: ["highlight", "note", "bookmark"]
        required: true
      - name: "data"
        type: "jsonb"
        required: true

  chat:
    properties:
      - name: "id"
        type: "uuid"
        required: true
      - name: "user_id"
        type: "uuid"
        required: true
      - name: "content_id"
        type: "uuid"
        required: false
      - name: "messages"
        type: "jsonb"
        required: true
      - name: "context"
        type: "jsonb"
        required: false
