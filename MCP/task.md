I need you to store the questions the user has answered and their response to the question and pass that to the LLM AI bot without changing the existing system prompt. 

Below is the current state of the app. FIX THIS.

### How Questions and Answers Are Stored

1. **Question Storage**:
   - Questions are defined in decision trees for each philosophical category (Theology, Epistemology, Ethics, Politics, Ontology, Aesthetics)
   - The complete question trees are stored in `supabase/functions/analyze-dna/prompts.ts`
   - For the active UI, the current question is retrieved from the appropriate tree (e.g., `THEOLOGY_TREE[currentPosition]?.question`)

### Issue with LLM Context

The current implementation has a critical flaw that prevents the LLM from effectively using previous question/answer context:

1. **Problem**: When adding questions to the path in `DNAAssessment.tsx`, only the question ID and the answer label are stored:
   ```typescript
   conversationManager.addQuestionToPath(
     upperCategory.toLowerCase(), 
     currentPosition,  // This is just the ID like "Q1" or "AAB"
     answer === 'yes' ? yesOption : noOption  // This is just "Yes"/"No" or custom labels
   );
   ```

2. **Missing Context**: The actual question text is never stored in the question path, only the ID.

3. **System Prompt Issue**: When generating the dynamic system prompt, only meaningless IDs are passed to the LLM:
   ```typescript
   for (const { questionId, answer } of questionPath) {
     dynamicPrompt += `- Question ID: "${questionId}"\n  Answer: ${answer}\n`;
   }
   ```

4. **LLM Limitation**: The LLM has no way to know what "Question ID: Q1" actually means or what question was asked.
