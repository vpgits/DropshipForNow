import { Configuration, OpenAIApi } from 'openai';
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
        max_tokens: 50
      });
      const aiScore = parseInt(response.data.choices[0].text.match(/\d+/)[0]);
      return { ...product, aiScore };
    } catch (error) {
      if (error.response && error.response.status === 429) {
        // Retry on rate limit errors
        throw error;
      }
      // Don't retry for other errors
      bail(error);
    }
  }, {
    retries: 3,
    factor: 2,
    minTimeout: 1000,
    maxTimeout: 5000,
  });
}

export async function analyzeProducts(products) {
  const analyzedProducts = await Promise.all(products.map(analyzeProduct));
  return analyzedProducts.sort((a, b) => b.aiScore - a.aiScore);
}