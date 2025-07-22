import fs from "fs";
import readline from "readline";
import fetch from "node-fetch";

const questions = JSON.parse(fs.readFileSync("evaluation-set.json", "utf-8"));

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function askScore(prompt: string): Promise<number> {
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      const score = parseInt(answer, 10);
      resolve(isNaN(score) ? 0 : score);
    });
  });
}

async function main() {
  const results = [];
  for (const { question } of questions) {
    console.log(`\nQ: ${question}`);
    const res = await fetch("http://localhost:3000/api/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
    });

    let data: any;
    if (!res.ok) {
      const errorText = await res.text();
      console.error("HTTP error:", res.status, errorText);
      data = { error: errorText };
    } else {
      data = await res.json();
    }

    console.log("API response:", data);

    if (data.error) {
      console.log("API Error:", data.error);
      continue; // skip to next question
    }

    const answer = data.answer || data.result || JSON.stringify(data);

    console.log(`A: ${answer}\n`);

    const accuracy = await askScore("Accuracy (0-2): ");
    const helpfulness = await askScore("Helpfulness (0-2): ");
    const citation = await askScore("Citation Quality (0-2): ");

    results.push({ question, answer, accuracy, helpfulness, citation });
  }
  rl.close();
  fs.writeFileSync("evaluation-results.json", JSON.stringify(results, null, 2));
  console.log("\nEvaluation complete! Results saved to evaluation-results.json");
}

main();
