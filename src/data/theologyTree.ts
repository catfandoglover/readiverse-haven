export interface TheologyQuestion {
  question: string;
  yes?: string;
  no?: string;
  yes_label?: string;
  no_label?: string;
}

export interface TheologyTree {
  [key: string]: TheologyQuestion;
}

export const THEOLOGY_TREE: TheologyTree = {
  "Q1": {
    "question": "If you could prove or disprove God's existence, would you want to know?",
    "yes": "A",
    "no": "B",
    "yes_label": "Yes",
    "no_label": "No"
  },
  "A": {
    "question": "Can reason alone lead us to religious truth?",
    "yes": "AA",
    "no": "AB",
    "yes_label": "Yes",
    "no_label": "No"
  },
  "B": {
    "question": "Is faith more about experience or tradition?",
    "yes": "BA",  // Using "yes" for "Experience"
    "no": "BB",   // Using "no" for "Tradition"
    "yes_label": "Experience",
    "no_label": "Tradition"
  },
  "AA": {
    "question": "Must the divine be personal to be meaningful?",
    "yes": "AAA",
    "no": "AAB",
    "yes_label": "Yes",
    "no_label": "No"
  },
  "AB": {
    "question": "Can multiple religions all be true?",
    "yes": "ABA",
    "no": "ABB",
    "yes_label": "Yes",
    "no_label": "No"
  },
  "BA": {
    "question": "Should religious truth adapt to modern knowledge?",
    "yes": "BAA",
    "no": "BAB",
    "yes_label": "Yes",
    "no_label": "No"
  },
  "BB": {
    "question": "Is divine revelation necessary for moral knowledge?",
    "yes": "BBA",
    "no": "BBB",
    "yes_label": "Yes",
    "no_label": "No"
  },
  "AAA": {
    "question": "Does evil disprove a perfect God?",
    "yes": "AAAA",
    "no": "AAAB",
    "yes_label": "Yes",
    "no_label": "No"
  },
  "AAB": {
    "question": "Is the universe itself divine?",
    "yes": "AABA",
    "no": "AABB",
    "yes_label": "Yes",
    "no_label": "No"
  },
  "ABA": {
    "question": "Does genuine free will exist?",
    "yes": "ABAA",
    "no": "ABAB",
    "yes_label": "Yes",
    "no_label": "No"
  },
  "ABB": {
    "question": "Is religion more about transformation or truth?",
    "yes": "ABBA",  // Using "yes" for "Truth"
    "no": "ABBB",   // Using "no" for "Transform"
    "yes_label": "Truth",
    "no_label": "Transform"
  },
  "BAA": {
    "question": "Can sacred texts contain errors?",
    "yes": "BAAA",
    "no": "BAAB",
    "yes_label": "Yes",
    "no_label": "No"
  },
  "BAB": {
    "question": "Is mystical experience trustworthy?",
    "yes": "BABA",
    "no": "BABB",
    "yes_label": "Yes",
    "no_label": "No"
  },
  "BBA": {
    "question": "Should faith seek understanding?",
    "yes": "BBAA",
    "no": "BBAB",
    "yes_label": "Yes",
    "no_label": "No"
  },
  "BBB": {
    "question": "Does divine hiddenness matter?",
    "yes": "BBBA",
    "no": "BBBB",
    "yes_label": "Yes",
    "no_label": "No"
  },
  "AAAA": {
    "question": "Can finite minds grasp infinite truth?",
    "yes": "AAAAA",
    "no": "AAAAB",
    "yes_label": "Yes",
    "no_label": "No"
  },
  "AAAB": {
    "question": "Is reality fundamentally good?",
    "yes": "AAABA",
    "no": "AAABB",
    "yes_label": "Yes",
    "no_label": "No"
  },
  "AABA": {
    "question": "Does prayer change anything?",
    "yes": "AABAA",
    "no": "AABAB",
    "yes_label": "Yes",
    "no_label": "No"
  },
  "AABB": {
    "question": "Is consciousness evidence of divinity?",
    "yes": "AABBA",
    "no": "AABBB",
    "yes_label": "Yes",
    "no_label": "No"
  },
  "ABAA": {
    "question": "Can miracles violate natural law?",
    "yes": "ABAAA",
    "no": "ABAAB",
    "yes_label": "Yes",
    "no_label": "No"
  },
  "ABAB": {
    "question": "Is there purpose in evolution?",
    "yes": "ABABA",
    "no": "ABABB",
    "yes_label": "Yes",
    "no_label": "No"
  },
  "ABBA": {
    "question": "Can symbols contain ultimate truth?",
    "yes": "ABBAA",
    "no": "ABBAB",
    "yes_label": "Yes",
    "no_label": "No"
  },
  "ABBB": {
    "question": "Is divine grace necessary for virtue?",
    "yes": "ABBBA",
    "no": "ABBBB",
    "yes_label": "Yes",
    "no_label": "No"
  },
  "BAAA": {
    "question": "Should tradition limit interpretation?",
    "yes": "BAAAA",
    "no": "BAAAB",
    "yes_label": "Yes",
    "no_label": "No"
  },
  "BAAB": {
    "question": "Can ritual create real change?",
    "yes": "BAABA",
    "no": "BAABB",
    "yes_label": "Yes",
    "no_label": "No"
  },
  "BABA": {
    "question": "Is doubt part of authentic faith?",
    "yes": "BABAA",
    "no": "BABAB",
    "yes_label": "Yes",
    "no_label": "No"
  },
  "BABB": {
    "question": "Must religion be communal?",
    "yes": "BABBA",
    "no": "BABBB",
    "yes_label": "Yes",
    "no_label": "No"
  },
  "BBAA": {
    "question": "Can God's nature be known?",
    "yes": "BBAAA",
    "no": "BBAAB",
    "yes_label": "Yes",
    "no_label": "No"
  },
  "BBAB": {
    "question": "Is suffering meaningful?",
    "yes": "BBABA",
    "no": "BBABB",
    "yes_label": "Yes",
    "no_label": "No"
  },
  "BBBA": {
    "question": "Is love the ultimate reality?",
    "yes": "BBBAA",
    "no": "BBBAB",
    "yes_label": "Yes",
    "no_label": "No"
  },
  "BBBB": {
    "question": "Does immortality give life meaning?",
    "yes": "BBBBA",
    "no": "BBBBB",
    "yes_label": "Yes",
    "no_label": "No"
  },
  // Leaf nodes (final questions)
  "AAAAA": {"question": "Final question AAAAA"},
  "AAAAB": {"question": "Final question AAAAB"},
  "AAABA": {"question": "Final question AAABA"},
  "AAABB": {"question": "Final question AAABB"},
  "AABAA": {"question": "Final question AABAA"},
  "AABAB": {"question": "Final question AABAB"},
  "AABBA": {"question": "Final question AABBA"},
  "AABBB": {"question": "Final question AABBB"},
  "ABAAA": {"question": "Final question ABAAA"},
  "ABAAB": {"question": "Final question ABAAB"},
  "ABABA": {"question": "Final question ABABA"},
  "ABABB": {"question": "Final question ABABB"},
  "ABBAA": {"question": "Final question ABBAA"},
  "ABBAB": {"question": "Final question ABBAB"},
  "ABBBA": {"question": "Final question ABBBA"},
  "ABBBB": {"question": "Final question ABBBB"},
  "BAAAA": {"question": "Final question BAAAA"},
  "BAAAB": {"question": "Final question BAAAB"},
  "BAABA": {"question": "Final question BAABA"},
  "BAABB": {"question": "Final question BAABB"},
  "BABAA": {"question": "Final question BABAA"},
  "BABAB": {"question": "Final question BABAB"},
  "BABBA": {"question": "Final question BABBA"},
  "BABBB": {"question": "Final question BABBB"},
  "BBAAA": {"question": "Final question BBAAA"},
  "BBAAB": {"question": "Final question BBAAB"},
  "BBABA": {"question": "Final question BBABA"},
  "BBABB": {"question": "Final question BBABB"},
  "BBBAA": {"question": "Final question BBBAA"},
  "BBBAB": {"question": "Final question BBBAB"},
  "BBBBA": {"question": "Final question BBBBA"},
  "BBBBB": {"question": "Final question BBBBB"}
};
