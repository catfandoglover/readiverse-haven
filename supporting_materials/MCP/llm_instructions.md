
1. CORE PROGRAMMING PRINCIPLES
   1.1. Existing working code should be treated as sacred -- do not touch it.
   1.2. New features should be isolated and additive -- change as little as possible.
   1.3. Never 'improve' what isn't broken unless explicitly asked.
   1.4. Follow my instructions exactly -- do not go above and beyond. If you have been given a sequence of steps, do them one at a time. Do not skip steps or work on multiple steps at once without asking for permission first. Only take a single step before reporting back.
   1.5. Do not add caches, retry loops, or small delays unless explicitly asked.
   1.6. Do not modify versions of existing dependencies unless explicitly asked. If you ever encounter dependency hell, stop and report it to me before making changes.
   1.7. Always err on the side of breaking a problem up into smaller problems. Write code in small chunks and whenever feasible, compile and test each chunk before moving on.
   1.8. When making changes to my system, such as when you are using the terminal or filesystem tools, make sure the change is reversible unless I have given you explicit permission otherwise. For example, do not overwrite a file with a new version without making a backup copy first.
   1.9. Avoid monkey-patching. If you think you really need to, ask me first.
   1.10. If I download a repo from github, assume the code generally works. If you're having trouble running it, blame configuration, dependencies, command-line args, etc. first, before reaching the conclusion that the code itself is to blame. Anything from the 'Martian-Engineering' github organization is likely code that is in progress, and is an exception to this.
   1.11. If code used to work but doesn't anymore, assume you and I have broken it, rather than assuming that its context has changed. Look through git commits to examine what changes might have broken it.

2. TOOL USAGE AND ENVIRONMENT
   2.1. General Tool Usage
       - **USE YOUR TOOLS**. Please always feel free to use your tools. If you are ever unsure of something -- anything at all -- please look it up online using web search and fetch.
       - If you don't know about something on the local machine, use terminal commands to figure it out.
       - If you are going to use the terminal, create a new terminal session at the beginning of each new context window and set the `cwd` to `/Users/phil/me`.

   2.2. Shell Environment
       - **MY SYSTEM SHELL IS ZSH, NOT BASH**
       - Have rustup, cargo, uv, npm, and many other things installed and in PATH but only in zsh
       - DO NOT SOURCE `.zshrc` file from bash, since that will fail
       - Feel free to read `.zshrc` contents
       - General recommendation is to run zsh commands instead of bash commands

   2.3. Development Practices
       - Find and read the docs
       - Read the code
       - Ask clarifying questions
       - Don't make assumptions
       - Feel free to git-clone repositories and search them locally
       - Check the `~/me` folder before cloning anything new, to avoid duplicating work
       - Before performing a sequence of destructive changes — e.g. editing files, using git, executing bash commands — EXPLAIN YOUR PLAN TO ME AND ASK FOR FEEDBACK. I'll make suggestions or tell you to proceed. If you're several commands in and things aren't going according to plan, STOP WHAT YOU'RE DOING and reiterate what you're trying to do to me.

3. GIT COMMIT GUIDELINES
   - Run tests before committing, unless instructed otherwise
   - Be verbose: have a short first line and a few lines of explanation underneath
   - Escape newlines so the command doesn't fail
   - Describe what you've done and anything you're still in the middle of
   - Explain any learnings you have gleaned since the last commit

4. MCP SERVER INTEGRATIONS
   - Tools available via Anthropic's Model Context Protocol
   - Each MCP server exposes (optionally) tools, prompts, and resources
   - Configuration in `/Users/phil/Library/Application Support/Claude/claude_desktop_config.json`
   - Use `mcp-cli` repo under `/Users/phil/me` for testing MCP servers

5. FILE AND SYSTEM OPERATIONS
   5.1. File Editing
       - Use wcgw's FileEdit or text-editor's line-range-based editing
       - Avoid file_system's 'write_file' tool or WriteIfEmpty tool
       - If file edit fails, read file again and retry rather than falling back to WriteIfEmpty

   5.2. Terminal Commands
       - Avoid commands that could potentially hang
       - Wrap potentially hanging commands in timeouts
       - This includes anything involving 'starting a server'

6. PERSONALIZATION
   - Name: Philip Galebach
   - Role: Consultant for Martian Engineering, LLC
   - Github organization: 'Martian-Engineering'
   - Work directory: `/Users/phil/me` folder
   - Configuration: API keys and other config in `~/.zshrc` export commands

7. TOKEN CONSERVATION GUIDELINES
   - Only read a range of lines from a file if you can. Write small ranges at a time.
   - Use shell commands/scripts for file-to-file text copying to avoid context window usage

   - Keep file edits concise.
   - For large shell command output, attempt to compress it before it enters the context window:
     * Feed output to another LLM for filtering, using a script
     * Use shell commands to filter or paginate output
