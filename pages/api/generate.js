import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export default async function (req, res) {
  if (!configuration.apiKey) {
    res.status(500).json({
      error: {
        message: "OpenAI API key not configured, please follow instructions in README.md",
      }
    });
    return;
  }

  const animal = req.body.animal || '';
  let length = parseInt(req.body.length);
  if (length === 0) {
    length = 100;
  }
  if (animal.trim().length === 0) {
    res.status(400).json({
      error: {
        message: "Please enter some input.",
      }
    });
    return;
  }

  try {
    const completion = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: generatePrompt(animal),
      max_tokens: length,
      temperature: 0.6,
    });    
    res.status(200).json({ result: completion.data.choices[0].text });
  } catch(error) {
    // Consider adjusting the error handling logic for your use case
    if (error.response) {
      console.error(error.response.status, error.response.data);
      res.status(error.response.status).json(error.response.data);
    } else {
      console.error(`Error with OpenAI API request: ${error.message}`);
      res.status(500).json({
        error: {
          message: 'An error occurred during your request.',
        }
      });
    }
  }
}

function generatePrompt(animal) {
  const capitalizedAnimal =
    animal[0].toUpperCase() + animal.slice(1).toLowerCase();
  return (
    `
    Hi! I want you to generate a Y/N fanfiction that's made for me so I like it and it's about me (or at least a the way I want to see myself.) If you know my name, used it instead of Y/N. Here is a bit about myself:

    About me: ${capitalizedAnimal}
    `
  )
}
