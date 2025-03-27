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
        condition: "authenticated && !has_assessment_id"
      - to: "discover"
        condition: "authenticated && has_assessment_id"
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
        condition: "email_confirmed && !has_assessment_id"
      - to: "discover"
        condition: "email_confirmed && has_assessment_id"

  dna_priming:
    path: "/dna/priming"
    auth_required: true
    components:
      - type: "priming_screens"
        state: "visible"
      - type: "navigation_buttons"
        state: "visible"
        actions:
          - action: "next"
            next_state: "next_screen"
          - action: "start_assessment"
            next_state: "dna_assessment"
    transitions:
      - to: "dna_assessment"
        condition: "priming_completed"

  dna_assessment:
    path: "/dna/:category"
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
    path: "/dna/welcome"
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
        condition: "authenticated && has_assessment_id"
      - type: "take_dna_prompt"
        state: "conditional"
        condition: "authenticated && !has_assessment_id"
    transitions:
      - to: "content_detail"
        condition: "item_clicked"
      - to: "login_register"
        condition: "auth_required_action && !authenticated"
      - to: "dna_assessment"
        condition: "take_dna_clicked"
      - to: "search_page"
        condition: "search_submitted"

  search_page:
    path: "/discover/search"
    auth_required: false
    components:
      - type: "search_header"
        state: "visible"
      - type: "search_input"
        state: "visible"
      - type: "search_results"
        state: "visible"
      - type: "filter_tabs"
        state: "visible"
        options: ["all", "icons", "concepts", "classics", "questions"]
    transitions:
      - to: "content_detail"
        condition: "result_clicked"
      - to: "search_results_specific"
        condition: "filter_clicked"
      - to: "discover"
        condition: "back_clicked"

  search_results_specific:
    path: "/discover/search/:contentType"
    auth_required: false
    components:
      - type: "search_header"
        state: "visible"
      - type: "content_type_header"
        state: "visible"
      - type: "results_grid"
        state: "visible"
        data_source: "filtered_content"
      - type: "back_button"
        state: "visible"
    transitions:
      - to: "content_detail"
        condition: "item_clicked"
      - to: "search_page"
        condition: "back_clicked"

  content_detail:
    path: "/view/:type/:slug"
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
      - type: "reader_controls"
        state: "visible"
        actions:
          - action: "adjust_font"
            next_state: "reader"
          - action: "adjust_theme"
            next_state: "reader"
          - action: "add_bookmark"
            next_state: "reader"
          - action: "add_highlight"
            next_state: "reader"
    transitions:
      - to: "virgil_book_chat"
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
      - to: "virgil_modes"
        condition: "modes_clicked"

  virgil_modes:
    path: "/virgil-modes"
    auth_required: true
    components:
      - type: "welcome_container"
        state: "conditional"
        condition: "!welcome_dismissed"
      - type: "prompt_cards_grid"
        state: "visible"
        data_source: "prompts_table"
      - type: "conversation_history_sidebar"
        state: "hidden"
        show_condition: "history_button_clicked"
    transitions:
      - to: "virgil_chat"
        condition: "prompt_selected"
      - to: "virgil"
        condition: "back_to_virgil_clicked"

  virgil_chat:
    path: "/virgil-chat"
    auth_required: true
    components:
      - type: "fullscreen_chat_interface"
        state: "visible"
        data_source: "selected_prompt"
      - type: "transition_animation"
        state: "visible"
        duration: "2500ms"
    transitions:
      - to: "virgil_modes"
        condition: "back_clicked"

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
      - to: "share_profile"
        condition: "share_profile_clicked"
      - to: "dashboard"
        condition: "dashboard_clicked"

  shareable_profile:
    path: "/profile/share/:name"
    auth_required: false
    components:
      - type: "profile_header"
        state: "visible"
      - type: "public_dna_summary"
        state: "visible"
      - type: "share_options"
        state: "visible"
      - type: "get_started_button"
        state: "conditional"
        condition: "!authenticated"
    transitions:
      - to: "login_register"
        condition: "get_started_clicked && !authenticated"
      - to: "profile"
        condition: "back_clicked && authenticated"

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
    path: "/share-badge/:domainId/:resourceId"
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

  bookshelf:
    path: "/bookshelf"
    auth_required: true
    components:
      - type: "bookshelf_header"
        state: "visible"
      - type: "last_read_book_hero"
        state: "visible"
        condition: "has_reading_history"
      - type: "intellectual_dna_card"
        state: "visible"
      - type: "bookshelf_content"
        state: "visible"
        sections:
          - name: "dna_recommendations"
            editable: false
            condition: "has_assessment_id"
          - name: "favorites"
            editable: true
          - name: "custom_shelves"
            editable: true
      - type: "domain_filters"
        state: "visible"
    transitions:
      - to: "reader"
        condition: "book_clicked"
      - to: "favorites_shelf"
        condition: "favorites_clicked"
      - to: "intellectual_dna_shelf"
        condition: "dna_shelf_clicked"
      - to: "domain_specific_shelf"
        condition: "domain_clicked"

  favorites_shelf:
    path: "/favorites-shelf"
    auth_required: true
    components:
      - type: "favorites_header"
        state: "visible"
      - type: "favorites_tabs"
        state: "visible"
        options: ["classics", "icons", "concepts"]
      - type: "favorites_content"
        state: "visible"
        data_source: "user_favorites"
      - type: "remove_button"
        state: "visible"
        actions:
          - action: "click"
            next_state: "favorites_shelf"
    transitions:
      - to: "reader"
        condition: "book_clicked"
      - to: "bookshelf"
        condition: "back_clicked"

  intellectual_dna_shelf:
    path: "/intellectual-dna"
    auth_required: true
    components:
      - type: "dna_shelf_header"
        state: "visible"
      - type: "dna_recommendations"
        state: "visible"
        data_source: "dna_assessment_results"
      - type: "domain_carousel"
        state: "visible"
    transitions:
      - to: "reader"
        condition: "book_clicked"
      - to: "bookshelf"
        condition: "back_clicked"

  domain_specific_shelf:
    path: "/bookshelf/:domain"
    auth_required: true
    components:
      - type: "domain_header"
        state: "visible"
      - type: "domain_books"
        state: "visible"
        data_source: "domain_filtered_books"
    transitions:
      - to: "reader"
        condition: "book_clicked"
      - to: "bookshelf"
        condition: "back_clicked"

  dashboard:
    path: "/dashboard"
    auth_required: true
    components:
      - type: "profile_header"
        state: "visible"
      - type: "domains_list"
        state: "visible"
      - type: "progress_chart"
        state: "visible"
      - type: "time_with_virgil"
        state: "visible"
      - type: "badges_page"
        state: "visible"
    transitions:
      - to: "domain_detail"
        condition: "domain_clicked"
      - to: "profile"
        condition: "profile_clicked"

  domain_detail:
    path: "/dashboard/domain/:domainId"
    auth_required: true
    components:
      - type: "domain_header"
        state: "visible"
      - type: "domain_content"
        state: "visible"
      - type: "domain_progress"
        state: "visible"
    transitions:
      - to: "dashboard"
        condition: "back_clicked"
      - to: "reader"
        condition: "book_clicked"

  become_who_you_are:
    path: "/become-who-you-are"
    auth_required: true
    components:
      - type: "philosophical_journey"
        state: "visible"
      - type: "journey_navigation"
        state: "visible"
    transitions:
      - to: "dashboard"
        condition: "back_clicked"
      - to: "virgil_chat"
        condition: "chat_clicked"

  classroom:
    path: "/classroom"
    auth_required: true
    components:
      - type: "classroom_header"
        state: "visible"
      - type: "last_course_hero"
        state: "visible"
        condition: "has_course_history"
      - type: "intellectual_dna_course_card"
        state: "visible"
      - type: "create_your_own_course_card"
        state: "visible"
      - type: "courses_list"
        state: "visible"
        data_source: "user_courses"
      - type: "create_course_dialog"
        state: "hidden"
        show_condition: "create_course_clicked"
    transitions:
      - to: "classroom_virgil_chat"
        condition: "course_clicked"
      - to: "intellectual_dna_course"
        condition: "dna_course_clicked"

  intellectual_dna_course:
    path: "/intellectual-dna-course"
    auth_required: true
    components:
      - type: "dna_course_header"
        state: "visible"
      - type: "course_content"
        state: "visible"
        data_source: "dna_course"
    transitions:
      - to: "classroom_virgil_chat"
        condition: "start_clicked"
      - to: "classroom"
        condition: "back_clicked"

  classroom_virgil_chat:
    path: "/classroom-virgil-chat"
    auth_required: true
    components:
      - type: "chat_interface"
        state: "visible"
        context: "course_content"
      - type: "course_progress"
        state: "visible"
    transitions:
      - to: "classroom"
        condition: "back_clicked"

  exam_room:
    path: "/exam-room"
    auth_required: true
    components:
      - type: "exam_header"
        state: "visible"
      - type: "last_exam_hero"
        state: "visible"
        condition: "has_exam_history"
      - type: "intellectual_dna_exam_card"
        state: "visible"
      - type: "create_your_own_exam_card"
        state: "visible"
      - type: "exams_list"
        state: "visible"
        data_source: "user_exams"
      - type: "create_exam_dialog"
        state: "hidden"
        show_condition: "create_exam_clicked"
    transitions:
      - to: "exam_welcome"
        condition: "exam_clicked"
      - to: "intellectual_dna_exam"
        condition: "dna_exam_clicked"

  exam_welcome:
    path: "/exam-welcome"
    auth_required: true
    components:
      - type: "exam_welcome_header"
        state: "visible"
      - type: "exam_instructions"
        state: "visible"
      - type: "start_exam_button"
        state: "visible"
    transitions:
      - to: "exam_virgil_chat"
        condition: "start_clicked"
      - to: "exam_room"
        condition: "back_clicked"

  intellectual_dna_exam:
    path: "/intellectual-dna-exam"
    auth_required: true
    components:
      - type: "dna_exam_header"
        state: "visible"
      - type: "exam_content"
        state: "visible"
        data_source: "dna_exam"
    transitions:
      - to: "exam_virgil_chat"
        condition: "start_clicked"
      - to: "exam_room"
        condition: "back_clicked"

  exam_virgil_chat:
    path: "/exam-virgil-chat"
    auth_required: true
    components:
      - type: "chat_interface"
        state: "visible"
        context: "exam_content"
      - type: "timer"
        state: "visible"
    transitions:
      - to: "virgil_exam_room"
        condition: "exam_completed"
      - to: "exam_room"
        condition: "back_clicked"

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
      - outseta_user_id
      - email_verification_status
      - assessment_id

  dna_assessment_flow:
    states:
      - name: "not_started"
        actions:
          - action: "begin_assessment"
            next_state: "dna_priming"
      - name: "priming"
        actions:
          - action: "continue_priming"
            next_state: "priming"
          - action: "complete_priming"
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
      - name: "virgil_office"
        actions:
          - action: "select_mode"
            next_state: "virgil_modes"
          - action: "start_conversation"
            next_state: "general_chat"
      - name: "virgil_modes"
        actions:
          - action: "select_prompt"
            next_state: "virgil_chat"
          - action: "view_history"
            next_state: "conversation_history"
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
      - conversation_prompts

  content_management:
    states:
      - name: "browsing"
        actions:
          - action: "view_content"
            next_state: "content_detail"
          - action: "filter"
            next_state: "filtered_view"
          - action: "search"
            next_state: "search_results"
      - name: "reading"
        actions:
          - action: "annotate"
            next_state: "reading"
          - action: "chat_about"
            next_state: "virgil_book_chat"
          - action: "bookmark"
            next_state: "reading"
          - action: "change_settings" 
            next_state: "reading"
      - name: "organizing"
        actions:
          - action: "add_to_shelf"
            next_state: "organizing"
          - action: "remove_from_shelf"
            next_state: "organizing"
          - action: "organize_by_domain"
            next_state: "domain_specific_shelf"
          - action: "add_to_favorites"
            next_state: "organizing"
    data_requirements:
      - books
      - icons
      - concepts
      - user_books
      - user_favorites
      - reading_progress
      - custom_domains

  education_system:
    states:
      - name: "classroom"
        actions:
          - action: "view_course"
            next_state: "course_detail"
          - action: "create_course"
            next_state: "create_course_dialog"
          - action: "start_course"
            next_state: "classroom_chat"
      - name: "examination"
        actions:
          - action: "view_exam"
            next_state: "exam_detail"
          - action: "create_exam"
            next_state: "create_exam_dialog"
          - action: "start_exam"
            next_state: "exam_chat"
          - action: "view_results"
            next_state: "exam_results"
      - name: "badge_management"
        actions:
          - action: "view_badge"
            next_state: "badge_detail"
          - action: "share_badge"
            next_state: "share_badge" 
    data_requirements:
      - courses_library
      - exams_data
      - user_progress
      - badges_earned

  dashboard_system:
    states:
      - name: "overview"
        actions:
          - action: "view_domain"
            next_state: "domain_detail"
          - action: "view_progress"
            next_state: "progress_detail"
          - action: "view_badges"
            next_state: "badges_page"
      - name: "domain_exploration"
        actions:
          - action: "view_content"
            next_state: "content_detail"
          - action: "start_reading"
            next_state: "reader"
      - name: "profile_management"
        actions:
          - action: "edit_profile"
            next_state: "profile_edit"
          - action: "share_profile"
            next_state: "shareable_profile"
    data_requirements:
      - user_domains
      - progress_metrics
      - badges_earned
      - time_spent_data

