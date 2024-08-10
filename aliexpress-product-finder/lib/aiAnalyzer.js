import { Configuration, OpenAIApi } from 'openai'; // Correct import
import retry from 'async-retry';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

async function analyzeProduct(product) {
  const prompt = `Analyze this product as a potential "winning product": ${product.name}. Rate it on a scale of 1-10.`;

  return retry(async (bail) => {
    try {
      const response = await openai.createCompletion({
        model: "text-davinci-002",
        prompt: prompt,
        max_tokens: 50,
      });

      // Extracting the first number found in the response text
      const aiScoreMatch = response.data.choices[0].text.match(/\d+/);
      if (!aiScoreMatch) {
        throw new Error("AI response did not contain a valid score");
      }

      const aiScore = parseInt(aiScoreMatch[0], 10);
      if (isNaN(aiScore)) {
        throw new Error("Parsed AI score is not a number");
      }

      return { ...product, aiScore };
    } catch (error) {
      if (error.response && error.response.status === 429) {
        // Retry on rate limit errors
        throw error;
      }
      // Bail out for other errors to avoid unnecessary retries
      bail(error);
      return { ...product, aiScore: null }; // Return product with null score on failure
    }
  }, {
    retries: 3, // Number of retries
    factor: 2, // Exponential backoff factor
    minTimeout: 1000, // Minimum wait time between retries
    maxTimeout: 5000, // Maximum wait time between retries
  });
}

export async function analyzeProducts(products) {
  const analyzedProducts = await Promise.all(products.map(analyzeProduct));
  return analyzedProducts
    .filter(product => product.aiScore !== null) // Filter out failed analyses
    .sort((a, b) => b.aiScore - a.aiScore);
}
