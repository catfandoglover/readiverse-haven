
type PromptSection = {
  system_prompt: string;
  output_format: {
    [key: string]: string;
  };
};

export function getPromptForSection(section: number): PromptSection {
  const prompts: Record<number, PromptSection> = {
    1: {
      system_prompt: `You are analyzing the theological and ontological aspects of someone's intellectual DNA based on their assessment answers. Focus on identifying patterns in their thinking about existence and divinity.`,
      output_format: {
        theology_introduction: "A concise introduction to their theological perspective",
        ontology_introduction: "A concise introduction to their ontological perspective",
        theology_kindred_spirit_1: "Name of first theological thinker who shares their views",
        theology_kindred_spirit_2: "Name of second theological thinker",
        theology_kindred_spirit_3: "Name of third theological thinker",
        theology_kindred_spirit_4: "Name of fourth theological thinker",
        theology_kindred_spirit_5: "Name of fifth theological thinker"
      }
    },
    2: {
      system_prompt: `You are analyzing the epistemological and ethical aspects of someone's intellectual DNA based on their assessment answers. Focus on how they approach knowledge and morality.`,
      output_format: {
        epistemology_introduction: "A concise introduction to their epistemological perspective",
        ethics_introduction: "A concise introduction to their ethical perspective",
        epistemology_kindred_spirit_1: "Name of first epistemological thinker who shares their views",
        epistemology_kindred_spirit_2: "Name of second epistemological thinker",
        epistemology_kindred_spirit_3: "Name of third epistemological thinker",
        ethics_kindred_spirit_1: "Name of first ethical thinker who shares their views",
        ethics_kindred_spirit_2: "Name of second ethical thinker",
        ethics_kindred_spirit_3: "Name of third ethical thinker"
      }
    },
    3: {
      system_prompt: `You are analyzing the political and aesthetic aspects of someone's intellectual DNA based on their assessment answers. Focus on their views about society and beauty.`,
      output_format: {
        politics_introduction: "A concise introduction to their political perspective",
        aesthetics_introduction: "A concise introduction to their aesthetic perspective",
        politics_kindred_spirit_1: "Name of first political thinker who shares their views",
        politics_kindred_spirit_2: "Name of second political thinker",
        politics_kindred_spirit_3: "Name of third political thinker",
        aesthetics_kindred_spirit_1: "Name of first aesthetic thinker who shares their views",
        aesthetics_kindred_spirit_2: "Name of second aesthetic thinker",
        aesthetics_kindred_spirit_3: "Name of third aesthetic thinker"
      }
    }
  };

  const prompt = prompts[section];
  if (!prompt) {
    throw new Error(`Invalid section number: ${section}`);
  }

  return prompt;
}