# 3. NAVIGATION ARCHITECTURE
navigation:
  primary_menu:
    - name: "Profile"
      path: "/profile"
      auth_required: true
      visible_condition: "authenticated"
    - name: "DNA"
      path: "/dna"
      auth_required: false
      default_for: ["new_users"]
    - name: "Virgil"
      path: "/virgil"
      auth_required: true
      visible_condition: "authenticated"
    - name: "Discover"
      path: "/discover"
      auth_required: false
      default_for: ["all_users", "unauthenticated"]
    - name: "Study"
      path: "/bookshelf"
      auth_required: true
      visible_condition: "authenticated"

  conditional_navigation:
    - condition: "!authenticated"
      available_paths: ["/discover", "/login", "/register", "/share-badge/*", "/profile/share/*", "/badge/*", "/"]
    - condition: "authenticated && !has_assessment_id"
      available_paths: ["/discover", "/dna/*", "/bookshelf", "/read/*", "/profile", "/virgil", "/dashboard"]
    - condition: "authenticated && has_assessment_id"
      available_paths: ["*"]

  deep_linking:
    - pattern: "/view/:type/:slug"
      destination: "content_detail"
      auth_requirement: false
    - pattern: "/read/:slug"
      destination: "reader"
      auth_requirement: true
    - pattern: "/profile/share/:name"
      destination: "shareable_profile"
      auth_requirement: false
    - pattern: "/share-badge/:domainId/:resourceId"
      destination: "share_badge"
      auth_requirement: false
    - pattern: "/share-badge/:domainId/:resourceId/:userName"
      destination: "share_badge"
      auth_requirement: false
    - pattern: "/badge/:domainId/:resourceId"
      destination: "share_badge"
      auth_requirement: false
    - pattern: "/badge/:domainId/:resourceId/:userName"
      destination: "share_badge"
      auth_requirement: false
    - pattern: "/virgil/exam/:id"
      destination: "virgil_exam_room"
      auth_requirement: true
    - pattern: "/dashboard/domain/:domainId"
      destination: "domain_detail"
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
        to: "virgil_book_chat"
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
      - from: "virgil_modes"
        to: "virgil_chat"
        transition_type: "special_transition"
        duration: "2500ms"

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

  file_upload_error:
    components:
      - type: "error_message"
        state: "visible"
        message: "Failed to upload file"
      - type: "retry_button"
        state: "visible"

# 5. BUSINESS RULES
business_rules:
  - rule: "Authentication required for reading full content"
    implementation: "Show preview and prompt login for full access"
  
  - rule: "DNA assessment required for personalized recommendations"
    implementation: "Check assessment_id field in profile before showing personalized content"
  
  - rule: "Annotation persistence"
    implementation: "Save highlights and notes to user's account"
  
  - rule: "Reading progress tracking"
    implementation: "Track and save user's progress in user_books table"
  
  - rule: "Chat context preservation"
    implementation: "Maintain chat context when switching between content and chat"
  
  - rule: "Domain-specific organization"
    implementation: "Allow filtering content by intellectual domains using custom_domains"
  
  - rule: "Badge earning requirements"
    implementation: "Award badges based on exam completion and performance"
  
  - rule: "Course progress tracking"
    implementation: "Track and display user progress in courses"

# 6. DATA MODELS
data_models:
  user:
    properties:
      - name: "id"
        type: "uuid"
        required: true
      - name: "outseta_user_id"
        type: "varchar"
        required: true
        unique: true
      - name: "email"
        type: "varchar"
        required: true
      - name: "full_name"
        type: "varchar"
        required: false
      - name: "profile_image"
        type: "text"
        required: false
      - name: "landscape_image"
        type: "text"
        required: false
      - name: "assessment_id"
        type: "uuid"
        required: false
      - name: "created_at"
        type: "timestamp"
        required: true
      - name: "updated_at"
        type: "timestamp"
        required: true

  books:
    properties:
      - name: "id"
        type: "uuid"
        required: true
      - name: "title"
        type: "text"
        required: true
      - name: "slug"
        type: "text"
        required: true
        unique: true
      - name: "author"
        type: "text"
        required: true
      - name: "cover_url"
        type: "text"
        required: false
      - name: "epub_file_url"
        type: "text"
        required: false
      - name: "categories"
        type: "text[]"
        required: false
      - name: "amazon_link"
        type: "text"
        required: false
      - name: "bookshop_link"
        type: "text"
        required: false
      - name: "about"
        type: "text"
        required: false
      - name: "introduction"
        type: "text"
        required: false
      - name: "icon_illustration"
        type: "text"
        required: false
      - name: "created_at"
        type: "timestamp"
        required: true
      - name: "author_id"
        type: "uuid"
        required: false

  icons:
    properties:
      - name: "id"
        type: "uuid"
        required: true
      - name: "name"
        type: "text"
        required: true
      - name: "illustration"
        type: "text"
        required: false
      - name: "slug"
        type: "text"
        required: false
      - name: "about"
        type: "text"
        required: false
      - name: "introduction"
        type: "text"
        required: false
      - name: "great_conversation"
        type: "text"
        required: false
      - name: "anecdotes"
        type: "text[]"
        required: false
      - name: "created_at"
        type: "timestamp"
        required: true

  concepts:
    properties:
      - name: "id"
        type: "uuid"
        required: true
      - name: "title"
        type: "text"
        required: true
      - name: "illustration"
        type: "text"
        required: false
      - name: "type"
        type: "text"
        required: false
      - name: "about"
        type: "text"
        required: false
      - name: "introduction"
        type: "text"
        required: false
      - name: "created_at"
        type: "timestamp"
        required: true

  great_questions:
    properties:
      - name: "id"
        type: "uuid"
        required: true
      - name: "category_number"
        type: "text"
        required: false
      - name: "category"
        type: "text"
        required: false
      - name: "question"
        type: "text"
        required: true
      - name: "notion_id"
        type: "text"
        required: false
        unique: true
      - name: "illustration"
        type: "text"
        required: false
      - name: "answer_a"
        type: "text"
        required: false
      - name: "answer_b"
        type: "text"
        required: false
      - name: "related_classics"
        type: "text[]"
        required: false
      - name: "created_at"
        type: "timestamp"
        required: true

  user_books:
    properties:
      - name: "id"
        type: "uuid"
        required: true
      - name: "book_id"
        type: "uuid"
        required: true
      - name: "outseta_user_id"
        type: "varchar"
        required: true
      - name: "status"
        type: "text"
        required: false
      - name: "current_page"
        type: "integer"
        required: false
      - name: "current_cfi"
        type: "text"
        required: false
      - name: "last_read_at"
        type: "timestamp"
        required: false
      - name: "created_at"
        type: "timestamp"
        required: true
      - name: "updated_at"
        type: "timestamp"
        required: true
      - name: "book_outseta_unique"
        type: "unique"
        constraint: "(book_id, outseta_user_id)"

  user_favorites:
    properties:
      - name: "id"
        type: "uuid"
        required: true
      - name: "outseta_user_id"
        type: "varchar"
        required: true
      - name: "item_id"
        type: "uuid"
        required: true
      - name: "item_type"
        type: "text"
        required: true
      - name: "added_at"
        type: "timestamp"
        required: true
      - name: "favorite_unique"
        type: "unique"
        constraint: "(outseta_user_id, item_id, item_type)"

  dna_assessment_results:
    properties:
      - name: "id"
        type: "uuid"
        required: true
      - name: "name"
        type: "text"
        required: false
      - name: "answers"
        type: "jsonb"
        required: false
      - name: "ethics_sequence"
        type: "text"
        required: false
      - name: "epistemology_sequence"
        type: "text"
        required: false
      - name: "politics_sequence"
        type: "text"
        required: false
      - name: "theology_sequence"
        type: "text"
        required: false
      - name: "ontology_sequence"
        type: "text"
        required: false
      - name: "aesthetics_sequence"
        type: "text"
        required: false
      - name: "profile_id"
        type: "text"
        required: false
      - name: "created_at"
        type: "timestamp"
        required: true

  dna_analysis_results:
    properties:
      - name: "id"
        type: "uuid"
        required: true
      - name: "assessment_id"
        type: "uuid"
        required: true
      - name: "analysis_text"
        type: "text"
        required: false
      - name: "raw_response"
        type: "jsonb"
        required: false
      - name: "archetype"
        type: "text"
        required: false
      - name: "introduction"
        type: "text"
        required: false
      - name: "archetype_definition"
        type: "text"
        required: false
      - name: "key_tension_1"
        type: "text"
        required: false
      - name: "key_tension_2"
        type: "text"
        required: false
      - name: "key_tension_3"
        type: "text"
        required: false
      - name: "analysis_type"
        type: "dna_result_type"
        required: false
      - name: "created_at"
        type: "timestamp"
        required: true

  dna_conversations:
    properties:
      - name: "id"
        type: "uuid"
        required: true
      - name: "assessment_id"
        type: "uuid"
        required: true
      - name: "user_id"
        type: "uuid"
        required: true
      - name: "session_id"
        type: "text"
        required: false
      - name: "messages"
        type: "jsonb"
        required: false
      - name: "question_id"
        type: "text"
        required: false
      - name: "metadata"
        type: "jsonb"
        required: false
      - name: "created_at"
        type: "timestamp"
        required: true
      - name: "updated_at"
        type: "timestamp"
        required: true

  custom_domains:
    properties:
      - name: "id"
        type: "uuid"
        required: true
      - name: "name"
        type: "text"
        required: true
      - name: "user_id"
        type: "uuid"
        required: false
      - name: "outseta_user_id"
        type: "text"
        required: false
      - name: "created_at"
        type: "timestamp"
        required: true
